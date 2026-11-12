"use client";

import React from "react";

export default function FavoriteCardSkeleton() {
  return (
    <div className="relative bg-lovely p-2 pt-4 border-lovely border-2">
      <div className="absolute -top-5 -left-5 w-20 h-12 bg-gray-200 animate-pulse rounded-full"></div>
      <div className="relative aspect-square bg-gray-200 animate-pulse"></div>

      <div className="p-4 bg-creamey">
        <div className="flex justify-between items-start mb-2">
          <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
        </div>

        <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
        </div>

        <div className="flex justify-between items-center">
          <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-9 w-20 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  );
}