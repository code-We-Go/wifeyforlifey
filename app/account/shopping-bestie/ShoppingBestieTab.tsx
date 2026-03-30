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
  Plus,
  Store,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import { thirdFont } from "@/fonts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { compressImage } from "@/utils/imageCompression";
import { UploadDropzone } from "@/utils/uploadthing";
import { CldImage, CldUploadWidget } from "next-cloudinary";

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
  images?: string[];
  createdAt: string;
}

export interface SubCategoryDoc {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
}

export interface ShoppingBrand {
  _id: string;
  name: string;
  logo?: string;
  /** Raw ObjectId refs to ShoppingSubcategory */
  subCategories: string[];
  /** Enriched sub-category docs (with parent category populated) */
  subCategoryDocs: SubCategoryDoc[];
  /** Flat list of sub-category names, e.g. ["Clothing", "Accessories"] */
  subCategoryNames: string[];
  /** Deduplicated list of parent category names, e.g. ["Fashion", "Beauty"] */
  categories: string[];
  description?: string;
  link: string;
  averageRating: number;  // computed by aggregation
  reviewCount: number;    // computed by aggregation ($size of reviews)
  clicks: number;
  tags: string[];
  isFeatured?: boolean;
  approved?: boolean;
  submittedBy?: string | null;
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
    comment: string,
    images: string[]
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
  const [userImages, setUserImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(userHasRated);
  // Track which reviews the user has already voted on: reviewId -> vote type
  const [votedReviews, setVotedReviews] = useState<Map<string, "helpful" | "notHelpful">>(new Map());

  // Image viewer state
  const [viewerImages, setViewerImages] = useState<string[] | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const openImageViewer = (images: string[], index: number) => {
    if (images && images.length > 0) {
      setViewerImages(images);
      setViewerIndex(index);
    }
  };

  const closeImageViewer = () => {
    setViewerImages(null);
    setViewerIndex(0);
  };

  const handleNextImage = useCallback(() => {
    if (viewerImages && viewerIndex < viewerImages.length - 1) {
      setViewerIndex((prev) => prev + 1);
    }
  }, [viewerImages, viewerIndex]);

  const handlePrevImage = useCallback(() => {
    if (viewerIndex > 0) {
      setViewerIndex((prev) => prev - 1);
    }
  }, [viewerIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!viewerImages) return;
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "ArrowLeft") handlePrevImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewerImages, handleNextImage, handlePrevImage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNextImage();
    }
    if (isRightSwipe) {
      handlePrevImage();
    }
  };

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
      const result = await onSubmitFeedback(brand._id, userRating, userComment, userImages);
      setSubmitted(true);
      setUserRating(0);
      setUserComment("");
      setUserImages([]);
      setShowFeedback(false);
      // Prepend new review to local list
      setReviews((prev) => [result.review, ...prev]);
      onBrandUpdate(brand._id, {
        averageRating: result.averageRating,
        reviewCount: (brand.reviewCount || 0) + 1,
        ...(brand.reviews ? { reviews: [result.review, ...brand.reviews] } : {}),
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
                className="h-full w-full object-cover "
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
            {/* Categories + sub-categories — a brand may belong to many */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {(brand.categories ?? []).map((cat) => (
                <span
                  key={cat}
                  className="text-xs bg-lovely/10 text-lovely px-2 py-0.5 rounded-full font-medium"
                >
                  {cat}
                </span>
              ))}
              {(brand.subCategoryNames ?? []).map((sub) => (
                <span key={sub} className="text-xs text-lovely/60">
                  {sub}
                </span>
              ))}
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
          {brand.description || "No description available"}
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
          {/* <div className="flex items-center gap-1">
            <MousePointerClick className="h-3.5 w-3.5 text-lovely/40" />
            <span>{brand.clicks.toLocaleString()} visits</span>
          </div> */}
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-lovely/40" />
            <span>{brand.reviews?.length ?? brand.reviewCount} reviews</span>
          </div>
        </div>
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
                        <p className="text-xs text-lovely/70 mt-1">{review.comment}</p>
                      )}
                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {review.images.map((imgUrl, i) => (
                            <div key={i} className="relative group cursor-pointer" onClick={() => openImageViewer(review.images!, i)}>
                              <CldImage
                                src={imgUrl}
                                alt="review image"
                                width={120}
                                height={120}
                                className="rounded-lg object-cover w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <div className="bg-white/90 p-1.5 rounded-full text-lovely shadow-sm">
                                  <ZoomIn size={16} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-3">
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
        </div>

        {/* Feedback Form */}
        {showFeedback && !submitted && (
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
            {userImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {userImages.map((imgUrl, i) => (
                  <div key={i} className="relative">
                    <CldImage
                      src={imgUrl}
                      alt="uploaded image"
                      width={80}
                      height={80}
                      className="rounded-lg object-cover w-20 h-20"
                    />
                    <button
                      type="button"
                      onClick={() => setUserImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full p-0.5 shadow-sm border border-red-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "inspoPintrest"}
              onSuccess={(result: any) => {
                if (result?.info?.public_id) {
                  setUserImages((prev) => [...prev, result.info.public_id]);
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex items-center gap-1.5 text-xs text-lovely/70 hover:text-lovely"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Images
                </button>
              )}
            </CldUploadWidget>
            <div className="flex gap-2 mt-2">
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

      </div>

      {/* Full View Image Modal */}
      <Dialog open={!!viewerImages} onOpenChange={(open) => !open && closeImageViewer()}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-hidden">
          <DialogTitle className="sr-only">
            Review Image Preview
          </DialogTitle>
          {viewerImages && (
            <div 
              className="relative w-full h-full flex items-center justify-center touch-none outline-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Close button */}
              <div className="absolute top-4 right-4 z-50 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={closeImageViewer}
                >
                  <X size={24} />
                </Button>
              </div>

              {/* Navigation Buttons */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-40 pointer-events-none">
                <div className="pointer-events-auto">
                  {viewerIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                    >
                      <ChevronLeft size={32} />
                    </Button>
                  )}
                </div>
                <div className="pointer-events-auto">
                  {viewerIndex < viewerImages.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                    >
                      <ChevronRight size={32} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative w-auto h-auto max-w-full max-h-full rounded-lg overflow-hidden flex items-center justify-center select-none bg-black/10 backdrop-blur-sm p-2 sm:p-4">
                <CldImage
                  src={viewerImages[viewerIndex]}
                  alt="Full View"
                  width={1000}
                  height={1000}
                  className="object-contain max-h-[85vh] w-auto animate-in fade-in zoom-in-95 duration-300 pointer-events-none"
                  draggable={false}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Brand Submission Dialog ──────────────────────────────────────────────────

interface CategoryData {
  _id: string;
  name: string;
  subcategories: { _id: string; name: string }[];
}

function BrandSubmissionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    link: "",
    logo: "",
    selectedSubCategories: [] as string[],
    tags: "",
  });

  useEffect(() => {
    if (open && categories.length === 0) {
      axios.get("/api/shopping-bestie/categories").then((res) => {
        setCategories(res.data.data || []);
      });
    }
  }, [open, categories.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedSubCategories.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one sub-category.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/shopping-bestie", {
        ...formData,
        subCategories: formData.selectedSubCategories,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      toast({
        title: "Success! 🎉",
        description: "Your brand suggestion has been submitted for review.",
        variant: "added",
      });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        link: "",
        logo: "",
        selectedSubCategories: [],
        tags: "",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to submit brand suggestion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSubCategory = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSubCategories: prev.selectedSubCategories.includes(id)
        ? prev.selectedSubCategories.filter((sid) => sid !== id)
        : [...prev.selectedSubCategories, id],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-lovely text-creamey hover:bg-lovely/90 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-95 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Suggest a Brand
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-creamey border-lovely/20 max-w-lg w-[95vw] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-lovely flex items-center gap-2">
            <Store className="h-6 w-6" />
            Suggest a New Brand
          </DialogTitle>
          <p className="text-lovely/60 text-sm">
            Know a brand that every wifey should love? Tell us about it!
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name" className="text-lovely font-semibold">Brand Name *</Label>
            <Input
              id="brand-name"
              required
              placeholder="e.g., Wifey Essentials"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/50 border-lovely/20 focus:border-lovely"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-link" className="text-lovely font-semibold">Website/Link *</Label>
            <Input
              id="brand-link"
              required
              type="url"
              placeholder="https://example.com"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="bg-white/50 border-lovely/20 focus:border-lovely"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-desc" className="text-lovely font-semibold">Description (Optional)</Label>
            <Textarea
              id="brand-desc"
              placeholder="What makes this brand special?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white/50 border-lovely/20 focus:border-lovely min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-lovely font-semibold">Categories *</Label>
            <div className="space-y-3 max-h-[200px] overflow-y-auto p-3 rounded-lg border border-lovely/10 bg-white/30">
              {categories.map((cat) => (
                <div key={cat._id} className="space-y-1.5">
                  <p className="text-xs font-bold text-lovely/40 uppercase tracking-widest">{cat.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub._id}
                        type="button"
                        onClick={() => toggleSubCategory(sub._id)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          formData.selectedSubCategories.includes(sub._id)
                            ? "bg-lovely text-creamey border-lovely"
                            : "bg-white/50 text-lovely/70 border-lovely/10 hover:border-lovely/30"
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-tags" className="text-lovely font-semibold">Tags (Optional)</Label>
            <Input
              id="brand-tags"
              placeholder="fashion, jewelry, local (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="bg-white/50 border-lovely/20 focus:border-lovely"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-lovely font-semibold">Logo (Optional)</Label>
            {formData.logo ? (
              <div className="relative inline-block mt-2">
                <img src={formData.logo} alt="Brand logo" className="h-24 w-24 object-cover rounded-xl shadow-sm border border-lovely/20" />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logo: "" })}
                  className="absolute -top-2 -right-2 bg-creamey border border-lovely/20 text-red-500 rounded-full p-1 shadow hover:bg-red-50"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border border-lovely/20 rounded-xl bg-white/50 p-2">
                <UploadDropzone
                  endpoint="mediaUploader"
                  config={{ mode: "auto" }}
                  onBeforeUploadBegin={async (files) => {
                    try {
                      return await Promise.all(
                        files.map(async (file) => {
                          if (file.type.startsWith("image/")) {
                            return await compressImage(file);
                          }
                          return file;
                        })
                      );
                    } catch (error) {
                      console.error("Compression err", error);
                      return files;
                    }
                  }}
                  onClientUploadComplete={(res) => {
                    if (res && res[0] && res[0].url) {
                      setFormData({ ...formData, logo: res[0].url });
                    }
                  }}
                  onUploadError={(error) => {
                    toast({
                      title: "Upload Failed",
                      description: error.message,
                      variant: "destructive",
                    });
                  }}
                  appearance={{
                    uploadIcon: "text-lovely",
                    allowedContent: "text-lovely/90",
                    button: "bg-lovely text-creamey rounded-full px-6 py-2 font-bold hover:bg-lovely/80 transition hover:cursor-pointer",
                    container: "flex text-lovely/80 flex-col items-center gap-2",
                  }}
                />
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-lovely text-creamey hover:bg-lovely/90 h-11 text-base font-bold shadow-lg shadow-lovely/20"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              Submit Brand for Approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);

  useEffect(() => {
    setSelectedSubCategory("All");
  }, [selectedCategory]);

  useEffect(() => {
    axios
      .get("/api/shopping-bestie/categories")
      .then((res) => {
        setCategoriesData(res.data.data || []);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Derive unique category names from fetched categories data
  const categories = [
    "All",
    ...categoriesData.map((c) => c.name).sort(),
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
    comment: string,
    images: string[] = []
  ) => {
    const res = await axios.post(
      `/api/shopping-bestie/${brandId}/review`,
      { rating, comment, images }
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

  // Derive unique subCategory names from fetched categories data when a specific category is selected
  const subCategories = selectedCategory === "All"
    ? []
    : [
        "All",
        ...(categoriesData
          .find((c) => c.name === selectedCategory)
          ?.subcategories.map((s) => s.name)
          .sort() || []),
      ];

  // Client-side search and subcategory filter (categories/sort are server-side via query params)
  const filteredBrands = brands.filter((b) => {
    const matchesSearch = searchQuery
      ? b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.categories ?? []).some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.subCategoryNames ?? []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesSubCats = selectedSubCategory === "All"
      ? true
      : (b.subCategoryNames ?? []).includes(selectedSubCategory);

    return matchesSearch && matchesSubCats;
  });

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
          <div className="mt-4 space-y-4 text-lovely/80 text-sm max-w-3xl leading-relaxed">
            <p>
              These brands aren’t officially recommended or endorsed by Wifey for Lifey 💗✨<br />
              They’re simply a curated list of our community’s go-to favorites!
            </p>
            <p>
              Always do your own research, read reviews, and choose what feels right for you before purchasing 🛍️💭<br />
              Wifey for Lifey isn’t responsible for any issues related to products or services.
            </p>
            <p>
              We just put this list together to make your shopping journey a little easier and way less overwhelming 💕
            </p>
          </div>
        </div>
        <BrandSubmissionDialog />
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

        {/* SubCategory Pills */}
        {selectedCategory !== "All" && subCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-lovely/10 mt-2">
            {subCategories.map((subcat) => (
              <button
                key={subcat}
                onClick={() => setSelectedSubCategory(subcat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedSubCategory === subcat
                    ? "bg-lovely/80 text-creamey shadow-sm"
                    : "bg-white/50 text-lovely/80 hover:bg-lovely/10 border border-lovely/20"
                }`}
              >
                {subcat}
              </button>
            ))}
          </div>
        )}

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
        Ratings &amp; reviews can be submitted by all registered members.
        New brand suggestions will be reviewed and approved by our team.
      </p>
    </div>
  );
}
