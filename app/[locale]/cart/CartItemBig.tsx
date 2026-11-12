import { CartItem } from "@/app/interfaces/interfaces";
import React, { useContext } from "react";
import Image from "next/image";
import { cartContext } from "@/app/context/cartContext";

const CartItemBig = ({ item }: { item: CartItem }) => {
  const { cart, setCart } = useContext(cartContext);

  //     const updateItemQuantity= (id:number,opr:string) =>{
  //         console.log(id);
  //         console.log(item.quantity)
  //         const newCartQuantity=cart.filter((item)=>

  //           item.id === id && opr==='plus'?
  //         {...item,quantity : item.quantity+=1}:
  //           item.quantity>0 ? {...item,quantity : item.quantity-=1}:1

  //     )
  //     setCart(newCartQuantity)
  // }

  const updateItemQuantity = (id: number, opr: string) => {
    console.log(id);
    console.log(item.quantity);

    const newCartQuantity = cart.map((item) => {
      if (item.quantity === id) {
        if (opr === "plus") {
          return { ...item, quantity: item.quantity + 1 };
        } else if (opr === "min" && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
      }
      return item; // return the item unchanged if no updates
    });

    setCart(newCartQuantity);
  };

  return (
    <div className="flex  px-2 min-h-1/4 h-auto bg-slate-200 w-full border-b rounded-2xl border-gray-400 py-2  items-start gap-4">
      <Image
        unoptimized
        width={200}
        height={300}
        src={item.imageUrl}
        alt=""
        className="size-24 rounded object-cover"
      />

      <div className="w-full h-full">
        <div className="flex  w-full justify-center text-center">
          <h3 className="text-sm w-full text-black">{item.productName}</h3>
        </div>
        <div className="flex  justify-between">
          <div className="w-full gap-2 flex flex-col items-start text-[10px]  text-slate-500 justify-between ">
            {/* <h3 className=''>Color : {item.}</h3> */}
            <h3 className="">Quantity : {item.quantity}</h3>
          </div>
          <div>
            <div className="flex rounded-xl items-center justify-center bg-slate-300 text-primary">
              <span
                onClick={() => {
                  updateItemQuantity(item.quantity, "min");
                }}
                className="px-4 cursor-pointer"
              >
                -
              </span>
              <span className="px-4 font-semibold">{item.quantity}</span>
              <span
                onClick={() => {
                  updateItemQuantity(item.quantity, "plus");
                }}
                className="px-4 cursor-pointer"
              >
                +
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemBig;
