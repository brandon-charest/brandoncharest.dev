#!/usr/bin/env bash

# Script to create new markdown files with common frontmatter
# Usage: ./new-post.sh <type> <path/to/file.md>
# Example: ./new-post.sh blog content/blog/2026-01-05-my-new-post.md
# Example: ./new-post.sh garden content/garden/algorithms/sorting.md
# Example: ./new-post.sh index content/garden/newcategory/_index.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo "Usage: $0 <type> <filepath>"
    echo ""
    echo "Types:"
    echo "  blog    - Create a blog post with full frontmatter"
    echo "  garden  - Create a garden page with growth tracking"
    echo "  index   - Create an _index.md section file"
    echo ""
    echo "Examples:"
    echo "  $0 blog content/blog/2026-01-05-my-post.md"
    echo "  $0 garden content/garden/rust/ownership.md"
    echo "  $0 index content/garden/newcategory/_index.md"
    exit 1
}

# Check arguments
if [ $# -ne 2 ]; then
    usage
fi

TYPE="$1"
FILEPATH="$2"

# Make path absolute if it's relative
if [[ ! "$FILEPATH" = /* ]]; then
    FILEPATH="$SCRIPT_DIR/$FILEPATH"
fi

# Check if file already exists
if [ -f "$FILEPATH" ]; then
    echo -e "${RED}Error: File already exists: $FILEPATH${NC}"
    exit 1
fi

# Create directory if it doesn't exist
DIR=$(dirname "$FILEPATH")
mkdir -p "$DIR"

# Get current date in ISO format
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
SIMPLE_DATE=$(date +"%Y-%m-%d")

# Extract filename without path and extension for title suggestion
FILENAME=$(basename "$FILEPATH" .md)
# Convert filename to title case (replace hyphens/underscores with spaces)
TITLE=$(echo "$FILENAME" | sed 's/[-_]/ /g' | sed 's/\b\(.\)/\u\1/g')

case "$TYPE" in
    blog)
        cat > "$FILEPATH" << EOF
+++
title = "$TITLE"
date = "$CURRENT_DATE"
description = ""
[taxonomies]
    tags = [ ]
[extra]
    pinned = false
    type = "blog"
    growth = "evergreen"
    cover_image = ""
+++

## Introduction

Your content here...
EOF
        ;;
    
    garden)
        cat > "$FILEPATH" << EOF
+++
title = "$TITLE"
date = "$SIMPLE_DATE"
description = ""

[taxonomies]
tags = []

[extra]
growth = "seedling"
+++

## Overview

Your content here...
EOF
        ;;
    
    index)
        cat > "$FILEPATH" << EOF
+++
title = "$TITLE"
description = ""
sort_by = "date"
template = "section.html"

+++
EOF
        ;;
    
    *)
        echo -e "${RED}Error: Unknown type '$TYPE'${NC}"
        usage
        ;;
esac

echo -e "${GREEN}✓ Created $TYPE file: $FILEPATH${NC}"
echo -e "${YELLOW}📝 Opening in \$EDITOR...${NC}"

# Open in editor if set, otherwise just display the path
if [ -n "$EDITOR" ]; then
    $EDITOR "$FILEPATH"
else
    echo -e "${YELLOW}Tip: Set \$EDITOR environment variable to auto-open files${NC}"
fi
