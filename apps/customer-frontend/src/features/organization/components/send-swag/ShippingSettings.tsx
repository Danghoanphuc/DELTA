// src/features/organization/components/send-swag/ShippingSettings.tsx
// ✅ SOLID: Single Responsibility - Shipping settings only

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Switch } from "@/shared/components/ui/switch";
import { SendSwagState } from "../../hooks/useSendSwag";

interface ShippingSettingsProps {
  state: SendSwagState;
  onUpdate: (updates: Partial<SendSwagState>) => void;
}

export function ShippingSettings({ state, onUpdate }: ShippingSettingsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Cài đặt gửi quà</h2>

      <div>
        <Label>Tên đợt gửi quà</Label>
        <Input
          value={state.orderName}
          onChange={(e) => onUpdate({ orderName: e.target.value })}
          placeholder={`Gửi quà - ${state.selectedPack?.name || ""}`}
        />
      </div>

      <div>
        <Label className="mb-3 block">Phương thức vận chuyển</Label>
        <RadioGroup
          value={state.shippingMethod}
          onValueChange={(value) => onUpdate({ shippingMethod: value })}
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard" className="flex-1 cursor-pointer">
              <span className="font-medium">Tiêu chuẩn</span>
              <span className="text-sm text-gray-500 ml-2">
                3-5 ngày • 30,000đ/gói
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="express" id="express" />
            <Label htmlFor="express" className="flex-1 cursor-pointer">
              <span className="font-medium">Nhanh</span>
              <span className="text-sm text-gray-500 ml-2">
                1-2 ngày • 50,000đ/gói
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="overnight" id="overnight" />
            <Label htmlFor="overnight" className="flex-1 cursor-pointer">
              <span className="font-medium">Hỏa tốc</span>
              <span className="text-sm text-gray-500 ml-2">
                Trong ngày • 100,000đ/gói
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <Label>Gửi ngay lập tức</Label>
          <p className="text-sm text-gray-500">
            Bắt đầu xử lý ngay sau khi thanh toán
          </p>
        </div>
        <Switch
          checked={state.sendImmediately}
          onCheckedChange={(checked) => onUpdate({ sendImmediately: checked })}
        />
      </div>

      {!state.sendImmediately && (
        <div>
          <Label>Ngày gửi dự kiến</Label>
          <Input
            type="date"
            value={state.scheduledDate}
            onChange={(e) => onUpdate({ scheduledDate: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
      )}

      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <Label>Thông báo cho người nhận</Label>
          <p className="text-sm text-gray-500">
            Gửi email thông báo khi quà được gửi
          </p>
        </div>
        <Switch
          checked={state.notifyRecipients}
          onCheckedChange={(checked) => onUpdate({ notifyRecipients: checked })}
        />
      </div>

      <div>
        <Label>Tin nhắn kèm theo (tùy chọn)</Label>
        <Textarea
          value={state.customMessage}
          onChange={(e) => onUpdate({ customMessage: e.target.value })}
          placeholder="Viết lời nhắn gửi kèm quà..."
          rows={3}
        />
      </div>
    </div>
  );
}
