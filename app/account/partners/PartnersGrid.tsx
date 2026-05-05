"use client";

import React, { useState, useEffect } from "react";
import PartnerCard from "./PartnerCard";
import PartnerCardSkeleton from "./PartnerCardSkeleton";
import { thirdFont } from "@/fonts";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Partner {
  _id?: string;
  category: string;
  subCategory: string;
  brand: string;
  offer: string;
  discount: string;
  code: string;
  link: string;
  bookingMethod: string;
  imagePath?: string; // Add optional image path field
}

export default function PartnersGrid() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [userSubs, setUserSubs] = useState<any[]>([]);
  const [allPackages, setAllPackages] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [lockedPartnerPackages, setLockedPartnerPackages] = useState<any[]>([]);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  // Helper to extract string ID from potential $oid object or string
  const extractId = (id: any): string => {
    if (!id) return "";
    if (typeof id === "string") return id;
    if (typeof id === "object" && id.$oid) return id.$oid;
    return String(id);
  };

  // Fetch partners data from API
  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/partners');
        const data = await response.json();
        
        if (data.partners) {
          setPartners(data.partners);
        } else {
          console.error('No partners data found');
          setPartners([]);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  useEffect(() => {
    const fetchSubsAndPackages = async () => {
      if (sessionStatus !== "authenticated" || !session?.user?.email) {
        setLoadingSubs(false);
        return;
      }

      try {
        setLoadingSubs(true);
        // Fetch subscriptions
        const subRes = await fetch(
          `/api/subscriptions/track?email=${encodeURIComponent(
            session.user.email
          )}&all=true`
        );
        if (subRes.ok) {
          const subs = await subRes.json();
          setUserSubs(Array.isArray(subs) ? subs : [subs]);
        }

        // Fetch all active packages
        const pkgRes = await fetch("/api/packages?all=true&active=true");
        if (pkgRes.ok) {
          const pkgs = await pkgRes.json();
          setAllPackages(pkgs.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch subs/packages", error);
      } finally {
        setLoadingSubs(false);
      }
    };

    fetchSubsAndPackages();
  }, [session?.user?.email, sessionStatus]);

  const checkAccess = (partnerId: string) => {
    if (!partnerId) return true;
    if (sessionStatus !== "authenticated") return false;

    const now = Date.now();
    for (const sub of userSubs) {
      if (!sub || !sub.subscribed) continue;

      const isMini =
        String(sub.packageID?._id || sub.packageID) ===
        "68bf6ae9c4d5c1af12cdcd37";
      const isExpired =
        !isMini &&
        sub.expiryDate &&
        new Date(sub.expiryDate).getTime() < now;
      if (isExpired) continue;

      // Check package-level partner access
      const pkg = sub?.packageID; // populated package object
      if (pkg) {
        if (pkg.accessAllPartners) {
          const pkgPartners = Array.isArray(pkg.packagePartners)
            ? pkg.packagePartners
            : [];
          if (
            pkgPartners.some(
              (id: any) => String(extractId(id)) === String(partnerId)
            )
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const getRequiredPackages = (partnerId: string) => {
    return allPackages.filter((pkg) => {
      const pkgPartners = Array.isArray(pkg.packagePartners)
        ? pkg.packagePartners
        : [];
      return pkgPartners.some(
        (id: any) => String(extractId(id)) === String(partnerId)
      );
    });
  };

  const handleLockedPartnerClick = (partnerId: string) => {
    const pkgs = getRequiredPackages(partnerId);
    setLockedPartnerPackages(pkgs);
    setIsLockModalOpen(true);
  };

  // Extract categories and subcategories when partners data changes
  useEffect(() => {
    if (partners.length > 0) {
      // Extract unique categories and subcategories
      const uniqueCategories = Array.from(
        new Set(partners.map((partner) => partner.category))
      ).filter(Boolean);

      const uniqueSubCategories = Array.from(
        new Set(partners.map((partner) => partner.subCategory))
      ).filter(Boolean);

      setCategories(["All", ...uniqueCategories]);
      setSubCategories(["All", ...uniqueSubCategories]);
    }
  }, [partners]);

  // Filter partners based on selected category and subcategory
  const filteredPartners = partners.filter((partner) => {
    const categoryMatch =
      selectedCategory === "All" || partner.category === selectedCategory;
    const subCategoryMatch =
      selectedSubCategory === "All" ||
      partner.subCategory === selectedSubCategory;
    return categoryMatch && subCategoryMatch;
  });

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Reset subcategory when category changes
    if (category !== "All") {
      setSelectedSubCategory("All");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h2
        className={`${thirdFont.className} tracking-normal text-4xl font-semibold text-lovely mb-8`}
      >
        Our Partners
      </h2>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <div className="space-y-2">
          <h3 className="text-lovely font-medium">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category
                    ? "bg-lovely text-creamey"
                    : "bg-creamey text-lovely border border-lovely"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {selectedCategory !== "All" && (
          <div className="space-y-2">
            <h3 className="text-lovely font-medium">Sub-Categories</h3>
            <div className="flex flex-wrap gap-2">
              {subCategories
                .filter(
                  (subCat) =>
                    subCat === "All" ||
                    partners.some(
                      (p) =>
                        p.category === selectedCategory &&
                        p.subCategory === subCat
                    )
                )
                .map((subCategory) => (
                  <button
                    key={subCategory}
                    onClick={() => setSelectedSubCategory(subCategory)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      selectedSubCategory === subCategory
                        ? "bg-lovely text-creamey"
                        : "bg-creamey text-lovely border border-lovely"
                    }`}
                  >
                    {subCategory}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {[...Array(8)].map((_, index) => (
            <PartnerCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          {filteredPartners.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lovely text-lg">
                No partners found with the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPartners.map((partner, index) => {
                const partnerId = extractId(partner._id);
                const isLocked = !checkAccess(partnerId);
                const requiredPkgs = getRequiredPackages(partnerId);
                return (
                  <PartnerCard 
                    key={index} 
                    partner={partner} 
                    isLocked={isLocked}
                    onLockedClick={() => handleLockedPartnerClick(partnerId)}
                    requiredPackages={requiredPkgs}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Lock Guidance Modal */}
      <Dialog open={isLockModalOpen} onOpenChange={setIsLockModalOpen}>
        <DialogContent className="max-w-md bg-creamey rounded-3xl p-8 border-none shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="bg-creamey/30 p-4 rounded-full mb-6">
              <Lock size={40} className="text-lovely" />
            </div>
            <DialogTitle className="text-2xl font-bold text-lovely mb-4">
              Partner Locked
            </DialogTitle>
            <p className="text-lovely/70 mb-8">
              {lockedPartnerPackages.length > 0
                ? "This partner offer is exclusive to our community members. Subscribe to one of the following packages to gain full access:"
                : "This partner offer is exclusive to our community members. Please subscribe to a package to gain full access."}
            </p>

            <div className="w-full space-y-3">
              {lockedPartnerPackages.map((pkg) => (
                <button
                  key={pkg._id}
                  onClick={() => {
                    router.push(`/subscription/${pkg._id}`);
                    setIsLockModalOpen(false);
                  }}
                  className="w-full flex items-center hover:bg-pinkey cursor-pointer justify-between p-4 hover:text-lovely bg-pinkey/80  rounded-2xl border border-lovely/60 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
                      {pkg.imgUrl && (
                        <img
                          src={pkg.imgUrl}
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="font-semibold text-lovely transition-colors">
                      {pkg.name}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-lovely/50" />
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              onClick={() => setIsLockModalOpen(false)}
              className="mt-6 text-lovely/60 hover:text-lovely"
            >
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
