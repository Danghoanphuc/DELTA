# 🌍 Hệ thống đa ngôn ngữ (i18n)

## Ngôn ngữ được hỗ trợ

- 🇻🇳 Tiếng Việt (vi) - Mặc định
- 🇺🇸 English (en)
- 🇯🇵 日本語 (ja)
- 🇰🇷 한국어 (ko)
- 🇨🇳 中文 (zh)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇪🇸 Español (es)
- 🇮🇹 Italiano (it)
- 🇷🇺 Русский (ru)

## Cách sử dụng

### 1. Sử dụng hook `useTranslation`

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t("header.shop")}</h1>;
}
```

### 2. Sử dụng hook `useLanguage` (custom)

```tsx
import { useLanguage } from "@/i18n";

function LanguageSwitcher() {
  const { currentLangInfo, changeLanguage } = useLanguage();

  return (
    <div>
      <p>Current: {currentLangInfo.label}</p>
      <button onClick={() => changeLanguage("en")}>Switch to English</button>
    </div>
  );
}
```

### 3. Thêm translation mới

Thêm key vào tất cả các file trong `locales/*/translation.json`:

```json
{
  "header": {
    "newKey": "New Value"
  }
}
```

Sau đó sử dụng: `t('header.newKey')`

## Cấu trúc thư mục

```
i18n/
├── config.ts              # Cấu hình i18next
├── constants.ts           # Danh sách ngôn ngữ
├── index.ts              # Export chính
├── hooks/
│   └── useLanguage.ts    # Custom hook
├── locales/
│   ├── vi/
│   │   └── translation.json
│   ├── en/
│   │   └── translation.json
│   └── ... (8 ngôn ngữ khác)
└── react-i18next.d.ts    # TypeScript definitions
```

## Lưu ý

- Ngôn ngữ được lưu trong `localStorage`
- Tự động phát hiện ngôn ngữ trình duyệt
- Fallback về Tiếng Việt nếu không tìm thấy translation
