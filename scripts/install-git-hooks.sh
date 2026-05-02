#!/usr/bin/env bash
# scripts/install-git-hooks.sh
#
# Point git at the in-repo .githooks directory so the pre-commit hook runs.
# Idempotent. Run automatically by `pnpm install` via the postinstall script.
set -uo pipefail

# Skip silently outside a git checkout (e.g. fresh tarball, CI cache layer).
if [ ! -d .git ] && ! git rev-parse --git-dir >/dev/null 2>&1; then
  exit 0
fi

if [ ! -d .githooks ]; then
  exit 0
fi

CURRENT=$(git config --get core.hooksPath 2>/dev/null || true)
if [ "$CURRENT" != ".githooks" ]; then
  git config core.hooksPath .githooks
fi

# Make sure each hook is executable.
chmod +x .githooks/* 2>/dev/null || true

exit 0
