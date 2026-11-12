"use client";
import React from "react";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ipackage } from "@/app/interfaces/interfaces";
import { useRouter } from "@/i18n/routing";
import { thirdFont } from "@/fonts";
import { useTranslations } from "next-intl";

export default function PackageProductCard({
  packageItem,
}: {
  packageItem: Ipackage;
}) {
  const router = useRouter();
  const t = useTranslations("common");

  const handleProductClick = (e: React.MouseEvent) => {
    // Only navigate if the click wasn't on a button
    if (!(e.target as HTMLElement).closest("button")) {
      router.push(`/package/${packageItem.slug}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    router.push(`/package/${packageItem.slug}`);
  };

  return (
    <div
      className="relative product-card bg-lovely px-2 pt-4 pb-2 border-lovely border-2 group cursor-pointer h-full flex flex-col justify-between min-h-[300px]"
      onClick={handleProductClick}
    >
      <Image
        width={80}
        height={50}
        className="absolute -top-5 -rotate-45 rtl:rotate-45 -start-5 z-20"
        alt="fyonka"
        src={"/fyonkaCreamey.png"}
      />
      <div className="relative aspect-square overflow-hidden shrink-0">
        <Image
          src={packageItem.imgUrl}
          alt={packageItem.name}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-105`}
        />
        <div
          className={`absolute inset-0 transition-colors duration-300 bg-black/0 group-hover:bg-black/10`}
        ></div>
      </div>
      <div className="pt-2 px-2 md:pt-4 md:px-4 flex flex-col grow justify-between">
        <h4
          className={`${thirdFont.className} text-sm md:text-base xl:text-lg tracking-wide font-semibold text-creamey line-clamp-1`}
        >
          {packageItem.name}
        </h4>
        <div className="flex items-center justify-between mt-2">
          <div className="space-y-0">
            <div className="text-xs md:text-sm block invisible">0.00 {t("le")}</div>
            <p className="price-tag text-xs md:text-sm text-creamey">
              {packageItem.price.toFixed(2)} {t("le")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 hover:bg-creamey/90 text-lovely bg-creamey rounded-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 me-1" />
              <span className="text-xs">{t("seeDetails")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
