#!/usr/bin/env bash
# scripts/exclude-from-icloud.sh
#
# When the project lives in ~/Documents (which iCloud Drive syncs by default),
# iCloud creates Finder-style copies of files inside .git/ and node_modules/
# (e.g. "main 10", "next-swc.darwin-arm64 2.node"). Those copies cause
# silent build hangs and "fatal: bad object refs/heads/main 10" errors.
#
# macOS / iCloud Drive ignore any path whose name ends with ".nosync".
# We rename .git -> .git.nosync and node_modules -> node_modules.nosync,
# then symlink the original names back. Git, pnpm, and Next.js follow
# symlinks transparently, so nothing else has to change.
#
# This script is idempotent and safe to run on every `pnpm install` (it is
# wired into the package.json postinstall hook). It no-ops on non-Darwin
# systems, on CI, and when the symlinks already exist.
#
# Usage:
#   bash scripts/exclude-from-icloud.sh           # protect .git and node_modules
#   bash scripts/exclude-from-icloud.sh --revert  # undo (un-symlink, move back)
#   bash scripts/exclude-from-icloud.sh --dry-run # show what would happen
set -uo pipefail

if [ -t 1 ]; then
  C_RED=$'\033[31m'; C_YEL=$'\033[33m'; C_GRN=$'\033[32m'; C_DIM=$'\033[2m'; C_RST=$'\033[0m'
else
  C_RED=""; C_YEL=""; C_GRN=""; C_DIM=""; C_RST=""
fi

DRY_RUN=0
REVERT=0
case "${1:-}" in
  --dry-run|-n) DRY_RUN=1 ;;
  --revert)     REVERT=1 ;;
  -h|--help) grep '^# ' "$0" | sed 's/^# \?//'; exit 0 ;;
  "") ;;
  *) echo "Unknown flag: $1" >&2; exit 2 ;;
esac

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Skip on non-macOS — iCloud Drive only exists on Darwin. Skip in CI.
if [ "$(uname)" != "Darwin" ]; then
  echo "${C_DIM}exclude-from-icloud: not macOS, skipping${C_RST}"
  exit 0
fi
if [ -n "${CI:-}" ] || [ -n "${VERCEL:-}" ] || [ -n "${GITHUB_ACTIONS:-}" ]; then
  echo "${C_DIM}exclude-from-icloud: CI environment, skipping${C_RST}"
  exit 0
fi

prefix() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '%s' "${C_DIM}[dry-run]${C_RST} "
  fi
}

# Move target from $1 -> $1.nosync and symlink $1 to it. Idempotent.
protect() {
  local target="$1"
  local nosync="${target}.nosync"

  if [ -L "$target" ]; then
    if [ "$(readlink "$target")" = "$nosync" ]; then
      echo "${C_GRN}OK${C_RST}    $target already iCloud-excluded"
      return 0
    else
      echo "${C_YEL}WARN${C_RST}  $target is a symlink but points to $(readlink "$target"), not $nosync; skipping"
      return 0
    fi
  fi

  if [ ! -e "$target" ]; then
    echo "${C_DIM}info${C_RST}  $target does not exist, nothing to protect"
    return 0
  fi

  if [ -e "$nosync" ]; then
    echo "${C_RED}error${C_RST} both $target and $nosync exist as real paths; resolve manually" >&2
    return 1
  fi

  echo "$(prefix)${C_YEL}protecting${C_RST} $target -> $nosync"
  if [ "$DRY_RUN" -eq 0 ]; then
    mv "$target" "$nosync"
    ln -s "$nosync" "$target"
    echo "${C_GRN}done${C_RST}  $target is now a symlink to $nosync (iCloud will skip it)"
  fi
}

# Reverse of protect: turn the symlink back into a real directory.
revert() {
  local target="$1"
  local nosync="${target}.nosync"

  if [ ! -L "$target" ]; then
    echo "${C_DIM}info${C_RST}  $target is not a symlink, nothing to revert"
    return 0
  fi
  if [ ! -d "$nosync" ]; then
    echo "${C_RED}error${C_RST} $target is a symlink but $nosync is missing; resolve manually" >&2
    return 1
  fi

  echo "$(prefix)${C_YEL}reverting${C_RST} $target (removing symlink, moving $nosync back)"
  if [ "$DRY_RUN" -eq 0 ]; then
    rm "$target"
    mv "$nosync" "$target"
    echo "${C_GRN}done${C_RST}  $target is now a real directory again"
  fi
}

printf '\n%s\n' "${C_DIM}── iCloud exclusion (.nosync rename trick) ──${C_RST}"

if [ "$REVERT" -eq 1 ]; then
  revert .git
  revert node_modules
else
  protect .git
  protect node_modules
fi

if [ "$DRY_RUN" -eq 1 ]; then
  printf '\n%s\n' "${C_DIM}Dry run complete. Re-run without --dry-run to apply.${C_RST}"
fi
