"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SideCart() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    closeCart,
  } = useCart();

  const handleQuantityChange = (
    productId: string,
    newQuantity: number,
    variant: any,
    attribute: any
  ) => {
    if (newQuantity >= 1 && newQuantity <= attribute.stock) {
      updateQuantity(productId, newQuantity, variant, attribute);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md bg-creamey border-l-lovely/10 p-0 flex flex-col h-full">
        <SheetHeader className="p-6 border-b border-lovely/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-medium text-lovely flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              Your Cart
            </SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
              <div className="w-20 h-20 bg-pinkey rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-lovely opacity-40" />
              </div>
              <h3 className="text-xl font-medium text-lovely mb-2">
                Your cart is empty
              </h3>
              <p className="text-lovely/60 mb-8">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button
                onClick={closeCart}
                className="rounded-full bg-lovely hover:bg-lovely/90 text-creamey px-8"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-lovely/5">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-lovely truncate pr-2">
                        {item.productName}
                      </h4>
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.variant, item.attributes)
                        }
                        className="text-lovely/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-lovely/60 mb-2">
                      {item.variant.name} {item.attributes.name && `• ${item.attributes.name}`}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center bg-pinkey rounded-full px-2 py-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.quantity - 1,
                              item.variant,
                              item.attributes
                            )
                          }
                          className="p-1 text-lovely hover:bg-lovely/10 rounded-full transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-lovely">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.quantity + 1,
                              item.variant,
                              item.attributes
                            )
                          }
                          className="p-1 text-lovely hover:bg-lovely/10 rounded-full transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-medium text-lovely">
                        LE {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <SheetFooter className="p-6 border-t border-lovely/10 bg-white/50 backdrop-blur-sm mt-auto sm:flex-col gap-4">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-lg font-medium text-lovely">
                <span>Subtotal</span>
                <span>LE {totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-lovely/60">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-lovely bg-creamey text-lovely hover:bg-everGreen hover:text-creamey transition-all duration-300"
                  onClick={closeCart}
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full bg-lovely hover:bg-everGreen text-creamey transition-all duration-300"
                  onClick={closeCart}
                >
                  <Link href="/checkout" className="flex items-center justify-center gap-2">
                    Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
