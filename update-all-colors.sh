#!/bin/bash

# Script to update all organization pages with Sơn Mài theme
# Usage: bash update-all-colors.sh

echo "🎨 Starting color theme update for all organization pages..."

# Array of files to update
files=(
  "apps/customer-frontend/src/features/organization/pages/SwagPacksPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/RecipientsPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/TeamPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/AnalyticsPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/SettingsPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/AccountPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/SupportPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/InventoryPage.tsx"
)

# Color replacements using sed
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Updating $file..."
    
    # Background colors
    sed -i 's/bg-gray-50\b/bg-[#FAFAF8]/g' "$file"
    sed -i 's/bg-gray-100\b/bg-[#F7F6F2]/g' "$file"
    sed -i 's/bg-white\b/bg-[#F7F6F2]/g' "$file"
    sed -i 's/bg-orange-50\b/bg-[#FFF5F3]/g' "$file"
    sed -i 's/bg-orange-100\b/bg-[#FFF5F3]/g' "$file"
    sed -i 's/bg-orange-500\b/bg-[#C63321]/g' "$file"
    sed -i 's/bg-orange-600\b/bg-[#A82A1A]/g' "$file"
    
    # Text colors
    sed -i 's/text-gray-900\b/text-[#1C1917]/g' "$file"
    sed -i 's/text-gray-800\b/text-[#1C1917]/g' "$file"
    sed -i 's/text-gray-700\b/text-[#44403C]/g' "$file"
    sed -i 's/text-gray-600\b/text-[#57534E]/g' "$file"
    sed -i 's/text-gray-500\b/text-[#78716C]/g' "$file"
    sed -i 's/text-gray-400\b/text-[#A8A29E]/g' "$file"
    sed -i 's/text-gray-300\b/text-[#E5E3DC]/g' "$file"
    sed -i 's/text-orange-700\b/text-[#C63321]/g' "$file"
    sed -i 's/text-orange-600\b/text-[#C63321]/g' "$file"
    sed -i 's/text-orange-500\b/text-[#C63321]/g' "$file"
    
    # Border colors
    sed -i 's/border-gray-200\b/border-[#E5E3DC]/g' "$file"
    sed -i 's/border-gray-100\b/border-[#E5E3DC]/g' "$file"
    sed -i 's/border-orange-200\b/border-[#C63321]/g' "$file"
    sed -i 's/border-orange-500\b/border-[#C63321]/g' "$file"
    
    # Hover states
    sed -i 's/hover:bg-gray-50\b/hover:bg-[#FAFAF8]/g' "$file"
    sed -i 's/hover:bg-gray-100\b/hover:bg-[#F7F6F2]/g' "$file"
    sed -i 's/hover:text-gray-900\b/hover:text-[#1C1917]/g' "$file"
    sed -i 's/hover:bg-orange-600\b/hover:bg-[#A82A1A]/g' "$file"
    sed -i 's/hover:bg-orange-500\b/hover:bg-[#C63321]/g' "$file"
    sed -i 's/hover:border-orange-300\b/hover:border-[#C63321]/g' "$file"
    
    # Update border-none to border-2
    sed -i 's/border-none shadow-sm/border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]/g' "$file"
    
    echo "✅ Updated $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "🎉 Color theme update complete!"
echo "📊 Updated ${#files[@]} files"
echo ""
echo "Next steps:"
echo "1. Review changes with: git diff"
echo "2. Test the pages visually"
echo "3. Run diagnostics to check for errors"
