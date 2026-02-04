"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { thirdFont } from "@/fonts";

interface Subcategory {
  _id: string;
  subCategoryName: string;
  description?: string;
  image?: string;
  categoryID?: string;
}

const CategoriesSection = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Embla carousel configuration
  // User requested "not autoplayed", so we only use the core hook
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    
    // Cleanup
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch subcategories that effectively should be on homepage
        const res = await fetch("/api/subcategories?homepage=true");
        const data = await res.json();
        
        if (res.ok) {
          const subData = Array.isArray(data) ? data : data.data || [];
          setSubcategories(subData);
        } else {
          setError(data.error || "Failed to fetch subcategories");
        }
      } catch (err) {
        console.error("Error fetching subcategories:", err);
        setError("Failed to fetch subcategories");
      } finally {
        setLoading(false);
      }
    };
    fetchSubCategories();
  }, []);

  return (
    <section className="py-16 bg-pinkey text-lovely">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10">
          <div>
            <h2
              className={`${thirdFont.className} tracking-normal text-4xl md:text-5xl lg:text-6xl font-semibold`}
            >
              Your Bridal needs
            </h2>
            <p className="mt-4 text-lovely/80 max-w-2xl">
              Everything you need for your perfect journey.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex -ml-4">
                {/* Skeleton Loading Cards */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 pl-4"
                  >
                    <div className="bg-creamey/30 backdrop-blur-sm border border-lovely/10 rounded-xl overflow-hidden min-h-[250px] animate-pulse">
                      {/* Image skeleton */}
                      <div className="h-48 w-full bg-lovely/10" />
                      {/* Content skeleton */}
                      <div className="p-6 space-y-3">
                        <div className="h-6 bg-lovely/10 rounded w-3/4" />
                        <div className="h-4 bg-lovely/10 rounded w-full" />
                        <div className="h-4 bg-lovely/10 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-white/10 rounded-xl">
            <p>{error}</p>
          </div>
        ) : subcategories.length === 0 ? (
          <div className="text-center p-12 bg-creamey/30 backdrop-blur-sm border border-lovely/10 rounded-xl">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lovely/10 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className={`${thirdFont.className} text-2xl font-semibold mb-2`}>
                Coming Soon
              </h3>
              <p className="text-lovely/70">
                We're curating the perfect bridal categories for you. Check back soon!
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Carousel Viewport */}
            <div className="" ref={emblaRef}>
              <div className="flex -ml-4">
                {subcategories.map((sub) => (
                  <div
                    key={sub._id}
                    className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 pl-4"
                  >
                    <Link className="relative" href={`/shop?subcategory=${sub._id}`}>
                              <Image
                                width={80}
                                height={50}
                                className="absolute -top-5 -rotate-45 -left-5 z-30"
                                alt="fyonka"
                                src={"/fyonkaCreamey.png"}
                                unoptimized
                              />
                      <div className="group h-full rounded-md bg-creamey/30 hover:bg-creamey/50 backdrop-blur-sm border border-lovely/10  transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col min-h-[250px] cursor-pointer">
                        {/* Image Section */}
                        
                        {sub.image ? (
                           <div className="relative rounded-t-md  aspect-square w-full overflow-hidden">
                             <Image 
                               src={sub.image} 
                               alt={sub.subCategoryName} 
                               fill
                               className="object-cover transition-transform duration-500 group-hover:scale-105"
                             />
                           </div>
                        ) : (
                           <div className="h-48 w-full bg-lovely/5 flex items-center justify-center">
                              <span className="text-lovely/20 text-4xl font-display">Wifey</span>
                           </div>
                        )}

                        <div className="p-2 md:p-6 flex flex-col flex-grow justify-between">
                          <div>
                            <h3 className={`${thirdFont.className} text-xl md:text-2xl font-bold `}>
                              {sub.subCategoryName}
                            </h3>
                            {/* {sub.description && (
                              <p className="text-sm line-clamp-2 opacity-90">
                                {sub.description}
                              </p>
                            )} */}
                          </div>
                          
                          {/* <div className="mt-4 flex justify-end">
                             <div className="w-8 h-8 rounded-full bg-lovely/10 flex items-center justify-center group-hover:bg-lovely group-hover:text-pinkey transition-colors">
                                <ChevronRight className="w-4 h-4" />
                             </div>
                          </div> */}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {subcategories.length > 0 && (
              <>
                 <button
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8 bg-creamey text-lovely rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-0 disabled:cursor-not-allowed z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8 bg-creamey text-lovely rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-0 disabled:cursor-not-allowed z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Pagination Dots */}
            {scrollSnaps.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {scrollSnaps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === selectedIndex
                          ? "w-8 bg-lovely"
                          : "w-2 bg-lovely/30 hover:bg-lovely/50"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
            )}
            
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
