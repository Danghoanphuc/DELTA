#!/bin/bash
# Add font-serif to headings

files=(
  "apps/customer-frontend/src/features/organization/pages/TeamPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/RecipientsPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/SettingsPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/AccountPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/SupportPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/InventoryPage.tsx"
  "apps/customer-frontend/src/features/organization/pages/AnalyticsPage.tsx"
)

for file in "${files[@]}"; do
  sed -i 's/text-2xl font-bold text-\[#1C1917\]/text-2xl font-serif font-bold text-[#1C1917]/g' "$file"
  echo "✅ Updated typography in $file"
done

echo "🎉 Typography update complete!"
