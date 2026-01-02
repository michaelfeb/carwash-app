#!/bin/bash

# Commit Script with Custom Format
# Format: <Type> [Component] : Description
# Example: <Feat> [Transaction] : Add modal for change status

echo "==================================="
echo "  Custom Commit Message Generator"
echo "==================================="
echo ""

# Prompt for commit type
echo "Select commit type:"
echo "1) Feat     - New feature"
echo "2) Fix      - Bug fix"
echo "3) Refactor - Code refactoring"
echo "4) Docs     - Documentation"
echo "5) Style    - Code style/formatting"
echo "6) Test     - Adding tests"
echo "7) Chore    - Maintenance tasks"
echo ""
read -p "Enter number (1-7): " type_choice

case $type_choice in
    1) TYPE="Feat" ;;
    2) TYPE="Fix" ;;
    3) TYPE="Refactor" ;;
    4) TYPE="Docs" ;;
    5) TYPE="Style" ;;
    6) TYPE="Test" ;;
    7) TYPE="Chore" ;;
    *) echo "Invalid choice. Exiting."; exit 1 ;;
esac

echo ""
# Prompt for component/feature
read -p "Enter component/feature (e.g., Transaction, DataTable, Auth): " COMPONENT

echo ""
# Prompt for description
read -p "Enter description: " DESCRIPTION

# Build commit message
COMMIT_MSG="<$TYPE> [$COMPONENT] : $DESCRIPTION"

echo ""
echo "==================================="
echo "Commit message:"
echo "$COMMIT_MSG"
echo "==================================="
echo ""

# Confirm before committing
read -p "Proceed with commit? (y/n): " confirm

if [[ $confirm == "y" || $confirm == "Y" ]]; then
    git add .
    git commit -m "$COMMIT_MSG"
    echo ""
    echo "✓ Committed successfully!"
else
    echo "Commit cancelled."
    exit 0
fi
