import React, { useState } from "react";
import Link from "next/link";

interface LoyaltyPointsSectionProps {
  loyaltyPoints: { realLoyaltyPoints: number };
  redeemPoints: number;
  setRedeemPoints: (val: number) => void;
  loyaltyDiscount: number;
  setLoyaltyDiscount: (val: number) => void;
  isAuthenticated: boolean;
  showTooltip?: boolean;
  setShowTooltip?: (val: boolean) => void;
  mobile?: boolean;
}

const LoyaltyPointsSection: React.FC<LoyaltyPointsSectionProps> = ({
  loyaltyPoints,
  redeemPoints,
  setRedeemPoints,
  loyaltyDiscount,
  setLoyaltyDiscount,
  isAuthenticated,
  showTooltip,
  setShowTooltip,
  mobile = false,
}) => {
  const maxRedeem = loyaltyPoints.realLoyaltyPoints - (loyaltyPoints.realLoyaltyPoints % 20);

  // Handler for redeeming points (allow any value, clamp in effect)
  const handleRedeemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value) || 0;
    setRedeemPoints(value);
    // Loyalty points: clamp to valid multiple of 20 and ≤ loyaltyPoints
    let validRedeem = Math.max(0, Math.min(value - (value % 20), loyaltyPoints.realLoyaltyPoints));
    const loyaltyLE = Math.floor(validRedeem / 20);
    setLoyaltyDiscount(loyaltyLE);
  };

  return (
    <div className="mt-6">
      {isAuthenticated ? (
        <div className="space-y-2 bg-pinkey text-lovely rounded-lg p-4 shadow-sm border border-lovely">
          <div className="flex items-center gap-2 mb-2 relative"
            onMouseEnter={() => setShowTooltip && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip && setShowTooltip(false)}>
            <span className="font-semibold text-lovely">Loyalty Points</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-lovely">{loyaltyPoints.realLoyaltyPoints}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2 relative">
              <div
                className="h-2 bg-lovely rounded-full"
                style={{ width: `${Math.min(100, (redeemPoints / loyaltyPoints.realLoyaltyPoints) * 100 || 0)}%` }}
              ></div>
            </div>
            <span className="text-xs text-lovely/90">max: {maxRedeem}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <label htmlFor={mobile ? "redeemPointsMobile" : "redeemPoints"} className="text-lovely font-medium">
              Redeem{mobile ? ":" : " Loyalty Points:"}
            </label>
            <input
              id={mobile ? "redeemPointsMobile" : "redeemPoints"}
              type="number"
              min={0}
              max={maxRedeem}
              value={redeemPoints}
              onChange={handleRedeemChange}
              className="border border-lovely bg-creamey rounded px-2 py-1 w-24 focus:ring-lovely focus:border-lovely"
            />
            <span className="text-lovely font-semibold">= {loyaltyDiscount} LE</span>
            <button
              type="button"
              className="ml-2 px-3 py-1 rounded bg-lovely/90 text-creamey hover:bg-lovely transition"
              onClick={() => {
                setRedeemPoints(maxRedeem);
                setLoyaltyDiscount(Math.floor(maxRedeem / 20));
              }}
              disabled={loyaltyPoints.realLoyaltyPoints < 20}
            >
              Max
            </button>
          </div>
          {redeemPoints > 0 && (
            <div className="text-xs text-green-700 mt-1">
              You will redeem {redeemPoints} points for a {loyaltyDiscount} LE discount.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 bg-pinkey text-lovely rounded-lg p-4 shadow-sm border border-lovely flex flex-col items-center">
          <span className="font-semibold text-lovely mb-2">Loyalty Points</span>
          <Link href="/login?redirect=checkout">
            <button className="px-4 py-2 bg-lovely text-creamey rounded hover:bg-lovely/90 transition font-semibold">
              Log in to use your loyalty points
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LoyaltyPointsSection;
