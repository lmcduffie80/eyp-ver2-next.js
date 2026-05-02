#!/usr/bin/env bash
# scripts/repair-git-dupes.sh
#
# Repair iCloud-induced corruption inside .git/.
#
# When the project lives in ~/Documents/ (which iCloud Drive syncs by default),
# iCloud will create Finder-style copies of files in .git/ named
#   refs/heads/main 2, refs/heads/main 10, index 2,
#   objects/aa/bbbb...8d76 7,  etc.
#
# Git treats those as broken refs / bad loose objects and fails with errors
# like:
#
#   fatal: bad object refs/heads/main 10
#
# This script:
#   1. Backs up every offending file to .git-icloud-backup-<ts>/ in the repo
#      root (so nothing is lost if a deletion turns out to be wrong).
#   2. Deletes the bad refs, the duplicate index file(s), and the bad loose
#      objects under .git/objects/.
#   3. Runs `git fsck` and `git gc --prune=now` to repack and verify.
#
# Idempotent: safe to run any time. Re-run after every iCloud relapse.
#
# Usage:
#   bash scripts/repair-git-dupes.sh           # repair
#   bash scripts/repair-git-dupes.sh --dry-run # show what would be removed
set -uo pipefail

if [ -t 1 ]; then
  C_RED=$'\033[31m'; C_YEL=$'\033[33m'; C_GRN=$'\033[32m'; C_DIM=$'\033[2m'; C_RST=$'\033[0m'
else
  C_RED=""; C_YEL=""; C_GRN=""; C_DIM=""; C_RST=""
fi

DRY_RUN=0
case "${1:-}" in
  --dry-run|-n) DRY_RUN=1 ;;
  -h|--help) grep '^# ' "$0" | sed 's/^# \?//'; exit 0 ;;
  "") ;;
  *) echo "Unknown flag: $1" >&2; exit 2 ;;
esac

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Resolve the actual .git directory (could be a symlink to .git.nosync/).
GIT_DIR=".git"
if [ -L "$GIT_DIR" ]; then
  GIT_DIR="$(readlink "$GIT_DIR")"
fi
if [ ! -d "$GIT_DIR" ]; then
  echo "${C_RED}error:${C_RST} no .git directory at $REPO_ROOT" >&2
  exit 1
fi

prefix() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '%s' "${C_DIM}[dry-run]${C_RST} "
  fi
}

printf '\n%s\n' "${C_DIM}── repairing $GIT_DIR ──${C_RST}"

# Collect every duplicate-style path under .git/. Pattern matches:
#   refs/heads/main 2, main 10, index 2, packed-refs 3, HEAD 4,
#   objects/ab/cdef...12 7
# i.e. any filename ending with " <digits>" or " <digits>.<ext>".
TARGETS=$(find "$GIT_DIR" -type f \
  \( -name "* [0-9]*" -o -name "* [0-9]*.*" \) \
  ! -path "*.icloud-backup-*" 2>/dev/null || true)

COUNT=$(printf '%s' "$TARGETS" | grep -c . || true)

if [ "$COUNT" -eq 0 ]; then
  echo "${C_GRN}OK${C_RST}    no iCloud duplicates inside $GIT_DIR"
else
  echo "$(prefix)${C_YEL}found${C_RST} $COUNT duplicate file(s):"
    printf '%s\n' "$TARGETS" | head -20 | sed 's/^/      /'
  if [ "$COUNT" -gt 20 ]; then
    printf '      %s...and %d more%s\n' "$C_DIM" "$((COUNT - 20))" "$C_RST"
  fi

  if [ "$DRY_RUN" -eq 0 ]; then
    BACKUP_TAR="$REPO_ROOT/.git-icloud-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    echo "$(prefix)${C_YEL}backing up${C_RST} to $BACKUP_TAR"
    # One tar invocation is dramatically faster than 712 cp calls when iCloud
    # is in the loop (each file open/close costs seconds on iCloud-synced
    # storage). Filenames contain spaces, so use NUL-delimited input.
    if ! printf '%s\n' "$TARGETS" | tr '\n' '\0' \
      | (cd "$REPO_ROOT" && tar --null -czf "$BACKUP_TAR" -T - 2>/dev/null); then
      echo "${C_YEL}WARN${C_RST}  tar backup may be incomplete; continuing"
    fi

    echo "$(prefix)${C_YEL}removing${C_RST} $COUNT duplicate file(s)"
    # Single xargs call instead of a per-file loop: again, much faster.
    printf '%s\n' "$TARGETS" | tr '\n' '\0' \
      | xargs -0 -n 50 rm -f --
    echo "${C_GRN}done${C_RST}  removed $COUNT file(s) (backup at $BACKUP_TAR)"
  fi
fi

if [ "$DRY_RUN" -eq 1 ]; then
  printf '\n%s\n' "${C_DIM}Dry run complete. Re-run without --dry-run to apply.${C_RST}"
  exit 0
fi

printf '\n%s\n' "${C_DIM}── git fsck ──${C_RST}"
# We tolerate dangling objects (normal after some workflows). Anything else
# that fsck reports after the cleanup is something we want to know about.
if FSCK_OUT=$(git fsck --no-dangling --no-reflogs 2>&1); then
  if [ -z "$FSCK_OUT" ]; then
    echo "${C_GRN}OK${C_RST}    fsck clean"
  else
    printf '%s\n' "$FSCK_OUT" | sed 's/^/      /'
    echo "${C_YEL}WARN${C_RST}  fsck reported the above (often benign warnings)"
  fi
else
  printf '%s\n' "$FSCK_OUT" | sed 's/^/      /'
  echo "${C_RED}FAIL${C_RST}  fsck still reports errors after cleanup"
  exit 1
fi

printf '\n%s\n' "${C_DIM}── git gc ──${C_RST}"
git gc --prune=now --quiet
echo "${C_GRN}done${C_RST}  repacked and pruned"

printf '\n%s\n' "${C_DIM}── repo state ──${C_RST}"
HEAD_SHA=$(git rev-parse HEAD 2>&1)
if echo "$HEAD_SHA" | grep -qE '^[a-f0-9]{40}$'; then
  echo "${C_GRN}OK${C_RST}    HEAD = $HEAD_SHA"
else
  echo "${C_RED}FAIL${C_RST}  git rev-parse HEAD: $HEAD_SHA"
  exit 1
fi

printf '\n%s\n' "${C_GRN}.git repair complete.${C_RST}"
