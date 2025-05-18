#!/bin/bash

# Check if current directory is a git repository
if [ ! -d .git ]; then
  echo "Not a git repository."
  exit 1
fi

# Check for a remote pointing to GitHub
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [[ -z "$REMOTE_URL" ]]; then
  echo "No 'origin' remote found."
  exit 1
fi
if [[ "$REMOTE_URL" != *github.com* ]]; then
  echo "'origin' remote does not point to GitHub: $REMOTE_URL"
  exit 1
fi

echo "Remote 'origin' points to: $REMOTE_URL"

# Fetch latest from remote
git fetch origin &>/dev/null

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "You have uncommitted changes."
else
  echo "No uncommitted changes."
fi

# Check for unpushed commits
UNPUSHED=$(git log origin/$BRANCH..HEAD --oneline)
if [ -n "$UNPUSHED" ]; then
  echo "You have unpushed commits:"
  echo "$UNPUSHED"
else
  echo "No unpushed commits."
fi

# Check for unpulled commits
UNPULLED=$(git log HEAD..origin/$BRANCH --oneline)
if [ -n "$UNPULLED" ]; then
  echo "You have unpulled commits:"
  echo "$UNPULLED"
else
  echo "No unpulled commits."
fi

# Summary
if [ -z "$(git status --porcelain)" ] && [ -z "$UNPUSHED" ] && [ -z "$UNPULLED" ]; then
  echo "\nYour local folder and GitHub repo are in sync!"
else
  echo "\nYour local folder and GitHub repo are NOT in sync."
fi 