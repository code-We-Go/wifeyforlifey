"use client";

import React, { useState, useEffect } from "react";
import FavoriteCard from "./FavoriteCard";
import FavoriteCardSkeleton from "./FavoriteCardSkeleton";
import { thirdFont } from "@/fonts";
import { Slider } from "@/components/ui/slider";

interface IFavorite {
  _id: string;
  title: string;
  image: string;
  link: string;
  clickCount: number;
  category: string;
  subCategory: string;
  brand: string;
  price?: number;
  maxPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function FavoritesGrid() {
  const [favorites, setFavorites] = useState<IFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [maxPriceValue, setMaxPriceValue] = useState<number>(100000);

  // Fetch favorites data from API
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const response = await fetch("/api/favorites");
        const data = await response.json();

        if (!response.ok || data.error) {
          setApiError(data.error ?? "Failed to fetch favorites");
          setFavorites([]);
          return;
        }

        if (data.favorites) {
          setFavorites(data.favorites);

          // Find the maximum price for the slider
          const pricesArray = data.favorites
            .map((fav: IFavorite) => {
              const price = fav.maxPrice && fav.maxPrice > 0 ? fav.maxPrice : fav.price;
              return price && price > 0 ? price : null;
            })
            .filter((price: number | null): price is number => price !== null);

          const maxPrice = pricesArray.length > 0 ? Math.max(...pricesArray) : 1000000;
          setMaxPriceValue(maxPrice);
          setPriceRange([0, maxPrice]);
        } else {
          console.error("No favorites data found");
          setFavorites([]);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setApiError("Something went wrong. Please try again later.");
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Extract categories and subcategories when favorites data changes
  useEffect(() => {
    if (favorites.length > 0) {
      // Extract unique categories and subcategories
      const uniqueCategories = Array.from(
        new Set(favorites.map((favorite) => favorite.category))
      ).filter(Boolean);

      const uniqueSubCategories = Array.from(
        new Set(favorites.map((favorite) => favorite.subCategory))
      ).filter(Boolean);

      setCategories(["All", ...uniqueCategories]);
      setSubCategories(["All", ...uniqueSubCategories]);
    }
  }, [favorites]);

  // Update max price when category or subcategory changes
  useEffect(() => {
    if (favorites.length > 0) {
      // Filter favorites by category and subcategory (without price filter)
      const categoryFilteredFavorites = favorites.filter((favorite) => {
        const categoryMatch =
          selectedCategory === "All" || favorite.category === selectedCategory;
        const subCategoryMatch =
          selectedSubCategory === "All" ||
          favorite.subCategory === selectedSubCategory;
        return categoryMatch && subCategoryMatch;
      });

      // Calculate max price from filtered items
      const pricesArray = categoryFilteredFavorites
        .map((fav: IFavorite) => {
          const price = fav.maxPrice && fav.maxPrice > 0 ? fav.maxPrice : fav.price;
          return price && price > 0 ? price : null;
        })
        .filter((price: number | null): price is number => price !== null);

      const maxPrice = pricesArray.length > 0 ? Math.max(...pricesArray) : 1000000;
      setMaxPriceValue(maxPrice);
      setPriceRange([0, maxPrice]);
    }
  }, [favorites, selectedCategory, selectedSubCategory]);

  // Filter favorites based on selected category, subcategory, and price range
  const filteredFavorites = favorites.filter((favorite) => {
    const categoryMatch =
      selectedCategory === "All" || favorite.category === selectedCategory;
    const subCategoryMatch =
      selectedSubCategory === "All" ||
      favorite.subCategory === selectedSubCategory;

    // If the slider covers the full range, skip price filtering entirely
    const isFullPriceRange =
      priceRange[0] === 0 && priceRange[1] >= maxPriceValue;
    if (isFullPriceRange) {
      return categoryMatch && subCategoryMatch;
    }

    // Price filtering logic
    const hasPrice = (favorite.price ?? 0) > 0;
    const hasMaxPrice = (favorite.maxPrice ?? 0) > 0;

    // Items without any price information are always shown
    if (!hasPrice && !hasMaxPrice) {
      return categoryMatch && subCategoryMatch;
    }

    // Use price as both min and max when maxPrice is 0 or missing
    const minPrice = hasPrice ? favorite.price! : 0;
    const maxPrice = hasMaxPrice ? favorite.maxPrice! : minPrice;

    const priceMatch =
      (minPrice >= priceRange[0] && minPrice <= priceRange[1]) ||
      (maxPrice >= priceRange[0] && maxPrice <= priceRange[1]) ||
      (minPrice <= priceRange[0] && maxPrice >= priceRange[1]);

    return categoryMatch && subCategoryMatch && priceMatch;
  });

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Always reset subcategory when category changes
    setSelectedSubCategory("All");
  };

  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  return (
    <div className="container mx-auto py-8">
      <h2
        className={`${thirdFont.className} tracking-normal text-4xl font-semibold text-lovely mb-8`}
      >
        Wifey&apos;s Favorites
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
                    favorites.some(
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

        {/* Price Range Filter */}
        <div className="w-full space-y-2">
          <h3 className="text-lovely font-medium">Price Range</h3>
          <div className="px-4">
            <Slider
              defaultValue={[0, maxPriceValue]}
              max={maxPriceValue}
              step={1}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={handlePriceRangeChange}
              className="my-6"
            />
            <div className="flex justify-between text-sm text-lovely">
              <span>{priceRange[0]} EGP</span>
              <span>{priceRange[1]} EGP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(8)].map((_, index) => (
            <FavoriteCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          {apiError ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{apiError}</p>
            </div>
          ) : filteredFavorites?.length === 0 ? (
            <div className="text-center py-12">
              {favorites.length === 0 ? (
                // Truly no favorites exist in the database at all
                <p className="text-lovely text-lg">
                  No favorites have been added yet.
                </p>
              ) : (
                // Favorites exist but current filters are hiding all of them
                <>
                  <p className="text-lovely text-lg">
                    No favorites match the selected filters.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedSubCategory("All");
                      setPriceRange([0, maxPriceValue]);
                    }}
                    className="mt-4 px-6 py-2 rounded-full text-sm bg-lovely text-creamey hover:opacity-80 transition-opacity"
                  >
                    Reset Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites?.map((favorite) => (
                <FavoriteCard key={favorite._id} favorite={favorite} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
