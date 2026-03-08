"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  X,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  MousePointerClick,
  Send,
  Tag,
  Sparkles,
  Filter,
  RefreshCw,
} from "lucide-react";
import { thirdFont } from "@/fonts";
import { Button } from "@/components/ui/button";
import axios from "axios";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VoterInfo {
  userId: string;
  displayName: string;
}

export interface BrandReview {
  _id: string;
  userId: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  comment?: string;
  rating: number;
  helpful: string[];         // raw userId array (for length / toggle tracking)
  notHelpful: string[];      // raw userId array
  helpfulVoters?: VoterInfo[];    // enriched voter names from API
  notHelpfulVoters?: VoterInfo[]; // enriched voter names from API
  createdAt: string;
}

export interface ShoppingBrand {
  _id: string;
  name: string;
  logo?: string;
  category: string;
  subCategory: string;
  description: string;
  link: string;
  averageRating: number;  // computed by aggregation in GET /api/shopping-bestie
  reviewCount: number;    // computed by aggregation ($size of reviews array)
  clicks: number;
  tags: string[];
  isFeatured?: boolean;
  reviews?: BrandReview[];
}

// ─── Voter Popover ──────────────────────────────────────────────────────────

function VoterPopover({
  count,
  voters,
  type,
}: {
  count: number;
  voters: VoterInfo[];
  type: "helpful" | "notHelpful";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (count === 0) {
    return <span className="text-xs tabular-nums">{count}</span>;
  }

  const accent = type === "helpful" ? "text-green-400" : "text-red-400";
  const borderColor = type === "helpful" ? "border-green-400/30" : "border-red-400/30";
  const bgColor = type === "helpful" ? "bg-green-400/10" : "bg-red-400/10";

  return (
    <div ref={ref} className="relative bg-creamey inline-flex">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className={`text-xs tabular-nums underline decoration-dotted underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity ${accent}`}
      >
        {count}
      </button>
      {open && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[140px] max-w-[200px] rounded-xl border ${borderColor} text-lovely bg-creamey shadow-xl p-2`}
        >
          <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 px-1 ${accent}`}>
            {type === "helpful" ? "👍 Helpful" : "👎 Not Helpful"}
          </p>
          <ul className="space-y-0.5">
            {voters.length > 0 ? (
              voters.map((v) => (
                <li key={v.userId} className="text-xs text-lovely truncate px-1 py-0.5 rounded hover:bg-white/5">
                  {v.displayName}
                </li>
              ))
            ) : (
              <li className="text-xs text-lovely/60 px-1">No names available</li>
            )}
          </ul>
          {/* Caret */}
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0`}
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `5px solid ${type === "helpful" ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Star Rating Display ─────────────────────────────────────────────────────

function StarRatingDisplay({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconClass} ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Interactive Star Rating Input ──────────────────────────────────────────

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Brand Card ─────────────────────────────────────────────────────────────

interface BrandCardProps {
  brand: ShoppingBrand;
  isSubscribed: boolean;
  userHasRated: boolean;
  onLinkClick: (brandId: string) => void;
  onSubmitFeedback: (
    brandId: string,
    rating: number,
    comment: string
  ) => Promise<{ averageRating: number; review: BrandReview }>;
  onBrandUpdate: (brandId: string, patch: Partial<ShoppingBrand>) => void;
}

function BrandCard({
  brand,
  isSubscribed,
  userHasRated,
  onLinkClick,
  onSubmitFeedback,
  onBrandUpdate,
}: BrandCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<BrandReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(userHasRated);
  // Track which reviews the user has already voted on: reviewId -> vote type
  const [votedReviews, setVotedReviews] = useState<Map<string, "helpful" | "notHelpful">>(new Map());

  const loadReviews = async () => {
    if (reviews.length > 0) return; // already loaded
    setLoadingReviews(true);
    try {
      const res = await axios.get(
        `/api/shopping-bestie/${brand._id}/review?limit=40`
      );
      setReviews(res.data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleVote = async (reviewId: string, vote: "helpful" | "notHelpful") => {
    const currentVote = votedReviews.get(reviewId);
    const opposite = vote === "helpful" ? "notHelpful" : "helpful";
    const isTogglingOff = currentVote === vote;
    const isSwitching = currentVote && currentVote !== vote;

    // Optimistic UI update — work with arrays
    setReviews((prev) =>
      prev.map((r) => {
        if (r._id !== reviewId) return r;
        const fakeId = "optimistic";
        if (isTogglingOff) {
          return { ...r, [vote]: r[vote].filter((id) => id !== fakeId) };
        }
        return {
          ...r,
          [vote]: [...r[vote], fakeId],
          ...(isSwitching ? { [opposite]: r[opposite].filter((id) => id !== fakeId) } : {}),
        };
      })
    );

    if (isTogglingOff) {
      setVotedReviews((prev) => { const next = new Map(prev); next.delete(reviewId); return next; });
    } else {
      setVotedReviews((prev) => new Map(prev).set(reviewId, vote));
    }

    try {
      const res = await axios.post(
        `/api/shopping-bestie/${brand._id}/review/${reviewId}/vote`,
        { vote }
      );
      // Sync with real server counts
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                helpful: Array.from({ length: res.data.helpful }, (_, i) => `srv_${i}`),
                notHelpful: Array.from({ length: res.data.notHelpful }, (_, i) => `srv_${i}`),
              }
            : r
        )
      );
      if (res.data.userVote === null) {
        setVotedReviews((prev) => { const next = new Map(prev); next.delete(reviewId); return next; });
      }
    } catch {
      // Rollback on failure — refetch reviews
      setReviews([]);
      loadReviews();
      setVotedReviews((prev) => { const next = new Map(prev); next.delete(reviewId); return next; });
    }
  };

  const handleToggleReviews = () => {
    if (!showReviews) loadReviews();
    setShowReviews((v) => !v);
  };

  const handleSubmit = async () => {
    if (!userRating) return;
    setSubmitting(true);
    try {
      const result = await onSubmitFeedback(brand._id, userRating, userComment);
      setSubmitted(true);
      setUserRating(0);
      setUserComment("");
      setShowFeedback(false);
      // Prepend new review to local list
      setReviews((prev) => [result.review, ...prev]);
      onBrandUpdate(brand._id, {
        averageRating: result.averageRating,
      });
    } catch (err: any) {
      // Already reviewed or other error – surface through toast if possible
      console.error("Review error:", err?.response?.data?.error);
      if (err?.response?.status === 409) {
        setSubmitted(true); // mark as already rated
        setShowFeedback(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden bg-white/5 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-lovely/10 group ${
        brand.isFeatured
          ? "border-lovely/40 ring-1 ring-lovely/20"
          : "border-lovely/15"
      }`}
    >
      {/* Featured Badge */}
      {brand.isFeatured && (
        <div className="bg-lovely text-creamey text-xs font-semibold px-3 py-1 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Bestie&apos;s Pick
        </div>
      )}

      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-lovely/10 flex items-center justify-center border border-lovely/20 shadow-sm">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-lovely text-lg font-bold">
                {brand.name[0]}
              </span>
            )}
          </div>

          {/* Brand Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lovely font-bold text-lg leading-tight truncate">
              {brand.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs bg-lovely/10 text-lovely px-2 py-0.5 rounded-full font-medium">
                {brand.category}
              </span>
              <span className="text-xs text-lovely/60">{brand.subCategory}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <StarRatingDisplay rating={brand.averageRating} />
              <span className="text-xs text-lovely/70 font-medium">
                {brand.averageRating > 0 ? brand.averageRating.toFixed(1) : "–"}
              </span>
              <span className="text-xs text-lovely/40">
                ({brand.reviews?.length ?? brand.reviewCount} ratings)
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-lovely/70 text-sm mb-3 line-clamp-2">
          {brand.description}
        </p>

        {/* Tags */}
        {brand.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {brand.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs flex items-center gap-1 text-lovely/70 border border-lovely/15 px-2 py-0.5 rounded-full"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-4 text-xs text-lovely/50">
          <div className="flex items-center gap-1">
            <MousePointerClick className="h-3.5 w-3.5 text-lovely/40" />
            <span>{brand.clicks.toLocaleString()} visits</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-lovely/40" />
            <span>{brand.reviews?.length ?? brand.reviewCount} reviews</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={brand.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onLinkClick(brand._id)}
            className="flex-1 min-w-0 flex items-center justify-center gap-2 py-2.5 px-4 bg-lovely text-creamey rounded-xl text-sm font-semibold hover:bg-lovely/90 transition-all duration-200 group-hover:shadow-md"
          >
            <ShoppingBag className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Visit Store</span>
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
          </a>

          {isSubscribed && (
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              disabled={submitted}
              className={`flex items-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                submitted
                  ? "border-lovely/40 text-lovely/70 cursor-default"
                  : showFeedback
                  ? "bg-lovely/10 border-lovely text-lovely"
                  : "border-lovely/30 text-lovely/70 hover:border-lovely hover:text-lovely"
              }`}
            >
              <Star className="h-4 w-4" />
              {submitted ? "✓ Rated" : "Rate"}
            </button>
          )}
        </div>

        {/* Feedback Form */}
        {isSubscribed && showFeedback && !submitted && (
          <div className="mt-4 p-4 rounded-xl bg-lovely/5 border border-lovely/15 space-y-3">
            <p className="text-sm font-semibold text-lovely">
              Leave your review
            </p>
            <StarRatingInput value={userRating} onChange={setUserRating} />
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Share your experience with this brand (optional)"
              rows={3}
              className="w-full bg-transparent border border-lovely/20 rounded-lg p-2.5 text-sm text-lovely placeholder-lovely/40 focus:outline-none focus:border-lovely/50 resize-none"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!userRating || submitting}
                className="flex-1 bg-lovely text-creamey hover:bg-lovely/90 h-9 text-sm"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    Submit Review
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowFeedback(false)}
                className="text-lovely/70 hover:text-lovely h-9 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Reviews Toggle */}
        {(brand.reviews?.length ?? brand.reviewCount) > 0 && (
          <div className="mt-4">
            <button
              onClick={handleToggleReviews}
              className="flex items-center gap-1.5 text-xs text-lovely/60 hover:text-lovely mb-2 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {showReviews ? "Hide" : "Show"} reviews
              {showReviews ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showReviews && (
              <div className="space-y-2">
                {loadingReviews ? (
                  <div className="text-xs text-lovely/40 py-2">
                    Loading reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-xs text-lovely/40 py-2">
                    No reviews yet. Be the first!
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review._id}
                      className="p-3 rounded-lg bg-lovely/5 border border-lovely/10"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-lovely">
                          {review.firstName
                            ? `${review.firstName}${review.lastName ? " " + review.lastName : ""}`
                            : review.userName}
                        </span>
                        <div className="flex items-center gap-1">
                          <StarRatingDisplay rating={review.rating} />
                          <span className="text-xs text-lovely/40 ml-1">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-lovely/70">{review.comment}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {/* Helpful vote button + clickable count popover */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleVote(review._id, "helpful")}
                            disabled={votedReviews.has(review._id)}
                            className={`flex items-center gap-1 text-xs transition-colors disabled:cursor-default ${
                              votedReviews.get(review._id) === "helpful"
                              ? "text-lovely-500"
                                : "text-lovely/50 hover:text-lovely"
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <VoterPopover
                            count={review.helpful.length}
                            voters={review.helpfulVoters ?? []}
                            type="helpful"
                          />
                        </div>

                        {/* Not-helpful vote button + clickable count popover */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleVote(review._id, "notHelpful")}
                            disabled={votedReviews.has(review._id)}
                            className={`flex items-center gap-1 text-xs transition-colors disabled:cursor-default ${
                              votedReviews.get(review._id) === "notHelpful"
                                ? "text-red-400"
                                : "text-lovely/50 hover:text-lovely"
                            }`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                          <VoterPopover
                            count={review.notHelpful.length}
                            voters={review.notHelpfulVoters ?? []}
                            type="notHelpful"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface ShoppingBestieTabProps {
  isSubscribed: boolean;
}

export default function ShoppingBestieTab({
  isSubscribed,
}: ShoppingBestieTabProps) {
  const [brands, setBrands] = useState<ShoppingBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "visits" | "default">(
    "default"
  );
  const [ratedBrands, setRatedBrands] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Derived categories from loaded data
  const categories = [
    "All",
    ...Array.from(new Set(brands.map((b) => b.category))),
  ];

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (sortBy !== "default") params.set("sort", sortBy);

      const res = await axios.get(`/api/shopping-bestie?${params.toString()}`);
      setBrands(res.data.data || []);
    } catch (err) {
      setError("Failed to load brands. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleLinkClick = async (brandId: string) => {
    // Optimistic update
    setBrands((prev) =>
      prev.map((b) =>
        b._id === brandId ? { ...b, clicks: b.clicks + 1 } : b
      )
    );
    // Fire-and-forget to the API
    axios
      .post(`/api/shopping-bestie/${brandId}/click`)
      .catch(() => {/* OK to fail silently */});
  };

  const handleSubmitFeedback = async (
    brandId: string,
    rating: number,
    comment: string
  ) => {
    const res = await axios.post(
      `/api/shopping-bestie/${brandId}/review`,
      { rating, comment }
    );
    setRatedBrands((prev) =>
      new Set(Array.from(prev).concat(brandId))
    );
    return res.data; // { review, averageRating, totalRatings }
  };

  const handleBrandUpdate = (brandId: string, patch: Partial<ShoppingBrand>) => {
    setBrands((prev) =>
      prev.map((b) => (b._id === brandId ? { ...b, ...patch } : b))
    );
  };

  // Client-side search (categories/sort are server-side via query params)
  const filteredBrands = searchQuery
    ? brands.filter(
        (b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : brands;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2
            className={`${thirdFont.className} text-3xl font-bold text-lovely tracking-normal`}
          >
            Shopping Bestie 🛍️
          </h2>
          <p className="text-lovely/60 text-sm mt-1">
            Handpicked brands every wifey should know about
          </p>
        </div>
        {!isSubscribed && (
          <div className="bg-lovely/10 border border-lovely/30 rounded-xl px-4 py-2 text-lovely text-sm font-medium">
            Subscribe to rate &amp; review brands ✨
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-lovely/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands, categories, or tags..."
            className="w-full bg-transparent border border-lovely/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-lovely placeholder-lovely/40 focus:outline-none focus:border-lovely/50 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-lovely text-creamey shadow-sm"
                  : "bg-lovely/10 text-lovely hover:bg-lovely/20 border border-lovely/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-xs text-lovely/60">
          <span className="font-medium">Sort by:</span>
          {(["default", "rating", "visits"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`px-3 py-1 rounded-full border transition-all ${
                sortBy === opt
                  ? "border-lovely text-lovely bg-lovely/10"
                  : "border-lovely/20 hover:border-lovely/40"
              }`}
            >
              {opt === "default"
                ? "Featured"
                : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-lovely/10 p-5 space-y-3 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-xl bg-lovely/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-lovely/10 rounded w-3/4" />
                  <div className="h-3 bg-lovely/10 rounded w-1/2" />
                  <div className="h-3 bg-lovely/10 rounded w-1/3" />
                </div>
              </div>
              <div className="h-3 bg-lovely/10 rounded w-full" />
              <div className="h-3 bg-lovely/10 rounded w-5/6" />
              <div className="h-10 bg-lovely/10 rounded-xl w-full mt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-14 w-14 text-lovely/20 mx-auto mb-4" />
          <p className="text-lovely/50 font-medium mb-3">{error}</p>
          <Button
            onClick={fetchBrands}
            className="bg-lovely text-creamey hover:bg-lovely/90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-14 w-14 text-lovely/20 mx-auto mb-4" />
          <p className="text-lovely/50 font-medium">
            No brands found. Try a different filter or search term.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-lovely/40 font-medium">
            Showing {filteredBrands.length} brand
            {filteredBrands.length !== 1 ? "s" : ""}
            {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredBrands.map((brand) => (
              <BrandCard
                key={brand._id}
                brand={brand}
                isSubscribed={isSubscribed}
                userHasRated={ratedBrands.has(brand._id)}
                onLinkClick={handleLinkClick}
                onSubmitFeedback={handleSubmitFeedback}
                onBrandUpdate={handleBrandUpdate}
              />
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-lovely/30 pb-4">
        Ratings &amp; reviews can only be submitted once per brand by subscribed
        members.
      </p>
    </div>
  );
}
