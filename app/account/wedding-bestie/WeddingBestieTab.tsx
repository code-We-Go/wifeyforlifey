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
import { ChevronRight, ExternalLink, Package } from "lucide-react";
import { thirdFont } from "@/fonts";

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
      setSubcategories(category.subcategories || []);
      setSelectedSubcategory(null);
      setVendors([]);
    } else {
      // Logic for non-subscribed users is handled in the render phase when hasSubscription is false
    }
  };

  const handleSubcategoryClick = async (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    fetchVendors(subcategory._id);
  };

  const fetchVendors = async (subCategoryID: string) => {
    try {
      setLoadingVendors(true);
      const res = await axios.get(`/api/wedding-planning-vendors?subCategoryID=${subCategoryID}`);
      setVendors(res.data.data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoadingVendors(false);
    }
  };

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
        <Package className="h-16 w-16 text-saga mb-4" />
        <h2 className={`text-2xl font-bold text-saga mb-2 ${thirdFont.className}`}>
          Subscription Required
        </h2>
        <p className="text-saga/80 max-w-md mb-6">
          To access the Wedding Planning Bestie features, you need to subscribe to the Wedding Experience package.
        </p>
        <Link href={`/package/${WEDDING_BESTIE_SLUG}`}>
          <Button className="bg-saga text-creamey hover:bg-saga/80">
            Subscribe Now
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="mt-4 text-saga/60 text-xs"
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

          <div className="flex flex-wrap gap-3">
            {subcategories.map((sub) => (
              <Button
                key={sub._id}
                variant={selectedSubcategory?._id === sub._id ? "default" : "outline"}
                className={selectedSubcategory?._id === sub._id ? "bg-lovely text-creamey" : "border-lovely text-lovely"}
                onClick={() => handleSubcategoryClick(sub)}
              >
                {sub.name}
              </Button>
            ))}
          </div>

          {selectedSubcategory && (
            <div className="mt-8">
              <h3 className={`text-2xl font-bold text-lovely mb-6 ${thirdFont.className}`}>
                {selectedSubcategory.name} Vendors
              </h3>
              
              {loadingVendors ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                  ))}
                </div>
              ) : vendors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vendors.map((vendor) => (
                    <Card key={vendor._id} className="overflow-hidden border-lovely/10 shadow-md">
                      {vendor.images && vendor.images.length > 0 && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={vendor.images[0]}
                            alt={vendor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4 bg-creamey">
                        <h4 className="text-lg font-bold text-lovely mb-1">{vendor.name}</h4>
                        {vendor.price && (
                          <p className="text-sm text-lovely/80 mb-2 font-medium">Starting from: {vendor.price}</p>
                        )}
                        {vendor.notes && (
                          <p className="text-xs text-lovely/60 mb-4 line-clamp-2 italic">
                            &quot;{vendor.notes}&quot;
                          </p>
                        )}
                        {vendor.link && (
                          <Link 
                            href={vendor.link} 
                            target="_blank"
                            className="inline-flex items-center text-sm font-bold text-lovely hover:underline gap-1"
                          >
                            View Portfolio <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-lovely/60">
                  No vendors found for this subcategory yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeddingBestieTab;
