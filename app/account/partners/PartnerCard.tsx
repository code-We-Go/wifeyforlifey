"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ExternalLink, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { thirdFont } from "@/fonts";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface Partner {
  _id?: string;
  category: string;
  subCategory: string;
  brand: string;
  offer: string;
  discount: string;
  code: string;
  link: string;
  bookingMethod: string;
  imagePath?: string;
}

interface PartnerCardProps {
  partner: Partner;
  isLocked?: boolean;
  onLockedClick?: () => void;
  requiredPackages?: any[];
}

export default function PartnerCard({ 
  partner, 
  isLocked, 
  onLockedClick,
  requiredPackages = []
}: PartnerCardProps) {
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const router = useRouter();
  // Function to handle external link click
  const handleVisitWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) {
      onLockedClick?.();
      return;
    }
    if (partner.link) {
      window.open(partner.link, "_blank");
    }
  };

  const handleCardClick = () => {
    setIsOfferModalOpen(true);
  };

  // Default image path if none is provided
  const getImagePath = (): string => {
    return partner.imagePath || "vogacloset.jpeg"; // Default logo if no image path is provided
  };

  return (
    <>
      <div 
        className="relative product-card bg-lovely p-2 pt-4 border-lovely border-2 group cursor-pointer"
        onClick={handleCardClick}
      >
        <Image
          width={80}
          height={50}
          className="absolute -top-5 -rotate-45 -left-5 z-20"
          alt="fyonka"
          src={"/fyonkaCreamey.png"}
          unoptimized
        />
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={`${getImagePath()}`}
            alt={partner.brand}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            className={`absolute inset-0 transition-colors duration-300 bg-black/0 group-hover:bg-black/10`}
          >
            {isLocked && (
              <div className="absolute top-2 right-2">
                <div className="bg-lovely/80 backdrop-blur-sm p-2 rounded-full text-creamey shadow-lg border border-creamey/20">
                  <Lock size={16} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="md:p-4 mt-2">
          <h4
            className={`${thirdFont.className} tracking-normal font-semibold text-creamey line-clamp-1 text-lg`}
          >
            {partner.brand}
          </h4>
          <div className="flex flex-col mt-2">
            <div className="space-y-0.5">
              <p className="text-xs text-creamey/80 uppercase tracking-wider font-medium">
                {partner.category} • {partner.subCategory}
              </p>
              <p className="text-creamey font-medium line-clamp-2 h-10 leading-tight">
                {partner.offer}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOfferModalOpen(true);
                }}
                className="text-[10px] text-creamey/50 hover:text-creamey uppercase tracking-widest transition-colors font-bold underline decoration-creamey/30 underline-offset-4"
              >
                More Details
              </button>
              {partner.discount && (
                <p className="text-sm font-bold text-creamey/90 mt-1">
                  {partner.discount}
                </p>
              )}
              {partner.code && (
                <div className="mt-2 flex items-center">
                  <span className="text-[10px] font-bold text-lovely bg-creamey px-2 py-0.5 rounded-sm uppercase tracking-tighter mr-2">
                    Code
                  </span>
                  {isLocked ? (
                    <div 
                      className="flex items-center gap-1.5 text-creamey bg-creamey/10 px-2 py-0.5 rounded-sm border border-creamey/20 cursor-help"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLockedClick?.();
                      }}
                    >
                      <span className="text-sm tracking-[0.2em] font-bold">••••••</span>
                      <Lock size={12} className="opacity-70" />
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-creamey bg-creamey/20 px-2 py-0.5 rounded-sm">
                      {partner.code}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-4">
              {partner.link && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-9 hover:bg-creamey text-lovely bg-creamey/90 rounded-full w-full font-bold shadow-sm"
                  onClick={handleVisitWebsite}
                >
                  {isLocked ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      <span className="text-xs uppercase tracking-widest">Unlock Code</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span className="text-xs uppercase tracking-widest">Visit Partner</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offer Details Modal */}
      <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
        <DialogContent 
          className="max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl max-h-[95vh] bg-creamey rounded-3xl p-8 border-none shadow-2xl overflow-y-auto overflow-x-hidden"
          onPointerDownOutside={(e) => e.preventDefault()} // Optional: prevent accidental close if needed
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-lovely/10 flex-shrink-0">
                <Image
                  src={getImagePath()}
                  alt={partner.brand}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <DialogTitle
                  className={`${thirdFont.className} text-2xl font-bold text-lovely leading-none mb-1`}
                >
                  {partner.brand}
                </DialogTitle>
                <p className="text-lovely/60 text-xs uppercase tracking-widest font-bold">
                  {partner.category} • {partner.subCategory}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-lovely/40 mb-2">
                  The Offer
                </h5>
                <p className="text-lovely text-base font-medium leading-normal">
                  {partner.offer}
                </p>
              </div>

              {partner.discount && (
                <div>
                  <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold text-lovely/40 mb-2">
                    Special Pricing
                  </h5>
                  <p className="text-lovely text-xl font-black italic">
                    {partner.discount}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-lovely/10 space-y-4">
                {partner.code && (
                  <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-lovely/5">
                    <span className="text-xs font-bold text-lovely/60 uppercase tracking-widest">
                      Promo Code
                    </span>
                    {isLocked ? (
                      <div
                        className="flex items-center gap-2 text-lovely cursor-pointer hover:text-pinkey transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLockedClick?.();
                        }}
                      >
                        <span className="font-mono tracking-widest font-black">
                          ••••••
                        </span>
                        <Lock size={14} />
                      </div>
                    ) : (
                      <span className="font-mono text-lg font-black text-lovely bg-white px-3 py-1 rounded-lg shadow-sm border border-lovely/10">
                        {partner.code}
                      </span>
                    )}
                  </div>
                )}

                {isLocked ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-lovely/5 rounded-2xl border border-lovely/10 text-center">
                      <p className="text-lovely text-sm font-semibold mb-4">
                        To unlock this code you have to subscribe to one of this packages :
                      </p>
                      <div className="space-y-3">
                        {requiredPackages.map((pkg) => (
                          <button
                            key={pkg._id}
                            onClick={() => {
                              router.push(`/subscription/${pkg._id}`);
                              setIsOfferModalOpen(false);
                            }}
                            className="w-full flex items-center hover:bg-pinkey cursor-pointer justify-between p-4 hover:text-lovely bg-pinkey/80 rounded-2xl border border-lovely/60 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex-shrink-0">
                                {pkg.imgUrl && (
                                  <img
                                    src={pkg.imgUrl}
                                    alt={pkg.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <span className="font-semibold text-lovely transition-colors">
                                {pkg.name}
                              </span>
                            </div>
                            <ChevronRight size={20} className="text-lovely/50" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={(e) => {
                      handleVisitWebsite(e);
                    }}
                    className="w-full py-6 rounded-2xl bg-lovely text-white hover:bg-lovely/90 font-bold text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ExternalLink size={18} className="mr-2" />
                    Redeem on Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

