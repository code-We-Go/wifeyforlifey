"use client";
import React from "react";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ipackage } from "@/app/interfaces/interfaces";
import { cn } from "@/lib/utils";
import { thirdFont } from "@/fonts";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "next-intl";
import { localizePackage } from "@/app/lib/localize";

export default function PackageCard({
  packageItem,
}: {
  packageItem: Ipackage;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const locale = useLocale();
  const t = useTranslations("common");
  const pkg = localizePackage(packageItem, locale);

  const handlePackageClick = (e: React.MouseEvent) => {
    // Only navigate if the click wasn't on a button
    if (!(e.target as HTMLElement).closest("button")) {
    router.push(`/package/${packageItem.slug}`);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    router.push(`/package/${packageItem.slug}`);
  };

  return (
    <div
      className="relative bg-white/50 border-2 border-lovely text-lovely/90  rounded-[18px] overflow-hidden group cursor-pointer flex flex-col h-full"
      onClick={handlePackageClick}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0 bg-white">
        <Image
          src={pkg.imgUrl}
          alt={pkg.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 transition-colors duration-300 bg-black/0 group-hover:bg-black/10"></div>
        {pkg.discountedFrom && pkg.discountedFrom > pkg.price && (
          <div className="absolute top-3 end-3 z-10 bg-lovely text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            {locale === "ar"
              ? `وفري ${Math.round(((pkg.discountedFrom - pkg.price) / pkg.discountedFrom) * 100)}%`
              : `Save ${Math.round(((pkg.discountedFrom - pkg.price) / pkg.discountedFrom) * 100)}%`}
          </div>
        )}
      </div>
      
      <div className="p-[16px_18px_20px] flex flex-col grow">
        {pkg.notes && pkg.notes.length > 0 && (
          <span className="inline-block self-start text-[11px] font-semibold tracking-[0.06em] uppercase bg-lovely/20  px-2.5 py-1 rounded-full mb-2">
            {pkg.notes[0]}
          </span>
        )}
        
        <h3
          className={cn(
            thirdFont.className,
            "font-bold text-[22px] uppercase tracking-[0.03em] leading-tight"
          )}
        >
          {pkg.name}
        </h3>
        
        {pkg.notes && pkg.notes.length > 1 && (
          <p className="text-[13.5px] leading-[1.55] mt-1.5 text-lovely/90 line-clamp-3">
            {pkg.notes[1]}
          </p>
        )}
        
        <div className="grow" />

        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
          <p className={cn(thirdFont.className, "font-semibold text-[19px] flex items-center gap-1.5 flex-wrap")}>
            {locale === "ar"
              ? `يبدأ من ${packageItem.price.toLocaleString()} ${t("le")}`
              : `From LE ${packageItem.price.toLocaleString()}`}
            {packageItem.discountedFrom && packageItem.discountedFrom > packageItem.price && (
              <span className="text-[14px] text-lovely/60 line-through font-normal">
                {locale === "ar"
                  ? `${packageItem.discountedFrom.toLocaleString()} ${t("le")}`
                  : `LE ${packageItem.discountedFrom.toLocaleString()}`}
              </span>
            )}
            <small className="font-sans font-medium text-[12px] opacity-85 normal-case tracking-normal">
              {packageItem.duration > 0 ? (
                <>
                  | {(() => {
                    const months = Number(packageItem.duration);
                    if (isNaN(months) || months === 0) return packageItem.duration;
                    if (locale === "ar") {
                      if (months === 1) return "شهر واحد";
                      if (months === 2) return "شهران";
                      if (months < 12) return `${months} شهور`;
                      const years = Math.floor(months / 12);
                      const rem = months % 12;
                      let res = years === 1 ? "سنة كاملة" : `${years} سنوات`;
                      if (rem > 0) res += ` و ${rem} ${rem === 1 ? "شهر" : "شهور"}`;
                      return res;
                    }
                    if (months < 12) return `${months} Months`;
                    const years = Math.floor(months / 12);
                    const remainingMonths = months % 12;
                    let result = `${years} ${years === 1 ? "Year" : "Years"}`;
                    if (remainingMonths > 0) {
                      result += ` and ${remainingMonths} ${
                        remainingMonths === 1 ? "Month" : "Months"
                      }`;
                    }
                    return result;
                  })()}
                </>
              ) : null}
            </small>
          </p>
        </div>

        <Button
          variant="secondary"
          className="mt-[14px] self-start w-auto px-6 bg-lovely font-bold text-white hover:bg-lovely/90 rounded-full h-auto py-2.5"
          onClick={handleViewDetails}
        >
          {t("seeDetails")}
        </Button>
      </div>
    </div>
  );
}
