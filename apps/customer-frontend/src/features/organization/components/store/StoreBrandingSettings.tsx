// src/features/organization/components/store/StoreBrandingSettings.tsx
// ✅ SOLID: Single Responsibility - Branding settings only

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { CompanyStore } from "@/features/company-store/services/company-store.service";

interface StoreBrandingSettingsProps {
  branding: CompanyStore["branding"];
  onUpdate: (updates: Partial<CompanyStore["branding"]>) => void;
}

export function StoreBrandingSettings({
  branding,
  onUpdate,
}: StoreBrandingSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo & Hình ảnh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Logo URL</Label>
            <Input
              value={branding.logoUrl || ""}
              onChange={(e) => onUpdate({ logoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Hero Image URL</Label>
            <Input
              value={branding.heroImageUrl || ""}
              onChange={(e) => onUpdate({ heroImageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Hero Title</Label>
            <Input
              value={branding.heroTitle || ""}
              onChange={(e) => onUpdate({ heroTitle: e.target.value })}
              placeholder="Chào mừng đến store"
            />
          </div>
          <div>
            <Label>Hero Subtitle</Label>
            <Input
              value={branding.heroSubtitle || ""}
              onChange={(e) => onUpdate({ heroSubtitle: e.target.value })}
              placeholder="Khám phá swag của chúng tôi"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Màu sắc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Màu chính</Label>
              <div className="flex gap-2 mt-1">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={branding.primaryColor}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Màu phụ</Label>
              <div className="flex gap-2 mt-1">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={branding.secondaryColor}
                  onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Màu nhấn</Label>
              <div className="flex gap-2 mt-1">
                <input
                  type="color"
                  value={branding.accentColor}
                  onChange={(e) => onUpdate({ accentColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={branding.accentColor}
                  onChange={(e) => onUpdate({ accentColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
