// src/features/organization/components/send-swag/PackSelector.tsx
// ✅ SOLID: Single Responsibility - Pack selection only

import { useState } from "react";
import { Search, Package, Gift, Check, Loader2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { SwagPack } from "../../services/swag-order.service";

interface PackSelectorProps {
  packs: SwagPack[];
  selectedPack: SwagPack | null;
  onSelect: (pack: SwagPack) => void;
  isLoading: boolean;
}

export function PackSelector({
  packs,
  selectedPack,
  onSelect,
  isLoading,
}: PackSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredPacks = packs.filter((pack) =>
    pack.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Chọn bộ quà để gửi</h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm bộ quà..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : filteredPacks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Chưa có bộ quà nào. Hãy tạo bộ quà trước.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPacks.map((pack) => (
            <button
              key={pack._id}
              onClick={() => onSelect(pack)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedPack?._id === pack._id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {pack.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {pack.items?.length || 0} sản phẩm
                  </p>
                  <p className="text-sm font-medium text-orange-600">
                    {formatCurrency(pack.pricing?.unitPrice || 0)}/bộ
                  </p>
                </div>
                {selectedPack?._id === pack._id && (
                  <Check className="w-5 h-5 text-orange-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
