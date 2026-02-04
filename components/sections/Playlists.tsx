"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { VideoPlaylist } from "@/app/interfaces/interfaces";
import useEmblaCarousel from "embla-carousel-react";

import VideoCard from "@/components/playlists/VideoCard";
import VideoCardSkeleton from "@/components/skeletons/VideoCardSkeleton";
import { thirdFont } from "@/fonts";
import { headerStyle } from "@/app/styles/style";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Playlists = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>();
  const [featuredPlaylists, setFeaturedPlaylists] = useState<VideoPlaylist[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchFeaturedPlaylists = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/playlists?featured=true&all=true");
        const data = await res.json();
        if (res.ok) {
          setFeaturedPlaylists(data.data || []);
        } else {
          setError(data.error || "Failed to fetch featured playlists");
        }
      } catch (err) {
        setError("Failed to fetch featured playlists");
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedPlaylists();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`py-16 bg-lovely text-creamey transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center mb-3 md:mb-6">
          <div>
            <h2
              className={`max-md:pb-3 ${thirdFont.className} ${headerStyle}`}
            >
              Your Bridal-Era Video Guides
            </h2>
            <p className="max-md:text-sm max-md:pb-2">
              These videos are designed to support your Gehaz Bestie Planner when it's time to make real-life choices.
            </p>
            <p className="pb-2 max-md:text-sm md:pb-4">Helps you understand your options and avoid confusion or pressure, Protects you from fake reviews and biased sales advice, Guides you to choose what's right for you — confidently.</p>
            {/* <p>Protects you from fake reviews and biased sales advice</p> */}
            {/* <p>Guides you to choose what's right for you — confidently</p> */}
            <p className="font-semibold max-md:text-sm">
              Includes trusted experts videos in selected playlists to support you along the way [OB-GYNs, sex therapists, interior designers, appliance experts, and more]
            </p>
          </div>
          {/* <Button
            asChild
            variant="outline"
            className="mt-4 hover:bg-everGreen bg-creamey hover:text-creamey border-0  text-lovely md:mt-0"
          >
            <Link href="/playlists">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button> */}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : featuredPlaylists.length === 0 ? (
          <div className="text-center py-8">
            No featured playlists found.
          </div>
        ) : (
          <div className="relative">
            {/* Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {featuredPlaylists.map((playlist) => (
                  <div
                    key={playlist._id}
                    className="flex-none w-[60vw] sm:w-[45vw] md:w-[33vw] lg:w-[25vw] pl-2 pr-2"
                  >
                    <VideoCard playlist={playlist} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {featuredPlaylists.length > 3 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-creamey hover:bg-creamey/90 text-lovely rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-creamey hover:bg-creamey/90 text-lovely rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Page Indicators */}
            {featuredPlaylists.length > 3 && (
              <div className="flex justify-center gap-2 mt-8">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? "bg-creamey w-8"
                        : "bg-creamey/40 hover:bg-creamey/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
          
        )}

        {/* Subscription CTA */}
        <div className="mt-12 text-center flex flex-col items-center md:flex-row md:items-center gap-2 md:gap-4 justify-start">
          <p className="text-creamey/90 text-sm text-start md:text-base max-w-md mb-6">
            Access included with your subscription<br />
            Watch all playlists anytime as part of your Wifey Experience 💗
          </p>
          <Button
            asChild
            size="lg"
            className="bg-creamey text-lovely hover:bg-creamey/90  text-sm md:text-base md:px-8 py-4 md:py-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/packages/687396821b4da119eb1c13fe" className="text-center leading-tight">
              Subscribe to unlock <br /> premium videos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Playlists;
