// src/features/organization/components/recipients/RecipientFormModal.tsx
// ✅ SOLID: Single Responsibility - Add/Edit form only

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { RecipientFormData } from "../../services/recipient.service";

interface RecipientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecipientFormData) => Promise<void>;
  initialData?: Partial<RecipientFormData>;
  title?: string;
}

const INITIAL_FORM: RecipientFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  jobTitle: "",
  shirtSize: "",
};

export function RecipientFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title = "Thêm người nhận",
}: RecipientFormModalProps) {
  const [formData, setFormData] = useState<RecipientFormData>({
    ...INITIAL_FORM,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
      setFormData(INITIAL_FORM);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof RecipientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Họ *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Nguyễn"
              />
            </div>
            <div>
              <Label>Tên *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Văn A"
              />
            </div>
          </div>
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="email@company.com"
            />
          </div>
          <div>
            <Label>Số điện thoại</Label>
            <Input
              value={formData.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="0901234567"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phòng ban</Label>
              <Input
                value={formData.department || ""}
                onChange={(e) => updateField("department", e.target.value)}
                placeholder="Marketing"
              />
            </div>
            <div>
              <Label>Chức vụ</Label>
              <Input
                value={formData.jobTitle || ""}
                onChange={(e) => updateField("jobTitle", e.target.value)}
                placeholder="Manager"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.firstName ||
              !formData.lastName ||
              !formData.email
            }
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Lưu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
