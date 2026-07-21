"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  Minus,
  Plus,
  Check,
  Lock,
  Sparkles,
  HelpCircle,
  ShoppingBag,
  Zap,
  RotateCcw,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ipackage } from "@/app/interfaces/interfaces";
import { thirdFont } from "@/fonts";
import axios from "axios";
import PackageDetailSkeleton from "@/app/package/[slug]/PackageDetailSkeleton";
import WifeyCommunity from "@/components/sections/WifeyCommunity";
import { useCart } from "@/providers/CartProvider";

// Quiz Data
interface QuizOption {
  text: string;
  value: string;
}

interface QuizQuestion {
  id: string;
  q: string;
  o: QuizOption[];
  k: "stage" | "support" | "persona" | "groom";
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    q: "Where are you in your bridal era right now?",
    k: "stage",
    o: [
      { text: "Deep in gehaz mode — buying for our home", value: "gehaz" },
      { text: "Planning the wedding day itself", value: "wedding" },
      { text: "Both at the same time (send help 😅)", value: "both" },
    ],
  },
  {
    id: "q2",
    q: "How do you want to go through it?",
    k: "support",
    o: [
      { text: "Just give me the book — I've got this", value: "mini" },
      { text: "I want backup: videos, community & experts on call", value: "full" },
    ],
  },
  {
    id: "q3",
    q: "Be honest — which bride are you?",
    k: "persona",
    o: [
      { text: "The Sentimental Romantic — crying at dress videos 🥹", value: "romantic" },
      { text: "The Efficient Planner — color-coded everything 📋", value: "planner" },
      { text: "The Balanced Dreamer — organized but make it fun ✨", value: "dreamer" },
    ],
  },
  {
    id: "q4",
    q: "And your groom…?",
    k: "groom",
    o: [
      { text: "Give him a checklist and he's unstoppable", value: "follows" },
      { text: "He'll need me to assign every task 😌", value: "assign" },
      { text: "No groom tasks needed — gehaz only for now", value: "na" },
    ],
  },
];

function PackageProductCard({
  prod,
  addItem,
  openCart,
}: {
  prod: any;
  addItem: any;
  openCart: any;
}) {
  const [prodQuantity, setProdQuantity] = useState(1);

  const prodImage =
    prod.variations?.[0]?.images?.[0]?.url ||
    prod.images?.[0]?.url ||
    prod.imgUrl ||
    "/placeholder.png";
  const prodPrice =
    prod.variations?.[0]?.attributes?.[0]?.price ??
    prod.variations?.[0]?.price ??
    prod.price?.local ??
    0;

  const handleAddProduct = () => {
    const variant = prod.variations?.[0] || {
      name: "Default",
      attributeName: "Standard",
      attributes: [],
      images: [{ url: prodImage, type: "image" }],
    };
    const attr = prod.variations?.[0]?.attributes?.[0] || {
      name: "Standard",
      stock: 10,
      price: prodPrice,
    };

    addItem({
      productId: prod._id,
      productName: prod.title,
      price: prodPrice,
      attributes: attr,
      variant: variant,
      imageUrl: prodImage,
      quantity: prodQuantity,
    });
    openCart();
  };

  return (
    <div
      key={prod._id}
      className="bg-lovely text-white p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between shadow-md transition-all hover:scale-[1.02] group/card"
    >
      <Link href={`/shop/${prod._id}`} className="block group/link">
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white mb-3 shadow-inner">
          <Image
            src={prodImage}
            alt={prod.title || "Product"}
            fill
            className="object-cover transition-transform duration-300 group-hover/link:scale-105"
          />
        </div>
        <h4 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 min-h-[36px] text-white group-hover/link:underline">
          {prod.title}
        </h4>
        <p className={`${thirdFont.className} text-base sm:text-lg font-bold text-white mt-1`}>
          LE {prodPrice.toLocaleString()}
        </p>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-2 mt-3">
        <div className="flex items-center bg-white/20 text-white rounded-full p-0.5 border border-white/30 shrink-0">
          <button
            type="button"
            onClick={() => setProdQuantity((q) => Math.max(1, q - 1))}
            disabled={prodQuantity <= 1}
            className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full hover:bg-white/30 transition-colors disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
          <span className="w-4 sm:w-5 text-center font-bold text-xs">{prodQuantity}</span>
          <button
            type="button"
            onClick={() => setProdQuantity((q) => q + 1)}
            className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full hover:bg-white/30 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          className="flex-1 bg-white text-lovely font-bold text-xs sm:text-sm py-1.5 sm:py-2 rounded-full hover:bg-creamey transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
          id={`add-prod-${prod._id}`}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function PackageeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addSubscription, addItem, openCart } = useCart();

  const [packageData, setPackageData] = useState<Ipackage | null>(null);
  const [allPackages, setAllPackages] = useState<Ipackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(-1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const formatDuration = (duration: any) => {
    const months = Number(duration);
    if (isNaN(months) || months <= 0) return null;
    if (months < 12) return `${months} Months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    let result = `${years} ${years === 1 ? "Year" : "Years"}`;
    if (remainingMonths > 0) {
      result += ` and ${remainingMonths} ${remainingMonths === 1 ? "Month" : "Months"
        }`;
    }
    return result;
  };

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
        const targetSlug = params?.slug || "GehazBestiePlanner";
        const response = await axios.get(
          `/api/packages?slug=${targetSlug}&all=true`
        );
        const packages = response.data.data;

        if (Array.isArray(packages) && packages.length > 0) {
          setAllPackages(packages);
          const highestPricePackage = packages.reduce((max, pkg) =>
            pkg.price > max.price ? pkg : max, packages[0]
          );
          setPackageData(highestPricePackage);

          if (highestPricePackage.variants && highestPricePackage.variants.length > 0) {
            setSelectedVariantIndex(highestPricePackage.variants.length - 1);
          }
        } else {
          setPackageData(null);
        }
      } catch (error) {
        console.error("Error fetching package:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [params?.slug]);

  const handleAddToCart = () => {
    if (!packageData) return;
    let price = packageData.price;
    let duration = packageData.duration;
    let saving = packageData.saving;

    if (packageData.variants && packageData.variants.length > 0) {
      if (selectedVariantIndex === -1) {
        showToast("Please select a plan variant before adding to cart.");
        return;
      }
      const selected = packageData.variants[selectedVariantIndex];
      price = selected.price;
      duration = selected.duration;
      saving = selected.saving;
    }

    addSubscription({
      packageId: packageData._id || "",
      packageName: packageData.name,
      categoryName: packageData.partOf || packageData.name,
      tier:
        packageData.name.toLowerCase().includes("mini") ||
          (packageData.slug && packageData.slug.toLowerCase().includes("mini"))
          ? "mini"
          : "full",
      price,
      duration,
      saving,
      imageUrl: packageData.imgUrl,
      quantity,
    });

    openCart();
  };

  const handleSubscribeNow = () => {
    if (!packageData) return;
    let price = packageData.price;
    let duration = packageData.duration;
    let saving = packageData.saving;

    if (packageData.variants && packageData.variants.length > 0) {
      if (selectedVariantIndex === -1) {
        showToast("Please select a plan variant before subscribing.");
        return;
      }
      const selected = packageData.variants[selectedVariantIndex];
      price = selected.price;
      duration = selected.duration;
      saving = selected.saving;
    }

    addSubscription({
      packageId: packageData._id || "",
      packageName: packageData.name,
      categoryName: packageData.partOf || packageData.name,
      tier:
        packageData.name.toLowerCase().includes("mini") ||
          (packageData.slug && packageData.slug.toLowerCase().includes("mini"))
          ? "mini"
          : "full",
      price,
      duration,
      saving,
      imageUrl: packageData.imgUrl,
      quantity,
    });

    router.push("/subscription/checkout");
  };

  // Quiz Handling
  const handleQuizAnswer = (option: QuizOption) => {
    const key = QUIZ_QUESTIONS[quizIndex].k;
    const newAnswers = { ...quizAnswers, [key]: option.value };
    setQuizAnswers(newAnswers);

    if (quizIndex + 1 < QUIZ_QUESTIONS.length) {
      setQuizIndex(quizIndex + 1);
    } else {
      setShowQuizResult(true);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizIndex(0);
    setShowQuizResult(false);
  };

  const getQuizResultData = () => {
    const personas: Record<string, string> = {
      romantic: "The Sentimental Romantic 🥹",
      planner: "The Efficient Planner 📋",
      dreamer: "The Balanced Dreamer ✨",
    };
    const personaText = personas[quizAnswers.persona] || "The Modern Bride 💖";

    if (quizAnswers.stage === "both") {
      return {
        persona: personaText,
        title: "The Whole Bridal Era Bundle",
        why: "You're living gehaz and wedding planning at the same time — so you get both planners (3 books!) plus one full year of the complete Wifey Experience, in one box.",
        price: "LE 3,900 (save LE 1,300)",
        btnTxt: "Explore Full Bundle",
      };
    } else if (quizAnswers.stage === "gehaz") {
      if (quizAnswers.support === "full") {
        return {
          persona: personaText,
          title: "Gehaz Bestie — Full Experience",
          why: "You're building your home and you want backup every step: 12 video playlists, the WhatsApp circle, partner discounts and expert access for a whole year.",
          price: "LE 2,500",
          btnTxt: "Explore Gehaz Bestie",
        };
      }
      return {
        persona: personaText,
        title: "Gehaz Bestie — Mini Experience",
        why: "You've got this — you just need the book. 11 chapters, Essentials vs Nice-to-Haves, and quantity guides so you never overspend.",
        price: "LE 1,500",
        btnTxt: "Explore Gehaz Mini",
      };
    } else {
      if (quizAnswers.support === "full") {
        return {
          persona: personaText,
          title: "Wedding Bestie — Full Experience",
          why: "Your big day, fully backed up: both checklists (yours + his), 10 playlists, the community, expert discounts and curated inspos for every decision.",
          price: "LE 2,700",
          btnTxt: "Explore Wedding Bestie",
        };
      }
      return {
        persona: personaText,
        title: "Wedding Bestie — Mini Experience",
        why: "Two checklists — one for you, one for your groom — with countdown tasks from 2 months out to the night before.",
        price: "LE 1,700",
        btnTxt: "Explore Wedding Mini",
      };
    }
  };

  if (loading) {
    return <PackageDetailSkeleton />;
  }

  if (!packageData) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-lovely">Package not found</h2>
        <p className="mt-4 text-lovely/90">
          The package you are looking for does not exist or has been removed.
        </p>
        <Button
          onClick={() => router.push("/shop")}
          className="mt-6 bg-lovely text-creamey hover:bg-lovely/90 rounded-full px-8 py-3"
        >
          Return to Shop
        </Button>
      </div>
    );
  }

  const selectedVariant =
    packageData.variants && selectedVariantIndex >= 0
      ? packageData.variants[selectedVariantIndex]
      : null;

  const activePrice = selectedVariant
    ? selectedVariant.price
    : packageData.price;
  const activeSaving = selectedVariant
    ? selectedVariant.saving
    : packageData.saving;

  // Resolve the full-tier package (highest price) for comparisonFeatures & hero/callout
  const fullPackage =
    allPackages.length > 0
      ? allPackages.reduce((max, pkg) => (pkg.price > max.price ? pkg : max), allPackages[0])
      : packageData;

  return (
    <div className="bg-creamey text-foreground min-h-screen pb-24 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-lovely text-white px-5 py-1.5 md:py-3 rounded-xl shadow-2xl border border-white/20 animate-bounce">
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      <div className="md:max-w-[800px] lg:max-w-[950px] 2xl:max-w-[1200px] mx-auto px-4 pt-6">
        {/* Back button */}
        <div className="md:mb-6">
          <Button
            variant="ghost"
            className="text-lovely hover:text-lovely/90 hover:bg-transparent p-0 flex items-center font-medium"
            onClick={() => router.push('/shop?tab=subscriptions')}
            id="back-btn"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            Back to Packages
          </Button>
        </div>

        {/* Hero Banner Header */}
        {/* <div className="mb-2 md:mb-8">
          <h1
            className={`${thirdFont.className} text-3xl sm:text-4xl md:text-5xl font-extrabold text-lovely uppercase tracking-tight leading-tight`}
          >
            {fullPackage?.heroTitle || "Everything for your bridal era — in one place"}
          </h1>
          <p className="mt-1 md:mt-3 text-base sm:text-lg text-lovely/90 max-w-2xl font-normal leading-relaxed">
            {fullPackage?.heroSubtitle || "Planners, tools & real support built for Egyptian brides. Wherever you are in your journey, there's a bestie for it. 🎀"}
          </p>
        </div> */}

        {/* Main Package Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-10 bg-pinkey/60 p-6 sm:p-8 rounded-3xl border-2 border-lovely/30 shadow-xl mb-6 md:mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border-3 border-lovely shadow-md bg-creamey">
              <Image
                src={
                  packageData.images && packageData.images.length > 0
                    ? packageData.images[currentImageIndex]
                    : packageData.imgUrl
                }
                alt={packageData.name}
                fill
                className="object-contain p-2"
                priority
              />

              {packageData.images && packageData.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? packageData.images.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-creamey/90 hover:bg-creamey rounded-full p-2 text-lovely shadow-md transition-all z-10"
                    aria-label="Previous image"
                    id="prev-img-btn"
                  >
                    <ChevronLeftIcon size={22} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex((prev) =>
                        prev === packageData.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-creamey/90 hover:bg-creamey rounded-full p-2 text-lovely shadow-md transition-all z-10"
                    aria-label="Next image"
                    id="next-img-btn"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {packageData.images && packageData.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {packageData.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${currentImageIndex === index
                      ? "border-lovely ring-2 ring-lovely/30 scale-105"
                      : "border-lovely/20 opacity-70 hover:opacity-100"
                      }`}
                    id={`thumb-btn-${index}`}
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

          {/* Package Details & Segmented Controls */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="inline-block font-semibold text-xs uppercase tracking-widest bg-lovely/10 text-lovely px-3 py-1 rounded-full mb-3">
                {packageData.badgeLabel}
              </span>
              <h2
                className={`${thirdFont.className} text-3xl sm:text-4xl font-extrabold text-lovely tracking-wide mb-3`}
              >
                {packageData.partOf ? packageData.partOf : packageData.name}
              </h2>

              {/* All Packages Segmented Switcher (HTML Mockup Design) */}
              {allPackages.length > 1 && (
                <div className="relative flex bg-pinkey/40 border-2 border-lovely rounded-full p-1.5 mb-6 shadow-inner">
                  {allPackages.map((pkg) => {
                    const isSelected = packageData?._id === pkg._id;
                    const isFull =
                      pkg._id === fullPackage?._id ||
                      (!pkg.name.toLowerCase().includes("mini") &&
                        !pkg.slug?.toLowerCase().includes("mini"));

                    return (
                      <button
                        key={pkg._id}
                        onClick={() => {
                          setPackageData(pkg);
                          setCurrentImageIndex(0);
                          setQuantity(1);
                          if (pkg.variants && pkg.variants.length > 0) {
                            setSelectedVariantIndex(pkg.variants.length - 1);
                          } else {
                            setSelectedVariantIndex(-1);
                          }
                        }}
                        className={`relative flex-1 py-2.5 px-3 rounded-full text-center transition-all duration-200 cursor-pointer ${isSelected
                          ? "bg-lovely text-white shadow-md font-bold"
                          : "bg-transparent text-lovely hover:bg-lovely/10 font-semibold"
                          }`}
                        id={`pkg-badge-${pkg._id}`}
                      >
                        {isFull && (
                          <span className="absolute -top-3.5 right-4 bg-lovely text-white text-[9.5px] sm:text-[10.5px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-md z-10 border border-white/20">
                            Most popular
                          </span>
                        )}
                        <span className="block text-sm sm:text-base font-extrabold leading-tight">
                          {pkg.name}
                        </span>
                        <span
                          className={`block text-xs sm:text-sm mt-0.5 font-medium ${isSelected ? "text-white/90" : "text-lovely/80"
                            }`}
                        >
                          LE {pkg.price.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Dashed Helper Callout (Not Sure? Mini vs Full) */}
              {allPackages.length > 1 && (
                <div className="mb-6 p-3.5 sm:p-4 bg-white border-2 border-dashed border-pinkey rounded-2xl text-xs sm:text-sm text-lovely/90 leading-relaxed shadow-sm">
                  <strong className="text-lovely">Not sure?</strong> Just want the planner? Choose <strong className="text-lovely">Mini</strong>. Want the planner <em>plus</em> a year of discounts, videos, community &amp; expert support? Choose <strong className="text-lovely">Full</strong>.
                </div>
              )}

              {/* Variant Segmented Control */}
              {packageData.variants && packageData.variants.length > 0 ? (
                <div className="mb-6 bg-pinkey/40 border-2 border-lovely/30 p-4 rounded-2xl">
                  <h3 className={`${thirdFont.className} text-lg font-bold text-lovely mb-3`}>
                    Choose Experience Plan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {packageData.variants.map((variant, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedVariantIndex(index)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedVariantIndex === index
                          ? "border-lovely bg-creamey shadow-md ring-2 ring-lovely/20"
                          : "border-lovely/20 bg-white/50 hover:bg-white/80"
                          }`}
                        id={`variant-card-${index}`}
                      >
                        {formatDuration(variant.duration) && (
                          <p className="font-bold text-xs uppercase tracking-wider text-lovely">
                            {formatDuration(variant.duration)}
                          </p>
                        )}
                        <p className={`${thirdFont.className} text-2xl font-bold text-lovely mt-1`}>
                          LE {variant.price.toFixed(2)}
                        </p>
                        {variant.saving && (
                          <p className="text-xs text-lovely/80 font-medium mt-1">
                            {variant.saving}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-pinkey/40 border-2 border-lovely/30 rounded-2xl">
                  {formatDuration(packageData.duration) && (
                    <p className="text-sm font-semibold uppercase text-lovely mb-1">
                      Duration: {formatDuration(packageData.duration)}
                    </p>
                  )}
                  <p className={`${thirdFont.className} text-3xl font-extrabold text-lovely`}>
                    LE {activePrice.toFixed(2)}
                  </p>
                  {activeSaving && (
                    <p className="text-sm text-lovely/80 font-medium mt-1">
                      {activeSaving}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-lovely font-bold mt-2.5 flex items-center gap-1.5">
                    🎁 Comes with {Math.round(activePrice).toLocaleString()} Wifey Points — to spend them on our lovely items later.
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider text-lovely font-bold mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <Button
                    className="bg-pinkey text-lovely hover:bg-lovely hover:text-white h-10 w-10 p-0 rounded-xl border-2 border-lovely/20 transition-all"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                    disabled={quantity <= 1}
                    id="qty-minus-btn"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-bold text-lg text-lovely">
                    {quantity}
                  </span>
                  <Button
                    className="bg-pinkey text-lovely hover:bg-lovely hover:text-white h-10 w-10 p-0 rounded-xl border-2 border-lovely/20 transition-all"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    id="qty-plus-btn"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-lovely/20">
              <Button
                className="flex-1 bg-creamey text-lovely border-2 border-lovely hover:bg-lovely/10 rounded-full py-6 text-base font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                onClick={handleAddToCart}
                id="add-to-cart-btn"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </Button>
              <Button
                className="flex-1 bg-lovely text-creamey hover:bg-lovely/90 rounded-full py-6 text-base font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                onClick={handleSubscribeNow}
                id="subscribe-now-btn"
              >
                <Zap className="w-5 h-5 fill-current" /> Subscribe Now
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Comparison Section (Mockup Table Design) */}
        <div className="bg-pinkey/70 p-6 sm:p-8 rounded-3xl border-2 border-pinkey shadow-md mb-12">
          <h2 className={`${thirdFont.className} text-2xl sm:text-3xl font-extrabold text-lovely uppercase tracking-wide mb-4 text-center`}>
            Choose Your Experience Tier 🎀
          </h2>
          <p className="text-center text-sm text-lovely/80 mb-6 max-w-xl mx-auto">
            Compare the Full and Mini packages to decide which bestie fits your bridal era needs.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="text-left p-3 text-xs uppercase tracking-wider text-lovely/70 font-semibold">Features Included</th>
                  <th className="p-3 text-center bg-lovely text-white font-bold text-sm rounded-t-xl w-1/4 uppercase tracking-wider">Full</th>
                  <th className="p-3 text-center bg-white text-lovely border-2 border-pinkey font-bold text-sm rounded-t-xl w-1/4 uppercase tracking-wider">Mini</th>
                </tr>
              </thead>
              <tbody>
                {(fullPackage?.comparisonFeatures ?? []).map((feat, idx) => {
                  const isCheck = (val: string) => val === "✓" || val === "✔" || val.toLowerCase() === "true";
                  const isDash = (val: string) => val === "—" || val === "-" || val.toLowerCase() === "false";
                  return (
                    <tr key={idx}>
                      <td className="p-3 bg-pinkey/30 text-lovely/90 rounded-l-xl text-xs sm:text-sm font-medium">
                        {feat.feature}
                      </td>
                      <td className="p-3 text-center bg-pinkey/20 font-bold text-emerald-600">
                        {isCheck(feat.fullValue) ? (
                          <Check className="inline h-5 w-5" />
                        ) : isDash(feat.fullValue) ? (
                          <span className="text-gray-400 font-bold">—</span>
                        ) : (
                          <>
                            <Check className="inline h-5 w-5" />
                            <span className="block text-[10px] text-lovely font-semibold mt-0.5">{feat.fullValue}</span>
                          </>
                        )}
                      </td>
                      <td className="p-3 text-center bg-white border border-pinkey/50 rounded-r-xl font-bold">
                        {isCheck(feat.miniValue) ? (
                          <Check className="inline h-5 w-5 text-emerald-600" />
                        ) : isDash(feat.miniValue) ? (
                          <span className="text-gray-400 font-bold">—</span>
                        ) : (
                          <>
                            <Check className="inline h-5 w-5 text-emerald-600" />
                            <span className="block text-[10px] text-lovely font-semibold mt-0.5">{feat.miniValue}</span>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Redbox Callout (HTML Mockup Design) */}
          <div className="mt-6 bg-lovely text-white p-6 rounded-2xl shadow-md space-y-2">
            <h3 className={`${thirdFont.className} text-xl font-bold uppercase tracking-wide`}>
              {fullPackage?.calloutTitle || "Why most brides choose Full 💕"}
            </h3>
            <p className="text-sm leading-relaxed text-white/95">
              {fullPackage?.calloutDescription || (
                <>
                  For <strong>LE 1,000 more</strong>, you unlock 11 extra playlists plus a full year of community, expert access and partner discounts. One appliance discount alone can cover the difference.
                </>
              )}
            </p>
          </div>
          <div className="mt-4 p-4 border-2 text-lovely/90 border-dashed border-pinkey rounded-xl text-center text-xs sm:text-sm font-medium">
            <strong>The physical planner is yours forever.</strong> Digital benefits stay active for 12 months from purchase.
          </div>
        </div>

        {/* Make it a full order Section (Suggested Products from MongoDB) */}
        {((packageData.packageProducts && packageData.packageProducts.length > 0) ||
          (fullPackage?.packageProducts && fullPackage.packageProducts.length > 0)) && (
            <div className="bg-pinkey/60 p-6 sm:p-8 rounded-3xl border-2 border-lovely/30 shadow-md mb-12">
              <h2 className={`${thirdFont.className} text-2xl sm:text-3xl font-extrabold text-lovely uppercase tracking-wide mb-6 text-center`}>
                Make it a full order 🎀
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {(packageData.packageProducts?.length
                  ? packageData.packageProducts
                  : fullPackage?.packageProducts ?? []
                ).map((prod: any) => (
                  <PackageProductCard
                    key={prod._id}
                    prod={prod}
                    addItem={addItem}
                    openCart={openCart}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Support Cards Feature Carousel */}
        {/* {(packageData.supportCards ?? []).length > 0 && (
          <div className="mb-14">
            <h2
              className={`${thirdFont.className} text-2xl sm:text-3xl font-extrabold text-lovely text-center mb-6 uppercase tracking-wide`}
            >
              Included Experience Features 🌟
            </h2>

            <div className="relative">
              {(packageData.supportCards ?? []).length > 2 && (
                <>
                  <button
                    onClick={scrollPrev}
                    disabled={!canScrollPrev}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-6 z-10 bg-lovely text-white p-2 sm:p-3 rounded-full shadow-xl transition-all ${!canScrollPrev
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-lovely/90 cursor-pointer"
                      }`}
                    aria-label="Previous feature"
                    id="support-prev-btn"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={scrollNext}
                    disabled={!canScrollNext}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-6 z-10 bg-lovely text-white p-2 sm:p-3 rounded-full shadow-xl transition-all ${!canScrollNext
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-lovely/90 cursor-pointer"
                      }`}
                    aria-label="Next feature"
                    id="support-next-btn"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="overflow-hidden p-2" ref={emblaRef}>
                <div className="flex gap-4">
                  {(packageData.supportCards ?? []).map((card) => (
                    <div
                      key={card.id}
                      className="flex-[0_0_85%] sm:flex-[0_0_45%] min-w-0"
                    >
                      <div
                        className={`rounded-2xl shadow-lg p-5 h-[340px] flex flex-col justify-between relative overflow-hidden transition-all ${card.enable === false
                            ? "bg-gray-400 text-gray-100 grayscale"
                            : "bg-lovely text-creamey"
                          }`}
                      >
                        <div>
                          <h3 className="text-lg font-bold mb-3 border-b border-white/20 pb-2">
                            {card.title}
                          </h3>
                          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-white/95">
                            {card.description.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>

                        {card.imagePath && (
                          <div className="relative h-32 w-full mt-2 rounded-xl overflow-hidden">
                            <Image
                              src={card.imagePath}
                              alt={card.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}

                        {card.enable === false && (
                          <div className="absolute inset-0 bg-lovely/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                            <Lock className="w-8 h-8 text-creamey mb-2" />
                            <p className={`${thirdFont.className} text-creamey font-bold text-sm uppercase tracking-wide`}>
                              Available in Full Experience
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )} */}



        {/* Interactive Bridal Quiz Section */}
        {/* <div className="bg-pinkey/60 border-2 border-pinkey rounded-3xl p-6 sm:p-8 shadow-lg mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-lovely" />
            <span className="text-xs uppercase tracking-widest font-bold text-lovely">Bridal Quiz</span>
          </div>
          <h2 className={`${thirdFont.className} text-2xl sm:text-3xl font-extrabold text-lovely uppercase tracking-tight`}>
            Which Bestie Do You Need?
          </h2>
          <p className="text-sm text-lovely/80 mb-6">
            Answer 4 quick questions and we'll match you with your ideal Wifey package. 💕
          </p>

          {!showQuizResult ? (
            <div id="quiz-flow" className="space-y-6">
              <div className="bg-pinkey/30 p-5 rounded-2xl border border-pinkey">
                <h3 className={`${thirdFont.className} text-lg font-bold text-lovely mb-4`}>
                  {QUIZ_QUESTIONS[quizIndex].q}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {QUIZ_QUESTIONS[quizIndex].o.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(opt)}
                      className="text-left bg-white hover:bg-lovely text-lovely hover:text-white border-2 border-pinkey hover:border-lovely rounded-xl p-4 text-sm font-semibold transition-all shadow-sm"
                      id={`quiz-opt-${quizIndex}-${i}`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-lovely">
                <span>Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
                <span className="bg-lovely/10 px-3 py-1 rounded-full">
                  {Math.round(((quizIndex) / QUIZ_QUESTIONS.length) * 100)}% Completed
                </span>
              </div>
            </div>
          ) : (
            <div id="quiz-result" className="bg-lovely text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
              <span className="inline-block bg-white text-lovely font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                {getQuizResultData().persona}
              </span>
              <h3 className={`${thirdFont.className} text-2xl font-extrabold uppercase tracking-wide`}>
                {getQuizResultData().title}
              </h3>
              <p className="text-sm leading-relaxed text-white/95">
                {getQuizResultData().why}
              </p>
              <div className={`${thirdFont.className} text-3xl font-extrabold text-creamey pt-2`}>
                {getQuizResultData().price}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Button
                  className="bg-white text-lovely hover:bg-creamey font-bold rounded-full py-5 px-6 text-sm"
                  onClick={handleAddToCart}
                  id="quiz-result-btn"
                >
                  {getQuizResultData().btnTxt}
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 rounded-full py-5 px-6 text-sm flex items-center justify-center gap-2"
                  onClick={resetQuiz}
                  id="retake-quiz-btn"
                >
                  <RotateCcw className="w-4 h-4" /> Retake Quiz
                </Button>
              </div>
            </div>
          )}
        </div> */}

        {/* Wifey Community Section */}
        <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-pinkey">
          <WifeyCommunity />
        </div>
        {/* Notes Section */}
        {packageData.notes && packageData.notes.length > 0 && (
          <div className="bg-pinkey/80 p-6 sm:p-8 rounded-3xl border-2 border-lovely/20 shadow-md mt-12">
            <h3 className={`${thirdFont.className} text-xl font-bold text-lovely mb-3 uppercase tracking-wide`}>
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-lovely/90">
              {packageData.notes.map((note, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-lovely mr-2">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
