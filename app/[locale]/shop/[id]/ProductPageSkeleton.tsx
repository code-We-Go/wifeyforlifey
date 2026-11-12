import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ProductPageSkeleton() {
  return (
    <div className="container-custom py-8 md:py-12 animate-pulse">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-10 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </div>

      {/* Back to shop button - mobile only */}
      <div className="md:hidden mb-4">
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <Skeleton className="relative aspect-square w-full rounded-lg bg-muted" />
          <div className="flex space-x-2 overflow-auto pb-1">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-md" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-2/3 mb-2 rounded" />
          </div>
          <Skeleton className="h-8 w-24 mb-2 rounded" />
          <Skeleton className="h-5 w-full mb-4 rounded" />

          {/* Variants Selection */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2 rounded" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2 rounded" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          <div>
            <Skeleton className="h-4 w-24 mb-2 rounded" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-12 rounded" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-20 ml-2 rounded" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>

          <Skeleton className="h-px w-full my-4" />

          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <div className="flex space-x-4 border-b pb-2 mb-4">
          <Skeleton className="h-8 w-32 rounded" />
          <Skeleton className="h-8 w-32 rounded" />
        </div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded" />
          ))}
        </div>
      </div>
    </div>
  );
} 