// src/features/organization/components/store/CreateStoreForm.tsx
// ✅ SOLID: Single Responsibility - Create store form only

import { useState } from "react";
import { Store, Plus, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { toast } from "sonner";

interface CreateStoreFormProps {
  onCreate: (name: string) => Promise<any>;
}

export function CreateStoreForm({ onCreate }: CreateStoreFormProps) {
  const [storeName, setStoreName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!storeName.trim()) {
      toast.error("Vui lòng nhập tên store");
      return;
    }

    setCreating(true);
    try {
      await onCreate(storeName);
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo store");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <Store className="w-16 h-16 text-primary mx-auto mb-4" />
          <CardTitle>Tạo Company Store</CardTitle>
          <CardDescription>
            Tạo store riêng cho tổ chức của bạn để nhân viên có thể đặt swag
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tên Store *</Label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="VD: Acme Corp Swag Store"
            />
          </div>
          <Button className="w-full" onClick={handleCreate} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Tạo Store
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
