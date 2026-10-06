"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Ipackage } from "@/app/interfaces/interfaces";
import { thirdFont } from "@/fonts";
import axios from "axios";
import PackageDetailSkeleton from "@/app/packageOld/[slug]/PackageDetailSkeleton";
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
  const [showModal, setShowModal] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Touch swipe refs for mobile gesture navigation
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndYRef = useRef<number | null>(null);
  const hasSwipedRef = useRef<boolean>(false);

  // Zoom & Pan state for Lightbox Magnifier
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const toggleZoom = useCallback(() => {
    if (zoomScale > 1) {
      resetZoom();
    } else {
      setZoomScale(2);
      setPanPosition({ x: 0, y: 0 });
    }
  }, [zoomScale, resetZoom]);

  const handleZoomStep = useCallback((delta: number) => {
    setZoomScale((prev) => {
      const next = Math.min(3.5, Math.max(1, Math.round((prev + delta) * 10) / 10));
      if (next === 1) {
        setPanPosition({ x: 0, y: 0 });
        setIsDragging(false);
      }
      return next;
    });
  }, []);

  // Reset zoom when image changes or lightbox closes
  useEffect(() => {
    resetZoom();
  }, [currentImageIndex, isLightboxOpen, resetZoom]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      handleZoomStep(0.25);
    } else {
      handleZoomStep(-0.25);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...panPosition };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomScale > 1) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanPosition({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
    touchEndXRef.current = null;
    touchEndYRef.current = null;
    hasSwipedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
    touchEndYRef.current = e.targetTouches[0].clientY;

    // When zoomed in, pan image with finger drag
    if (zoomScale > 1 && touchStartXRef.current !== null && touchStartYRef.current !== null) {
      const dx = e.targetTouches[0].clientX - touchStartXRef.current;
      const dy = e.targetTouches[0].clientY - touchStartYRef.current;
      setPanPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      touchStartXRef.current = e.targetTouches[0].clientX;
      touchStartYRef.current = e.targetTouches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    if (zoomScale > 1) {
      touchStartXRef.current = null;
      touchEndXRef.current = null;
      touchStartYRef.current = null;
      touchEndYRef.current = null;
      return;
    }

    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diffX = touchStartXRef.current - touchEndXRef.current;
    const diffY = (touchStartYRef.current ?? 0) - (touchEndYRef.current ?? 0);

    // Horizontal swipe threshold: > 40px and dominant over vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      hasSwipedRef.current = true;
      if (galleryImages.length > 1) {
        if (diffX > 0) {
          // Swipe left -> Next image
          setCurrentImageIndex((prev) =>
            prev === galleryImages.length - 1 ? 0 : prev + 1
          );
        } else {
          // Swipe right -> Previous image
          setCurrentImageIndex((prev) =>
            prev === 0 ? galleryImages.length - 1 : prev - 1
          );
        }
      }
      setTimeout(() => {
        hasSwipedRef.current = false;
      }, 100);
    }
  };

  // Package-specific modal content
  const getModalContent = (packageId: string) => {
    const packageContents = {
      "687396821b4da119eb1c13fe": {
        header: "This is a pre-order",
        content: `Please note that this order is a pre-order, and your planner will be shipped within 10 business days.

  While you wait for your gehaz bestie to arrive, you can already enjoy:
  ✨ Wifey's curated playlists
  ✨ Exclusive partner discounts
  ✨ Access to supportive Wifey circles

  Thank you for your patience and love — we can't wait for you to unwrap your planner! 💗`,
      },
      "68bf6ae9c4d5c1af12cdcd37": {
        header: "This is a pre-order",
        content: `Please note that this order is a pre-order, and your Gehaz Bestie Planner will be beshipped within 10 business days.

After completing your purchase, you’ll receive a confirmation email with a tracking link so you can follow your planner’s journey every step of the way.

Once you receive your planner, you’ll unlock a special Wifey bonus 💗 — access to one playlist of your choice for 6 months. Inside your package, you’ll find a thank-you card with a QR code that lets you browse and select your favorite playlist.

We’re beyond excited to share this experience with you… your planner will be on its way very soon! ✨`,
      },
    };

    return packageContents[packageId as keyof typeof packageContents] || null;
  };

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

  // Show modal when package data is loaded for specific packages
  useEffect(() => {
    if (packageData && packageData._id) {
      const modalContent = getModalContent(packageData._id);
      // remove false for activating pre-order modal
      if (modalContent && false) {
        setShowModal(true);
      }
    }
  }, [packageData]);

  // Handle keyboard navigation & body scroll lock for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const total =
      packageData?.images && packageData.images.length > 0
        ? packageData.images.length
        : packageData?.imgUrl
          ? 1
          : 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (total > 1) {
        if (e.key === "ArrowLeft") {
          setCurrentImageIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
        }
        if (e.key === "ArrowRight") {
          setCurrentImageIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, packageData]);

  const handleAddToCart = () => {
    if (!packageData) return;
    let price = packageData.price;
    let discountedFrom = packageData.discountedFrom;
    let duration = packageData.duration;
    let saving = packageData.saving;

    if (packageData.variants && packageData.variants.length > 0) {
      if (selectedVariantIndex === -1) {
        showToast("Please select a plan variant before adding to cart.");
        return;
      }
      const selected = packageData.variants[selectedVariantIndex];
      price = selected.price;
      discountedFrom = selected.discountedFrom ?? packageData.discountedFrom;
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
      discountedFrom,
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
    let discountedFrom = packageData.discountedFrom;
    let duration = packageData.duration;
    let saving = packageData.saving;

    if (packageData.variants && packageData.variants.length > 0) {
      if (selectedVariantIndex === -1) {
        showToast("Please select a plan variant before subscribing.");
        return;
      }
      const selected = packageData.variants[selectedVariantIndex];
      price = selected.price;
      discountedFrom = selected.discountedFrom ?? packageData.discountedFrom;
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
      discountedFrom,
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

  const isWeddingPackage = Boolean(
    (typeof params?.slug === "string" && params.slug.toLowerCase().includes("wedding")) ||
    (packageData?.slug && packageData.slug.toLowerCase().includes("wedding")) ||
    (packageData?.name && packageData.name.toLowerCase().includes("wedding")) ||
    (packageData?.partOf && packageData.partOf.toLowerCase().includes("wedding")) ||
    packageData?.duration === 6
  );

  const galleryImages =
    packageData?.images && packageData.images.length > 0
      ? packageData.images
      : packageData?.imgUrl
        ? [packageData.imgUrl]
        : [];

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
            <div
              onClick={() => {
                if (hasSwipedRef.current) return;
                setIsLightboxOpen(true);
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-square overflow-hidden rounded-2xl border-3 border-lovely shadow-md bg-creamey cursor-zoom-in group/mainimg touch-pan-y"
            >
              <Image
                src={
                  galleryImages[currentImageIndex] ||
                  packageData.imgUrl ||
                  "/placeholder.png"
                }
                alt={packageData.name}
                fill
                className="object-contain p-2 transition-transform duration-300 group-hover/mainimg:scale-[1.02]"
                priority
              />

              {/* Zoom hint badge */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full p-2 opacity-0 group-hover/mainimg:opacity-100 transition-opacity pointer-events-none shadow-md">
                <Maximize2 size={16} />
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? galleryImages.length - 1 : prev - 1
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
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === galleryImages.length - 1 ? 0 : prev + 1
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
                  <strong className="text-lovely">Not sure?</strong> Just want the planner? Choose <strong className="text-lovely">Mini</strong>. Want the planner <em>plus</em> {isWeddingPackage ? "6 months" : "a year"} of discounts, videos, community &amp; expert support? Choose <strong className="text-lovely">Full</strong>.
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
            Compare the Mini and Full packages to decide which bestie fits your bridal era needs.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="text-left p-3 text-xs uppercase tracking-wider text-lovely/70 font-semibold">Features Included</th>
                  <th className="p-3 text-center bg-lovely text-white font-bold text-sm rounded-t-xl w-1/4 uppercase tracking-wider">Mini</th>
                  <th className="p-3 text-center bg-white text-lovely border-2 border-pinkey font-bold text-sm rounded-t-xl w-1/4 uppercase tracking-wider">Full</th>
                </tr>
              </thead>
              <tbody>
                {(fullPackage?.comparisonFeatures ?? []).map((feat, idx) => {
                  const isCheck = (val: string) => val === "✓" || val === "✔" || val.toLowerCase() === "true";
                  const isDash = (val: string) => val === "—" || val === "-" || val.toLowerCase() === "false";
                  return (
                    <tr key={idx}>
                      <td className="p-3 bg-lovely/80 text-white rounded-l-xl text-xs sm:text-sm font-medium">
                        {feat.feature}
                      </td>
                      <td className="p-3 text-center bg-pinkey/20 border border-pinkey/50 font-bold">
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
                      <td className="p-3 text-center bg-white border border-pinkey/50 rounded-r-xl font-bold">
                        {isCheck(feat.fullValue) ? (
                          <Check className="inline h-5 w-5 text-emerald-600" />
                        ) : isDash(feat.fullValue) ? (
                          <span className="text-gray-400 font-bold">—</span>
                        ) : (
                          <>
                            <Check className="inline h-5 w-5 text-emerald-600" />
                            <span className="block text-[10px] text-lovely font-semibold mt-0.5">{feat.fullValue}</span>
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
              {fullPackage?.calloutDescription ? (
                isWeddingPackage ? (
                  fullPackage.calloutDescription
                    .replace(/a full year|12 months|a whole year/gi, "6 months")
                    .replace(/appliance discount/gi, "wedding vendor discount")
                ) : (
                  fullPackage.calloutDescription
                )
              ) : (
                <>
                  For <strong>LE 1,000 more</strong>, you unlock 11 extra playlists plus {isWeddingPackage ? "6 months" : "a full year"} of community, expert access and partner discounts. {isWeddingPackage ? "One wedding vendor discount alone can cover the difference." : "One appliance discount alone can cover the difference."}
                </>
              )}
            </p>
          </div>
          <div className="mt-4 p-4 border-2 text-lovely/90 border-dashed border-pinkey rounded-xl text-center text-xs sm:text-sm font-medium">
            <strong>The physical planner is yours forever.</strong> Digital benefits stay active for {isWeddingPackage ? "6 months" : "12 months"} from purchase.
          </div>
        </div>
        {/* Notes Section */}
        {packageData.notes && packageData.notes.length > 0 && (
          <div className="bg-pinkey/80 p-6 sm:p-8 rounded-3xl border-2 border-lovely/20 shadow-md my-12 ">
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

      </div>

      {/* Modal for specific packages */}
      {showModal && packageData?._id && getModalContent(packageData._id) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-creamey rounded-2xl max-w-md w-full mx-4 relative shadow-2xl border-2 border-lovely">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-lovely hover:text-lovely/70 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Modal content */}
            <div className="p-6 pt-12">
              <div className="text-center">
                <div className="text-4xl mb-4">💖</div>
                {getModalContent(packageData._id) && (
                  <>
                    <h2 className="text-lovely text-lg font-bold mb-4">
                      {getModalContent(packageData._id)?.header}
                    </h2>
                    <div className="text-lovely leading-relaxed whitespace-pre-line text-sm font-medium">
                      {getModalContent(packageData._id)?.content}
                    </div>
                  </>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-6 bg-lovely text-creamey hover:bg-lovely/90 transition-colors rounded-full px-8 py-3 font-semibold shadow-lg"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Lightbox Modal with Dark Background */}
      {isLightboxOpen && galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 transition-all select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar: Title, Zoom Controls & Close Button */}
          <div
            className="w-full max-w-6xl flex items-center justify-between text-white z-20 pt-2 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-semibold text-sm sm:text-base text-white/90 truncate max-w-xs sm:max-w-md">
                {packageData.name}
              </span>
              {galleryImages.length > 1 && (
                <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-mono flex-shrink-0">
                  {currentImageIndex + 1} / {galleryImages.length}
                </span>
              )}
            </div>

            {/* Magnifier / Zoom Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/10 backdrop-blur-sm">
                <button
                  onClick={() => handleZoomStep(-0.5)}
                  disabled={zoomScale <= 1}
                  className="p-1.5 sm:p-2 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent rounded-full transition-colors cursor-pointer"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={toggleZoom}
                  className="px-2 py-0.5 text-xs font-mono text-white/90 hover:text-white transition-colors cursor-pointer min-w-[42px] text-center"
                  title="Toggle Zoom"
                >
                  {Math.round(zoomScale * 100)}%
                </button>
                <button
                  onClick={() => handleZoomStep(0.5)}
                  disabled={zoomScale >= 3.5}
                  className="p-1.5 sm:p-2 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent rounded-full transition-colors cursor-pointer"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
              </div>

              {zoomScale > 1 && (
                <button
                  onClick={resetZoom}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-2.5 transition-colors cursor-pointer border border-white/10"
                  title="Reset Zoom"
                  aria-label="Reset Zoom"
                >
                  <RotateCcw size={16} />
                </button>
              )}

              <button
                onClick={() => setIsLightboxOpen(false)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors cursor-pointer ml-1 sm:ml-2 border border-white/10"
                aria-label="Close image popup"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Main Stage: Prev Button, Large Image, Next Button */}
          <div
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-2 touch-pan-y"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Prev Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? galleryImages.length - 1 : prev - 1
                  );
                }}
                className="absolute left-2 sm:left-4 z-20 bg-white/10 hover:bg-white/25 active:scale-95 text-white rounded-full p-3 transition-all backdrop-blur-sm shadow-xl cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Displayed Image with Magnifier / Pan */}
            <div
              className={`relative w-full h-[65vh] sm:h-[75vh] overflow-hidden flex items-center justify-center ${
                zoomScale > 1
                  ? isDragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : "cursor-zoom-in"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onDoubleClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDragging) {
                  toggleZoom();
                }
              }}
            >
              <div
                style={{
                  transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
                  transition: isDragging ? "none" : "transform 0.2s ease-out",
                }}
                className="relative w-full h-full flex items-center justify-center will-change-transform"
              >
                <Image
                  src={galleryImages[currentImageIndex]}
                  alt={`${packageData.name} image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain drop-shadow-2xl pointer-events-none select-none"
                  priority
                />
              </div>
            </div>

            {/* Next Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) =>
                    prev === galleryImages.length - 1 ? 0 : prev + 1
                  );
                }}
                className="absolute right-2 sm:right-4 z-20 bg-white/10 hover:bg-white/25 active:scale-95 text-white rounded-full p-3 transition-all backdrop-blur-sm shadow-xl cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {galleryImages.length > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 px-2 z-20 scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${currentImageIndex === idx
                      ? "border-pinkey ring-2 ring-pinkey/50 scale-105 opacity-100"
                      : "border-white/20 opacity-50 hover:opacity-80"
                    }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
