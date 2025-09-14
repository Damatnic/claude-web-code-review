#!/bin/bash

# Claude Web Code Review - Large File Handler
# Automatically chunks and reviews large files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if file path is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No file path provided${NC}"
    echo "Usage: $0 <file-path> [template]"
    exit 1
fi

FILE_PATH="$1"
TEMPLATE="${2:-best-practices}"

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}Error: File not found: $FILE_PATH${NC}"
    exit 1
fi

# Get file size
FILE_SIZE=$(stat -f%z "$FILE_PATH" 2>/dev/null || stat -c%s "$FILE_PATH" 2>/dev/null)
FILE_SIZE_KB=$((FILE_SIZE / 1024))

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}  Claude Web Code Review - Large File Mode ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "File: ${GREEN}$(basename "$FILE_PATH")${NC}"
echo -e "Size: ${YELLOW}${FILE_SIZE_KB} KB${NC}"
echo -e "Template: ${GREEN}$TEMPLATE${NC}"
echo ""

# Check if file needs chunking (> 100KB)
if [ $FILE_SIZE_KB -gt 100 ]; then
    echo -e "${YELLOW}⚡ Large file detected. Chunking required...${NC}"
    
    # Chunk the file
    echo -e "${BLUE}Step 1: Chunking file...${NC}"
    node src/chunker.js file "$FILE_PATH"
    
    # Find the latest chunk directory
    CHUNK_DIR=$(find chunks -type d -name "$(basename "$FILE_PATH" | cut -d. -f1)_*" | sort -r | head -1)
    
    if [ -z "$CHUNK_DIR" ]; then
        echo -e "${RED}Error: No chunks created${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Chunks created in: $CHUNK_DIR${NC}"
    
    # Review each chunk
    echo -e "${BLUE}Step 2: Reviewing chunks...${NC}"
    
    CHUNK_COUNT=$(find "$CHUNK_DIR" -name "chunk_*.js" -o -name "chunk_*.ts" -o -name "chunk_*.py" | wc -l)
    CURRENT=0
    
    for CHUNK in "$CHUNK_DIR"/chunk_*; do
        if [ -f "$CHUNK" ]; then
            CURRENT=$((CURRENT + 1))
            echo -e "  Reviewing chunk $CURRENT/$CHUNK_COUNT..."
            node src/review.js file "$CHUNK" --template "$TEMPLATE"
        fi
    done
    
    echo -e "${GREEN}✓ All chunks reviewed${NC}"
    
else
    echo -e "${BLUE}File size is manageable. Direct review...${NC}"
    node src/review.js file "$FILE_PATH" --template "$TEMPLATE"
fi

# Display review summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Review Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

# Find and display the latest review report
LATEST_REVIEW=$(find reviews -name "$(basename "$FILE_PATH" | cut -d. -f1)_*.md" | sort -r | head -1)

if [ -f "$LATEST_REVIEW" ]; then
    echo ""
    echo -e "${BLUE}Review Report Summary:${NC}"
    echo -e "${BLUE}───────────────────────${NC}"
    
    # Display first 20 lines of the report
    head -20 "$LATEST_REVIEW"
    
    echo ""
    echo -e "${YELLOW}Full report: $LATEST_REVIEW${NC}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"