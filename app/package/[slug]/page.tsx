"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ipackage } from "@/app/interfaces/interfaces";
import { thirdFont } from "@/fonts";
import axios from "axios";
import PackageDetailSkeleton from "./PackageDetailSkeleton";

interface SupportCard {
  id: number;
  title: string;
  description: string[];
  imagePath: string;
}

const supportCards: SupportCard[] = [
  {
    id: 1,
    title: "Discounts & Partnerships",
    description: [
      "A trusted partner list that grows over time",
      "Community-only discounts on things you actually need",
      "Your membership keeps increasing in value — Wifey-approved = always 💕"
    ],
    imagePath: "/360/50.png"
  },
  {
    id: 2,
    title: "Wifeys favorite products",
    description: [
      "Curated, Wifey-approved products we genuinely recommend",
      "Real reviews — you don't waste time searching",
      "Clear guidance on what's worth buying — and what's not",
      "Includes the maximum fair market price, so you don't overpay"
    ],
    imagePath: "/360/52.png"
  },
  {
    id: 3,
    title: "Inspos",
    description: [
      "Pinterest, But Make It Bridal 💕",
      "Curated bridal inspiration — without the overwhelm",
      "Makeup looks, hairstyles, bridal nails & home moodboards",
      "Saved, organized, and filtered by the Wifey team",
      "Inspiration that feels realistic, beautiful, and achievable",
      "So you can get inspired — not stressed or pressured."
    ],
    imagePath: "/360/51.png"
  },
  {
    id: 4,
    title: "Whatsapp Support circle",
    description: [
      "You're not meant to do this alone.",
      "A private Whatsapp group for Wifey brides only",
      "Ask questions, share worries, and support each other",
      // "Live group chat with trusted experts and each other",
      "Guided by the Wifey for Life team — not just about gehaz, but life, emotions, and everything in between"
    ],
    imagePath: "/360/48.png"
  },
  {
    id: 5,
    title: "Bridal-Era Video Guides",
    description: [
      "Designed to support your Gehaz Bestie Planner when it's time to choose",
      "Helps you understand options and avoid confusion or pressure",
      "Protects you from fake reviews and biased sales advice",
      "Includes trusted expert videos in selected playlists ",
      "(OB-GYN, sex therapists, interior designers, appliance experts & more)",
      // "Organized support in 1 place"
    ],
    imagePath: "/360/49.png"
  },
  {
    id: 6,
    title: "Expert-Led Webinars",
    description: [
      "Live group webinars hosted with trusted experts",
      "ask questions, learn, and feel reassured",
      "Guided by the Wifey for Life team",
      "Examples of webinars hosted!",
      "Appliances 101 with Zeinab Ahmed",
      "Feminine Care 101 with Dr. Dalia Ghozlan",
      "Sex Education 101 with Quareb Therapy"
    ],
    imagePath: "/360/53.png"
  },
  {
    id: 7,
    title: "Discounts on 1:1 Consultations",
    description: [
      "Personal Support — At a Better Price 💕",
      "10%-20% off 1:1 consultations",
      "Interior designers",
      "Women's health educators",
      "Sex therapists",
      "Appliance experts",
      "Wedding & bridal consultants"
    ],
    imagePath: "/360/47.png"
  }
];

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [packageData, setPackageData] = useState<Ipackage | null>(null);
  const [allPackages, setAllPackages] = useState<Ipackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Embla Carousel for Package Cards
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });
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
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchPackageData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/packages?slug=${params.slug}&all=true`
        );
        // The API returns { data: [], ... } for search/list queries
        const packages = response.data.data;
        
        if (Array.isArray(packages) && packages.length > 0) {
          setAllPackages(packages);
          // Default to the first package
          setPackageData(packages[0]);
        } else {
             setPackageData(null);
        }
      } catch (error) {
        console.error("Error fetching package:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchPackageData();
    }
  }, [params.slug]);

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!packageData) {
    return (
      <div className="container mx-auto py-12 px-4 ">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-lovely">Package not found</h2>
          <p className="mt-4 text-lovely/90">
            The package you are looking for does not exist or has been removed.
          </p>
          <Button
            onClick={() => router.push("/shop")}
            className="mt-6 bg-lovely text-creamey hover:bg-lovely/90"
          >
            Return to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    // <div className="py-8 pb-44 md:pb-24 px-4">
    <div className="py-8   px-4">
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-lovely hover:text-lovely/80 hover:bg-transparent p-0"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Package Image Carousel */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-lovely">
            <Image
              src={
                packageData.images && packageData.images.length > 0
                  ? packageData.images[currentImageIndex]
                  : packageData.imgUrl
              }
              alt={packageData.name}
              fill
              className="object-contain"
            />

            {/* Navigation arrows */}
            {packageData.images && packageData.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? packageData.images.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-creamey/80 rounded-full p-1 text-lovely hover:bg-creamey transition-colors z-10"
                >
                  <ChevronLeftIcon size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex((prev) =>
                      prev === packageData.images.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-creamey/80 rounded-full p-1 text-lovely hover:bg-creamey transition-colors z-10"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail navigation */}
          {packageData.images && packageData.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {packageData.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 ${
                    currentImageIndex === index
                      ? "border-lovely"
                      : "border-lovely/30 hover:border-lovely/60"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${packageData.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Package Details */}
        <div>
                    <h1
            className={`${thirdFont.className} text-3xl xl:text-4xl tracking-wide font-bold text-lovely mb-2`}
          >
                              {packageData.partOf?packageData.partOf:packageData.name}

          </h1>
           {/* Variants Badges */}
           {allPackages.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {allPackages.map((pkg) => (
                <div
                  key={pkg._id}
                  onClick={() => {
                    setPackageData(pkg);
                    setCurrentImageIndex(0);
                  }}
                  className={`cursor-pointer px-4 py-1 rounded-full border transition-all ${
                    packageData?._id === pkg._id
                      ? "bg-lovely text-creamey border-lovely"
                      : "bg-transparent text-lovely border-lovely hover:bg-lovely/10"
                  }`}
                >
                  {pkg.name}
                </div>
              ))}
            </div>
          )}

          {/* <p className="text-lg font-medium text-lovely mb-4">
            Duration: {packageData.duration}
          </p> */}
          <p className="text-2xl font-bold text-lovely mb-6">
            LE {packageData.price.toFixed(2)}
          </p>

          <Separator className="my-6" />

        {/* <h2
          className={`${thirdFont.className} text-2xl font-bold text-lovely text-center mb-4`}
        >
          Package Features
        </h2> */}
        
        {/* Carousel Container */}
                <div className="relative lg:pb-44">
                  {/* Navigation Arrows */}
                  {supportCards.length > 2 && (
                    <>
                      <button
                        onClick={scrollPrev}
                        disabled={!canScrollPrev}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-lovely text-white p-2 md:p-3 rounded-full shadow-lg transition-all ${
                          !canScrollPrev ? 'opacity-30 cursor-not-allowed' : 'hover:bg-lovely/90 cursor-pointer'
                        }`}
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                      <button
                        onClick={scrollNext}
                        disabled={!canScrollNext}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-lovely text-white p-2 md:p-3 rounded-full shadow-lg transition-all ${
                          !canScrollNext ? 'opacity-30 cursor-not-allowed' : 'hover:bg-lovely/90 cursor-pointer'
                        }`}
                        aria-label="Next slide"
                      >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </>
                  )}
        
                  {/* Embla Carousel */}
                  <div className="overflow-x-clip overflow-y-visible" ref={emblaRef}>
                    <div className="flex gap-2 md:gap-4">
                      {supportCards.map((card) => (
                        <div key={card.id} className="relative flex-[0_0_80%] sm:flex-[0_0_50%]  min-w-0 pb-6 md:pb-12">
                          <div className="bg-lovely rounded-sm  shadow-xl h-[350px]  ">
                            {/* Card Header */}
                            <div className="p-2 md:p-4 pb-32 md:pb-40 h-full ">
                              <h3 className="text-base lg:text-lg font-bold text-creamey mb-2 md:mb-3">
                                {card.title}
                              </h3>
                              <ul className="list-disc list-outside pl-4  text-creamey marker:text-creamey">
                                {card.description.map((point, index) => (
                                  <li key={index} className="text-xs md:text-sm text-creamey/95 leading-normal">
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>
        
                            {/* Mobile Screen Mockup - Absolutely positioned at bottom */}
        
                            <div className="absolute -bottom-14  xs:-bottom-32 sm:-bottom-20  lg:-bottom-40 xl:-bottom-36 left-1/2 z-20 -translate-x-1/2 w-[420px] xs:w-[550px]  h-[450px] xs:h-[550px] ">
                              <Image
                                src={card.imagePath}
                                alt={card.title}
                                fill
                                className="object-contain object-bottom"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


          {/* Package Items */}
         {/* <div className="mb-6">
            <h2
              className={`${thirdFont.className} text-xl font-semibold text-lovely mb-4`}
            >
              What&apos;s Included
            </h2>
            <ul className="space-y-2">
              {packageData.items.map(
                (item, index) =>
                  item.included && (
                    <li key={index} className="flex items-start">
                      <span className="text-lovely">• {item.value}</span>
                    </li>
                  )
              )}
            </ul>
          </div> */}
          

          {/* Notes */}
          {packageData.notes && packageData.notes.length > 0 && (
            <div className="mb-6">
              <h2
                className={`${thirdFont.className} text-xl font-semibold text-lovely mb-4`}
              >
                Notes
              </h2>
              <ul className="space-y-2">
                {packageData.notes.map((note, index) => (
                  <li key={index} className="text-lovely/90 text-sm">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Button */}
          <Button
            className="w-full mt-6 bg-lovely text-creamey hover:bg-lovely/90 rounded-full py-6"
            onClick={() => router.push(`/subscription/${packageData._id}`)}
          >
            Subscribe to {packageData.name}
          </Button>
        </div>
      </div>

      {/* Package Cards Section */}
      {false && (
      <div className="mt-16 container-custom">
        <h2
          className={`${thirdFont.className} text-2xl font-bold text-lovely text-center mb-8`}
        >
          Package Features
        </h2>
        
        {/* Carousel Container */}
      </div>
      )}
    </div>
  );
}
