#!/bin/sh
# Link the portable kernel from a sibling pi-director clone into a workspace.
# Usage: apply-kit.sh [workspace] [--director <path>]
set -eu

workspace="."
director=""

while [ $# -gt 0 ]; do
  case "$1" in
    --director)
      if [ $# -lt 2 ]; then
        echo "apply-kit: --director needs a path" >&2
        exit 1
      fi
      director="$2"
      shift 2
      ;;
    --director=*)
      director="${1#--director=}"
      shift
      ;;
    -*)
      echo "apply-kit: unknown option $1" >&2
      echo "usage: apply-kit.sh [workspace] [--director <path>]" >&2
      exit 1
      ;;
    *)
      workspace="$1"
      shift
      ;;
  esac
done

workspace=$(CDPATH= cd "$workspace" && pwd)
if [ -z "$director" ]; then
  director="$workspace/pi-director"
fi
director=$(CDPATH= cd "$director" && pwd)

kernel="$director/setup/AGENTS.md"
if [ ! -f "$kernel" ]; then
  echo "apply-kit: no setup/AGENTS.md at $director" >&2
  exit 1
fi

rel_director=$(node -e "console.log(require('path').relative(process.argv[1], process.argv[2]))" "$workspace" "$director")
if [ -z "$rel_director" ]; then
  echo "apply-kit: director path resolved inside the workspace root; pass a sibling clone" >&2
  exit 1
fi

link() {
  dest="$1"
  rel="$2"
  dest_dir=$(dirname "$dest")
  mkdir -p "$dest_dir"
  if [ -L "$dest" ]; then
    cur=$(readlink "$dest")
    if [ "$cur" = "$rel" ]; then
      echo "skip $dest (already $rel)"
      return 0
    fi
    ln -sfn "$rel" "$dest"
    echo "relink $dest -> $rel"
    return 0
  fi
  if [ -d "$dest" ]; then
    echo "skip $dest (directory exists)"
    return 0
  fi
  if [ -e "$dest" ]; then
    rm -f "$dest"
    ln -sfn "$rel" "$dest"
    echo "replace $dest -> $rel"
    return 0
  fi
  ln -sfn "$rel" "$dest"
  echo "link $dest -> $rel"
}

seed() {
  dest="$1"
  src="$2"
  dest_dir=$(dirname "$dest")
  mkdir -p "$dest_dir"
  if [ -e "$dest" ] || [ -L "$dest" ]; then
    echo "skip $dest (exists)"
    return 0
  fi
  cp "$src" "$dest"
  echo "seed $dest"
}

mkdir -p "$workspace/.agents" "$workspace/run/dev" "$workspace/run/test" \
  "$workspace/.agents/plan" "$workspace/.agents/projects"

link "$workspace/AGENTS.md" "$rel_director/setup/AGENTS.md"
link "$workspace/.agents/AGENTS.md" "$rel_director/setup/.agents/AGENTS.md"
link "$workspace/.agents/templates" "$rel_director/setup/.agents/templates"

seed "$workspace/.agents/MEMORY.md" "$director/setup/.agents/MEMORY.md"
seed "$workspace/.agents/WORKSPACE.md" "$director/setup/.agents/WORKSPACE.md"
seed "$workspace/.gitignore" "$director/setup/.gitignore"

if [ ! -e "$workspace/run/dev/.gitkeep" ]; then
  : >"$workspace/run/dev/.gitkeep"
  echo "seed $workspace/run/dev/.gitkeep"
else
  echo "skip $workspace/run/dev/.gitkeep (exists)"
fi
if [ ! -e "$workspace/run/test/.gitkeep" ]; then
  : >"$workspace/run/test/.gitkeep"
  echo "seed $workspace/run/test/.gitkeep"
else
  echo "skip $workspace/run/test/.gitkeep (exists)"
fi
if [ ! -e "$workspace/.agents/plan/.gitkeep" ]; then
  : >"$workspace/.agents/plan/.gitkeep"
  echo "seed $workspace/.agents/plan/.gitkeep"
else
  echo "skip $workspace/.agents/plan/.gitkeep (exists)"
fi
if [ ! -e "$workspace/.agents/projects/.gitkeep" ]; then
  : >"$workspace/.agents/projects/.gitkeep"
  echo "seed $workspace/.agents/projects/.gitkeep"
else
  echo "skip $workspace/.agents/projects/.gitkeep (exists)"
fi
