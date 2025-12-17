# Blog Module - DEPRECATED

⚠️ **Module này không còn được sử dụng**

## Lý do

Frontend đã được gộp chung với Magazine module. Tất cả blog posts giờ được quản lý qua Magazine API.

## Migration

- Frontend: Đã xóa `BlogPage.tsx`, `BlogDetailPage.tsx`, `blog.service.ts`, `useBlogPosts.ts`
- Route `/blog/:id` giờ redirect đến `MagazinePostDetailPage`
- Tất cả posts được fetch từ Magazine API

## Có thể xóa

Nếu không còn dùng SupplierPost model, có thể xóa toàn bộ folder này:

- `blog.controller.js`
- `blog.routes.js`
- `blog.service.js` (nếu có)

## Ngày deprecated

2024-12-14
