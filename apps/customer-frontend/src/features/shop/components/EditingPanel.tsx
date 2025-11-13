// features/shop/components/EditingPanel.tsx

import React, { Dispatch, SetStateAction } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Card, CardContent } from "@/shared/components/ui/card";
import { DollarSign, Layers } from "lucide-react";
import { NativeScrollArea } from "@/shared/components/ui/NativeScrollArea";

import { LiveQuotePanel } from "./LiveQuotePanel";
import { DecalList } from "@/features/editor/components/DecalList";
import { DecalItem, EditorItem } from "@/features/editor/types/decal.types";
import { PrinterProduct } from "@/types/product";

// Gộp props lại
interface EditingPanelProps {
  product: PrinterProduct;
  decals: EditorItem[];
  basePrice: number;
  minQuantity: number;
  formatPrice: (price: number) => string;
  isSaving: boolean;
  onSaveAndAddToCart: () => Promise<void>;
  selectedQuantity: number;
  onQuantityChange: Dispatch<SetStateAction<number>>;

  // For DecalList
  selectedDecalId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<EditorItem>) => void;
}

export const EditingPanel = (props: EditingPanelProps) => {
  const decalItems = props.decals.filter(
    (d) => d.type === "decal"
  ) as DecalItem[];

  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      <Tabs defaultValue="quote" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quote">
            <DollarSign size={16} className="mr-2" />
            Báo giá
          </TabsTrigger>
          <TabsTrigger value="layers">
            <Layers size={16} className="mr-2" />
            Các Lớp
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Báo giá Động */}
        <TabsContent value="quote">
          <LiveQuotePanel
            product={props.product}
            decals={decalItems}
            basePrice={props.basePrice}
            minQuantity={props.minQuantity}
            formatPrice={props.formatPrice}
            isSaving={props.isSaving}
            onSaveAndAddToCart={props.onSaveAndAddToCart}
            selectedQuantity={props.selectedQuantity}
            onQuantityChange={props.onQuantityChange}
          />
        </TabsContent>

        {/* Tab 2: Danh sách lớp (Decals) */}
        <TabsContent value="layers">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {/* Dùng NativeScrollArea nếu DecalList dài */}
              <NativeScrollArea className="h-[400px] lg:h-[calc(100vh-20rem)]">
                <DecalList
                  items={props.decals}
                  selectedItemIds={
                    props.selectedDecalId ? [props.selectedDecalId] : []
                  }
                  onSelect={(id, isMulti) => props.onSelect(id)}
                  onDelete={props.onDelete}
                  onUpdate={props.onUpdate}
                  onReorder={() => {}}
                />
              </NativeScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};