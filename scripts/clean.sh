#!/usr/bin/env bash
# scripts/clean.sh
#
# Repair script for the recurring problems caused by macOS Finder / iCloud
# dropping duplicate files into source dirs and by jest leaving stale cache
# locks behind. Safe to run any time. Always idempotent.
#
# Usage:
#   scripts/clean.sh --all          # everything below
#   scripts/clean.sh --dupes        # delete macOS Finder duplicates in source dirs
#   scripts/clean.sh --jest         # kill orphan jest processes + clear jest cache
#   scripts/clean.sh --dry-run      # combine with any other flag to preview only
#
# Notes:
#   - Only deletes files matching the macOS Finder pattern ("foo 2.tsx",
#     "foo 14.ts", "foo 3", etc.). Multi-digit copy indices are supported.
#   - Scans source dirs, project root (non-recursive), public/, .githooks/,
#     __tests__/, __mocks__/, hooks/, utils/. Wedding/Prom/Photography media
#     folders are intentionally never touched (~16k dupes there are gitignored).
#   - For .git/ corruption (bad refs, bad loose objects), use the dedicated
#     scripts/repair-git-dupes.sh.
#   - All target files are also covered by .gitignore (so none are tracked).
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [ -t 1 ]; then
  C_RED=$'\033[31m'; C_YEL=$'\033[33m'; C_GRN=$'\033[32m'; C_DIM=$'\033[2m'; C_RST=$'\033[0m'
else
  C_RED=""; C_YEL=""; C_GRN=""; C_DIM=""; C_RST=""
fi

DO_DUPES=0
DO_JEST=0
DRY_RUN=0

while [ $# -gt 0 ]; do
  case "$1" in
    --all)      DO_DUPES=1; DO_JEST=1 ;;
    --dupes)    DO_DUPES=1 ;;
    --jest)     DO_JEST=1 ;;
    --dry-run)  DRY_RUN=1 ;;
    -h|--help)
      grep '^# ' "$0" | sed 's/^# \?//'
      exit 0 ;;
    *) echo "Unknown flag: $1" >&2; exit 2 ;;
  esac
  shift
done

if [ "$DO_DUPES" -eq 0 ] && [ "$DO_JEST" -eq 0 ]; then
  DO_DUPES=1; DO_JEST=1
fi

prefix() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '%s' "${C_DIM}[dry-run]${C_RST} "
  fi
}

if [ "$DO_DUPES" -eq 1 ]; then
  printf '\n%s\n' "${C_DIM}── macOS Finder duplicates ──${C_RST}"
  # Match paths whose basename ends in " <digits>" or " <digits>.<ext>".
  # We use `find -E ... -regex` (anchored to whole path) instead of fnmatch
  # globs because globs can't anchor to "right before the trailing extension"
  # and would falsely match originals like
  # "Screenshot 2026-03-14 at 12.08.04 AM.png".
  DUP_REGEX='.* [0-9]+(\.[A-Za-z0-9]+)?'
  SRC_DIRS=()
  for d in app components lib scripts __tests__ __mocks__ hooks utils public .githooks; do
    [ -d "$d" ] && SRC_DIRS+=("$d")
  done
  if [ ${#SRC_DIRS[@]} -gt 0 ]; then
    SRC_TARGETS=$(find -E "${SRC_DIRS[@]}" -type f -regex "$DUP_REGEX" 2>/dev/null || true)
  else
    SRC_TARGETS=""
  fi
  # Project-root scan: only one level deep so we don't recurse into the giant
  # wedding/photo media folders (which have ~16k dupes by design).
  ROOT_TARGETS=$(find -E . -maxdepth 1 -type f -regex "$DUP_REGEX" 2>/dev/null || true)
  TARGETS=$(printf '%s\n%s\n' "$SRC_TARGETS" "$ROOT_TARGETS" | sed '/^$/d')
  COUNT=$(printf '%s' "$TARGETS" | grep -c . || true)
  if [ "$COUNT" -eq 0 ]; then
    echo "${C_GRN}OK${C_RST}    no duplicates to remove"
  else
    echo "$(prefix)${C_YEL}removing${C_RST} $COUNT duplicate file(s):"
    printf '%s\n' "$TARGETS" | sed 's/^/      /'
    if [ "$DRY_RUN" -eq 0 ]; then
      printf '%s\n' "$TARGETS" | while IFS= read -r f; do
        [ -n "$f" ] && rm -f -- "$f"
      done
      echo "${C_GRN}done${C_RST}  removed $COUNT file(s)"
    fi
  fi
fi

if [ "$DO_JEST" -eq 1 ]; then
  printf '\n%s\n' "${C_DIM}── jest processes & cache ──${C_RST}"

  JEST_PIDS=""
  while IFS= read -r line; do
    pid=$(echo "$line" | awk '{print $1}')
    if ps -o command= -p "$pid" 2>/dev/null | grep -q "$REPO_ROOT"; then
      JEST_PIDS="$JEST_PIDS $pid"
    fi
  done < <(pgrep -fl "node .*jest.*bin/jest.js" 2>/dev/null || true)
  JEST_PIDS=$(echo "$JEST_PIDS" | tr -s ' ' | sed 's/^ //;s/ $//')

  if [ -z "$JEST_PIDS" ]; then
    echo "${C_GRN}OK${C_RST}    no jest processes running"
  else
    echo "$(prefix)${C_YEL}killing${C_RST} jest process(es): $JEST_PIDS"
    if [ "$DRY_RUN" -eq 0 ]; then
      kill $JEST_PIDS 2>/dev/null || true
      sleep 1
      # Anything still alive gets SIGKILL.
      for pid in $JEST_PIDS; do
        if kill -0 "$pid" 2>/dev/null; then
          kill -9 "$pid" 2>/dev/null || true
        fi
      done
      echo "${C_GRN}done${C_RST}  jest processes terminated"
    fi
  fi

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
    SIZE=$(du -sh "$JEST_CACHE_DIR" 2>/dev/null | awk '{print $1}')
    echo "$(prefix)${C_YEL}removing${C_RST} jest cache: $JEST_CACHE_DIR ($SIZE)"
    if [ "$DRY_RUN" -eq 0 ]; then
      rm -rf "$JEST_CACHE_DIR"
      echo "${C_GRN}done${C_RST}  jest cache cleared"
    fi
  else
    echo "${C_GRN}OK${C_RST}    no jest cache to clear"
  fi
fi

printf '\n'
if [ "$DRY_RUN" -eq 1 ]; then
  echo "${C_DIM}Dry run complete. Re-run without --dry-run to apply.${C_RST}"
else
  echo "${C_GRN}Cleanup complete.${C_RST}"
fi
