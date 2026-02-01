"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/app/interfaces/interfaces";
import { wishListContext } from "@/app/context/wishListContext";
import { useContext, useState } from "react";
import { cartContext } from "@/app/context/cartContext";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import { useModal } from "@/app/context/ModalContext";
import { thirdFont } from "@/fonts";
import { useToast } from "@/hooks/use-toast";
export default function ProductCard({
  product,
  favorite,
}: {
  product: Product;
  favorite: boolean;
}) {
  const router = useRouter();
  const { wishList, setWishList } = useContext(wishListContext);
  const { cart, setCart } = useContext(cartContext);
  const [heartIsEmpty, setHeartIsEmpty] = useState(!favorite);
  const { openModal } = useModal();
  const { toast } = useToast();
  const toggleHeart = () => {
    setHeartIsEmpty(!heartIsEmpty);
  };

  const addToWishList = () => {
    if (heartIsEmpty) {
      setWishList((oldWishList) => [
        ...oldWishList,
        {
          id: wishList.length,
          productId: product._id,
          productName: product.title,
          price: product.price.local,
          variant: product.variations?.[0],
          quantity: 1,
          attributes: product.variations?.[0]?.attributes?.[0],
          imageUrl: product.variations?.[0]?.images?.[0]?.url,
        },
      ]);
      // Swal.fire({
      //   background: "#cb808b",
      //   color: "white",
      //   toast: false,
      //   iconColor: "#473728",
      //   position: "center",
      //   text: "YOUR PRODUCT HAS BEEN ADDED TO YOUR WISHLIST",
      //   showConfirmButton: false,
      //   timer: 2000,
      //   customClass: {
      //     popup: "no-rounded-corners small-popup",
      //   },
      // });
      toast({
        title: "Added item to Wishlist",
        description: "Item has been added to your wishlist.",
        variant: "added",
      });
    } else {
      const newWishList = wishList.filter(
        (item) => item.productId !== product._id
      );
      setWishList(newWishList);
      toast({
        title: "Removed item from Wishlist",
        description: "Item has been removed from your wishlist.",
        variant: "removed",
      });
    }
    toggleHeart();
  };

  const handleProductClick = (e: React.MouseEvent) => {
    // Only navigate if the click wasn't on a button
    if (!(e.target as HTMLElement).closest("button")) {
      router.push(`/shop/${product._id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    openModal(product);
  };

  // Check if product is out of stock (first variant, first attribute)
  const isOutOfStock = product.variations[0]?.attributes[0]?.stock === 0;

  return (
    <div
      className="relative product-card bg-lovely px-2 pt-4 pb-2 border-lovely border-2 group cursor-pointer"
      onClick={handleProductClick}
    >
      <Image
        width={80}
        height={50}
        className="absolute -top-5 -rotate-45 -left-5 z-20"
        alt="fyonka"
        src={"/fyonkaCreamey.png"}
      />
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.variations[0].images[0].url}
          alt={product.title}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? " opacity-80" : ""
          }`}
        />
        <div
          className={`absolute inset-0 transition-colors duration-300 ${
            isOutOfStock ? "bg-black/30" : "bg-black/0 group-hover:bg-black/10"
          }`}
        ></div>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </div>
          </div>
        )}
        <Button
          onClick={addToWishList}
          size="icon"
          variant="secondary"
          className={cn(
            heartIsEmpty
              ? "bg-transparent hover:bg-lovely shadow-md text-creamey"
              : "bg-lovely text-creamey hover:bg-transparent shadow-md",
            "rounded-full h-9 w-9 absolute top-4 right-4 z-10"
          )}
        >
          <Heart
            className={cn(
              heartIsEmpty
                ? "hover:bg-lovely text-creamey"
                : "bg-lovely hover:bg-transparent text-creamey",
              "h-4 w-4"
            )}
          />
        </Button>
      </div>
      <div className="pt-2 px-2 md:pt-4 md:px-4">
        <h4
          className={`${thirdFont.className} tracking-normal font-semibold text-creamey line-clamp-1`}
        >
          {product.title}
        </h4>
        <div className="flex items-center justify-between mt-2">
          <div className="space-y-0">
            {product.comparedPrice > 0 ? (
              <del className="text-creamey text-sm block">
                LE{product.comparedPrice.toFixed(2)}
              </del>
            ) : (
              <div className="text-sm block invisible">LE0.00</div>
            )}
            <p className="price-tag text-creamey">
              LE{product.price.local.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isOutOfStock ? (
              <div className="text-xs text-creamey font-medium">
                Out of Stock
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 hover:bg-creamey/90 text-lovely bg-creamey rounded-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                <span className="text-xs">Add</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
