#!/bin/bash

# Check that whichever commit we are on is the same as 'merging-devel'

target=devel

commit1=$(git log origin/merging-devel -1 --no-decorate --oneline | cut -f1 -d' ')
commit2=$(git log -1 --no-decorate --oneline | cut -f1 -d' ')

if [ "$commit1" == "$commit2" ]; then
    echo Commits match
    exit 0
else
    echo Commits do not match: ensure merging-devel points to your last commit
    echo "$commit1 (merging-devel) != $commit2 (this PR)"
    exit 1
fi
