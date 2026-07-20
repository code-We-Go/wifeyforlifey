"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ipackage } from "@/app/interfaces/interfaces";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { thirdFont } from "@/fonts";
import { useToast } from "@/hooks/use-toast";

export default function PackageCard({
  packageItem,
}: {
  packageItem: Ipackage;
}) {
  const router = useRouter();
  const { toast } = useToast();

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
          src={packageItem.imgUrl}
          alt={packageItem.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 transition-colors duration-300 bg-black/0 group-hover:bg-black/10"></div>
      </div>
      
      <div className="p-[16px_18px_20px] flex flex-col grow">
        {packageItem.notes && packageItem.notes.length > 0 && (
          <span className="inline-block self-start text-[11px] font-semibold tracking-[0.06em] uppercase bg-lovely/20  px-2.5 py-1 rounded-full mb-2">
            {packageItem.notes[0]}
          </span>
        )}
        
        <h3
          className={cn(
            thirdFont.className,
            "font-bold text-[22px] uppercase tracking-[0.03em] leading-tight"
          )}
        >
          {packageItem.name}
        </h3>
        
        {packageItem.notes && packageItem.notes.length > 1 && (
          <p className="text-[13.5px] leading-[1.55] mt-1.5 text-lovely/90 line-clamp-3">
            {packageItem.notes[1]}
          </p>
        )}
        
        <div className="grow" />

        <p className={cn(thirdFont.className, "font-semibold text-[19px] mt-3 flex items-center gap-1.5 flex-wrap")}>
          From LE {packageItem.price.toFixed(2)}
          <small className="font-sans font-medium text-[12px] opacity-85 normal-case tracking-normal">
            {packageItem.duration > 0 ? (
              <>
                | {(() => {
                  const months = Number(packageItem.duration);
                  if (isNaN(months) || months === 0) return packageItem.duration;
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

        <Button
          variant="secondary"
          className="mt-[14px] self-start w-auto px-6 bg-lovely font-bold text-white hover:bg-lovely/90 rounded-full h-auto py-2.5"
          onClick={handleViewDetails}
        >
          See {packageItem.name}
        </Button>
      </div>
    </div>
  );
}
