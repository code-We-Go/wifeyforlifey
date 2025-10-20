"use client";
import React, { useState, useEffect } from "react";
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
import { Product, Variant } from "@/app/interfaces/interfaces";

export default function ProductModal() {
  const { isModalOpen, closeModal, modalProduct } = useModal();
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>();
  const [selectedAttribute, setSelectedAttribute] = useState<
    { name: string; stock: number } | undefined
  >();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Update selected variant and attribute when modalProduct changes
  useEffect(() => {
    if (modalProduct) {
      const initialVariant = modalProduct.variations[0];
      setSelectedVariant(initialVariant);
      setSelectedAttribute(initialVariant?.attributes[0]);
      setQuantity(1);
      setSelectedImage(0);
    }
  }, [modalProduct]);

  if (!modalProduct) return null;

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
      productId: modalProduct._id,
      productName: modalProduct.title,
      price: modalProduct.price.local,
      attributes: selectedAttribute,
      variant: selectedVariant,
      imageUrl: selectedVariant.images[0].url,
      quantity,
    });

    closeModal();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[600px] text-lovely bg-creamey">
        <DialogHeader>
          <DialogTitle>Quick Add</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {selectedVariant && (
                <Image
                  src={selectedVariant.images[selectedImage].url}
                  alt={modalProduct.title}
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
                      alt={`${modalProduct.title} - Image ${index + 1}`}
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
              <h2 className="text-xl font-medium">{modalProduct.title}</h2>
              <p className="text-2xl font-medium mt-2">
                LE{modalProduct.price.local.toFixed(2)}
              </p>
            </div>

            {/* Variants Selection */}
            <div className="space-y-4">
              {/* <div>
                <h3 className="text-sm font-medium mb-2">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  {modalProduct.variations.map((variant, index) => (
                    <Button
                      key={index}
                      variant={selectedVariant === variant ? "default" : "outline"}
                      onClick={() => handleVariantChange(variant)}
                      className="rounded-full bg-pinkey text-lovely hover:bg-lovely/90 hover:text-creamey"
                    >
                      {variant.name}
                    </Button>
                  ))}
                </div>
              </div> */}

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
              <div className="text-sm font-medium mb-2">Quantity</div>
              <div className="flex items-center space-x-2">
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
                {selectedAttribute && (
                  <span
                    className={`text-sm ml-2 ${
                      selectedAttribute.stock === 0
                        ? "text-red-500 font-medium"
                        : selectedAttribute.stock <= 5
                        ? "text-orange-500 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {selectedAttribute.stock === 0
                      ? "Out of stock"
                      : `${selectedAttribute.stock} available`}
                  </span>
                )}
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
              <ShoppingCart className="mr-2 h-5 w-5" />
              {selectedAttribute && selectedAttribute.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
