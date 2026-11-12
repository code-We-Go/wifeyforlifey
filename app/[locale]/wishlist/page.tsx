"use client";
import React, { useContext } from "react";
import { wishListContext } from "@/app/context/wishListContext";
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { thirdFont } from "@/fonts";
import { Separator } from "@radix-ui/react-separator";
import Image from "next/image";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "next-intl";

const WishlistPage = () => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { wishList, setWishList } = useContext(wishListContext);
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("common");

  const handleRemoveFromWishlist = (
    productId: string,
    variant: any,
    attributes: any
  ) => {
    setWishList((prevList) =>
      prevList.filter(
        (item) =>
          item.productId !== productId ||
          item.variant !== variant ||
          item.attributes !== attributes
      )
    );
    toast({
      title: isArabic ? "اتشال من المفضلة" : "Removed from wishlist",
      description: isArabic
        ? "المنتج اتحذف من قائمة المفضلة."
        : "Item has been removed from your wishlist.",
    });
  };

  const handleMoveToCart = (item: any) => {
    addItem(item);
    handleRemoveFromWishlist(item.productId, item.variant, item.attributes);
    toast({
      title: isArabic ? "انضاف للشنطة 💕" : "Added to cart",
      description: isArabic
        ? `تم نقل ${item.productName} لشنطة مشترياتك.`
        : `${item.productName} has been moved to your cart.`,
    });
  };

  if (wishList.length === 0) {
    return (
      <div className="container-custom py-16 max-w-4xl min-h-[calc(100vh-128px)] mx-auto text-center">
        <div className="bg-lovely text-creamey rounded-lg p-8 md:p-12 shadow-sm">
          <div className="w-24 h-24 bg-creamey rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-lovely" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-medium mb-4">
            {isArabic ? "لسه مفيش حاجة في قائمة امنياتك!" : "Your Wishlist is Empty"}
          </h1>
          <p className="mb-8 max-w-md mx-auto" dir={isArabic ? "rtl" : "ltr"}>
            {isArabic
              ? "لسه مضفتيش حاجة لقائمة أمنياتك! خدي لفة في المتجر، وأكيد هتلاقي حاجات تعجبك💗\u200F"
              : "Looks like you haven't added anything to your wishlist yet. Explore our products and find something you'll love!"}
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-2xl bg-creamey text-lovely hover:bg-creamey hover:font-semibold"
          >
            <Link href="/shop">{isArabic ? "كمّلي شوبنج" : "Continue Shopping"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 md:py-12 min-h-[calc(100vh-128px)]">
      <div className="flex items-center mb-8">
        <h1
          className={`${thirdFont.className} tracking-normal text-4xl text-lovely/90 md:text-5xl font-semibold`}
        >
          {isArabic ? "المفضلة" : "Wishlist"}
        </h1>
        <span className="mx-2 text-lovely/90">
          ({wishList.length} {isArabic ? (wishList.length === 1 ? "منتج" : "منتجات") : (wishList.length === 1 ? "item" : "items")})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wishlist Items */}
        <div className="lg:col-span-3 space-y-6">
          <Separator className="hidden md:block" />

          {wishList.map((item, index) => (
            <div
              key={index}
              className="bg-card bg-lovely border-lovely border-2 text-creamey rounded-lg p-4 md:p-6 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Product */}
                <div className="md:col-span-5 flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                    <Image
                      unoptimized
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <h5 className="font-medium line-clamp-1">
                      {item.productName}
                    </h5>
                  </div>
                </div>

                <div className="md:col-span-1 hidden md:block text-center">
                  {item.variant?.name || "-"}
                </div>
                <div className="md:col-span-1 hidden md:block text-center">
                  {item.attributes?.name || "-"}
                </div>

                {/* Price */}
                <div className="md:col-span-1 hidden md:block text-center">
                  {isArabic ? `${item.price.toFixed(2)} ج.م` : `LE${item.price.toFixed(2)}`}
                </div>

                {/* Actions */}
                <div className="md:col-span-4 flex items-center justify-end space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-lovely hover:text-lovely hover:border hover:border-creamey bg-creamey hover:font-semibold hover:bg-creamey"
                    onClick={() => handleMoveToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    {isArabic ? "إضافة لشنطة التسوق" : "Move to Cart"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-creamey hover:text-lovely hover:bg-creamey"
                    onClick={() =>
                      handleRemoveFromWishlist(
                        item.productId,
                        item.variant,
                        item.attributes
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 flex justify-between items-center">
            <Button
              asChild
              variant="outline"
              className="gap-2 bg-lovely text-creamey hover:text-creamey hover:bg-lovely hover:font-semibold"
            >
              <Link href="/shop">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {isArabic ? "العودة للمتجر" : "Continue Shopping"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
