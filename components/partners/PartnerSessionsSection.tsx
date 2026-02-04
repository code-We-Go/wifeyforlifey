"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { thirdFont } from "@/fonts";
import axios from "axios";
import SessionCard from "@/components/shared/SessionCard";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PartnerSession = {
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
};

export default function PartnerSessionsSection() {
  const { data: authSession } = useSession();
  const [sessions, setSessions] = useState<PartnerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PartnerSession | null>(null);
  const [selectedForDetails, setSelectedForDetails] = useState<PartnerSession | null>(null);
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
  const [subscriptionFinalPrice, setSubscriptionFinalPrice] = useState<
    number | null
  >(null);
  const [couponFinalPrice, setCouponFinalPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/partner-sessions");
        const data = await res.json();
        setSessions(data.data || []);
      } catch (e) {
        setSessions([]);
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

  const openModal = (s: PartnerSession) => {
    setSelected(s);
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
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await axios.post("/api/partner-sessions/book", {
        sessionId: selected._id,
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

  const applyDiscount = async () => {
    if (!selected) return;
    const code = form.discountCode.trim();
    if (!code) {
      setApplied(false);
      // If subscription discount is applied, keep that as final price
      if (subscriptionFinalPrice !== null) {
        setFinalPrice(subscriptionFinalPrice);
      } else {
        setFinalPrice(selected.price);
      }
      setError("");
      return;
    }
    try {
      const res = await axios.post("/api/apply-discount", {
        cart: [{ price: selected.price, quantity: 1 }],
        discountCode: code,
        redeemType: "All",
      });
      const total = res.data?.finalTotal;
      if (typeof total === "number") {
        const codePrice = Math.round(total);
        setCouponFinalPrice(codePrice);
        // Determine best price between subscription and coupon
        const baseline = subscriptionFinalPrice ?? selected.price;
        const best = Math.min(codePrice, baseline);
        setApplied(codePrice < baseline);
        setFinalPrice(best);
        setError("");
      } else {
        setApplied(false);
        setCouponFinalPrice(null);
        setFinalPrice(subscriptionFinalPrice ?? selected.price);
        setError("Invalid discount response");
      }
    } catch (e: any) {
      setApplied(false);
      setCouponFinalPrice(null);
      setFinalPrice(subscriptionFinalPrice ?? selected.price);
      const msg =
        e?.response?.data?.error || "Invalid or expired discount code";
      setError(msg);
    }
  };

  return (
    <div className="">
      {/* <h2
        className={`${thirdFont.className} text-2xl font-bold mb-6 text-lovely`}
      >
        Partner Sessions
      </h2> */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lovely mx-auto"></div>
          <p className="mt-4 text-lovely/90">Loading sessions...</p>
        </div>
      ) : sessions.length > 0 ? (
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
                    onDetailsClick={() => setSelectedForDetails(session)}
                    onBookClick={() => openModal(session)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-lovely/90">No sessions available at the moment.</p>
      )}

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
                  openModal(selectedForDetails);
                }}
                className="bg-lovely hover:bg-lovely/90 text-white font-bold rounded-md px-10 md:px-20 py-3 md:py-6"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-creamey rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-lovely mb-2">
              Book: {selected.title}
            </h3>
            <p className="text-sm text-lovely/90 mb-4">
              After your payment is successfully completed, you will receive{" "}
              {selected.partnerName} WhatsApp contact to arrange your session
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
              {/* <div className="flex gap-2">
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
              </div> */}
              <div className="mt-2 p-3 rounded-2xl border border-lovely bg-creamey">
                <div className="flex items-center justify-between">
                  <span className="text-lovely">Price</span>
                  <span
                    className={`text-lovely ${
                      subscriptionApplied ? "line-through" : ""
                    }`}
                  >
                    EGP {selected.price}
                  </span>
                </div>
                {subscriptionApplied && subscriptionFinalPrice !== null && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lovely">
                      Subscribtion discount (
                      {selected.subscriptionDiscountPercentage}%){" "}
                      {/* {authSession?.user?.subscriptionExpiryDate
                        ? `(expires ${new Date(
                            authSession.user.subscriptionExpiryDate
                          ).toLocaleDateString()})`
                        : ""} */}
                    </span>
                    <span className="text-lovely">
                      EGP {Math.max(0, selected.price - subscriptionFinalPrice)}
                    </span>
                  </div>
                )}
                {applied && couponFinalPrice !== null && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lovely">Coupon applied</span>
                    <span className="text-lovely">EGP {couponFinalPrice}</span>
                  </div>
                )}
                {finalPrice !== null && finalPrice !== selected.price && (
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
                  className="flex-1 border-lovely text-lovely rounded-2xl"
                  onClick={() => setSelected(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
