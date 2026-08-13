"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronLeft, ExternalLink, Package, ArrowUpDown, ChevronUp, ChevronDown, X, Images } from "lucide-react";
import { thirdFont } from "@/fonts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const WEDDING_EXPERIENCE_PACKAGE_ID = "6965e63c6df4503dda02c12b";
const WEDDING_BESTIE_SLUG = "wedding-bestie-planner";

const WeddingBestieTab = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  // Vendor Details Modal state
  const [selectedVendorDetails, setSelectedVendorDetails] = useState<any | null>(null);

  // Lightbox Modal state
  const [lightboxData, setLightboxData] = useState<{
    images: string[];
    currentIndex: number;
    vendorName: string;
  } | null>(null);

  const formatPriceRange = (vendor: any) => {
    if (vendor.fromPrice != null || vendor.toPrice != null) {
      if (vendor.fromPrice === vendor.toPrice || vendor.fromPrice === 0 || vendor.fromPrice == null) {
        return vendor.toPrice ? `${vendor.toPrice} EGP` : "N/A";
      }
      const fromStr = vendor.fromPrice ? `From ${vendor.fromPrice} ` : "";
      const toStr = vendor.toPrice ? `To ${vendor.toPrice} ` : "";
      return `${fromStr}${toStr}EGP`.trim();
    }
    return "N/A";
  };

  const renderVendorLinks = (vendor: any) => {
    const linkList = Array.isArray(vendor.link)
      ? vendor.link.filter(Boolean)
      : vendor.link
      ? [vendor.link]
      : [];

    if (linkList.length === 0) return null;

    const getLinkLabel = (url: string, index: number, total: number) => {
      const lower = url.toLowerCase();
      if (lower.includes("instagram.com")) return "Instagram";
      if (lower.includes("facebook.com")) return "Facebook";
      if (lower.includes("tiktok.com")) return "TikTok";
      if (lower.includes("youtube.com")) return "YouTube";
      if (lower.includes("pinterest.com")) return "Pinterest";
      if (total === 1) return "Portfolio";
      return `Link ${index + 1}`;
    };

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {linkList.map((href: string, idx: number) => (
          <Link
            key={idx}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[11px] md:text-xs font-bold text-lovely hover:underline gap-1 bg-lovely/10 px-3 py-1 rounded-full transition-all hover:bg-lovely/20 whitespace-nowrap"
          >
            {getLinkLabel(href, idx, linkList.length)}
            <ExternalLink className="h-3 w-3" />
          </Link>
        ))}
      </div>
    );
  };

  const openLightbox = (vendor: any, startIdx: number = 0) => {
    const allImgs: string[] = [];
    if (vendor.coverImage) allImgs.push(vendor.coverImage);
    if (Array.isArray(vendor.images)) {
      vendor.images.forEach((img: string) => {
        if (img && !allImgs.includes(img)) {
          allImgs.push(img);
        }
      });
    }

    if (allImgs.length > 0) {
      const validIndex = startIdx >= 0 && startIdx < allImgs.length ? startIdx : 0;
      setLightboxData({
        images: allImgs,
        currentIndex: validIndex,
        vendorName: vendor.name,
      });
    }
  };

  const handleNextImage = () => {
    if (!lightboxData) return;
    setLightboxData((prev) =>
      prev
        ? {
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.images.length,
          }
        : null
    );
  };

  const handlePrevImage = () => {
    if (!lightboxData) return;
    setLightboxData((prev) =>
      prev
        ? {
            ...prev,
            currentIndex:
              (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
          }
        : null
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/categories?type=wedding-planning");
      setCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!session?.user?.email) return false;
    setCheckingSubscription(true);
    try {
      const res = await axios.get(`/api/subscriptions/track?email=${encodeURIComponent(session.user.email)}&all=true`);
      const subscriptions = Array.isArray(res.data) ? res.data : [res.data];
      
      const isValid = subscriptions.some((sub: any) => {
        const pkgId = sub.packageID?._id || sub.packageID;
        const isCorrectPackage = pkgId === WEDDING_EXPERIENCE_PACKAGE_ID;
        const isNotExpired = new Date(sub.expiryDate) > new Date();
        return isCorrectPackage && isNotExpired && sub.subscribed;
      });
      
      setHasSubscription(isValid);
      return isValid;
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasSubscription(false);
      return false;
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleCategoryClick = async (category: any) => {
    const isSubscribed = await checkSubscription();
    if (isSubscribed) {
      setSelectedCategory(category);
      const subs = category.subcategories || [];
      setSubcategories(subs);
      setSelectedSubcategory(null);
      // Fetch all vendors for all subcategories in this category
      fetchAllVendorsForCategory(subs);
    } else {
      // Logic for non-subscribed users is handled in the render phase when hasSubscription is false
    }
  };

  const fetchAllVendorsForCategory = async (subs: any[]) => {
    if (!subs.length) {
      setVendors([]);
      return;
    }
    try {
      setLoadingVendors(true);
      const ids = subs.map((s: any) => s._id).join(",");
      let url = `/api/wedding-planning-vendors?subCategoryIDs=${ids}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (sortOrder) url += `&sortBy=price&sortOrder=${sortOrder}`;
      const res = await axios.get(url);
      setVendors(res.data.data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleSubcategoryClick = async (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    fetchVendors(subcategory._id);
  };

  const handleShowAll = () => {
    setSelectedSubcategory(null);
    fetchAllVendorsForCategory(subcategories);
  };

  const fetchVendors = async (subCategoryID: string) => {
    try {
      setLoadingVendors(true);
      let url = `/api/wedding-planning-vendors?subCategoryID=${subCategoryID}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (sortOrder) url += `&sortBy=price&sortOrder=${sortOrder}`;
      const res = await axios.get(url);
      setVendors(res.data.data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleApplyFilters = () => {
    if (selectedSubcategory) {
      fetchVendors(selectedSubcategory._id);
    } else if (selectedCategory) {
      fetchAllVendorsForCategory(subcategories);
    }
  };

  useEffect(() => {
    if (selectedSubcategory || selectedCategory) {
      handleApplyFilters();
    }
  }, [sortOrder]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (hasSubscription === false) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-saga/10 rounded-2xl border-2 border-saga/20">
        <Package className="h-16 w-16 text-lovely mb-4" />
        <h2 className={`text-2xl font-bold text-lovely mb-2 ${thirdFont.className}`}>
          Subscription Required
        </h2>
        <p className="text-lovely/80 max-w-md mb-6">
          To access the Wedding Planning Bestie features, you need to subscribe to the Wedding Experience package.
        </p>
        <Link href={`/package/${WEDDING_BESTIE_SLUG}`}>
          <Button className="bg-lovely text-creamey hover:bg-lovely/80">
            Subscribe Now
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="mt-4 text-lovely/60 text-xs"
          onClick={() => setHasSubscription(null)}
        >
          Back to categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!selectedCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category._id} 
              className="cursor-pointer overflow-hidden border-none shadow-lg hover:scale-[1.02] transition-transform duration-300"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="relative h-40 w-full">
                <Image
                  src="/patterns/patternPinkey.png"
                  alt={category.name}
                  fill
                  className="object-cover blur-[2px]"
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center p-4 text-center">
                  <h3 className={`text-3xl leading-relaxed lg:text-4xl tracking-wide font-bold text-creamey drop-shadow-md ${thirdFont.className}`}>
                    {category.name}
                  </h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-lovely mb-4">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-sm font-medium hover:underline"
            >
              Wedding Planning Bestie
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-sm font-bold">{selectedCategory.name}</span>
          </div>
          <div className="bg-pinkey/30 border border-lovely/15 rounded-xl p-4 text-[11px] md:text-xs text-lovely/80 leading-relaxed">
            <span className="font-bold text-lovely mr-1">Please note:</span>
            This listed vendor is not a recommendation, it's just to get you started. Prices may not be accurate as vendors have full rights to change their price without notifying anyone, so please take these prices as an estimate and always make your own research for reviews.
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={!selectedSubcategory ? "default" : "outline"}
              className={!selectedSubcategory ? "bg-lovely text-creamey" : "border-lovely hover:bg-pinkey hover:text-lovely text-lovely"}
              onClick={handleShowAll}
            >
              All
            </Button>
            {subcategories.map((sub) => (
              <Button
                key={sub._id}
                variant={selectedSubcategory?._id === sub._id ? "default" : "outline"}
                className={selectedSubcategory?._id === sub._id ? "bg-lovely text-creamey" : "border-lovely bg-creamey hover:bg-pinkey hover:text-lovely text-lovely"}
                onClick={() => handleSubcategoryClick(sub)}
              >
                {sub.name}
              </Button>
            ))}
          </div>

          <div className="bg-pinkey/50 p-4 rounded-xl border border-lovely/20 flex flex-wrap items-end gap-4">
            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-lovely">Search Vendor Name</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor by name..."
                className="w-full placeholder:text-pinkey p-2 rounded-lg border border-lovely/30 bg-creamey text-lovely focus:outline-none focus:ring-2 focus:ring-lovely/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-lovely">Min Price (EGP)</label>
              <input
                type="number"
                value={minPrice || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinPrice(val);
                }}
                placeholder="From"
                className="w-32 placeholder:text-pinkey p-2 rounded-lg border border-lovely/30 bg-creamey text-lovely focus:outline-none focus:ring-2 focus:ring-lovely/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-lovely">Max Price (EGP)</label>
              <input
                type="number"
                value={maxPrice || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxPrice(val);
                }}
                placeholder="To"
                className="w-32 placeholder:text-pinkey p-2 rounded-lg border border-lovely/30 bg-creamey text-lovely focus:outline-none focus:ring-2 focus:ring-lovely/50"
              />
            </div>
            <Button 
              onClick={handleApplyFilters}
              className="bg-lovely text-creamey hover:bg-lovely/80"
            >
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc")}
              className="border-lovely/30 bg-creamey text-lovely hover:bg-pinkey flex items-center gap-1.5 text-xs font-semibold h-10 px-3"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>
                Price: {sortOrder === "asc" ? "Low to High" : sortOrder === "desc" ? "High to Low" : "Default"}
              </span>
            </Button>
            {(searchQuery || minPrice > 0 || maxPrice > 0 || sortOrder !== null) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchQuery("");
                  setMinPrice(0);
                  setMaxPrice(0);
                  setSortOrder(null);
                  if (selectedSubcategory) {
                    fetchVendors(selectedSubcategory._id);
                  } else if (selectedCategory) {
                    fetchAllVendorsForCategory(subcategories);
                  }
                }}
                className="text-lovely/70 hover:text-lovely"
              >
                Clear
              </Button>
            )}
          </div>

          {(() => {
            const filteredVendors = vendors.filter((v) =>
              searchQuery.trim()
                ? v.name?.toLowerCase().includes(searchQuery.toLowerCase().trim())
                : true
            );

            return (
              <div className="mt-8">
                <h3 className={`text-xl md:text-2xl tracking-wide font-bold text-lovely uppercase mb-6 ${thirdFont.className}`}>
                  {selectedSubcategory ? `${selectedSubcategory.name} Vendors` : `All ${selectedCategory.name} Vendors`}
                  {filteredVendors.length !== vendors.length && (
                    <span className="text-sm font-normal text-lovely/70 ml-2">
                      ({filteredVendors.length} of {vendors.length} shown)
                    </span>
                  )}
                </h3>
                
                {loadingVendors ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-pinkey/20 border border-lovely/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Skeleton className="h-24 w-24 rounded-2xl flex-shrink-0" />
                        <div className="space-y-2 flex-1 w-full">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-9 w-24 rounded-full sm:self-center" />
                      </div>
                    ))}
                  </div>
                ) : filteredVendors.length > 0 ? (
                  <div className="space-y-4">
                    {filteredVendors.map((vendor) => {
                      const coverImg = vendor.coverImage || (vendor.images && vendor.images[0]);

                      return (
                        <div
                          key={vendor._id}
                          className="bg-pinkey/20 border border-lovely/15 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-lovely/30 transition-all duration-200"
                        >
                          {/* Left Info Section */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Cover / Logo Image */}
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden border border-lovely/20 bg-pinkey/30 flex items-center justify-center">
                              {coverImg ? (
                                <Image
                                  src={coverImg}
                                  alt={vendor.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-lovely/40 text-[10px] sm:text-xs font-medium">
                                  No Cover
                                </span>
                              )}
                            </div>

                            {/* Content */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <h4 className="text-base sm:text-lg md:text-xl font-bold text-lovely truncate">
                                {vendor.name}
                              </h4>

                              <div className="text-xs sm:text-sm text-lovely/90 font-medium">
                                <span className="font-bold text-lovely">Price Range: </span>
                                {formatPriceRange(vendor)}
                              </div>

                              {renderVendorLinks(vendor)}
                            </div>
                          </div>

                          {/* Right Action Section */}
                          <div className="flex items-center justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-lovely/10">
                            <Button
                              type="button"
                              onClick={() => setSelectedVendorDetails(vendor)}
                              className="bg-lovely text-creamey hover:bg-lovely/80 rounded-full px-5 py-2 text-xs font-bold shadow-sm transition-all"
                            >
                              See More
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-creamey rounded-xl border border-lovely/10">
                    <p className="text-lovely/60">No vendors found matching your criteria.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ─── Vendor Details Modal ("See More") ────────────────────────────────────── */}
      {selectedVendorDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-creamey border-2 border-lovely/30 rounded-2xl max-w-2xl w-full p-5 md:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-lovely/15 pb-4">
              <div className="space-y-1">
                <h3 className={`text-2xl font-bold text-lovely ${thirdFont.className}`}>
                  {selectedVendorDetails.name}
                </h3>
                <div className="text-xs md:text-sm text-lovely/80 font-medium">
                  <span className="font-bold text-lovely">Price Range: </span>
                  {formatPriceRange(selectedVendorDetails)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedVendorDetails(null)}
                className="text-lovely hover:bg-lovely/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* External Links */}
            {renderVendorLinks(selectedVendorDetails) && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-lovely uppercase tracking-wider">Links</h4>
                {renderVendorLinks(selectedVendorDetails)}
              </div>
            )}

            {/* Images Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-lovely uppercase tracking-wider flex items-center gap-1.5">
                <Images className="w-4 h-4" /> Images
              </h4>
              {(() => {
                const allImgs: string[] = [];
                if (selectedVendorDetails.coverImage) allImgs.push(selectedVendorDetails.coverImage);
                if (Array.isArray(selectedVendorDetails.images)) {
                  selectedVendorDetails.images.forEach((img: string) => {
                    if (img && !allImgs.includes(img)) allImgs.push(img);
                  });
                }

                if (allImgs.length === 0) {
                  return (
                    <div className="p-4 bg-pinkey/20 rounded-xl text-center text-xs text-lovely/60">
                      No images available for this vendor.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {allImgs.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => openLightbox(selectedVendorDetails, idx)}
                        className="relative aspect-square rounded-xl overflow-hidden border border-lovely/20 group hover:ring-2 hover:ring-lovely focus:outline-none transition-all cursor-pointer"
                        title="Click to expand image"
                      >
                        <Image
                          src={img}
                          alt={`${selectedVendorDetails.name} ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Package Section */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-lovely uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4" /> Package Details
              </h4>
              <div className="bg-pinkey/30 border border-lovely/15 rounded-xl p-4 text-xs md:text-sm text-lovely/90 whitespace-pre-line leading-relaxed min-h-[60px]">
                {selectedVendorDetails.package || "No package details provided."}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-lovely uppercase tracking-wider">
                Notes
              </h4>
              <div className="bg-pinkey/20 border border-lovely/15 rounded-xl p-4 text-xs md:text-sm text-lovely/80 italic leading-relaxed min-h-[50px]">
                {selectedVendorDetails.notes || "No notes available."}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setSelectedVendorDetails(null)}
                className="bg-lovely text-creamey hover:bg-lovely/80 rounded-full px-6 text-xs font-bold"
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ─── Image Lightbox Popup Modal ────────────────────────────────────── */}
      {lightboxData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-creamey border-2 border-lovely/30 rounded-2xl max-w-3xl w-full p-4 md:p-6 shadow-2xl flex flex-col items-center gap-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-lovely/10 pb-3">
              <div>
                <h3 className={`text-xl font-bold text-lovely ${thirdFont.className}`}>
                  {lightboxData.vendorName}
                </h3>
                <p className="text-xs text-lovely/70 font-medium">
                  Image {lightboxData.currentIndex + 1} of {lightboxData.images.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLightboxData(null)}
                className="text-lovely hover:bg-lovely/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Main Image Display */}
            <div className="relative w-full aspect-video sm:aspect-[16/10] max-h-[60vh] rounded-xl overflow-hidden bg-black/5 border border-lovely/20 flex items-center justify-center">
              <Image
                src={lightboxData.images[lightboxData.currentIndex]}
                alt={`${lightboxData.vendorName} Image ${lightboxData.currentIndex + 1}`}
                fill
                className="object-contain"
              />

              {/* Previous Button */}
              {lightboxData.images.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-creamey/90 text-lovely p-2 rounded-full shadow-lg border border-pinkey hover:bg-lovely hover:text-creamey transition-all"
                  title="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Button */}
              {lightboxData.images.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-creamey/90 text-lovely p-2 rounded-full shadow-lg border border-pinkey hover:bg-lovely hover:text-creamey transition-all"
                  title="Next Image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Thumbnails Bar */}
            {lightboxData.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
                {lightboxData.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setLightboxData((prev) => (prev ? { ...prev, currentIndex: idx } : null))
                    }
                    className={`relative w-12 h-12 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                      idx === lightboxData.currentIndex
                        ? "border-lovely scale-105 shadow-md"
                        : "border-pinkey/50 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="Thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeddingBestieTab;
