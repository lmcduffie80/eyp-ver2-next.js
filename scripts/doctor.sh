#!/usr/bin/env bash
# scripts/doctor.sh
#
# Read-only health check for the repo. Detects the things that have caused
# pnpm dev / lint / test / build to hang in the past:
#   1. macOS Finder / iCloud duplicate files inside source dirs
#      (e.g. "route 2.ts", "page 3.tsx") that confuse Next.js, ESLint, jest.
#   2. Orphan jest processes left over from killed runs that hold haste-map
#      cache locks and deadlock subsequent test runs.
#   3. Stale or oversized jest cache.
#   4. Other duplicate-route hazards.
#
# This script never modifies anything. To fix what it finds, run
#   pnpm clean       (or scripts/clean.sh --all)
# Invoked via: pnpm health   (preferred) or pnpm run doctor
set -uo pipefail

# Color helpers (auto-disable on non-TTY)
if [ -t 1 ]; then
  C_RED=$'\033[31m'; C_YEL=$'\033[33m'; C_GRN=$'\033[32m'; C_DIM=$'\033[2m'; C_RST=$'\033[0m'
else
  C_RED=""; C_YEL=""; C_GRN=""; C_DIM=""; C_RST=""
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

issues=0
warn()  { printf '%s\n' "${C_YEL}WARN${C_RST}  $*"; issues=$((issues+1)); }
fail()  { printf '%s\n' "${C_RED}FAIL${C_RST}  $*"; issues=$((issues+1)); }
ok()    { printf '%s\n' "${C_GRN}OK${C_RST}    $*"; }
info()  { printf '%s\n' "${C_DIM}info${C_RST}  $*"; }
header(){ printf '\n%s\n' "${C_DIM}── $* ──${C_RST}"; }

header "macOS Finder / iCloud duplicate files in source dirs"
SRC_DIRS=(app components lib scripts middleware.ts)
DUPE_LIST=$(find app components lib scripts -type f \( -name "* [0-9].*" -o -name "* [0-9]" \) 2>/dev/null || true)
DUPE_COUNT=$(printf '%s' "$DUPE_LIST" | grep -c . || true)
if [ "$DUPE_COUNT" -eq 0 ]; then
  ok "no source-dir duplicates"
else
  fail "$DUPE_COUNT duplicate file(s) in app/, components/, lib/, scripts/"
  printf '%s\n' "$DUPE_LIST" | head -10 | sed 's/^/      /'
  if [ "$DUPE_COUNT" -gt 10 ]; then
    info "...and $((DUPE_COUNT - 10)) more. Run: pnpm clean:dupes"
  else
    info "Fix: pnpm clean:dupes"
  fi
fi

header "Next.js duplicate-route hazards"
# Look for sibling files like route.ts AND "route 2.ts" in the same folder.
ROUTE_DUPES=$(find app -type f -name "route [0-9].ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$ROUTE_DUPES" -eq 0 ]; then
  ok "no duplicate route.ts siblings"
else
  fail "$ROUTE_DUPES duplicate route file(s) (e.g. 'route 2.ts'); Next.js will warn and may serve the wrong handler"
  info "Fix: pnpm clean:dupes"
fi

header "Orphan jest processes"
# Count jest processes whose cwd is this repo (heuristic: command line contains the repo path).
JEST_PIDS=$(pgrep -fl "node .*jest.*bin/jest.js" 2>/dev/null | awk '{print $1}' || true)
ORPHAN_PIDS=""
for pid in $JEST_PIDS; do
  if ps -o command= -p "$pid" 2>/dev/null | grep -q "$REPO_ROOT"; then
    ORPHAN_PIDS="$ORPHAN_PIDS $pid"
  fi
done
ORPHAN_PIDS=$(echo "$ORPHAN_PIDS" | tr -s ' ' | sed 's/^ //;s/ $//')  # trim
if [ -z "$ORPHAN_PIDS" ]; then
  ok "no jest processes running for this repo"
else
  ORPHAN_COUNT=$(printf '%s\n' $ORPHAN_PIDS | grep -c .)
  warn "$ORPHAN_COUNT jest process(es) running: $ORPHAN_PIDS"
  info "If a 'pnpm test' is hanging, fix: pnpm clean:jest"
fi

header "Jest cache"
# next/jest's default cacheDirectory is /private/var/folders/...$TMPDIR/jest_<user>
JEST_CACHE_DIR=""
if [ -n "${TMPDIR:-}" ]; then
  for d in "$TMPDIR"jest_* "$TMPDIR"/jest_*; do
    [ -d "$d" ] && JEST_CACHE_DIR="$d" && break
  done
fi
if [ -z "$JEST_CACHE_DIR" ]; then
  for d in /private/var/folders/*/T/jest_* /tmp/jest_*; do
    [ -d "$d" ] && JEST_CACHE_DIR="$d" && break
  done
fi

if [ -n "$JEST_CACHE_DIR" ] && [ -d "$JEST_CACHE_DIR" ]; then
  HASTE_COUNT=$(find "$JEST_CACHE_DIR" -maxdepth 1 -type f -name "haste-map-*" 2>/dev/null | wc -l | tr -d ' ')
  CACHE_SIZE=$(du -sh "$JEST_CACHE_DIR" 2>/dev/null | awk '{print $1}')
  if [ "$HASTE_COUNT" -gt 1 ]; then
    warn "jest cache has $HASTE_COUNT haste-map files (multiple killed runs left them behind) at $JEST_CACHE_DIR ($CACHE_SIZE)"
    info "Fix: pnpm clean:jest"
  else
    ok "jest cache clean ($JEST_CACHE_DIR, $CACHE_SIZE)"
  fi
else
  ok "no jest cache yet (will be created on first test run)"
fi

header "git pre-commit hook"
HOOK_PATH=$(git config --get core.hooksPath 2>/dev/null || true)
if [ "$HOOK_PATH" = ".githooks" ] && [ -x ".githooks/pre-commit" ]; then
  ok "pre-commit hook installed (.githooks/pre-commit)"
else
  warn "pre-commit hook not installed; macOS Finder dupes could be committed"
  info "Fix: pnpm install  (runs scripts/install-git-hooks.sh automatically)"
fi

printf '\n'
if [ "$issues" -eq 0 ]; then
  printf '%s\n' "${C_GRN}All checks passed.${C_RST}"
  exit 0
else
  printf '%s\n' "${C_YEL}$issues issue(s) found.${C_RST} Run ${C_GRN}pnpm clean${C_RST} to fix everything safely, or use the targeted commands shown above."
  exit 1
fi
