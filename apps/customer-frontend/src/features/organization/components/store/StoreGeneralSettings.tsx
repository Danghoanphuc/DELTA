// src/features/organization/components/store/StoreGeneralSettings.tsx
// ✅ SOLID: Single Responsibility - General settings only

import { Globe, Lock, Key, Mail } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { CompanyStore } from "@/features/company-store/services/company-store.service";

const ACCESS_TYPES = [
  {
    value: "public",
    label: "Công khai",
    icon: Globe,
    desc: "Ai cũng có thể truy cập",
  },
  {
    value: "private",
    label: "Riêng tư",
    icon: Lock,
    desc: "Chỉ thành viên tổ chức",
  },
  {
    value: "password",
    label: "Mật khẩu",
    icon: Key,
    desc: "Cần mật khẩu để truy cập",
  },
  {
    value: "email_domain",
    label: "Email domain",
    icon: Mail,
    desc: "Chỉ email @company.com",
  },
] as const;

interface StoreGeneralSettingsProps {
  store: CompanyStore;
  onUpdateStore: (updates: Partial<CompanyStore>) => void;
  onUpdateSettings: (updates: Partial<CompanyStore["settings"]>) => void;
  onUpdateAccess: (type: CompanyStore["access"]["type"]) => void;
}

export function StoreGeneralSettings({
  store,
  onUpdateStore,
  onUpdateSettings,
  onUpdateAccess,
}: StoreGeneralSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tên Store</Label>
            <Input
              value={store.name}
              onChange={(e) => onUpdateStore({ name: e.target.value })}
            />
          </div>
          <div>
            <Label>Tagline</Label>
            <Input
              value={store.tagline || ""}
              onChange={(e) => onUpdateStore({ tagline: e.target.value })}
              placeholder="Slogan ngắn gọn cho store"
            />
          </div>
          <div>
            <Label>Mô tả</Label>
            <Textarea
              value={store.description || ""}
              onChange={(e) => onUpdateStore({ description: e.target.value })}
              placeholder="Mô tả về store..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quyền truy cập</CardTitle>
          <CardDescription>Ai có thể truy cập store của bạn?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {ACCESS_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = store.access.type === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => onUpdateAccess(type.value)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-2 ${
                      isSelected ? "text-primary" : "text-gray-400"
                    }`}
                  />
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.desc}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt hiển thị</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Hiển thị giá</div>
              <div className="text-sm text-gray-500">
                Hiện giá sản phẩm trên store
              </div>
            </div>
            <Switch
              checked={store.settings.showPrices}
              onCheckedChange={(v) => onUpdateSettings({ showPrices: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Yêu cầu duyệt đơn</div>
              <div className="text-sm text-gray-500">
                Đơn hàng cần được admin duyệt
              </div>
            </div>
            <Switch
              checked={store.settings.requireApproval}
              onCheckedChange={(v) => onUpdateSettings({ requireApproval: v })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
