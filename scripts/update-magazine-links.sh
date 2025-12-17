#!/bin/bash
# Script to update all magazine post links from /blog/${post.id} to getMagazinePostUrl(post)

echo "🔄 Updating magazine post links..."

# List of files to update
FILES=(
  "apps/customer-frontend/src/features/magazine/pillars/GocGiamTuyenPage.tsx"
  "apps/customer-frontend/src/features/magazine/pillars/CauChuyenDiSanPage.tsx"
  "apps/customer-frontend/src/features/magazine/ngu-hanh/KimPage.tsx"
  "apps/customer-frontend/src/features/magazine/ngu-hanh/MocPage.tsx"
  "apps/customer-frontend/src/features/magazine/ngu-hanh/ThuyPage.tsx"
  "apps/customer-frontend/src/features/magazine/ngu-hanh/HoaPage.tsx"
  "apps/customer-frontend/src/features/magazine/ngu-hanh/ThoPage.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  📝 Updating $file"
    
    # Replace the Link component
    sed -i 's|<Link to={`/blog/${post.id}`}>|<Link to={getMagazinePostUrl(post)}>|g' "$file"
    
    echo "  ✅ Done"
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo ""
echo "✨ All links updated!"
echo ""
echo "📋 Summary:"
echo "  - Changed: /blog/\${post.id} → getMagazinePostUrl(post)"
echo "  - New URL format: /tap-chi/:slug"
echo ""
echo "⚠️  Note: Make sure to import getMagazinePostUrl in each file!"
