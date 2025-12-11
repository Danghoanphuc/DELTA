#!/usr/bin/env python3
"""
Script to update color theme from gray/orange to Sơn Mài theme
Usage: python update-colors.py <file_path>
"""

import re
import sys

# Color mapping rules
COLOR_REPLACEMENTS = [
    # Background colors
    (r'bg-gray-50\b', 'bg-[#FAFAF8]'),
    (r'bg-gray-100\b', 'bg-[#F7F6F2]'),
    (r'bg-white\b', 'bg-[#F7F6F2]'),
    (r'bg-orange-50\b', 'bg-[#FFF5F3]'),
    (r'bg-orange-100\b', 'bg-[#FFF5F3]'),
    (r'bg-orange-500\b', 'bg-[#C63321]'),
    (r'bg-orange-600\b', 'bg-[#A82A1A]'),
    
    # Text colors
    (r'text-gray-900\b', 'text-[#1C1917]'),
    (r'text-gray-800\b', 'text-[#1C1917]'),
    (r'text-gray-700\b', 'text-[#44403C]'),
    (r'text-gray-600\b', 'text-[#57534E]'),
    (r'text-gray-500\b', 'text-[#78716C]'),
    (r'text-gray-400\b', 'text-[#A8A29E]'),
    (r'text-orange-700\b', 'text-[#C63321]'),
    (r'text-orange-600\b', 'text-[#C63321]'),
    (r'text-orange-500\b', 'text-[#C63321]'),
    
    # Border colors
    (r'border-gray-200\b', 'border-[#E5E3DC]'),
    (r'border-gray-100\b', 'border-[#E5E3DC]'),
    (r'border-orange-200\b', 'border-[#C63321]'),
    (r'border-orange-500\b', 'border-[#C63321]'),
    
    # Hover states
    (r'hover:bg-gray-50\b', 'hover:bg-[#FAFAF8]'),
    (r'hover:bg-gray-100\b', 'hover:bg-[#F7F6F2]'),
    (r'hover:text-gray-900\b', 'hover:text-[#1C1917]'),
    (r'hover:bg-orange-600\b', 'hover:bg-[#A82A1A]'),
    
    # Ring colors (convert to shadow)
    (r'ring-1 ring-orange-200', 'shadow-[0_0_0_2px_rgba(198,51,33,0.2)]'),
    (r'ring-2 ring-orange-500', 'shadow-[0_0_0_2px_rgba(198,51,33,0.3)]'),
]

def update_colors(content):
    """Apply all color replacements to content"""
    for pattern, replacement in COLOR_REPLACEMENTS:
        content = re.sub(pattern, replacement, content)
    return content

def main():
    if len(sys.argv) < 2:
        print("Usage: python update-colors.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        updated_content = update_colors(content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        print(f"✅ Updated colors in {file_path}")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
