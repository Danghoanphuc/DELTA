// features/products/components/ProductCustomizationPanel.tsx
/**
 * Main component that integrates all customization options
 * Phase 3.3 - Complete Product Customization UI
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { ShoppingCart, Loader2 } from "lucide-react";
import { VariantSelector } from "./VariantSelector";
import { PrintMethodSelector } from "./PrintMethodSelector";
import { ArtworkSelector } from "./ArtworkSelector";
import { PersonalizationInput } from "./PersonalizationInput";
import { PriceCalculator } from "./PriceCalculator";
import {
  CustomizationOptions,
  PriceBreakdown,
  VariantSelection,
  PrintMethodSelection,
  PersonalizationText,
} from "../types/customization.types";

interface ProductCustomizationPanelProps {
  productId: string;
  productName: string;
  variantAttributes: Array<{
    name: string;
    values: string[];
    label: string;
  }>;
  printMethods: any[];
  artworks: any[];
  minQuantity?: number;
  onAddToCart?: (customization: CustomizationOptions) => void;
  onUploadArtwork?: () => void;
  isAddingToCart?: boolean;
}

export const ProductCustomizationPanel: React.FC<
  ProductCustomizationPanelProps
> = ({
  productId,
  productName,
  variantAttributes,
  printMethods,
  artworks,
  minQuantity = 1,
  onAddToCart,
  onUploadArtwork,
  isAddingToCart = false,
}) => {
  // State
  const [variantSelection, setVariantSelection] = useState<VariantSelection>(
    {}
  );
  const [printMethod, setPrintMethod] = useState<
    PrintMethodSelection | undefined
  >();
  const [personalization, setPersonalization] = useState<PersonalizationText>({
    text: "",
  });
  const [quantity, setQuantity] = useState<number>(minQuantity);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown>({
    basePrice: 0,
    customizationCost: 0,
    setupFees: 0,
    volumeDiscount: 0,
    subtotal: 0,
    total: 0,
    unitPrice: 0,
  });
  const [isCalculating, setIsCalculating] = useState(false);

  // Handle artwork selection
  const handleArtworkSelect = (areaName: string, artworkId: string) => {
    if (!printMethod) return;

    const updatedAreas = printMethod.areas.map((area) =>
      area.area === areaName ? { ...area, artworkId } : area
    );

    setPrintMethod({
      ...printMethod,
      areas: updatedAreas,
    });
  };

  // Calculate price (mock implementation - replace with actual API call)
  useEffect(() => {
    const calculatePrice = async () => {
      setIsCalculating(true);

      // TODO: Replace with actual API call
      // const result = await productCustomizationService.calculatePrice(productId, {
      //   variantId: selectedVariantId,
      //   quantity,
      //   customization: { printMethod, personalization }
      // });

      // Mock calculation
      setTimeout(() => {
        const basePrice = 100000;
        const customizationCost = printMethod
          ? 50000 * printMethod.areas.length
          : 0;
        const setupFees = printMethod ? 200000 : 0;
        const subtotal = basePrice * quantity + customizationCost + setupFees;
        const volumeDiscount = quantity >= 50 ? subtotal * 0.1 : 0;
        const total = subtotal - volumeDiscount;
        const unitPrice = total / quantity;

        setPriceBreakdown({
          basePrice,
          customizationCost,
          setupFees,
          volumeDiscount,
          subtotal,
          total,
          unitPrice,
          savings: volumeDiscount,
          nextTierInfo:
            quantity < 50
              ? {
                  quantity: 50,
                  unitPrice: unitPrice * 0.9,
                  savings: subtotal * 0.1,
                }
              : undefined,
        });
        setIsCalculating(false);
      }, 500);
    };

    calculatePrice();
  }, [productId, variantSelection, printMethod, personalization, quantity]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!onAddToCart) return;

    const customization: CustomizationOptions = {
      variantSelection,
      printMethod,
      personalization: personalization.text ? personalization : undefined,
      quantity,
    };

    onAddToCart(customization);
  };

  // Check if can add to cart
  const canAddToCart = () => {
    // Must select all required variants
    const hasAllVariants = variantAttributes.every(
      (attr) => variantSelection[attr.name]
    );

    // Must have valid quantity
    const hasValidQuantity = quantity >= minQuantity;

    return hasAllVariants && hasValidQuantity;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Customization Options */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{productName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="font-medium">
                Số lượng
              </Label>
              <Input
                id="quantity"
                type="number"
                min={minQuantity}
                value={quantity}
                onChange={(e) =>
                  setQuantity(parseInt(e.target.value) || minQuantity)
                }
                className="w-32"
              />
              {quantity < minQuantity && (
                <p className="text-xs text-red-500">
                  Số lượng tối thiểu: {minQuantity}
                </p>
              )}
            </div>

            <Separator />

            {/* Variant Selection */}
            <VariantSelector
              attributes={variantAttributes}
              selection={variantSelection}
              onChange={setVariantSelection}
            />

            <Separator />

            {/* Print Method Selection */}
            {printMethods.length > 0 && (
              <>
                <PrintMethodSelector
                  printMethods={printMethods}
                  selection={printMethod}
                  onChange={setPrintMethod}
                />
                <Separator />
              </>
            )}

            {/* Artwork Selection */}
            {printMethod && printMethod.areas.length > 0 && (
              <>
                <ArtworkSelector
                  printAreas={printMethod.areas}
                  artworks={artworks}
                  onArtworkSelect={handleArtworkSelect}
                  onUploadClick={onUploadArtwork || (() => {})}
                />
                <Separator />
              </>
            )}

            {/* Personalization */}
            <PersonalizationInput
              personalization={personalization}
              onChange={setPersonalization}
            />
          </CardContent>
        </Card>

        {/* Add to Cart Button (Mobile) */}
        <Button
          size="lg"
          className="w-full lg:hidden"
          onClick={handleAddToCart}
          disabled={!canAddToCart() || isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang thêm...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ hàng
            </>
          )}
        </Button>
      </div>

      {/* Right Column - Price Calculator */}
      <div className="lg:col-span-1">
        <PriceCalculator
          priceBreakdown={priceBreakdown}
          quantity={quantity}
          loading={isCalculating}
        />

        {/* Add to Cart Button (Desktop) */}
        <Button
          size="lg"
          className="w-full mt-4 hidden lg:flex"
          onClick={handleAddToCart}
          disabled={!canAddToCart() || isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang thêm...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ hàng
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
