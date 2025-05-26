"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCart } from "@/providers/CartProvider";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    // Simulate API call
    setTimeout(() => {
      setIsApplying(false);
      alert(`Coupon "${couponCode}" is invalid.`);
    }, 1000);
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 max-w-4xl mx-auto text-center">
        <div className="bg-card rounded-lg p-8 md:p-12 shadow-sm">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-medium mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our products and find something you'll love!
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const shipping = totalPrice >= 50 ? 0 : 5.99;
  const tax = totalPrice * 0.1; // 10% tax
  const orderTotal = totalPrice + shipping + tax;

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-display font-medium">Shopping Cart</h1>
        <span className="ml-2 text-muted-foreground">
          ({totalItems} {totalItems === 1 ? "item" : "items"})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm text-muted-foreground mb-2">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <Separator className="hidden md:block" />

          {items.map((item) => (
            <div key={item.productId} className="bg-card rounded-lg p-4 md:p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Product */}
                <div className="md:col-span-6 flex items-center space-x-4">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground md:hidden">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                  <span className="md:hidden text-sm text-muted-foreground">
                    Quantity:
                  </span>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => 
                        updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                      }
                    >
                      <span className="sr-only">Decrease quantity</span>
                      <span aria-hidden>-</span>
                    </Button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => 
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <span className="sr-only">Increase quantity</span>
                      <span aria-hidden>+</span>
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <div className="md:col-span-2 hidden md:block text-center">
                  ${item.price.toFixed(2)}
                </div>

                {/* Total */}
                <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                  <span className="md:hidden text-sm text-muted-foreground">
                    Total:
                  </span>
                  <div className="flex items-center">
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 flex justify-between items-center">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/shop">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-medium text-base pt-2">
                <span>Total</span>
                <span>${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleApplyCoupon} className="mt-6">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  variant="outline"
                  disabled={!couponCode || isApplying}
                >
                  Apply
                </Button>
              </div>
            </form>

            <Button className="w-full mt-6 rounded-full" size="lg" asChild>
              <Link href="/checkout">
                <CreditCard className="mr-2 h-5 w-5" />
                Checkout
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Secure checkout powered by Paymob
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}