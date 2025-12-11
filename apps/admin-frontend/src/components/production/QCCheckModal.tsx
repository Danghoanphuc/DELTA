import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface QCCheckModalProps {
  productionOrderId: string;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit?: (data: { passed: boolean; notes: string }) => void;
  isLoading?: boolean;
}

export function QCCheckModal({
  productionOrderId,
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
  isLoading = false,
}: QCCheckModalProps) {
  const [passed, setPassed] = useState(true);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ passed, notes });
    }
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kiểm tra chất lượng (QC)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kết quả kiểm tra</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={passed}
                    onChange={() => setPassed(true)}
                    className="w-4 h-4"
                  />
                  <span>Đạt</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!passed}
                    onChange={() => setPassed(false)}
                    className="w-4 h-4"
                  />
                  <span>Không đạt</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú về kiểm tra..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
