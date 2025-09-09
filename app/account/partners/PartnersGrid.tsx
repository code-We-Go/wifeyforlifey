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

  // Partner data
  const partnersData: Partner[] = [
    {
      category: "Beauty",
      subCategory: "Clinics",
      brand: "Facefull Skin Care",
      offer:
        "Facefull Clinic, led by Dina — the first Egyptian skincare specialist certified by the South Korean Ministry of Education — offers advanced facials, dermapen, and dermaplaning treatments, along with custom skincare routines designed to keep every bride glowing.",
      discount: "10% off all services",
      code: "Wifeysbestie10",
      link: "https://www.instagram.com/facefullskincare?igsh=MWx4YWhqaXN6aG16eQ==",
      bookingMethod: "Through Instagram",
      imagePath: "facefull.jpeg",
    },
    {
      category: "Wedding Planning",
      subCategory: "Planner",
      brand: "Sky Essam Events",
      offer:
        "Sky Essam Events crafts unforgettable weddings with personalized planning, bridesmaids' gifts, and customized bridal accessories — designed to make every detail of your celebration uniquely yours.",
      discount: "Up to 10% customized discount",
      code: "Wifeysbestie10",
      link: "https://www.instagram.com/skyessamevents?igsh=M2IxZmJsYWRoOWt5",
      bookingMethod: "Through Instagram",
      imagePath: "sky.jpeg",
    },
    {
      category: "Wedding Planning",
      subCategory: "Catering",
      brand: "Sweet & Sour EG",
      offer:
        "Sweet & Sour EG tailors catering packages for weddings and bridal celebrations, offering elegant finger-food setups — from savory bites to sweet delights. Famous for their madeleine towers, cakepops, mini croissants, and signature club sandwiches, every spread is crafted to impress your guests.",
      discount: "Save between 5% to 7% based on the package chosen",
      code: "Wifeysbestie7",
      link: "https://www.instagram.com/sweetandsour_eg?igsh=MTY1Zjgyd3VzbXB4eQ==",
      bookingMethod: "Through Wifey for lifey",
      imagePath: "Sweet&Sour.jpeg",
    },
    {
      category: "Wedding Planning",
      subCategory: "Live Painter",
      brand: "Almeiry",
      offer:
        "Almeiry transforms your wedding moments into timeless works of art, capturing your celebration live on canvas so you can relive the magic forever.",
      discount: "10% off all services",
      code: "",
      link: "https://www.instagram.com/el_miryy?igsh=OWZ0ZG4zcGh6OWtw",
      bookingMethod: "Through Instagram",
      imagePath: "almery.jpeg",
    },
    {
      category: "Wedding Planning",
      subCategory: "Live Painter",
      brand: "ByRola",
      offer:
        "ByRola is a celebrated live wedding painter who has brought more than 150 celebrations to life on canvas. Specializing in vibrant, colorful paintings, she captures every emotion and detail in a timeless piece of art you'll treasure forever.",
      discount: "14%",
      code: "Wifeysbestie14",
      link: "https://www.instagram.com/byrolaa?igsh=MWcwY2V0NDEzdnl1ZA==",
      bookingMethod: "Through Wifey for lifey",
      imagePath: "byRola.jpeg",
    },
    {
      category: "Home Accessories",
      subCategory: "Wall Art",
      brand: "Almeiry",
      offer:
        "El Miry brings sophistication into your new home with original fine art, customized paintings, and wall murals. Each piece is designed to reflect your story and add a unique artistic touch to your bridal home.",
      discount: "10% off all services",
      code: "",
      link: "https://www.instagram.com/el_miryy?igsh=OWZ0ZG4zcGh6OWtw",
      bookingMethod: "Through Instagram",
      imagePath: "almery.jpeg",
    },
    {
      category: "Home Accessories",
      subCategory: "Wall Art",
      brand: "Artimia",
      offer:
        "Artimia creates customized wall décor, artistic fridge magnets, and handcrafted clay pieces — unique designs that add warmth, creativity, and personality to your bridal home.",
      discount: "10% off all products",
      code: "Wifeysbestie10",
      link: "https://www.instagram.com/artimia__?igsh=eWxyMHowZzczenU5",
      bookingMethod: "Through Instagram",
      imagePath: "artima.jpeg",
    },
    {
      category: "Beauty",
      subCategory: "Hair Tools",
      brand: "Shosh",
      offer:
        "Shosh elevates your hair routine with professional volumizers, straighteners, and curlers — helping every bride achieve salon-quality styles from home.",
      discount: "3% off all products",
      code: "Wifey3",
      link: "https://shosharabia.com",
      bookingMethod: "Through Website",
      imagePath: "shosh.jpeg",
    },
    {
      category: "Beauty",
      subCategory: "Haircare products",
      brand: "Curlit",
      offer:
        "Curlit specializes in clean, nourishing haircare for curly and wavy hair. With their signature leave-in and styling gel, they define curls, reduce frizz, and keep your bridal look effortlessly natural and long-lasting.",
      discount: "10% Off all products",
      code: "WIFEY10",
      link: "https://curlit.shop/",
      bookingMethod: "Through Website",
      imagePath: "curlit.jpeg",
    },
    {
      category: "Beauty",
      subCategory: "Skincare Products",
      brand: "YesStyle",
      offer:
        "YesStyle brings you the best of Korean and Japanese beauty, offering a wide range of skincare and haircare products to keep your glow fresh long after the wedding. Plus, any customs you pay are returned as app credit — so you can shop even more of your favorite products.",
      discount: "5% off all products",
      code: "WIFEYLIFEY9",
      link: "https://yesstyle.com",
      bookingMethod: "Through Website",
      imagePath: "yesStyle.jpeg",
    },
    {
      category: "E-Commerce",
      subCategory: "Marketplace",
      brand: "Noon Egypt",
      offer:
        "Noon is your go-to online marketplace for fashion, beauty, and home essentials, offering brides exclusive discount codes to make every purchase smarter.",
      discount: "",
      code: "TOP67 / TSP26 / SP27",
      link: "https://noon.com",
      bookingMethod: "Through Website",
      imagePath: "noon.jpeg",
    },
    {
      category: "E-Commerce",
      subCategory: "Marketplace",
      brand: "Noon GCC",
      offer:
        "Noon is your go-to online marketplace for fashion, beauty, and home essentials, offering brides exclusive discount codes to make every purchase smarter.",
      discount: "",
      code: "yay8",
      link: "https://noon.com",
      bookingMethod: "Through Website",
      imagePath: "noon.jpeg",
    },
    {
      category: "E-Commerce",
      subCategory: "Fashion",
      brand: "Namshi",
      offer:
        "Namshi curates fashion-forward clothing and accessories, giving brides on-trend options to style every occasion — from casual looks to chic bridal events.",
      discount: "",
      code: "ADT48",
      link: "https://namshi.com",
      bookingMethod: "Through Website",
      imagePath: "namshi.jpeg",
    },
    {
      category: "Fashion",
      subCategory: "Clothing",
      brand: "Defacto",
      offer:
        "Defacto offers stylish and affordable clothing collections designed for everyday comfort and bridal-era flair, making it easy to refresh your wardrobe.",
      discount: "",
      code: "DT87",
      link: "https://defacto.com",
      bookingMethod: "Through Website",
      imagePath: "defacto.jpeg",
    },
    {
      category: "Fashion",
      subCategory: "Luxury",
      brand: "Level Shoes",
      offer:
        "Level Shoes redefines luxury footwear with designer collections that let every bride step into her new era with confidence, style, and sophistication.",
      discount: "",
      code: "AX138",
      link: "https://levelshoes.com",
      bookingMethod: "Through Website",
      imagePath: "level.jpeg",
    },
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setPartners(partnersData);

      // Extract unique categories and subcategories
      const uniqueCategories = Array.from(
        new Set(partnersData.map((partner) => partner.category))
      ).filter(Boolean);

      const uniqueSubCategories = Array.from(
        new Set(partnersData.map((partner) => partner.subCategory))
      ).filter(Boolean);

      setCategories(["All", ...uniqueCategories]);
      setSubCategories(["All", ...uniqueSubCategories]);
      setLoading(false);
    }, 1000);
  }, []);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
