"use client";

import React, { useEffect, useState, useContext } from "react";
import { cartContext } from "@/app/context/cartContext";
import { CartItem } from "@/app/interfaces/interfaces";
import { Discount, DiscountCalculationType } from "@/app/types/discount";
import { thirdFont } from "@/fonts";
import LoadingSpinner from "./LoadingSpinner";

interface DiscountSectionProps {
  redeemType: string;
  onDiscountApplied: (discount: Discount | null) => void;
  packagePrice?: number; // Optional package price for subscription page
}

const DiscountSection: React.FC<DiscountSectionProps> = ({
  onDiscountApplied,
  redeemType,
  packagePrice,
}) => {
  const [discountCode, setDiscountCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
  const { cart } = useContext(cartContext);

  useEffect(() => {
    fetchActiveDiscounts();
  }, [cart, redeemType, packagePrice]);

  const fetchActiveDiscounts = async () => {
    try {
      // For subscription page, we need to pass the package price directly
      // instead of calculating from cart items
      const cartTotal =
        redeemType === "Subscription" && packagePrice !== undefined
          ? packagePrice // Use packagePrice prop for subscription
          : cart.reduce(
              (total: number, item: CartItem) =>
                total + item.price * item.quantity,
              0
            );

      console.log(
        "Discount Section - cartTotal:",
        cartTotal,
        "redeemType:",
        redeemType
      );

      const response = await fetch(
        `/api/active-discounts?cartTotal=${cartTotal}&redeemType=${redeemType}`
      );
      const data = await response.json();

      if (data.success && data.discounts.length > 0) {
        setActiveDiscounts(data.discounts);
        // Always apply the first available discount
        //3ayzen n5leeh y3ml apply l akbr discount
        onDiscountApplied(data.discounts[0]);
      } else {
        setActiveDiscounts([]);
        onDiscountApplied(null);
      }
    } catch (error) {
      console.error("Error fetching active discounts:", error);
      setActiveDiscounts([]);
      onDiscountApplied(null);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setError("Please enter a discount code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/apply-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          discountCode: discountCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply discount");
      }
      console.log("data.discount" + data.discount.calculationType);
      onDiscountApplied(data.discount);
      setDiscountCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply discount");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3
        className={`text-[16px] lg:text-4xl ${thirdFont.className}  text-lovely mb-4`}
      >
        Discounts
      </h3>

      {/* Active Automatic Discounts */}
      {activeDiscounts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Available Discounts:
          </h4>
          <div className="space-y-2">
            {activeDiscounts.map((discount, index) => (
              <div key={index} className="text-sm text-gray-600">
                • {discount.code}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Discount Code Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Enter discount code"
          className="flex-1 placeholder:text-lovely/80 px-2 py-2 border bg-creamey text-lovely border-pinkey rounded-2xl focus:outline-none focus:right-1 focus:ring-lovely/30"
          disabled={loading}
        />
        <button
          onClick={handleApplyDiscount}
          disabled={loading}
          className="px-4 py-2 bg-lovely rounded-2xl hover:bg-lovely/90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? <LoadingSpinner size="sm" text="Applying..." /> : "Apply"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default DiscountSection;
