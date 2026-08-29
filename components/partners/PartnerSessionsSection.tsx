"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { thirdFont } from "@/fonts";
import axios from "axios";
import SessionCard from "@/components/shared/SessionCard";

export type PartnerSessionVariant = {
  _id?: string;
  title: string;
  description: string;
  price: number;
  duration: number;
};

export type PartnerSessionLink = {
  url: string;
  description: string;
};

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
  link?: string;
  meetingLink?: string;
  variants?: PartnerSessionVariant[];
  links?: PartnerSessionLink[];
};

export default function PartnerSessionsSection() {
  const { data: authSession } = useSession();
  const [sessions, setSessions] = useState<PartnerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PartnerSession | null>(null);
  const [selectedForDetails, setSelectedForDetails] = useState<PartnerSession | null>(null);
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
  const [subscriptionFinalPrice, setSubscriptionFinalPrice] = useState<
    number | null
  >(null);
  const [couponFinalPrice, setCouponFinalPrice] = useState<number | null>(null);
  const [autoDiscounts, setAutoDiscounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const [res, discountsRes] = await Promise.all([
          fetch("/api/partner-sessions"),
          fetch("/api/active-discounts?redeemType=Sessions"),
        ]);
        const data = await res.json();
        setSessions(data.data || []);
        const discountsData = await discountsRes.json();
        if (discountsData.success && discountsData.discounts) {
          setAutoDiscounts(discountsData.discounts);
        }
      } catch (e) {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const getSessionDiscountBadge = (session: PartnerSession | null) => {
    if (!session || !autoDiscounts || autoDiscounts.length === 0) return null;
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

  const getSessionBasePrice = (s: PartnerSession, vIndex: number) => {
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

  const openDetails = (s: PartnerSession) => {
    setSelectedForDetails(s);
    setSelectedVariantIndex(0);
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

  const openModal = async (s: PartnerSession, initialVariantIndex = 0) => {
    setSelected(s);
    setSelectedVariantIndex(initialVariantIndex);
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
    if (!selected) return;
    setSelectedVariantIndex(idx);
    const basePrice = getSessionBasePrice(selected, idx);
    const isActiveSubscriber = checkIsActiveSubscriber();
    const subPercent = Number(selected.subscriptionDiscountPercentage || 0);

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
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await axios.post("/api/partner-sessions/book", {
        sessionId: selected._id,
        variantIndex:
          selected.variants && selected.variants.length > 0
            ? selectedVariantIndex
            : undefined,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        discountCode: form.discountCode || undefined,
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
    if (!selected) return;
    const basePrice = getSessionBasePrice(selected, selectedVariantIndex);
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
        // Determine best price between subscription and coupon
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

  const activeDetailsVariant =
    selectedForDetails?.variants && selectedForDetails.variants.length > 0
      ? selectedForDetails.variants[selectedVariantIndex] || selectedForDetails.variants[0]
      : null;

  const activeBookingVariant =
    selected?.variants && selected.variants.length > 0
      ? selected.variants[selectedVariantIndex] || selected.variants[0]
      : null;

  const bookingBasePrice = selected
    ? getSessionBasePrice(selected, selectedVariantIndex)
    : 0;

  return (
    <div className="">
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lovely mx-auto"></div>
          <p className="mt-4 text-lovely/90">Loading sessions...</p>
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-12">
          {sessions.map((session) => (
            <div key={session._id} className="min-w-0">
              <SessionCard
                session={session}
                discountBadge={getSessionDiscountBadge(session)}
                onDetailsClick={() => openDetails(session)}
                onBookClick={() => openModal(session)}
              />
            </div>
          ))}
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
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                        selectedVariantIndex === idx
                          ? "bg-lovely text-creamey border-lovely shadow"
                          : "bg-white/60 text-lovely border-lovely/40 hover:bg-white"
                      }`}
                    >
                      <span>{v.title}</span>
                      <span className="ml-2 text-xs opacity-80">
                        (EGP {v.price} • {v.duration}m)
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

            {/* Links */}
            {selectedForDetails.links && selectedForDetails.links.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-lovely text-lg mb-2">Links:</h4>
                <div className="space-y-2">
                  {selectedForDetails.links.map((link, i) => (
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

            {/* Action Buttons */}
            <div className="flex w-full justify-center gap-3">
              <Button
                onClick={() => {
                  const currIdx = selectedVariantIndex;
                  setSelectedForDetails(null);
                  openModal(selectedForDetails, currIdx);
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-creamey rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-lovely mb-2">
              Book: {activeBookingVariant?.title || selected.title}
            </h3>

            {/* Variant Switcher in Booking Modal */}
            {selected.variants && selected.variants.length > 1 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-lovely uppercase tracking-wide mb-1.5">
                  Selected Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {selected.variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleBookingVariantChange(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                        selectedVariantIndex === idx
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
                : `After your payment is successfully completed, you will receive ${selected.partnerName}'s WhatsApp contact / access link to arrange your session.`}
            </p>

            {/* Links */}
            {selected.links && selected.links.length > 0 && (
              <div className="mb-4">
                <div className="space-y-2">
                  {selected.links.map((link, i) => (
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
                    className={`text-lovely ${
                      subscriptionApplied || (applied && finalPrice !== bookingBasePrice)
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
                      {selected.subscriptionDiscountPercentage}%){" "}
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
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-lovely text-creamey rounded-2xl"
                >
                  {submitting
                    ? "Processing..."
                    : finalPrice === 0
                    ? "Book Now"
                    : "Proceed to Pay"}
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
