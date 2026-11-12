"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/app/context/ModalContext";
import { useCart } from "@/providers/CartProvider";
import { ShoppingCart } from "lucide-react";
import { Product, Variant, attribute } from "@/app/interfaces/interfaces";
import { useLocale, useTranslations } from "next-intl";
import { localizeProduct } from "@/app/lib/localize";

export default function ProductModal() {
  const locale = useLocale();
  const t = useTranslations("common");
  const { isModalOpen, closeModal, modalProduct } = useModal();
  const { addItem, openCart } = useCart();

  const product = useMemo(() => {
    return modalProduct ? localizeProduct(modalProduct, locale) : null;
  }, [modalProduct, locale]);

  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>();
  const [selectedAttribute, setSelectedAttribute] = useState<
    attribute | undefined
  >();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Update selected variant and attribute when product changes
  useEffect(() => {
    if (product && product.variations && product.variations.length > 0) {
      const initialVariant = product.variations[0];
      setSelectedVariant(initialVariant);
      setSelectedAttribute(initialVariant?.attributes?.[0]);
      setQuantity(1);
      setSelectedImage(0);
    }
  }, [product]);

  if (!product) return null;

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant);
    setSelectedAttribute(variant.attributes[0]);
    setQuantity(1);
    setSelectedImage(0);
  };

  const handleAttributeChange = (attribute: {
    name: string;
    stock: number;
  }) => {
    setSelectedAttribute(attribute);
    setQuantity(1);
  };

  const incrementQuantity = () => {
    if (selectedAttribute && quantity < selectedAttribute.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedAttribute) return;

    addItem({
      productId: product._id,
      productName: product.title,
      price:
        selectedAttribute?.price && selectedAttribute.price > 0
          ? selectedAttribute.price
          : selectedVariant?.price && selectedVariant.price > 0
          ? selectedVariant.price
          : product.price.local,
      attributes: selectedAttribute,
      variant: selectedVariant,
      imageUrl: selectedVariant.images?.[0]?.url,
      quantity,
    });

    closeModal();
    openCart();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-scroll text-lovely bg-creamey">
        <DialogHeader>
          <DialogTitle>{t("quickAdd")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {selectedVariant &&
                selectedVariant.images &&
                selectedVariant.images.length > 0 && (
                  <Image
                    src={selectedVariant.images[selectedImage]?.url}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                )}
            </div>

            {selectedVariant && selectedVariant.images.length > 1 && (
              <div className="flex space-x-2 overflow-auto pb-1">
                {selectedVariant.images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      unoptimized
                      src={image.url}
                      alt={`${product.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-medium">{product.title}</h2>
              <p className="text-2xl font-medium mt-2">
                {selectedAttribute?.price && selectedAttribute.price > 0
                  ? selectedAttribute.price.toFixed(2)
                  : selectedVariant?.price && selectedVariant.price > 0
                  ? selectedVariant.price.toFixed(2)
                  : product.price.local.toFixed(2)}{" "}
                {t("le")}
              </p>
            </div>

            {/* Variants Selection */}
            <div className="space-y-4">
              {selectedVariant && (
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    {selectedVariant.attributeName}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.attributes.map((attr, index) => (
                      <Button
                        key={index}
                        variant={
                          selectedAttribute === attr ? "default" : "outline"
                        }
                        onClick={() => handleAttributeChange(attr)}
                        className="rounded-full bg-pinkey text-lovely hover:bg-lovely/90 hover:text-creamey"
                        disabled={attr.stock <= 0}
                      >
                        {attr.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selection */}
            <div>
              <div className="text-sm font-medium mb-2">{t("quantity")}</div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Button
                  className="bg-pinkey hover:bg-lovely/90 hover:text-creamey"
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <span className="sr-only">Decrease quantity</span>
                  <span aria-hidden>-</span>
                </Button>
                <div className="w-12 text-center">{quantity}</div>
                <Button
                  className="bg-pinkey hover:bg-lovely/90 hover:text-creamey"
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={
                    !selectedAttribute || quantity >= selectedAttribute.stock
                  }
                >
                  <span className="sr-only">Increase quantity</span>
                  <span aria-hidden>+</span>
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full rounded-full bg-lovely hover:bg-everGreen text-creamey disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              disabled={
                !selectedVariant ||
                !selectedAttribute ||
                (selectedAttribute && selectedAttribute.stock === 0)
              }
            >
              <ShoppingCart className="mr-2 rtl:ml-2 rtl:mr-0 h-5 w-5" />
              {selectedAttribute && selectedAttribute.stock === 0
                ? t("outOfStock")
                : t("addToCart")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
