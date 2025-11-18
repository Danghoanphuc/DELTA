// features/chat/components/ProductRail.tsx
import { Card, CardContent } from "@/shared/components/ui/card";

export const ProductRail = ({
  title,
  products = [],
}: {
  title: string;
  products: any[];
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <a href="/shop" className="text-sm text-blue-600">
          Xem tất cả
        </a>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {products.slice(0, 12).map((p, idx) => (
          <Card key={p._id || idx} className="min-w-[180px]">
            <CardContent className="p-3">
              <div className="aspect-square rounded-md bg-gray-100 overflow-hidden">
                {p.images?.[0]?.url ? (
                  <img
                    src={p.images[0].url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
              <div className="mt-2 text-sm line-clamp-2">{p.name || "Sản phẩm"}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};


