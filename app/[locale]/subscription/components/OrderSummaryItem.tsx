import React, { useState } from "react";
import { CartItem } from "@/app/interfaces/interfaces";
import Image from "next/image";
import { thirdFont } from "@/fonts";
import { useCart } from "@/providers/CartProvider";
import { Minus, Plus, Trash2 } from "lucide-react";

const OrderSummaryItem = ({ cartItem }: { cartItem: CartItem }) => {
  const { updateQuantity, removeItem } = useCart();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleQuantity = (newQty: number) => {
    if (newQty < 1) return;
    updateQuantity(
      cartItem.productId, 
      newQty, 
      cartItem.variant as any, 
      cartItem.attributes as any
    );
  };

  const handleRemove = () => {
    setIsDeleting(true);
    setTimeout(() => {
      removeItem(
        cartItem.productId, 
        cartItem.variant as any, 
        cartItem.attributes as any
      );
    }, 300);
  };

  return (
    <div className={`group relative flex w-full py-3 px-3 rounded-2xl border border-lovely/10 bg-creamey/50 backdrop-blur-sm transition-all duration-300 ${isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} hover:shadow-md mb-2`}>
      <div className="flex w-full gap-4 items-center">
        {/* Product Image */}
        <div className="relative rounded-xl w-20 h-20 md:w-24 md:h-24 overflow-hidden border border-lovely/20 shadow-sm">
          <Image
            unoptimized
            fill
            alt={cartItem.productName}
            src={cartItem.imageUrl}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-1 flex-col justify-between h-full py-1">
          <div className="flex justify-between items-start">
            <h2 className={`${thirdFont.className} text-base md:text-lg font-bold text-lovely leading-tight line-clamp-1`}>
              {cartItem.productName}
            </h2>
            <button 
              onClick={handleRemove}
              className="text-lovely/40 hover:text-red-400 transition-colors p-1"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] md:text-xs text-lovely/60 -mt-1 mb-2">
            {cartItem.variant?.name} {cartItem.attributes?.name ? `- ${cartItem.attributes.name}` : ""}
          </p>

          <div className="flex items-center justify-between mt-auto">
            {/* Quantity Controls */}
            <div className="flex items-center bg-pinkey/20 rounded-full px-2 py-1 gap-3 border border-pinkey/30">
              <button 
                onClick={() => handleQuantity(cartItem.quantity - 1)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/50 text-lovely transition-colors"
                disabled={cartItem.quantity <= 1}
              >
                <Minus className={`w-3 h-3 ${cartItem.quantity <= 1 ? 'opacity-30' : ''}`} />
              </button>
              <span className="text-sm font-bold text-lovely min-w-[12px] text-center">
                {cartItem.quantity}
              </span>
              <button 
                onClick={() => handleQuantity(cartItem.quantity + 1)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/50 text-lovely transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-[10px] text-lovely/40 leading-none">Total</p>
              <p className="text-base font-bold text-lovely">
                {cartItem.quantity * cartItem.price} <span className="text-xs font-normal">LE</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryItem;
