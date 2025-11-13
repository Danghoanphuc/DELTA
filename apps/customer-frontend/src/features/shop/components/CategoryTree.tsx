// src/features/shop/components/CategoryTree.tsx (TẠO MỚI)
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { TaxonomyNode } from "../hooks/useShop";
import { cn } from "@/shared/lib/utils";

interface CategoryTreeProps {
  taxonomy: TaxonomyNode[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export const CategoryTree = ({
  taxonomy,
  selectedCategory,
  onCategoryChange,
}: CategoryTreeProps) => {
  // Tìm danh mục cha đang active (nếu có)
  const activeParent = taxonomy.find((t) =>
    t.children.some((c) => c.value === selectedCategory)
  );
  const defaultValue =
    activeParent?.value ||
    (taxonomy.find((t) => t.value === selectedCategory)
      ? selectedCategory
      : undefined);

  return (
    <div className="sticky top-20">
      <h2 className="text-lg font-semibold mb-3 px-4">Danh mục Sản phẩm</h2>
      <Button
        variant="ghost"
        onClick={() => onCategoryChange("all")}
        className={cn(
          "w-full justify-start text-base px-4",
          selectedCategory === "all"
            ? "font-bold text-blue-600"
            : "font-medium text-gray-700"
        )}
      >
        Tất cả sản phẩm
      </Button>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultValue}
        className="w-full"
      >
        {taxonomy.map((category) => (
          <AccordionItem
            key={category.value}
            value={category.value}
            className="border-b-0"
          >
            <AccordionTrigger
              onClick={() => onCategoryChange(category.value)}
              className={cn(
                "px-4 py-2 text-base rounded-md hover:no-underline hover:bg-gray-100",
                selectedCategory === category.value
                  ? "font-bold text-blue-600"
                  : "font-medium text-gray-700"
              )}
            >
              {category.label}
            </AccordionTrigger>
            <AccordionContent className="pb-1 pl-6">
              <ul className="space-y-1">
                {category.children.map((sub) => (
                  <li key={sub.value}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCategoryChange(sub.value)}
                      className={cn(
                        "w-full justify-start text-sm",
                        selectedCategory === sub.value
                          ? "font-semibold text-blue-600"
                          : "font-normal text-gray-600"
                      )}
                    >
                      {sub.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
