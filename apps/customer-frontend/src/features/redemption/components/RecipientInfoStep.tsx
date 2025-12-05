// src/features/redemption/components/RecipientInfoStep.tsx
// ✅ SOLID: Single Responsibility - Recipient info form only

import { User, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FormData, RedemptionLink } from "../hooks/useRedemption";

interface RecipientInfoStepProps {
  link: RedemptionLink;
  formData: FormData;
  submitting: boolean;
  onFormChange: (updates: Partial<FormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function RecipientInfoStep({
  link,
  formData,
  submitting,
  onFormChange,
  onBack,
  onSubmit,
}: RecipientInfoStepProps) {
  return (
    <>
      {/* Personal Info */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin người nhận
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Họ *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => onFormChange({ lastName: e.target.value })}
                placeholder="Nguyễn"
              />
            </div>
            <div>
              <Label>Tên *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => onFormChange({ firstName: e.target.value })}
                placeholder="Văn A"
              />
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => onFormChange({ email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          {link.settings.requirePhone && (
            <div>
              <Label className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Số điện thoại *
              </Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormChange({ phone: e.target.value })}
                placeholder="0901234567"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      {link.settings.requireAddress && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Địa chỉ giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Địa chỉ (số nhà, đường) *</Label>
              <Input
                value={formData.street}
                onChange={(e) => onFormChange({ street: e.target.value })}
                placeholder="123 Nguyễn Huệ"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phường/Xã</Label>
                <Input
                  value={formData.ward}
                  onChange={(e) => onFormChange({ ward: e.target.value })}
                  placeholder="Phường Bến Nghé"
                />
              </div>
              <div>
                <Label>Quận/Huyện *</Label>
                <Input
                  value={formData.district}
                  onChange={(e) => onFormChange({ district: e.target.value })}
                  placeholder="Quận 1"
                />
              </div>
            </div>

            <div>
              <Label>Tỉnh/Thành phố *</Label>
              <Input
                value={formData.city}
                onChange={(e) => onFormChange({ city: e.target.value })}
                placeholder="TP. Hồ Chí Minh"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Quay lại
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1"
          style={{ backgroundColor: link.branding.primaryColor }}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Xác nhận"
          )}
        </Button>
      </div>
    </>
  );
}
