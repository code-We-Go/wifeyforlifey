"use client";
import { CartItem } from "@/app/interfaces/interfaces";
import Image from "next/image";
import React, { useContext, useState } from "react";
import { useCart } from "@/providers/CartProvider";
import { wishListContext } from "@/app/context/wishListContext";
import Link from "next/link";
import { thirdFont } from "@/fonts";

const CartItemSmall = ({
  item,
  wishListBool,
}: {
  item: CartItem;
  wishListBool: boolean;
}) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const { updateQuantity, addItem, removeItem } = useCart();
  const { wishList, setWishList } = useContext(wishListContext);

  const handleQuantity = (opr: string, productId: string) => {
    if (opr === "-") {
      if (quantity > 1) {
        const updatedQuantity = quantity - 1;
        setQuantity(updatedQuantity);

        if (wishListBool === true) {
          const updatedWishList = wishList.map((wishItem) =>
            wishItem.productId === productId &&
            wishItem.attributes.name === item.attributes.name &&
            wishItem.variant.name === item.variant.name
              ? { ...wishItem, quantity: updatedQuantity }
              : wishItem
          );
          setWishList(updatedWishList);
        } else {
          updateQuantity(
            productId,
            updatedQuantity,
            item.variant,
            item.attributes
          );
        }
      } else if (quantity === 1) {
        // Remove item when quantity reaches 0
        if (wishListBool === true) {
          const updatedWishList = wishList.filter(
            (wishItem) =>
              !(
                wishItem.productId === productId &&
                wishItem.attributes.name === item.attributes.name &&
                wishItem.variant.name === item.variant.name
              )
          );
          setWishList(updatedWishList);
        } else {
          updateQuantity(productId, 0, item.variant, item.attributes);
        }
      }
    } else if (opr === "+") {
      const updatedQuantity = quantity + 1;
      setQuantity(updatedQuantity);

      if (wishListBool === true) {
        const updatedWishList = wishList.map((wishItem) =>
          wishItem.productId === productId &&
          wishItem.attributes.name === item.attributes.name &&
          wishItem.variant.name === item.variant.name
            ? { ...wishItem, quantity: updatedQuantity }
            : wishItem
        );
        setWishList(updatedWishList);
      } else {
        updateQuantity(
          productId,
          updatedQuantity,
          item.variant,
          item.attributes
        );
      }
    }
  };

  const [modalAppear, toggleRemoveModal] = useState(false);

  const transferItemToCart = () => {
    addItem(item);
  };

  return (
    <Link className="w-full" href={`/shop/${item.productId}`}>
      <div className="text-lovely w-full bg-pinkey rounded-2xl px-2 py-2">
        <div className="flex w-full h-full  py-2  gap-4">
          <div className="cursor-pointer h-full flex justify-start items-start">
            <span
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                removeItem(item.productId, item.variant, item.attributes);
              }}
              className="text-[12px] pt-2 px-4 text-lovel"
            >
              x
            </span>
          </div>
          <div className="relative min-w-[80px] min-h-[50px]">
            <Image
              width={80}
              height={80}
              src={item.imageUrl}
              alt=""
              className="aspect-square rounded object-cover"
            />
          </div>

          <div className="flex w-full flex-col  justify-between ">
            <div>
              <h3
                className={`${thirdFont.className} font-semibold text-lg w-full `}
              >
                {item.productName}
              </h3>
            </div>
            <div className="flex w-full  font-semibold text-xs  justify-between">
              {/* <h3 className=''>COLOR : {item.color}</h3>
            <h3 className=''>SIZE : {item.size}</h3> */}
            </div>

            <div className="mt-0.5 flex gap-3 justify-between   font-semibold text-xs ">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="flex gap-4 items-center justify-between"
              >
                QUANTITY :{/* <dt className="inline">Quantity:</dt> */}
                <span
                  className="px-3 py-2 bg-creamey rounded-lg text-lovely cursor-pointer p-3 text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuantity("-", item.productId);
                  }}
                >
                  -{" "}
                </span>
                {item.quantity}
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleQuantity("+", item.productId);
                  }}
                  className="text-sm px-3 py-2 bg-creamey rounded-lg text-lovely cursor-pointer"
                >
                  {" "}
                  +
                </span>
              </div>
              <h3 className="text-sm">PRICE : {item.price} LE</h3>
            </div>
            <div className="font-semibold flex justify-between w-full">
              <h2 className="text-xs">
                {" "}
                TOTAL : {item.quantity * item.price} LE{" "}
              </h2>
              {wishListBool && (
                <h1
                  onClick={() => {
                    transferItemToCart(); // Properly invoke the function
                    //  deleteItem(item.productId,item.color,item.size);  // Properly invoke with the item ID
                  }}
                  className="text-primary text-sm hover:cursor-pointer"
                >
                  ADD TO CART
                </h1>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CartItemSmall;
