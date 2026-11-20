import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { thirdFont } from "@/fonts";

const CheckoutSkeleton: React.FC = () => {
  return (
    <div className="container-custom py-8 md:py-12 min-h-screen bg-creamey">
      <Skeleton className="h-12 w-48 mb-8" />

      <div className="w-full flex flex-col-reverse min-h-screen md:flex-row">
        {/* Form Skeleton */}
        <div className="flex flex-col px-1 md:px-2 bg-backgroundColor items-start w-full md:w-5/7 gap-6">
          <div className="flex flex-col items-start w-full gap-2 py-1 pr-1 md:pr-2">
            {/* Contact Section */}
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="flex items-center gap-2 w-full mb-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Delivery Section */}
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="flex gap-2 items-center text-lg w-full mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Name Fields */}
            <div className="flex justify-start flex-col md:flex-row w-full gap-2 items-start md:items-center mb-4">
              <div className="flex flex-col gap-2 w-full md:w-2/4">
                <div className="flex gap-2 w-full items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-2/4">
                <div className="flex gap-2 w-full items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            {/* Lovely Bride's address Fields */}
            <div className="flex gap-2 w-full items-center mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex w-full gap-2 items-center mb-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* City and Postal Code */}
            <div className="flex flex-col sm:flex-row w-full gap-2 mb-4">
              <div className="flex flex-col w-full gap-2 flex-nowrap sm:w-3/5">
                <div className="flex w-full gap-2 items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="flex flex-col w-full md:w-2/5 gap-2">
                <div className="flex gap-2 w-full items-center">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            {/* State and Phone */}
            <div className="flex w-full gap-2 items-center mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex w-full gap-2 items-center mb-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Payment Section */}
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex gap-6">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-6">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end w-full">
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </div>

        {/* Order Summary Skeleton */}
        <div className="hidden md:block lg:col-span-3 relative w-full md:w-2/7 py-1">
          <div className="border-l-2 sticky top-4 w-full border-lovely pl-6 shadow-sm h-fit">
            <Skeleton className="h-8 w-32 mb-6" />

            {/* Cart Items */}
            <div className="flex flex-col gap-4 mb-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSkeleton;
