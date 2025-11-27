// src/features/printer/pages/AssetManagementPage.tsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AssetWizard } from "@/features/printer/components/AssetWizard";
import * as assetService from "@/services/assetService";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Plus, Search, Box, Filter, Layers } from "lucide-react";
import { toast } from "@/shared/utils/toast";
import { AssetCard } from "@/features/printer/components/AssetCard";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ASSETS_QUERY_KEY = ["printer-assets", "my-assets"];

export default function AssetManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const action = searchParams.get("action");
  const editingAssetId = action === "edit" ? searchParams.get("id") : null;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "private" | "public">("all");

  // Fetch assets
  const { data, isLoading } = useQuery({
    queryKey: ASSETS_QUERY_KEY,
    queryFn: assetService.getMyAssets,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const privateAssets = data?.privateAssets || [];
  const publicAssets = data?.publicAssets || [];
  
  // Combine & Filter
  const filteredAssets = [...privateAssets, ...publicAssets].filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Asset không có isPublic field, dùng cách khác để phân biệt
    const isInPublicList = publicAssets.some(a => a._id === asset._id);
    const matchesTab = 
      activeTab === "all" ? true :
      activeTab === "private" ? !isInPublicList :
      activeTab === "public" ? isInPublicList : true;
    
    return matchesSearch && matchesTab;
  });

  // Handlers
  const navigateTo = (newAction?: "new" | "edit", id?: string) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (newAction) {
          params.set("action", newAction);
          if (id) params.set("id", id);
        } else {
          params.delete("action");
          params.delete("id");
        }
        return params;
      },
      { replace: true }
    );
  };

  const handleSuccess = () => {
    navigateTo();
    queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    toast.success("Thao tác thành công!");
  };

  // Render Wizard (Mode Tạo/Sửa)
  if (action === "new" || (action === "edit" && editingAssetId)) {
    return (
      <div className="h-full overflow-y-auto bg-white">
         <AssetWizard
            productId={editingAssetId || undefined}
            onFormClose={() => navigateTo()}
            onSuccess={handleSuccess}
         />
      </div>
    );
  }

  // Render Gallery (Mode Xem)
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               <Layers className="text-orange-600" /> Kho Phôi 3D
            </h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý tài nguyên in ấn (file .glb) của bạn.</p>
          </div>
          
          <div className="flex gap-3">
             <Button 
               onClick={() => navigateTo("new")} 
               className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all"
             >
               <Plus className="mr-2 h-4 w-4" /> Thêm phôi mới
             </Button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="max-w-7xl mx-auto mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
           {/* Tabs Pill */}
           <div className="bg-gray-100/80 p-1 rounded-xl flex items-center gap-1">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'private', label: 'Riêng tư' },
                { id: 'public', label: 'Công khai' }
              ].map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                       "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                       activeTab === tab.id 
                          ? "bg-white text-gray-900 shadow-sm" 
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    )}
                 >
                    {tab.label}
                 </button>
              ))}
           </div>

           {/* Search */}
           <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                 placeholder="Tìm kiếm tên phôi..." 
                 className="pl-9 bg-white border-gray-200 focus:border-orange-500 rounded-xl shadow-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center h-64">
               <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-3" />
               <p className="text-gray-500">Đang tải kho phôi...</p>
             </div>
           ) : filteredAssets.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                   <Box className="w-10 h-10 text-orange-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Chưa có phôi nào</h3>
                <p className="text-gray-500 mt-1 mb-6 max-w-xs text-center">
                   {searchTerm ? "Không tìm thấy kết quả phù hợp." : "Tải lên phôi 3D đầu tiên để bắt đầu thiết kế."}
                </p>
                {!searchTerm && (
                   <Button variant="outline" onClick={() => navigateTo("new")}>
                      Tạo phôi mới
                   </Button>
                )}
             </div>
           ) : (
             <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
             >
               <AnimatePresence>
                 {filteredAssets.map((asset) => (
                   <motion.div
                     key={asset._id}
                     layout
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ duration: 0.2 }}
                   >
                     <AssetCard 
                       asset={asset} 
                       isSelected={false}
                       onClick={() => navigateTo("edit", asset._id)}
                     />
                   </motion.div>
                 ))}
               </AnimatePresence>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}