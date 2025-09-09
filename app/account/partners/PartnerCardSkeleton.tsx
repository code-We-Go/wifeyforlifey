import React from 'react'

const PartnerCardSkeleton = () => {
  return (
    <div className="relative product-card bg-lovely/80 p-2 pt-4 border-lovely/50 border-2">
      {/* Fyonka badge skeleton */}
      <div className="absolute -top-5 -rotate-45 -left-5 z-20 w-[80px] h-[50px] bg-creamey/20 animate-pulse" />
      
      {/* Image skeleton */}
      <div className="relative aspect-square overflow-hidden bg-creamey/20 animate-pulse" />
      
      {/* Title skeleton */}
      <div className="mt-2 h-6 bg-creamey/20 animate-pulse rounded" />
      
      {/* Category and discount skeleton */}
      <div className="mt-2 space-y-2">
        <div className="w-32 h-4 bg-creamey/20 animate-pulse rounded" />
        <div className="w-40 h-5 bg-creamey/20 animate-pulse rounded" />
        <div className="w-24 h-6 bg-creamey/20 animate-pulse rounded-full" />
      </div>
    </div>
  )
}

export default PartnerCardSkeleton