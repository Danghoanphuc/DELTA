// src/features/printer/components/product-wizard/ProductWizardPreview.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Box } from "lucide-react";
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
import { Asset } from "@/types/asset"; // Giả định

interface PreviewProps {
  asset: Asset | null;
}

export function ProductWizardPreview({ asset }: PreviewProps) {
  return (
    <Card className="sticky top-24 h-[calc(100vh-8rem)]">
      <CardHeader>
        <CardTitle>Xem trước Phôi 3D</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-8rem)]">
        {asset?.assets.modelUrl ? (
          <ProductViewer3D
            modelUrl={asset.assets.modelUrl}
            decals={[]}
            surfaceMapping={[]}
            onDrop={() => {}}
            selectedDecalId={null}
            onDecalSelect={() => {}}
            onDecalUpdate={() => {}}
            gizmoMode="translate"
            isSnapping={false}
            onModelLoaded={() => {}}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8">
            <Box size={48} className="text-gray-300 mb-4" />
            <p className="text-sm text-gray-500 text-center">
              Vui lòng chọn Phôi ở Bước 1
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
