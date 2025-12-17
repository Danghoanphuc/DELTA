# Cấu Trúc Tạp Chí Printz

## 📚 Tổng Quan

Tạp chí Printz được thiết kế như một tạp chí hạng sang với kiến trúc Pillar Content, bao gồm:

- **1 trang chủ** (`/tap-chi`)
- **3 trang Pillar Tinh Thần** (Triết lý, Giám tuyển, Di sản)
- **5 trang Pillar Sản Phẩm** (Ngũ Hành: Kim, Mộc, Thủy, Hỏa, Thổ)

---

## 🗂️ Cấu Trúc Thư Mục

```
src/features/magazine/
├── MagazineHomePage.tsx          # Trang chủ tạp chí
├── index.ts                       # Export tất cả pages
├── pillars/                       # 3 Trụ cột Tinh thần
│   ├── TrietLySongPage.tsx       # Triết lý sống
│   ├── GocGiamTuyenPage.tsx      # Góc giám tuyển
│   └── CauChuyenDiSanPage.tsx    # Câu chuyện di sản
└── ngu-hanh/                      # 5 Trụ cột Sản phẩm
    ├── index.ts
    ├── KimPage.tsx                # Kim - Gốm & Sứ
    ├── MocPage.tsx                # Mộc - Trà & Hương
    ├── ThuyPage.tsx               # Thủy - Lụa & Vải
    ├── HoaPage.tsx                # Hỏa - Sơn Mài & Gỗ
    └── ThoPage.tsx                # Thổ - Đá & Thủ Công
```

---

## 🌐 Routing Structure

### Trang Chủ

- **URL**: `/tap-chi`
- **Component**: `MagazineHomePage`
- **Mô tả**: Landing page với 2 sections chính:
  - Section 1: Ba Trụ Cột Tinh Thần (3 cards)
  - Section 2: Ngũ Hành Tinh Hoa (vòng tròn 5 hành)

### Pillar Pages - Tinh Thần

#### 1. Triết Lý Sống

- **URL**: `/tap-chi/triet-ly-song`
- **Component**: `TrietLySongPage`
- **Category**: `philosophy`
- **Nội dung**:
  - Phần 1: Định nghĩa Evergreen về Zen, Wabi-Sabi, Kintsugi
  - Phần 2: Slider sản phẩm (Trà thiền, Trầm hương, Gốm...)
  - Phần 3: Thư viện bài viết (auto-fetch từ category "philosophy")

#### 2. Góc Giám Tuyển

- **URL**: `/tap-chi/goc-giam-tuyen`
- **Component**: `GocGiamTuyenPage`
- **Category**: `curator-notes`
- **Nội dung**:
  - Phần 1: Định nghĩa về vai trò giám tuyển
  - Phần 2: 3 Highlights (Hành trình, Tâm huyết, Câu chuyện)
  - Phần 3: Nhật ký giám tuyển (auto-fetch từ category "curator-notes")

#### 3. Câu Chuyện Di Sản

- **URL**: `/tap-chi/cau-chuyen-di-san`
- **Component**: `CauChuyenDiSanPage`
- **Category**: `heritage-stories`
- **Nội dung**:
  - Phần 1: Định nghĩa về di sản văn hóa
  - Phần 2: 4 Categories di sản (Gốm, Sơn mài, Trầm hương, Lụa)
  - Phần 3: Thư viện di sản (auto-fetch từ category "heritage-stories")

### Pillar Pages - Ngũ Hành

#### 1. Kim - Gốm & Sứ

- **URL**: `/tap-chi/ngu-hanh/kim`
- **Component**: `KimPage`
- **Màu**: Slate (Xám bạc)
- **Ý nghĩa**: Vững chãi, quý giá, vĩnh cửu
- **Sản phẩm**: Gốm Bát Tràng, Sứ Minh Long, Chu Đậu

#### 2. Mộc - Trà & Hương

- **URL**: `/tap-chi/ngu-hanh/moc`
- **Component**: `MocPage`
- **Màu**: Green (Xanh lá)
- **Ý nghĩa**: Sinh trưởng, tươi mới, sức sống
- **Sản phẩm**: Trầm hương, Trà Shan Tuyết, Ô Long, Phổ Nhĩ

#### 3. Thủy - Lụa & Vải

- **URL**: `/tap-chi/ngu-hanh/thuy`
- **Component**: `ThuyPage`
- **Màu**: Blue (Xanh dương)
- **Ý nghĩa**: Mềm mại, linh hoạt, uyển chuyển
- **Sản phẩm**: Lụa Vạn Phúc, Áo dài, Thổ cẩm, Khăn lụa

#### 4. Hỏa - Sơn Mài & Gỗ

- **URL**: `/tap-chi/ngu-hanh/hoa`
- **Component**: `HoaPage`
- **Màu**: Red (Đỏ)
- **Ý nghĩa**: Nhiệt huyết, sáng tạo, biến đổi
- **Sản phẩm**: Sơn mài Hạ Thái, Gỗ trầm, Gỗ gụ, Tranh sơn mài

#### 5. Thổ - Đá & Thủ Công

- **URL**: `/tap-chi/ngu-hanh/tho`
- **Component**: `ThoPage`
- **Màu**: Amber (Vàng đất)
- **Ý nghĩa**: Vững chãi, bền bỉ, nuôi dưỡng
- **Sản phẩm**: Đá cẩm thạch, Đá muối, Gốm thủ công, Đá Non Nước

---

## 🎨 Cấu Trúc Trang Pillar

Mỗi trang Pillar (cả Tinh Thần và Ngũ Hành) đều có cấu trúc 3 phần:

### Phần 1: Định Nghĩa (Evergreen Content)

- **Mục đích**: Nội dung cố định, ít thay đổi
- **Độ dài**: 300-500 chữ
- **Nội dung**: Giới thiệu về triết lý/sản phẩm, ý nghĩa văn hóa
- **Format**: Prose text trong card trắng

### Phần 2: Sản Phẩm Gợi Ý (Curated Products)

- **Mục đích**: Showcase sản phẩm phù hợp với pillar
- **Format**:
  - Pillar Tinh Thần: Slider với 5-6 sản phẩm
  - Pillar Ngũ Hành: Grid 3 cột với 6 sản phẩm
- **Thông tin**: Tên, mô tả, giá, rating, tags
- **CTA**: "Thêm vào giỏ" button

### Phần 3: Thư Viện Bài Viết (Cluster Content)

- **Mục đích**: Hiển thị bài blog liên quan
- **Cơ chế**: Auto-fetch từ API dựa trên category
- **Format**: Grid 3 cột với blog cards
- **Thông tin**: Ảnh, tiêu đề, excerpt, tác giả, ngày, tags

---

## 🔄 Cơ Chế Tự Động

### Blog Post Fetching

```typescript
// Sử dụng hook useBlogPosts
const { posts, isLoading } = useBlogPosts(category, searchTerm);

// Categories:
// - "philosophy" → Triết Lý Sống
// - "curator-notes" → Góc Giám Tuyển
// - "heritage-stories" → Câu Chuyện Di Sản
```

### Product Display

- Sản phẩm hiện tại là **static data** trong component
- **TODO**: Kết nối với Product API để fetch real-time data
- Filter theo category/tags tương ứng với mỗi Pillar

---

## 🎯 SEO & Content Strategy

### Pillar Content Strategy

1. **Evergreen Content**: Nội dung cố định, optimize cho SEO
2. **Cluster Content**: Bài viết liên quan, tạo internal linking
3. **Product Integration**: Kết hợp content + commerce

### URL Structure

```
/tap-chi                          # Hub page
├── /triet-ly-song               # Pillar 1
├── /goc-giam-tuyen              # Pillar 2
├── /cau-chuyen-di-san           # Pillar 3
└── /ngu-hanh/
    ├── /kim                      # Pillar 4
    ├── /moc                      # Pillar 5
    ├── /thuy                     # Pillar 6
    ├── /hoa                      # Pillar 7
    └── /tho                      # Pillar 8
```

### Internal Linking

- Trang chủ → 8 Pillar pages
- Pillar pages → Blog posts (auto)
- Pillar pages → Products
- Blog posts → Related pillars (manual)

---

## 📝 Content Management

### Thêm Bài Viết Mới

1. Vào Admin Panel
2. Tạo bài viết mới
3. Chọn **Category** phù hợp:
   - `philosophy` → Hiển thị ở Triết Lý Sống
   - `curator-notes` → Hiển thị ở Góc Giám Tuyển
   - `heritage-stories` → Hiển thị ở Câu Chuyện Di Sản
4. Thêm **Tags** để filter (optional)
5. Publish → Tự động hiển thị ở trang Pillar tương ứng

### Cập Nhật Sản Phẩm

**Hiện tại**: Sửa trực tiếp trong component
**Tương lai**: Kết nối với Product API

---

## 🚀 Next Steps

### Phase 1: Content ✅

- [x] Tạo cấu trúc 8 trang Pillar
- [x] Viết Evergreen content
- [x] Thiết kế UI/UX

### Phase 2: Integration 🔄

- [ ] Kết nối Product API cho phần sản phẩm
- [ ] Thêm filter/search cho blog posts
- [ ] Implement newsletter signup

### Phase 3: Enhancement 📈

- [ ] Add analytics tracking
- [ ] Optimize SEO meta tags
- [ ] Add social sharing
- [ ] Implement related posts algorithm

---

## 💡 Tips cho Content Team

### Viết Bài Cho Pillar

1. **Chọn đúng category** khi tạo bài
2. **Thêm tags** để dễ filter
3. **Upload ảnh chất lượng cao** (min 800x600px)
4. **Viết excerpt hấp dẫn** (150-200 chữ)
5. **Format content** với markdown

### Best Practices

- Mỗi Pillar nên có **ít nhất 3-5 bài viết**
- Update **định kỳ** để giữ content fresh
- **Cross-link** giữa các bài viết liên quan
- Sử dụng **keywords** phù hợp với SEO

---

## 📞 Support

Nếu cần hỗ trợ về cấu trúc tạp chí, liên hệ:

- Tech Team: Cập nhật code, fix bugs
- Content Team: Viết bài, upload content
- Design Team: Cập nhật UI/UX

---

**Last Updated**: December 2024
**Version**: 1.0.0
