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
import { ChevronRight, ExternalLink, Package, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

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
            <div className="space-y-1">
              <label className="text-xs font-bold text-lovely">Min Price (EGP)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinPrice(val);
                }}
                placeholder="From"
                className="w-32  placeholder:text-pinkey p-2 ml-2 rounded-lg border border-lovely/30 bg-creamey text-lovely focus:outline-none focus:ring-2 focus:ring-lovely/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-lovely">Max Price (EGP)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxPrice(val);
                }}
                placeholder="To"
                className="w-32  placeholder:text-pinkey p-2 ml-2 rounded-lg border border-lovely/30 bg-creamey text-lovely focus:outline-none focus:ring-2 focus:ring-lovely/50"
              />
            </div>
            <Button 
              onClick={handleApplyFilters}
              className="bg-lovely text-creamey hover:bg-lovely/80"
            >
              Apply Filters
            </Button>
            {/* {(minPrice || maxPrice) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setMinPrice(0);
                  setMaxPrice(0);
                  // Trigger fetch with cleared filters
                  if (selectedSubcategory) {
                    setLoadingVendors(true);
                    axios.get(`/api/wedding-planning-vendors?subCategoryID=${selectedSubcategory._id}`)
                      .then(res => setVendors(res.data.data || []))
                      .finally(() => setLoadingVendors(false));
                  } else {
                    fetchAllVendorsForCategory(subcategories);
                  }
                }}
                className="text-lovely/60 hover:text-lovely"
              >
                Clear
              </Button>
            )} */}
          </div>

          <div className="mt-8">
            <h3 className={`text-2xl tracking-wide font-bold text-lovely mb-6 ${thirdFont.className}`}>
              {selectedSubcategory ? `${selectedSubcategory.name} Vendors` : `All ${selectedCategory.name} Vendors`}
            </h3>
            
            {loadingVendors ? (
              <div className="rounded-xl border border-lovely/10 shadow-lg overflow-hidden">
                <Table className="bg-creamey">
                  <TableHeader>
                    <TableRow className="bg-lovely/5 border-lovely/10">
                      <TableHead className="w-16 md:w-20 bg-creamey px-2 md:px-4 py-2 md:py-3 text-[11px] md:text-sm">Image</TableHead>
                      <TableHead className="bg-creamey px-2 md:px-4 py-2 md:py-3 text-[11px] md:text-sm">Name</TableHead>
                      <TableHead className="bg-creamey px-2 md:px-4 py-2 md:py-3 text-[11px] md:text-sm">Price Range</TableHead>
                      <TableHead className="text-right bg-creamey px-2 md:px-4 py-2 md:py-3 text-[11px] md:text-sm">Action</TableHead>
                      <TableHead className="bg-creamey px-2 md:px-4 py-2 md:py-3 text-[11px] md:text-sm">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i} className="border-lovely/10">
                        <TableCell className="px-2 py-2 md:px-4 md:py-3"><Skeleton className="h-8 w-8 md:h-12 md:w-12 rounded-lg" /></TableCell>
                        <TableCell className="px-2 py-2 md:px-4 md:py-3"><Skeleton className="h-4 w-16 md:w-32" /></TableCell>
                        <TableCell className="px-2 py-2 md:px-4 md:py-3"><Skeleton className="h-4 w-12 md:w-24" /></TableCell>
                        <TableCell className="px-2 py-2 md:px-4 md:py-3"><Skeleton className="h-4 w-full max-w-[60px] md:max-w-xs" /></TableCell>
                        <TableCell className="text-right px-2 py-2 md:px-4 md:py-3"><Skeleton className="h-6 w-16 md:h-8 md:w-24 rounded-full ml-auto" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : vendors.length > 0 ? (
              <div className="overflow-auto rounded-xl border border-lovely/10 shadow-lg max-h-[85vh]">
                <Table className="bg-creamey relative border-separate border-spacing-0">
                  <TableHeader className="sticky top-0 z-10 bg-creamey shadow-sm">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-lovely font-bold w-16 md:w-20 bg-creamey border-b border-lovely/10 sticky top-0 px-2 md:px-4 py-2 md:py-3 text-[11px] md:text-sm">Image</TableHead>
                      <TableHead className="text-lovely font-bold bg-creamey border-b border-lovely/10 sticky top-0 px-2 md:px-4 py-2 md:py-3 text-[11px] md:text-sm">Name</TableHead>
                      <TableHead 
                        className="text-lovely font-bold bg-creamey border-b border-lovely/10 sticky top-0 cursor-pointer hover:text-lovely/80 transition-colors px-2 md:px-4 py-2 md:py-3 text-[11px] md:text-sm"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      >
                        <div className="flex items-center gap-1">
                          Price Range
                          {sortOrder === "asc" && <ChevronUp className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                          {sortOrder === "desc" && <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                          {!sortOrder && <ArrowUpDown className="h-2.5 w-2.5 md:h-3 md:w-3 opacity-50" />}
                        </div>
                      </TableHead>
                      <TableHead className="text-lovely font-bold  bg-creamey border-b border-lovely/10 sticky top-0 px-2 md:px-4 py-2 md:py-3 text-[11px] md:text-sm">Link</TableHead>
                      <TableHead className="text-lovely font-bold bg-creamey border-b border-lovely/10 sticky top-0 px-2 md:px-4 py-2 md:py-3 text-[11px] md:text-sm">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor._id} className="border-lovely/10 hover:bg-lovely/5 transition-colors">
                        <TableCell className="px-2 py-2 md:px-4 md:py-3">
                          {vendor.images && vendor.images.length > 0 ? (
                            <div className="relative h-8 w-8 md:h-12 md:w-12 rounded-lg overflow-hidden border border-lovely/10 shadow-sm">
                              <Image
                                src={vendor.images[0]}
                                alt={vendor.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-lovely/10 flex items-center justify-center text-lovely/40 text-[8px] md:text-[10px]">
                              No Image
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-bold text-lovely px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm">{vendor.name}</TableCell>
                        <TableCell className="text-lovely/80 font-medium px-2 py-2 md:px-4 md:py-3 text-[11px] md:text-sm">
                          {(vendor.fromPrice != null || vendor.toPrice != null) ? (
                            (vendor.fromPrice === vendor.toPrice || vendor.fromPrice === 0 || vendor.fromPrice == null)
                              ? `${vendor.toPrice ?? ""} EGP`
                              : `${vendor.fromPrice ? `From ${vendor.fromPrice} ` : ""}${vendor.toPrice ? `To ${vendor.toPrice}` : ""} EGP`
                          ) : "N/A"}
                        </TableCell>
                        <TableCell className="text-right px-2 py-2 md:px-4 md:py-3">
                          {vendor.link && (
                            <Link 
                              href={vendor.link} 
                              target="_blank"
                              className="inline-flex items-center text-[10px] md:text-xs font-bold text-lovely hover:underline gap-1 bg-lovely/10 px-2 py-1 md:px-3 md:py-1.5 rounded-full transition-all hover:bg-lovely/20"
                            >
                              Portfolio <ExternalLink className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            </Link>
                          )}
                        </TableCell>
                        <TableCell className="text-lovely/60 text-[10px] md:text-xs italic max-w-[80px] sm:max-w-xs truncate px-2 py-2 md:px-4 md:py-3">
                          {vendor.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-lovely/60">
                No vendors found yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeddingBestieTab;
