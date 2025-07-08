"use client";
import React, { useContext } from "react";
import { wishListContext } from "../context/wishListContext";
import { ArrowLeft, ShoppingBag, Trash2, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { thirdFont } from "@/fonts";
import { Separator } from "@radix-ui/react-separator";
import Image from "next/image";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/hooks/use-toast";

const WishlistPage = () => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { wishList, setWishList } = useContext(wishListContext);

  const handleRemoveFromWishlist = (productId: string, variant: any, attributes: any) => {
    setWishList((prevList) => 
      prevList.filter(
        (item) => 
          item.productId !== productId || 
          item.variant !== variant || 
          item.attributes !== attributes
      )
    );
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    });
  };

  const handleMoveToCart = (item: any) => {
    addItem(item);
    handleRemoveFromWishlist(item.productId, item.variant, item.attributes);
    toast({
      title: "Added to cart",
      description: `${item.productName} has been moved to your cart.`,
    });
  };

  if (wishList.length === 0) {
    return (
      <div className="container-custom py-16 max-w-4xl mx-auto text-center">
        <div className="bg-lovely text-creamey rounded-lg p-8 md:p-12 shadow-sm">
          <div className="w-24 h-24 bg-creamey rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-lovely" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-medium mb-4">Your Wishlist is Empty</h1>
          <p className=" mb-8 max-w-md mx-auto">
            Looks like you haven&apos;t added anything to your wishlist yet. Explore our products and find something you&apos;ll love!
          </p>
          <Button asChild size="lg" className="rounded-2xl bg-everGreen text-creamey hover:bg-everGreen/90">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex items-center mb-8">
        <h1 className={`${thirdFont.className} tracking-normal text-4xl text-everGreen md:text-5xl  font-semibold`}>Wishlist</h1>
        <span className="ml-2 text-muted-foreground">
          ({wishList.length} {wishList.length === 1 ? "item" : "items"})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wishlist Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm text-muted-foreground mb-2">
            <div className="col-span-5 text-center">Product</div>
            <div className="col-span-2 text-center">Variants</div>
            <div className="col-span-1 text-center">Price</div>
          </div>

          <Separator className="hidden md:block" />

          {wishList.map((item, index) => (
            <div key={index} className="bg-card bg-everGreen text-creamey rounded-lg p-4 md:p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Product */}
                <div className="md:col-span-5 flex items-center space-x-4">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <h5 className="font-medium line-clamp-1">{item.productName}</h5>
                  </div>
                </div>

                <div className="md:col-span-1 hidden md:block text-center">
                  {item.variant.name}
                </div>
                <div className="md:col-span-1 hidden md:block text-center">
                  {item.attributes.name}
                </div>

                {/* Price */}
                <div className="md:col-span-1 hidden md:block text-center">
                  LE{item.price.toFixed(2)}
                </div>

                {/* Actions */}
                <div className="md:col-span-4 flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-creamey  hover:text-creamey hover:border hover:border-creamey bg-lovely hover:bg-saga"
                    onClick={() => handleMoveToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Move to Cart
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveFromWishlist(item.productId, item.variant, item.attributes)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
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
      </div>
    </div>
  );
};

export default WishlistPage;
