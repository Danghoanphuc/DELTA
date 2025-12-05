# 📚 Ví dụ sử dụng i18n

## 1. Component đơn giản với translation

```tsx
import { useTranslation } from "@/i18n";

function WelcomeMessage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("header.shop")}</h1>
      <p>{t("header.business")}</p>
    </div>
  );
}
```

## 2. Component với language switcher

```tsx
import { LanguageSwitcher } from "@/i18n";

function MyHeader() {
  return (
    <header>
      <nav>...</nav>
      <LanguageSwitcher variant="compact" align="end" />
    </header>
  );
}
```

## 3. Custom language selector

```tsx
import { useLanguage, LANGUAGES, type LanguageCode } from "@/i18n";

function CustomLanguageSelector() {
  const { currentLangInfo, changeLanguage } = useLanguage();

  return (
    <div>
      <p>Current: {currentLangInfo.label}</p>
      <select
        value={currentLangInfo.code}
        onChange={(e) => changeLanguage(e.target.value as LanguageCode)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## 4. Hiển thị text theo ngôn ngữ hiện tại

```tsx
import { useLanguage } from "@/i18n";

function LanguageInfo() {
  const { currentLangInfo } = useLanguage();

  return (
    <div>
      <span>{currentLangInfo.flag}</span>
      <span>{currentLangInfo.label}</span>
      <span>{currentLangInfo.shortCode}</span>
    </div>
  );
}
```

## 5. Sử dụng translation với biến

Thêm vào translation.json:

```json
{
  "welcome": "Welcome, {{name}}!"
}
```

Sử dụng:

```tsx
const { t } = useTranslation();
return <p>{t("welcome", { name: "John" })}</p>;
// Output: "Welcome, John!"
```

## 6. Translation với số nhiều (pluralization)

Thêm vào translation.json:

```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}
```

Sử dụng:

```tsx
const { t } = useTranslation();
return (
  <>
    <p>{t("items", { count: 1 })}</p> // "1 item"
    <p>{t("items", { count: 5 })}</p> // "5 items"
  </>
);
```

## 7. Kiểm tra ngôn ngữ hiện tại

```tsx
import { useLanguage } from "@/i18n";

function ConditionalContent() {
  const { currentLangInfo } = useLanguage();

  if (currentLangInfo.code === "vi") {
    return <VietnameseContent />;
  }

  return <EnglishContent />;
}
```

## 8. Đổi ngôn ngữ khi click button

```tsx
import { useLanguage } from "@/i18n";

function QuickLanguageSwitch() {
  const { changeLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      <button onClick={() => changeLanguage("vi")}>🇻🇳 VN</button>
      <button onClick={() => changeLanguage("en")}>🇺🇸 EN</button>
      <button onClick={() => changeLanguage("ja")}>🇯🇵 JP</button>
    </div>
  );
}
```

## 9. Lấy ngôn ngữ đã lưu

```tsx
import { getSavedLanguage, isValidLanguageCode } from "@/i18n";

function CheckSavedLanguage() {
  const saved = getSavedLanguage();

  if (saved) {
    console.log("Saved language:", saved);
  }

  // Kiểm tra code hợp lệ
  if (isValidLanguageCode("en")) {
    console.log("Valid language code");
  }
}
```

## 10. Translation trong form validation

```tsx
import { useTranslation } from "@/i18n";
import { z } from "zod";

function MyForm() {
  const { t } = useTranslation();

  const schema = z.object({
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(8, t("validation.passwordTooShort")),
  });

  // ... rest of form logic
}
```

## 11. Nested translations

translation.json:

```json
{
  "user": {
    "profile": {
      "title": "User Profile",
      "edit": "Edit Profile"
    }
  }
}
```

Sử dụng:

```tsx
const { t } = useTranslation();
return (
  <>
    <h1>{t("user.profile.title")}</h1>
    <button>{t("user.profile.edit")}</button>
  </>
);
```

## 12. Translation trong array/list

```tsx
import { useTranslation } from "@/i18n";

function NavigationMenu() {
  const { t } = useTranslation();

  const menuItems = [
    { key: "shop", path: "/shop" },
    { key: "business", path: "/business" },
    { key: "inspiration", path: "/templates" },
  ];

  return (
    <nav>
      {menuItems.map((item) => (
        <a key={item.key} href={item.path}>
          {t(`header.${item.key}`)}
        </a>
      ))}
    </nav>
  );
}
```
