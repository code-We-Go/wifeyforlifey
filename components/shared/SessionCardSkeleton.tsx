export default function SessionCardSkeleton() {
  return (
    <div className="flex flex-col gap-1 md:gap-2 w-full max-w-lg h-full bg-creamey border-2 border-lovely/20 rounded-xl p-2 shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-full aspect-square max-w-sm overflow-hidden rounded-lg flex-shrink-0">
        <div className="w-full h-full bg-lovely/10" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col justify-between flex-grow w-full text-left space-y-1 md:space-y-2">
        <div className="space-y-2">
          {/* Partner Name Skeleton */}
          <div className="h-6 md:h-7 bg-lovely/10 rounded w-3/4" />
          
          {/* Title Skeleton */}
          <div className="h-5 md:h-6 bg-lovely/10 rounded w-full" />
        </div>
        
        {/* More Details Link Skeleton */}
        <div className="h-4 bg-lovely/10 rounded w-24" />
        
        {/* Button Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="flex-1 h-8 bg-lovely/20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
