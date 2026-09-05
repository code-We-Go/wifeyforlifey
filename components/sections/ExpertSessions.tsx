"use client";

import { thirdFont } from "@/fonts";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
// import Link from "next/link"; 
import { ChevronLeft, ChevronRight, CreditCard, Smartphone, Upload, CheckCircle2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import SessionCard from "@/components/shared/SessionCard";
import SessionCardSkeleton from "@/components/shared/SessionCardSkeleton";
import useEmblaCarousel from "embla-carousel-react";
import { headerStyle, subHeaderStyle } from "@/app/styles/style";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface IPartnerSessionVariant {
  _id?: string;
  title: string;
  description: string;
  price: number;
  duration: number;
}

interface IPartnerSessionLink {
  url: string;
  description: string;
}

interface IPartnerSession {
  _id: string;
  title: string;
  description: string;
  partnerName: string;
  price: number;
  sessionType?: "one-to-one" | "webinar";
  discountCode?: string;
  whatsappNumber: string;
  partnerEmail: string;
  profitPercentage: number;
  imageUrl: string;
  subscriptionDiscountPercentage?: number;
  link?: string;
  meetingLink?: string;
  variants?: IPartnerSessionVariant[];
  links?: IPartnerSessionLink[];
}

const ExpertSessions = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>();
  const { data: authSession } = useSession();
  const [sessions, setSessions] = useState<IPartnerSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Booking State
  const [selectedForDetails, setSelectedForDetails] = useState<IPartnerSession | null>(null);
  const [selectedForBooking, setSelectedForBooking] = useState<IPartnerSession | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    discountCode: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [subscriptionApplied, setSubscriptionApplied] = useState(false);
  const [subscriptionFinalPrice, setSubscriptionFinalPrice] = useState<number | null>(null);
  const [couponFinalPrice, setCouponFinalPrice] = useState<number | null>(null);

  const [autoDiscounts, setAutoDiscounts] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "instapay">("card");
  const [instapayReceipt, setInstapayReceipt] = useState("");
  const [instapaySuccess, setInstapaySuccess] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const [sessionsRes, discountsRes] = await Promise.all([
          fetch("/api/partner-sessions"),
          fetch("/api/active-discounts?redeemType=Sessions"),
        ]);
        const data = await sessionsRes.json();
        if (data.success) {
          setSessions(data.data);
        }
        const discountsData = await discountsRes.json();
        if (discountsData.success && discountsData.discounts) {
          setAutoDiscounts(discountsData.discounts);
        }
      } catch (error) {
        console.error("Failed to fetch sessions or discounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const getSessionDiscountBadge = (session: IPartnerSession) => {
    if (!autoDiscounts || autoDiscounts.length === 0) return null;
    const sessionPrice = getSessionBasePrice(session, 0);
    if (!sessionPrice || sessionPrice <= 0) return null;

    const validDiscounts = autoDiscounts.filter((d: any) => {
      const minAmt = d.conditions?.minimumOrderAmount || 0;
      return minAmt <= sessionPrice;
    });

    if (validDiscounts.length === 0) return null;

    validDiscounts.sort((a: any, b: any) => {
      const minA = a.conditions?.minimumOrderAmount || 0;
      const minB = b.conditions?.minimumOrderAmount || 0;
      return minB - minA;
    });

    const best = validDiscounts[0];
    if (best.calculationType === "PERCENTAGE" && best.value) {
      return `${best.value}% OFF`;
    }
    if (best.calculationType === "FIXED_AMOUNT" && best.value) {
      const pct = Math.round((best.value / sessionPrice) * 100);
      return pct > 0 ? `${pct}% OFF` : `EGP ${best.value} OFF`;
    }
    return null;
  };

  // Embla Carousel
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

  const getSessionBasePrice = (s: IPartnerSession, vIndex: number) => {
    // Variant price takes absolute priority over session base price
    if (
      s.variants &&
      s.variants[vIndex] &&
      s.variants[vIndex].price !== undefined &&
      s.variants[vIndex].price !== null &&
      !isNaN(Number(s.variants[vIndex].price))
    ) {
      return Number(s.variants[vIndex].price);
    }
    return Number(s.price) || 0;
  };

  const openDetailsModal = (s: IPartnerSession) => {
    setSelectedForDetails(s);
    setSelectedVariantIndex(0);
  };

  const checkIsActiveSubscriber = () => {
    if (!authSession?.user?.isSubscribed) return false;
    const packageId = authSession?.user?.subscription?.packageId?.toString();
    const isMini =
      packageId === "68bf6ae9c4d5c1af12cdcd37" ||
      packageId === "6a2d9aec3def6ce76dc7babc";
    if (isMini) return false;

    const expiry = authSession?.user?.subscriptionExpiryDate;
    if (expiry) {
      return new Date(expiry).getTime() > Date.now();
    }
    return false;
  };

  const fetchAndApplyBestAutoDiscount = async (
    basePrice: number,
    subPrice: number | null
  ) => {
    try {
      const response = await fetch(
        `/api/active-discounts?cartTotal=${basePrice}&redeemType=Sessions`
      );
      const data = await response.json();
      if (data.success && data.discounts && data.discounts.length > 0) {
        // Filter valid discounts for this basePrice and sort by highest minimumOrderAmount
        const validDiscounts = data.discounts.filter((d: any) => {
          const minOrder = d.conditions?.minimumOrderAmount || 0;
          return minOrder <= basePrice;
        });

        validDiscounts.sort((a: any, b: any) => {
          const minA = a.conditions?.minimumOrderAmount || 0;
          const minB = b.conditions?.minimumOrderAmount || 0;
          return minB - minA;
        });

        if (validDiscounts.length > 0) {
          const bestDiscount = validDiscounts[0];
          let codePrice = basePrice;
          if (bestDiscount.calculationType === "PERCENTAGE" && bestDiscount.value) {
            codePrice = Math.max(
              0,
              Math.round(basePrice - (basePrice * bestDiscount.value) / 100)
            );
          } else if (
            bestDiscount.calculationType === "FIXED_AMOUNT" &&
            typeof bestDiscount.value === "number"
          ) {
            codePrice = Math.max(0, Math.round(basePrice - bestDiscount.value));
          }

          setCouponFinalPrice(codePrice);
          const baseline = subPrice ?? basePrice;
          const best = Math.min(codePrice, baseline);
          setApplied(codePrice < baseline);
          setFinalPrice(best);
          setForm((prev) => ({ ...prev, discountCode: bestDiscount.code }));
          return bestDiscount;
        }
      }
    } catch (e) {
      console.error("Error fetching automatic session discount:", e);
    }
    return null;
  };

  const openBookingModal = async (s: IPartnerSession, initialVariantIndex = 0) => {
    setSelectedForBooking(s);
    setSelectedVariantIndex(initialVariantIndex);
    setError("");
    setPaymentMethod("card");
    setInstapayReceipt("");
    setInstapaySuccess(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      discountCode: "",
    });
    setApplied(false);
    setSubscriptionApplied(false);
    setSubscriptionFinalPrice(null);
    setCouponFinalPrice(null);

    const basePrice = getSessionBasePrice(s, initialVariantIndex);
    // Auto-apply subscription discount if user has active subscription with valid expiry
    const isActiveSubscriber = checkIsActiveSubscriber();
    const subPercent = Number(s.subscriptionDiscountPercentage || 0);
    let subPrice: number | null = null;
    if (isActiveSubscriber && subPercent > 0) {
      subPrice = Math.max(
        0,
        Math.round(basePrice - (basePrice * subPercent) / 100)
      );
      setSubscriptionApplied(true);
      setSubscriptionFinalPrice(subPrice);
      setFinalPrice(subPrice);
    } else {
      setFinalPrice(basePrice);
    }

    // Auto-fetch and apply highest valid automatic discount
    await fetchAndApplyBestAutoDiscount(basePrice, subPrice);
  };

  const handleBookingVariantChange = async (idx: number) => {
    if (!selectedForBooking) return;
    setSelectedVariantIndex(idx);
    const basePrice = getSessionBasePrice(selectedForBooking, idx);
    const isActiveSubscriber = checkIsActiveSubscriber();
    const subPercent = Number(selectedForBooking.subscriptionDiscountPercentage || 0);

    let currentSubPrice: number | null = null;
    if (isActiveSubscriber && subPercent > 0) {
      currentSubPrice = Math.max(
        0,
        Math.round(basePrice - (basePrice * subPercent) / 100)
      );
      setSubscriptionApplied(true);
      setSubscriptionFinalPrice(currentSubPrice);
      setFinalPrice(currentSubPrice);
    } else {
      setSubscriptionApplied(false);
      setSubscriptionFinalPrice(null);
      setFinalPrice(basePrice);
    }
    setApplied(false);
    setCouponFinalPrice(null);
    setForm((prev) => ({ ...prev, discountCode: "" }));

    // Re-evaluate automatic discount for new variant price
    await fetchAndApplyBestAutoDiscount(basePrice, currentSubPrice);
  };

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForBooking) return;
    setSubmitting(true);
    setError("");
    try {
      // Validate instapay receipt
      if (paymentMethod === "instapay" && !instapayReceipt) {
        setError("Please upload your InstaPay receipt screenshot.");
        setSubmitting(false);
        return;
      }

      const res = await axios.post("/api/partner-sessions/book", {
        sessionId: selectedForBooking._id,
        variantIndex:
          selectedForBooking.variants && selectedForBooking.variants.length > 0
            ? selectedVariantIndex
            : undefined,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        discountCode: form.discountCode || undefined,
        paymentMethod: finalPrice === 0 ? undefined : paymentMethod,
        instapayReceipt: paymentMethod === "instapay" ? instapayReceipt : undefined,
      });

      if (res.data?.isFree) {
        if (res.data.link) {
          const directUrl =
            res.data.link.startsWith("http://") || res.data.link.startsWith("https://")
              ? res.data.link
              : `https://${res.data.link}`;
          window.location.href = directUrl;
        } else if (res.data.orderId) {
          window.location.href = `/payment/success?session=true&orderId=${res.data.orderId}`;
        } else {
          window.location.href = "/payment/success?session=true";
        }
        return;
      }

      // InstaPay flow — show success message in modal
      if (res.data?.isInstapay) {
        setInstapaySuccess(true);
        setSubmitting(false);
        return;
      }

      const clientSecret = res.data.token;
      if (clientSecret) {
        const url = `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.NEXT_PUBLIC_PaymobPublicKey}&clientSecret=${clientSecret}`;
        window.location.href = url;
      } else if (res.data.link) {
        window.location.href = res.data.link;
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to start booking");
    } finally {
      setSubmitting(false);
    }
  };

  const applyDiscount = async () => {
    if (!selectedForBooking) return;
    const basePrice = getSessionBasePrice(selectedForBooking, selectedVariantIndex);
    const code = form.discountCode.trim();
    if (!code) {
      // Re-apply best automatic discount if available when user clears the code
      const autoDiscount = await fetchAndApplyBestAutoDiscount(
        basePrice,
        subscriptionFinalPrice
      );
      if (!autoDiscount) {
        setApplied(false);
        setCouponFinalPrice(null);
        setFinalPrice(subscriptionFinalPrice ?? basePrice);
      }
      setError("");
      return;
    }
    try {
      const res = await axios.post("/api/apply-discount", {
        cart: [{ price: basePrice, quantity: 1 }],
        discountCode: code,
        redeemType: "Sessions",
      });
      const total = res.data?.finalTotal;
      if (typeof total === "number") {
        const codePrice = Math.max(0, Math.round(total));
        setCouponFinalPrice(codePrice);
        const baseline = subscriptionFinalPrice ?? basePrice;
        const best = Math.min(codePrice, baseline);
        setApplied(codePrice < baseline);
        setFinalPrice(best);
        setError("");
      } else {
        setApplied(false);
        setCouponFinalPrice(null);
        setFinalPrice(subscriptionFinalPrice ?? basePrice);
        setError("Invalid discount response");
      }
    } catch (e: any) {
      setApplied(false);
      setCouponFinalPrice(null);
      setFinalPrice(subscriptionFinalPrice ?? basePrice);
      const msg = e?.response?.data?.error || "Invalid or expired discount code";
      setError(msg);
    }
  };


  if (loading) {
    return (
      <section
        ref={sectionRef}
        className={`bg-pinkey text-lovely pt-8 md:pt-16 pb-2 transition-all duration-1000 ease-out ${isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="container-custom">
          {/* Header */}
          <div className="text-left mb-6 max-w-4xl">
            <h2
              className={`${thirdFont.className} ${headerStyle} mb-4`}
            >
              Get real answers from real experts
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">

                <p className={`${subHeaderStyle}`}>
                  Book consultation sessions with trusted experts and stop relying
                  on confusing or incorrect advice.
                </p>
              </li>
            </ul>
          </div>

          {/* Skeleton Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex gap-6 md:gap-12">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex-[0_0_45%] md:flex-[0_0_30%] xl:flex-[0_0_22%] min-w-0">
                    <SessionCardSkeleton />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 text-center md:text-left  pt-6">
            <p className="text-lovely/70 italic text-lg   decoration-lovely/30">
              Private, judgment-free sessions — from the comfort of your home.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (sessions.length === 0) {
    return null;
  }

  const activeDetailsVariant =
    selectedForDetails?.variants && selectedForDetails.variants.length > 0
      ? selectedForDetails.variants[selectedVariantIndex] || selectedForDetails.variants[0]
      : null;

  const activeBookingVariant =
    selectedForBooking?.variants && selectedForBooking.variants.length > 0
      ? selectedForBooking.variants[selectedVariantIndex] || selectedForBooking.variants[0]
      : null;

  const bookingBasePrice = selectedForBooking
    ? getSessionBasePrice(selectedForBooking, selectedVariantIndex)
    : 0;

  return (
    <section
      ref={sectionRef}
      className={`bg-pinkey text-lovely pt-8 md:pt-16 pb-2 transition-all duration-1000 ease-out ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
        }`}
    >
      <div className="container-custom">
        {/* Header */}
        <div className="text-left mb-6 max-w-4xl">
          <h2
            className={`${thirdFont.className} ${headerStyle} mb-4`}
          >
            Get real answers from real experts!
          </h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-xl mt-1">•</span>
              <p className={`${subHeaderStyle}`}>
                Book consultation sessions with trusted experts and stop relying
                on confusing or incorrect advice.
              </p>
            </li>
          </ul>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          {sessions.length > 4 && (
            <>
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-lovely text-white p-2 md:p-3 rounded-full shadow-lg transition-all ${!canScrollPrev ? 'opacity-30 cursor-not-allowed' : 'hover:bg-lovely/90 cursor-pointer'
                  }`}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-lovely text-white p-2 md:p-3 rounded-full shadow-lg transition-all ${!canScrollNext ? 'opacity-30 cursor-not-allowed' : 'hover:bg-lovely/90 cursor-pointer'
                  }`}
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 md:gap-12">
              {sessions.map((session) => (
                <div key={session._id} className="flex-[0_0_45%] md:flex-[0_0_30%] xl:flex-[0_0_22%] min-w-0">
                  <SessionCard
                    session={session}
                    discountBadge={getSessionDiscountBadge(session)}
                    onDetailsClick={() => openDetailsModal(session)}
                    onBookClick={() => openBookingModal(session)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center md:text-left  pt-6">
          <p className="text-lovely/70 italic text-lg  decoration-lovely/30">
            Private, judgment-free sessions — from the comfort of your home.
          </p>
        </div>
      </div>


      {/* Details Modal */}
      {selectedForDetails && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedForDetails(null)}
        >
          <div
            className="bg-creamey rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-6 mb-6">
              {/* Image */}
              {selectedForDetails.imageUrl && (
                <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={selectedForDetails.imageUrl}
                    alt={selectedForDetails.partnerName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Title & Name */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-lovely mb-1">
                  {selectedForDetails.partnerName}
                </h3>
                <p className="text-lg text-lovely/70 mb-2">
                  {activeDetailsVariant?.title || selectedForDetails.title}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-semibold text-lovely">
                    EGP {activeDetailsVariant ? activeDetailsVariant.price : selectedForDetails.price}
                  </p>
                  {getSessionDiscountBadge(selectedForDetails) && (
                    <span className="bg-lovely text-creamey text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {getSessionDiscountBadge(selectedForDetails)}
                    </span>
                  )}
                  {activeDetailsVariant?.duration ? (
                    <span className="text-xs bg-lovely/10 text-lovely font-medium px-2.5 py-1 rounded-full">
                      ⏱ {activeDetailsVariant.duration} mins
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Variants Selector if available */}
            {selectedForDetails.variants && selectedForDetails.variants.length > 1 && (
              <div className="mb-6">
                <h4 className="font-bold text-lovely text-sm mb-2 uppercase tracking-wide">
                  Choose Variant:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedForDetails.variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${selectedVariantIndex === idx
                          ? "bg-lovely text-creamey border-lovely shadow"
                          : "bg-white/60 text-lovely border-lovely/40 hover:bg-white"
                        }`}
                    >
                      <span>{v.title}</span>
                      <span className="ml-2 text-xs opacity-80">
                        (EGP {v.price} )
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h4 className="font-bold text-lovely text-lg mb-2">Helps you with:</h4>
              <div className="text-base font-medium text-lovely/90 whitespace-pre-line">
                {(activeDetailsVariant?.description || selectedForDetails.description)
                  .split('\n')
                  .map((line, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      {line.trim() && (
                        <>
                          <span className="mt-1">•</span>
                          <span>{line}</span>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Session Type */}
            {selectedForDetails.sessionType && (
              <div className="mb-6">
                <p className="text-lovely/80">
                  <span className="font-semibold">Session Type:</span>{" "}
                  {selectedForDetails.sessionType === "one-to-one" ? "One-to-One" : "Webinar"}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex w-full justify-center gap-3">
              <Button
                onClick={() => {
                  const currIdx = selectedVariantIndex;
                  setSelectedForDetails(null);
                  openBookingModal(selectedForDetails, currIdx);
                }}
                className="bg-lovely hover:bg-lovely/90 text-white font-bold rounded-md px-10 md:px-20 py-3 md:py-6"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedForBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedForBooking(null);
            setInstapaySuccess(false);
          }}
        >
          <div
            className="bg-creamey rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >

            {/* InstaPay Success Message */}
            {instapaySuccess ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-lovely">
                  Booking Submitted! 🎉
                </h3>
                <p className="text-lovely/80 text-sm leading-relaxed">
                  Your booking for <span className="font-semibold">{activeBookingVariant?.title || selectedForBooking.title}</span> has been received.
                </p>
                <div className="bg-lovely/5 border border-lovely/20 rounded-xl p-4 text-left space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⏳</span>
                    <p className="text-sm text-lovely/90">
                      Our administration team will review your payment receipt. This may take up to <span className="font-bold">24 hours</span>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📧</span>
                    <p className="text-sm text-lovely/90">
                      You will receive a confirmation email once your payment is verified.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🕐</span>
                    <p className="text-sm text-lovely/90">
                      Business hours: <span className="font-medium">Mon–Fri, 5 PM – 11 PM</span>. Weekend requests are reviewed on Monday.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  className="w-full bg-lovely text-creamey rounded-2xl mt-2"
                  onClick={() => {
                    setInstapaySuccess(false);
                    setSelectedForBooking(null);
                  }}
                >
                  Got it!
                </Button>
              </div>
            ) : (
            <>
            <h3 className="text-xl font-semibold text-lovely mb-2">
              Book: {activeBookingVariant?.title || selectedForBooking.title}
            </h3>

            {/* Variant Switcher in Booking Modal */}
            {selectedForBooking.variants && selectedForBooking.variants.length > 1 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-lovely uppercase tracking-wide mb-1.5">
                  Selected Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedForBooking.variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleBookingVariantChange(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${selectedVariantIndex === idx
                          ? "bg-lovely text-white border-lovely"
                          : "bg-white/60 text-lovely border-lovely/30 hover:bg-white"
                        }`}
                    >
                      {v.title} (EGP {v.price})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-lovely/90 mb-4">
              {finalPrice === 0
                ? "Once confirmed, you will be redirected directly to access your session."
                : paymentMethod === "instapay"
                  ? "Upload your InstaPay receipt and our team will verify your payment within 24 hours."
                  : `After your payment is successfully completed, you will receive ${selectedForBooking.partnerName}'s WhatsApp contact / access link to arrange your session.`}
            </p>

            {/* Links */}
            {selectedForBooking.links && selectedForBooking.links.length > 0 && (
              <div className="mb-4">
                <div className="space-y-2">
                  {selectedForBooking.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-lovely hover:text-lovely/70 underline underline-offset-2 transition-colors text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>{link.description || link.url} (Anonymously)</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={book} className="space-y-3">
              <Input
                className="border-pinkey placeholder:text-lovely bg-creamey"
                placeholder="First name"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                required
              />
              <Input
                className="border-pinkey placeholder:text-lovely bg-creamey"
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
              <Input
                className="border-pinkey lowercase placeholder:text-lovely bg-creamey"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                className="border-pinkey placeholder:text-lovely bg-creamey"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <Input
                  className="border-pinkey placeholder:text-lovely bg-creamey"
                  placeholder="Discount code (optional)"
                  value={form.discountCode}
                  onChange={(e) =>
                    setForm({ ...form, discountCode: e.target.value })
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-lovely text-lovely rounded-2xl"
                  onClick={applyDiscount}
                >
                  Apply
                </Button>
              </div>
              <div className="mt-2 p-3 rounded-2xl border border-lovely bg-creamey">
                <div className="flex items-center justify-between">
                  <span className="text-lovely">Price</span>
                  <span
                    className={`text-lovely ${subscriptionApplied || (applied && finalPrice !== bookingBasePrice)
                        ? "line-through"
                        : ""
                      }`}
                  >
                    EGP {bookingBasePrice}
                  </span>
                </div>
                {subscriptionApplied && subscriptionFinalPrice !== null && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lovely">
                      Subscription discount (
                      {selectedForBooking.subscriptionDiscountPercentage}%){" "}
                    </span>
                    <span className="text-lovely">
                      EGP {Math.max(0, bookingBasePrice - subscriptionFinalPrice)}
                    </span>
                  </div>
                )}
                {applied && couponFinalPrice !== null && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lovely">
                      Coupon discount ({Math.round((((subscriptionFinalPrice ?? bookingBasePrice) - couponFinalPrice) / (subscriptionFinalPrice ?? bookingBasePrice)) * 100)}%)
                    </span>
                    <span className="text-lovely">
                      EGP {Math.max(0, (subscriptionFinalPrice ?? bookingBasePrice) - couponFinalPrice)}
                    </span>
                  </div>
                )}
                {finalPrice !== null && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-lovely/20">
                    <span className="text-lovely font-medium">Final Price</span>
                    <span className="text-lovely font-semibold">
                      {finalPrice === 0 ? "FREE (EGP 0)" : `EGP ${finalPrice}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              {finalPrice !== null && finalPrice > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-lovely uppercase tracking-wide">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                        paymentMethod === "card"
                          ? "bg-lovely text-creamey border-lovely shadow-md"
                          : "bg-white/60 text-lovely border-lovely/30 hover:border-lovely/50 hover:bg-white"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Card / Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("instapay")}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                        paymentMethod === "instapay"
                          ? "bg-lovely text-creamey border-lovely shadow-md"
                          : "bg-white/60 text-lovely border-lovely/30 hover:border-lovely/50 hover:bg-white"
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      InstaPay
                    </button>
                  </div>

                  {/* InstaPay Instructions & Upload */}
                  {paymentMethod === "instapay" && (
                    <div className="p-3 border border-lovely/20 rounded-xl bg-lovely/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 text-lovely font-semibold">
                        <span className="p-1 bg-lovely/10 rounded-full text-sm">💰</span>
                        <p className="text-xs">InstaPay Instructions</p>
                      </div>
                      <div className="text-[12px] text-lovely space-y-1.5 bg-white/50 p-2.5 rounded-lg border border-lovely/10">
                        <p className="flex gap-1.5">
                          <span className="font-bold text-lovely">1.</span>
                          <span>Open <b>InstaPay</b> app → <b>"Send Money"</b></span>
                        </p>
                        <p className="flex gap-1.5">
                          <span className="font-bold text-lovely">2.</span>
                          <span>Select <b>"Bank Account"</b></span>
                        </p>
                        <p className="flex gap-1.5">
                          <span className="font-bold text-lovely">3.</span>
                          <span>Account: <b className="font-mono text-xs select-all bg-lovely/10 px-1 rounded">15018180131666</b></span>
                        </p>
                        <p className="flex gap-1.5">
                          <span className="font-bold text-lovely">4.</span>
                          <span>Bank: <b>Credit Agricole</b></span>
                        </p>
                        <p className="flex gap-1.5">
                          <span className="font-bold text-lovely">5.</span>
                          <span>Receiver: <b>Wifey</b></span>
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-lovely">Upload Receipt Screenshot</label>
                        <CldUploadWidget
                          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
                          onSuccess={(result: any) => {
                            if (result.info && typeof result.info !== "string") {
                              setInstapayReceipt(result.info.secure_url);
                            }
                          }}
                        >
                          {({ open }) => (
                            <button
                              type="button"
                              onClick={() => open()}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border-2 border-dashed border-lovely/30 text-lovely rounded-xl hover:bg-lovely/5 hover:border-lovely/50 transition-all text-xs font-medium"
                            >
                              <Upload className="w-4 h-4" />
                              {instapayReceipt ? "✓ Receipt Uploaded (Change)" : "📸 Upload Receipt"}
                            </button>
                          )}
                        </CldUploadWidget>

                        {instapayReceipt && (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-lovely/20 mt-1">
                            <Image src={instapayReceipt} alt="InstaPay Receipt" fill className="object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-start gap-2 text-[11px] text-lovely/70 bg-pinkey/30 p-2 rounded-lg">
                        <span className="text-sm">⚠️</span>
                        <p>Your booking will be reviewed by our administration team. Verification may take up to <b>24 hours</b> during business days (Mon–Fri, 5 PM – 11 PM).</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting || (paymentMethod === "instapay" && !instapayReceipt && finalPrice !== null && finalPrice > 0)}
                  className="flex-1 bg-lovely text-creamey rounded-2xl"
                >
                  {submitting
                    ? "Processing..."
                    : finalPrice === 0
                      ? "Book Now"
                      : paymentMethod === "instapay"
                        ? "Submit for Review"
                        : "Proceed to Pay"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-creamey hover:text-lovely hover:bg-creamey/90 border-lovely text-lovely rounded-2xl"
                  onClick={() => setSelectedForBooking(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
            </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ExpertSessions;
