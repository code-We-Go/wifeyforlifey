"use client";

import React, { useState, useEffect } from "react";
import PartnerCard from "./PartnerCard";
import PartnerCardSkeleton from "./PartnerCardSkeleton";
import { thirdFont } from "@/fonts";

interface Partner {
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
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner, index) => (
                <PartnerCard key={index} partner={partner} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
