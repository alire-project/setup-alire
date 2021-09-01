#!/bin/bash

# Check that whichever commit we are on is the same as 'merging-$target'

target=devel

# See whats happening
git log --graph --decorate --pretty=oneline --abbrev-commit --all | head -30

commit1=$(git log origin/merging-$target -1 --no-decorate --oneline --no-abbrev-commit | cut -f1 -d' ')
commit2=$(git rev-list --parents HEAD -n1 | cut -f3 -d' ')
# <hash> <parent1 hash> <parent2 hash>

if [ "$commit1" == "$commit2" ]; then
    echo Commits match
    exit 0
else
    echo Commits do not match: ensure merging-devel points to your last commit
    echo "$commit1 (merging-devel) != $commit2 (this PR)"
    exit 1
fi
