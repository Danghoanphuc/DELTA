// src/features/printer/pages/SettingsPage.tsx
import { useState } from "react";
import { 
  User, Lock, Store, ShieldCheck, 
  CreditCard, Bell, ChevronRight, 
  FileCheck, AlertTriangle, Loader2 
} from "lucide-react";
import { PrinterProfileForm } from "@/features/printer/components/PrinterProfileForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";

const SETTINGS_TABS = [
  { id: "profile", label: "Thông tin Xưởng", icon: Store, color: "text-blue-600", bg: "bg-blue-50", desc: "Tên, địa chỉ, logo, mô tả" },
  { id: "verification", label: "Xác thực", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50", desc: "Giấy phép KD, CCCD" },
  { id: "payment", label: "Thanh toán", icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50", desc: "Tài khoản ngân hàng" },
  { id: "account", label: "Tài khoản", icon: User, color: "text-orange-600", bg: "bg-orange-50", desc: "Email, mật khẩu" },
];

// --- Verification Component (Tách ra cho gọn) ---
const VerificationSection = ({ profile }: { profile: any }) => {
  const [gpkdFile, setGpkdFile] = useState<File | null>(null);
  const [cccdFile, setCccdFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchMe } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpkdFile && !cccdFile) return toast.error("Vui lòng tải lên ít nhất 1 tài liệu.");

    setIsSubmitting(true);
    const toastId = toast.loading("Đang nộp hồ sơ...");

    try {
      const formData = new FormData();
      if (gpkdFile) formData.append("gpkdFile", gpkdFile);
      if (cccdFile) formData.append("cccdFile", cccdFile);

      await api.put("/printers/submit-verification", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchMe();
      toast.success("Nộp hồ sơ thành công!", { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Thất bại", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profile?.isVerified) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
           <ShieldCheck className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-green-800">Tài khoản đã xác thực</h3>
        <p className="text-green-700 mt-1">Bạn có toàn quyền truy cập các tính năng cao cấp.</p>
      </div>
    );
  }

  if (profile?.verificationStatus === "pending_review") {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
           <FileCheck className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-bold text-yellow-800">Đang chờ duyệt</h3>
        <p className="text-yellow-700 mt-1">Chúng tôi đang xem xét hồ sơ của bạn. Vui lòng chờ 24-48h.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle /> Yêu cầu xác thực
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-6">
          Vui lòng tải lên giấy phép kinh doanh hoặc CCCD để kích hoạt tính năng bán hàng.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label>Giấy phép kinh doanh / CCCD</Label>
            <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
               <Input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="hidden" 
                  id="gpkd-upload"
                  onChange={(e) => setGpkdFile(e.target.files?.[0] || null)}
               />
               <label htmlFor="gpkd-upload" className="cursor-pointer flex-1 text-sm text-gray-500">
                  {gpkdFile ? <span className="text-blue-600 font-medium">{gpkdFile.name}</span> : "Click để tải lên file"}
               </label>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label>CCCD người đại diện (Mặt trước)</Label>
            <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
               <Input 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="hidden" 
                  id="cccd-upload"
                  onChange={(e) => setCccdFile(e.target.files?.[0] || null)}
               />
               <label htmlFor="cccd-upload" className="cursor-pointer flex-1 text-sm text-gray-500">
                  {cccdFile ? <span className="text-blue-600 font-medium">{cccdFile.name}</span> : "Click để tải lên file"}
               </label>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700">
            {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null} Nộp hồ sơ
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// --- Main Page ---
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const profile = useAuthStore((s) => s.activePrinterProfile);

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <PrinterProfileForm />;
      case "verification":
        return <VerificationSection profile={profile} />;
      case "payment":
      case "account":
        return (
           <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              <Loader2 className="w-8 h-8 mb-2 animate-spin opacity-20" />
              <p>Tính năng đang phát triển...</p>
           </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-1 h-full bg-gray-50/50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-200 bg-white p-6 flex-shrink-0 hidden lg:block overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h2>
        <div className="space-y-2">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center p-3 rounded-xl transition-all duration-200 group text-left",
                  isActive 
                    ? "bg-gray-100 ring-1 ring-gray-200 shadow-sm" 
                    : "hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors shrink-0",
                  tab.bg, tab.color
                )}>
                  <tab.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold truncate", isActive ? "text-gray-900" : "text-gray-700")}>
                    {tab.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{tab.desc}</p>
                </div>
                {isActive && <ChevronRight size={16} className="text-gray-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-6 lg:p-10 overflow-y-auto h-full">
           <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}