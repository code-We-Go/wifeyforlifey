import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { thirdFont } from "@/fonts";

const PackageDetailSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 animate-pulse">
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-lovely hover:text-lovely/80 hover:bg-transparent p-0"
          disabled
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Package Image Skeleton */}
        <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-lovely">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Package Details Skeleton */}
        <div>
          <Skeleton className={`${thirdFont.className} h-10 w-3/4 mb-2`} />
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-8 w-1/4 mb-6" />

          <Separator className="my-6" />

          {/* Package Items Skeleton */}
          <div className="mb-6">
            <Skeleton className={`${thirdFont.className} h-8 w-1/3 mb-4`} />
            <ul className="space-y-2">
              {[1, 2, 3, 4].map((item) => (
                <li key={item} className="flex items-start">
                  <Skeleton className="h-5 w-full" />
                </li>
              ))}
            </ul>
          </div>

          {/* Notes Skeleton */}
          <div className="mb-6">
            <Skeleton className={`${thirdFont.className} h-8 w-1/3 mb-4`} />
            <ul className="space-y-2">
              {[1, 2].map((note) => (
                <li key={note}>
                  <Skeleton className="h-4 w-full" />
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button Skeleton */}
          <Skeleton className="w-full h-14 mt-6 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default PackageDetailSkeleton;