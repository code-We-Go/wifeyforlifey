"use client";

import { thirdFont } from "@/fonts";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
// import Link from "next/link"; 
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import SessionCard from "@/components/shared/SessionCard";
import SessionCardSkeleton from "@/components/shared/SessionCardSkeleton";
import useEmblaCarousel from "embla-carousel-react";
import { headerStyle, subHeaderStyle } from "@/app/styles/style";

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
}

const ExpertSessions = () => {
  const { data: authSession } = useSession();
  const [sessions, setSessions] = useState<IPartnerSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Booking State
  const [selectedForDetails, setSelectedForDetails] = useState<IPartnerSession | null>(null);
  const [selectedForBooking, setSelectedForBooking] = useState<IPartnerSession | null>(null);
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

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/partner-sessions");
        const data = await response.json();
        if (data.success) {
          setSessions(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

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


  const openDetailsModal = (s: IPartnerSession) => {
    setSelectedForDetails(s);
  };

  const openBookingModal = (s: IPartnerSession) => {
    setSelectedForBooking(s);
    setError("");
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

    // Auto-apply subscription discount if user has active subscription
    const isActiveSubscriber = !!authSession?.user?.isSubscribed;
    const subPercent = Number(s.subscriptionDiscountPercentage || 0);
    if (isActiveSubscriber && subPercent > 0) {
      const subPrice = Math.max(
        0,
        Math.round(s.price - (s.price * subPercent) / 100)
      );
      setSubscriptionApplied(true);
      setSubscriptionFinalPrice(subPrice);
      setFinalPrice(subPrice);
    } else {
      setFinalPrice(s.price);
    }
  };

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForBooking) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await axios.post("/api/partner-sessions/book", {
        sessionId: selectedForBooking._id,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        discountCode: form.discountCode || undefined,
      });
      const clientSecret = res.data.token;
      const url = `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.NEXT_PUBLIC_PaymobPublicKey}&clientSecret=${clientSecret}`;
      window.location.href = url;
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to start booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-pinkey text-lovely pt-8 md:pt-16 pb-2">
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
            <p className="text-lovely/70 italic text-lg decoration-wavy underline decoration-lovely/30">
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

  return (
    <section className="bg-pinkey text-lovely pt-8 md:pt-16 pb-2 ">
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
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 md:gap-12">
              {sessions.map((session) => (
                <div key={session._id} className="flex-[0_0_45%] md:flex-[0_0_30%] xl:flex-[0_0_22%] min-w-0">
                  <SessionCard
                    session={session}
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
            <p className="text-lovely/70 italic text-lg decoration-wavy underline decoration-lovely/30">
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
                <p className="text-lg text-lovely/70 mb-3">
                  {selectedForDetails.title}
                </p>
                <p className="text-xl font-semibold text-lovely">
                  EGP {selectedForDetails.price}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="font-bold text-lovely text-lg mb-2">Helps you with:</h4>
              <div className="text-base font-medium text-lovely/90 whitespace-pre-line">
                {selectedForDetails.description.split('\n').map((line, i) => (
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
                  setSelectedForDetails(null);
                  openBookingModal(selectedForDetails);
                }}
                className=" bg-lovely hover:bg-lovely/90 text-white font-bold rounded-md px-10 md:px-20 py-3 md:py-6"
              >
                Book Now
              </Button>
              {/* <Button
                variant="outline"
                className="flex-1 border-lovely text-lovely rounded-xl py-5"
                onClick={() => setSelectedForDetails(null)}
              >
                Close
              </Button> */}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedForBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-creamey rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-lovely mb-2">
              Book: {selectedForBooking.title}
            </h3>
            <p className="text-sm text-lovely/90 mb-4">
              After your payment is successfully completed, you will receive{" "}
              {selectedForBooking.partnerName}&apos;s WhatsApp contact to arrange your session
              time.
            </p>

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
              
              <div className="mt-2 p-3 rounded-2xl border border-lovely bg-creamey">
                <div className="flex items-center justify-between">
                  <span className="text-lovely">Price</span>
                  <span
                    className={`text-lovely ${
                      subscriptionApplied ? "line-through" : ""
                    }`}
                  >
                    EGP {selectedForBooking.price}
                  </span>
                </div>
                {subscriptionApplied && subscriptionFinalPrice !== null && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lovely">
                      Subscription discount (
                      {selectedForBooking.subscriptionDiscountPercentage}%){" "}
                    </span>
                    <span className="text-lovely">
                      EGP {Math.max(0, selectedForBooking.price - subscriptionFinalPrice)}
                    </span>
                  </div>
                )}
                {applied && couponFinalPrice !== null && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lovely">Coupon applied</span>
                    <span className="text-lovely">EGP {couponFinalPrice}</span>
                  </div>
                )}
                {finalPrice !== null && finalPrice !== selectedForBooking.price && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lovely font-medium">Final Price</span>
                    <span className="text-lovely font-semibold">
                      EGP {finalPrice}
                    </span>
                  </div>
                )}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-lovely text-creamey rounded-2xl"
                >
                  {submitting ? "Processing..." : "Proceed to Pay"}
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
          </div>
        </div>
      )}
    </section>
  );
};

export default ExpertSessions;
