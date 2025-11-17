#!/bin/bash

# Fix specific markdown linting errors
fix_markdown_file() {
    local file="$1"
    echo "Fixing markdown errors in $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Use sed to fix common markdown issues
    
    # MD009: Remove trailing spaces
    sed -i '' 's/[[:space:]]*$//' "$file"
    
    # MD026: Remove trailing punctuation from headings
    sed -i '' 's/^\(#\+.*\)[.,:;!?]\+$/\1/' "$file"
    
    # MD022 & MD032: Add blank lines around headings and lists
    # This is more complex, so we'll use a Python script
    python3 - "$file" << 'EOF'
import sys
import re

def fix_markdown_structure(content):
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        current_line = lines[i].rstrip()  # Remove trailing spaces
        
        # Check if current line is a heading
        if re.match(r'^#+\s', current_line):
            # Add blank line before heading if previous line is not empty
            if fixed_lines and fixed_lines[-1].strip():
                fixed_lines.append('')
            
            fixed_lines.append(current_line)
            
            # Add blank line after heading if next line exists and is not empty
            if i + 1 < len(lines) and lines[i + 1].strip():
                fixed_lines.append('')
        
        # Check if current line starts a list
        elif re.match(r'^\s*[-*+]\s', current_line) or re.match(r'^\s*\d+\.\s', current_line):
            # Add blank line before list if previous line is not empty
            if fixed_lines and fixed_lines[-1].strip():
                fixed_lines.append('')
            
            # Add the list item
            fixed_lines.append(current_line)
            
            # Look ahead for more list items
            j = i + 1
            while j < len(lines):
                next_line = lines[j].rstrip()
                if re.match(r'^\s*[-*+]\s', next_line) or re.match(r'^\s*\d+\.\s', next_line) or next_line.strip() == '':
                    fixed_lines.append(next_line)
                    j += 1
                else:
                    break
            
            # Add blank line after list if next line exists and is not empty
            if j < len(lines) and lines[j].strip():
                fixed_lines.append('')
            
            i = j - 1  # Adjust index since we processed multiple lines
        
        # Check for fenced code blocks
        elif current_line.strip().startswith('```'):
            # Add blank line before code block if previous line is not empty
            if fixed_lines and fixed_lines[-1].strip():
                fixed_lines.append('')
            
            fixed_lines.append(current_line)
            i += 1
            
            # Add content until closing fence
            while i < len(lines) and not lines[i].strip().startswith('```'):
                fixed_lines.append(lines[i].rstrip())
                i += 1
            
            # Add closing fence
            if i < len(lines):
                fixed_lines.append(lines[i].rstrip())
            
            # Add blank line after code block if next line exists and is not empty
            if i + 1 < len(lines) and lines[i + 1].strip():
                fixed_lines.append('')
        
        else:
            fixed_lines.append(current_line)
        
        i += 1
    
    # Remove multiple consecutive empty lines and ensure single trailing newline
    result_lines = []
    prev_empty = False
    
    for line in fixed_lines:
        if line.strip() == '':
            if not prev_empty:
                result_lines.append('')
            prev_empty = True
        else:
            result_lines.append(line)
            prev_empty = False
    
    # Remove trailing empty lines and add single newline
    while result_lines and result_lines[-1].strip() == '':
        result_lines.pop()
    
    return '\n'.join(result_lines) + '\n'

if __name__ == "__main__":
    filename = sys.argv[1]
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed_content = fix_markdown_structure(content)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"Fixed markdown structure in {filename}")
EOF
    
    echo "Fixed $file"
}

# Fix all markdown files with errors
for file in "AI-INTEGRATION-GUIDE.md" "CHATGPT-INTEGRATION-SUMMARY.md" "DESIGN-OVERHAUL-SUMMARY.md" "RENAME-SUMMARY.md" "RESET-BUTTON-SUMMARY.md"; do
    if [ -f "$file" ]; then
        fix_markdown_file "$file"
    fi
done

echo "All markdown linting errors have been fixed!"