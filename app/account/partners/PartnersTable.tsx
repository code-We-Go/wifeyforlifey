// components/PartnersTable.tsx
"use client";

import React from "react";

const data = [
  {
    category: "Beauty",
    subCategory: "Clinics",
    brand: "Facefull skin care",
    service: "Facials, skin care routine advices",
    originalPrice: "Varies based on service from 1800-4000",
    discount: "10% Off of all services",
    finalPrice: "",
    code: "Wifeysbestie10",
    link: "",
  },
  {
    category: "Wedding Planning",
    subCategory: "Wedding planner",
    brand: "Sky essam events",
    service:
      "Event planning, Bridesmaids gifts, bridal accessories customization",
    originalPrice: "",
    discount: "Customized discount up to 10% based on the service",
    finalPrice: "",
    code: "Wifeysbestie10",
    link: "",
  },
  {
    category: "Wedding Planning",
    subCategory: "Catering",
    brand: "Sweet & Sour EG",
    service: `Silver package (100 person)
-100 sambosak
-100 mino pizza / spring rolls
-100 mini sandwiches 
-100 mini club sandwiches 
-100 biscuits
-100 cakepops/ cupcakes
-1 type of salad`,
    originalPrice: "19000 - 190EGP Per person",
    discount: "Save 7%!",
    finalPrice: "17,670",
    code: "Wifeysbestie7",
    link: "",
  },
  {
    category: "",
    subCategory: "",
    brand: "",
    service: `Gold Package (100 person)
-100 sambosak
-100 mini pizza/ spring rolls 
-100 mini kobeba
-100 mini club sandwich
-100 mini sandwich 
-100 biscuits
-100 cakepops/cupcakes
-100 mini cheescake
-1 type of salad`,
    originalPrice: "29000",
    discount: "7%",
    finalPrice: "26,970",
    code: "Wifeysbestie7",
    link: "",
  },
  {
    category: "",
    subCategory: "",
    brand: "",
    service: `Bachelorette/ mini celebrations (20 person)
-40 mini sandwiches 
-20 sambosak
-20 mini pizza
-20 club sandwich 
-20 mini kobena
-20 cakepops/ cakesicles
-20 cupcakes
-20 biscuits`,
    originalPrice: "5200-6000 (260-300 per person)",
    discount: "5%-7%",
    finalPrice: "4940-5580",
    code: "Wifeysbestie7",
    link: "",
  },
  {
    category: "Wedding planning",
    subCategory: "Live painter",
    brand: "Almeiry",
    service: "",
    originalPrice: "",
    discount: "",
    finalPrice: "",
    code: "",
    link: "",
  },
  {
    category: "Home accessories",
    subCategory: "Wall art",
    brand: "Almeriy",
    service: "",
    originalPrice: "",
    discount: "",
    finalPrice: "",
    code: "",
    link: "",
  },
  {
    category: "Home accessories",
    subCategory: "Wall art",
    brand: "Artimia",
    service: "",
    originalPrice: "",
    discount: "10% off of all products",
    finalPrice: "",
    code: "Wifeysbestie10",
    link: "",
  },
  {
    category: "Beauty",
    subCategory: "Hair care",
    brand: "Shosh",
    service: "Hair volumizers, Straighner, Curlers!",
    originalPrice: "3000-8000",
    discount: "3% off of all products",
    finalPrice: "",
    code: "Wifey3",
    link: "https://shosharabia.com/en/",
  },
  {
    category: "Beauty",
    subCategory: "Skin care",
    brand: "YesStyle",
    service: "Korean & Japanese skin care and hair care products",
    originalPrice: "",
    discount: "5% Off of all products",
    finalPrice: "",
    code: "WIFEYLIFEY9",
    link: "https://Yesstyle.com",
  },
  {
    category: "Apps",
    subCategory: "Noon Egypt",
    brand: "",
    service: "",
    originalPrice: "",
    discount: "",
    finalPrice: "",
    code: "TOP67, TSP26, SP27",
    link: "",
  },
  {
    category: "Apps",
    subCategory: "Noon GCC",
    brand: "",
    service: "",
    originalPrice: "",
    discount: "",
    finalPrice: "",
    code: "yay8",
    link: "",
  },
  {
    category: "Apps",
    subCategory: "Namshi",
    brand: "",
    service: "",
    originalPrice: "",
    discount: "",
    finalPrice: "",
    code: "ADT48",
    link: "",
  },
  {
    category: "Fashion",
    subCategory: "Clothes",
    brand: "Defacto",
    service: "",
    originalPrice: "",
    discount: "",
    finalPrice: "",
    code: "DT87",
    link: "",
  },
  {
    category: "Fashion",
    subCategory: "Luxury",
    brand: "Level shoes",
    service: "",
    originalPrice: "",
    discount: "",
    finalPrice: "",
    code: "AX138",
    link: "",
  },
];

export default function PartnersTable() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px] grid grid-cols-9 bg-lovely text-creamey font-semibold text-sm">
        <div className="p-2 border">Category</div>
        <div className="p-2 border">Sub-category</div>
        <div className="p-2 border">Brand</div>
        <div className="p-2 border">Service</div>
        <div className="p-2 border">Original Price</div>
        <div className="p-2 border">Special Discount</div>
        <div className="p-2 border">Wifey&apos;s final price!</div>
        <div className="p-2 border">Code</div>
        <div className="p-2 border">Link</div>
      </div>

      {data.map((row, i) => (
        <div
          key={i}
          className="min-w-[1000px] grid grid-cols-9 text-lovely text-sm"
        >
          <div className="p-2 border">{row.category}</div>
          <div className="p-2 border">{row.subCategory}</div>
          <div className="p-2 border">{row.brand}</div>
          <div className="p-2 border whitespace-pre-line">{row.service}</div>
          <div className="p-2 border">{row.originalPrice}</div>
          <div className="p-2 border">{row.discount}</div>
          <div className="p-2 border">{row.finalPrice}</div>
          <div className="p-2 border">{row.code}</div>
          <div className="p-2 border text-blue-600 underline break-words">
            {row.link ? (
              <a href={row.link} target="_blank" rel="noopener noreferrer">
                {row.link}
              </a>
            ) : (
              ""
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
