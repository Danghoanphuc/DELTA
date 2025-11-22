// src/features/printer/pages/AccountPage.tsx
import { useState, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { printerService } from "@/services/printer.service"; // Giả định service
import { uploadFileToCloudinary } from "@/services/cloudinaryService";

// UI Components
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { 
  User, Camera, LogOut, Shield, Mail, Phone, MapPin, 
  Globe, Save, Loader2, Lock, Bell, FileCheck
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

// Components con
import { AvatarCropModal } from "@/features/printer/components/AvatarCropModal";

export function AccountPage() {
  const { user, signOut, fetchMe } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state (Đơn giản hóa, thực tế nên dùng React Hook Form)
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    bio: "Chuyên in ấn bao bì và ấn phẩm văn phòng chất lượng cao.", // Giả lập
  });

  // --- Avatar Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Đọc file để hiện trong modal crop
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input để chọn lại cùng file nếu muốn
    e.target.value = "";
  };

  const handleSaveAvatar = async (file: File) => {
    const toastId = toast.loading("Đang cập nhật ảnh đại diện...");
    try {
      // 1. Upload Cloudinary
      const url = await uploadFileToCloudinary(file);
      
      // 2. Update User Profile (API)
      await printerService.updateMyProfile({ logoUrl: url } as any); // Ép kiểu tạm
      
      // 3. Refresh Store
      await fetchMe();
      
      toast.success("Đã cập nhật ảnh đại diện!", { id: toastId });
    } catch (error) {
      toast.error("Lỗi cập nhật ảnh", { id: toastId });
    }
  };

  // --- Profile Update Handler ---
  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Đã lưu thông tin cá nhân");
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
         <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="text-orange-600" /> Hồ sơ cá nhân
               </h1>
               <p className="text-sm text-gray-500 mt-1">Quản lý thông tin hiển thị và bảo mật tài khoản.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => signOut()} className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-0 shadow-none">
               <LogOut size={16} className="mr-2" /> Đăng xuất
            </Button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* HERO CARD */}
          <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-sm">
             {/* Cover Background */}
             <div className="h-32 bg-gradient-to-r from-orange-100 to-red-50"></div>
             
             <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 gap-6">
                   {/* Avatar */}
                   <div className="relative group">
                      <div className="w-32 h-32 rounded-full p-1 bg-white shadow-lg">
                         <Avatar className="w-full h-full border border-gray-100">
                            <AvatarImage src={user?.avatarUrl} className="object-cover" />
                            <AvatarFallback className="text-2xl bg-gray-100 text-gray-400">
                               {(user?.displayName?.[0] || "U").toUpperCase()}
                            </AvatarFallback>
                         </Avatar>
                      </div>
                      {/* Camera Button */}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-all group-hover:scale-110 active:scale-95 z-10"
                        title="Đổi ảnh đại diện"
                      >
                         <Camera size={18} />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileSelect}
                      />
                   </div>

                   {/* Info */}
                   <div className="flex-1 text-center sm:text-left mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{user?.displayName}</h2>
                      <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2 mt-1">
                         {user?.email}
                         <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-normal">
                            Printer Partner
                         </Badge>
                      </p>
                   </div>

                   {/* Stats (Optional) */}
                   <div className="flex gap-6 text-center border-l border-gray-100 pl-6 hidden md:flex">
                      <div>
                         <div className="text-lg font-bold text-gray-900">128</div>
                         <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Đơn hàng</div>
                      </div>
                      <div>
                         <div className="text-lg font-bold text-gray-900">4.8</div>
                         <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Đánh giá</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* TABS CONTENT */}
          <Tabs defaultValue="general" className="w-full">
             <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent p-0 h-auto rounded-none space-x-6 mb-6">
                <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-700 px-0 py-3 font-medium text-gray-500 hover:text-gray-700 transition-all">
                   Thông tin chung
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-700 px-0 py-3 font-medium text-gray-500 hover:text-gray-700 transition-all">
                   Bảo mật
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-700 px-0 py-3 font-medium text-gray-500 hover:text-gray-700 transition-all">
                   Thông báo
                </TabsTrigger>
             </TabsList>

             {/* Tab 1: General Info */}
             <TabsContent value="general">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                   <Card className="border-none shadow-sm">
                      <CardHeader>
                         <CardTitle>Thông tin cá nhân</CardTitle>
                         <CardDescription>Cập nhật thông tin liên hệ của bạn.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <Label>Tên hiển thị</Label>
                               <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input 
                                    value={formData.displayName} 
                                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <Label>Số điện thoại</Label>
                               <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <Label>Email (Không thể thay đổi)</Label>
                               <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input 
                                    value={formData.email} 
                                    disabled
                                    className="pl-9 bg-gray-100 border-transparent text-gray-500 cursor-not-allowed"
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <Label>Địa chỉ / Website</Label>
                               <div className="relative">
                                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <Input 
                                    placeholder="https://..."
                                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                  />
                               </div>
                            </div>
                         </div>
                         
                         <div className="space-y-2">
                            <Label>Giới thiệu bản thân</Label>
                            <Textarea 
                               value={formData.bio}
                               onChange={(e) => setFormData({...formData, bio: e.target.value})}
                               className="bg-gray-50 border-gray-200 focus:bg-white transition-all min-h-[100px]"
                            />
                         </div>

                         <div className="flex justify-end">
                            <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]">
                               {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                               Lưu thay đổi
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                </motion.div>
             </TabsContent>

             {/* Tab 2: Security */}
             <TabsContent value="security">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                   <Card className="border-none shadow-sm">
                      <CardHeader>
                         <CardTitle>Bảo mật & Đăng nhập</CardTitle>
                         <CardDescription>Quản lý mật khẩu và bảo vệ tài khoản.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                         <div className="space-y-4 border border-gray-100 rounded-xl p-6">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                               <Lock className="w-4 h-4 text-orange-600" /> Đổi mật khẩu
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <Label>Mật khẩu hiện tại</Label>
                                  <Input type="password" placeholder="••••••••" className="bg-gray-50" />
                               </div>
                               <div className="space-y-2">
                                  <Label>Mật khẩu mới</Label>
                                  <Input type="password" placeholder="••••••••" className="bg-gray-50" />
                               </div>
                            </div>
                            <div className="flex justify-end">
                               <Button variant="outline">Cập nhật mật khẩu</Button>
                            </div>
                         </div>

                         <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                               <h3 className="text-sm font-semibold text-gray-900">Xác thực 2 yếu tố (2FA)</h3>
                               <p className="text-xs text-gray-500 mt-1">Thêm một lớp bảo mật cho tài khoản của bạn.</p>
                            </div>
                            <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">Bật 2FA</Button>
                         </div>
                      </CardContent>
                   </Card>
                </motion.div>
             </TabsContent>

             {/* Tab 3: Notifications */}
             <TabsContent value="notifications">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                   <Card className="border-none shadow-sm">
                      <CardHeader>
                         <CardTitle>Cài đặt thông báo</CardTitle>
                         <CardDescription>Chọn cách bạn muốn nhận thông báo từ PrintZ.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                         {[
                           { id: 1, title: "Đơn hàng mới", desc: "Nhận thông báo khi có khách đặt hàng" },
                           { id: 2, title: "Tin nhắn từ khách", desc: "Nhận thông báo khi có tin nhắn chat mới" },
                           { id: 3, title: "Cập nhật hệ thống", desc: "Thông tin về tính năng mới và bảo trì" },
                           { id: 4, title: "Email Marketing", desc: "Nhận các mẹo kinh doanh và ưu đãi" },
                         ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                               <div className="flex items-center gap-4">
                                  <div className="p-2 bg-gray-100 rounded-full">
                                     <Bell className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div>
                                     <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                     <p className="text-xs text-gray-500">{item.desc}</p>
                                  </div>
                               </div>
                               <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500 cursor-pointer transition-colors duration-200 ease-in-out">
                                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm"/>
                               </div>
                            </div>
                         ))}
                      </CardContent>
                   </Card>
                </motion.div>
             </TabsContent>
          </Tabs>

        </div>
      </div>

      {/* Modal Cắt Ảnh */}
      {selectedImage && (
        <AvatarCropModal
          isOpen={cropModalOpen}
          onClose={() => { setCropModalOpen(false); setSelectedImage(null); }}
          imageSrc={selectedImage}
          onSave={handleSaveAvatar}
        />
      )}
    </div>
  );
}