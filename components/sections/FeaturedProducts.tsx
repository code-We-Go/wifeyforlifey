"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Video, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { wishListContext } from "@/app/context/wishListContext";
import axios from "axios";

import React, { useContext, useEffect, useState } from "react";
import ProductCard from "../shop/ProductCard";
import { thirdFont } from "@/fonts";
import { Ipackage, Product } from "@/app/interfaces/interfaces";
import ProductCardSkeleton from "../skeletons/ProductCardSkeleton";
import PackageCard from "../shop/PackageCard";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { headerStyle, subHeaderStyle } from "@/app/styles/style";

const FeaturedProducts = () => {
  const [packages, setPackages] = useState<Ipackage[]>([]);
  const { wishList, setWishList } = useContext(wishListContext);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>();
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      align: "start",
      skipSnaps: false,
      dragFree: true,
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  useEffect(() => {
    const fetchPackages = async () => {
      setPackagesLoading(true);
      try {
        const response = await fetch("/api/packages?all=true&active=true");
        const data = await response.json();
        setPackages(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPackages();
  }, []);
  // const featuredProducts = mockProducts
  //   .filter((product) => product.featured)
  //   .slice(0, 3);
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await axios("/api/products?featured=true");
      setFeaturedProducts(res.data.data);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <section className="  bg-creamey ">
      {/* <div className='inset-0 bg-black/10 backdrop-blur-[4px]'> */}
      <div className="py-8 md:py-16 container-custom ">
        <div className="flex flex-col items-start md:flex-row justify-between md:items-center mb-2 md:mb-4">
          <div>
            <h2
              className={`${thirdFont.className} ${headerStyle} text-lovely mb-2`}
            >
              Our Besties' Favorites
            </h2>
            <span className={`${subHeaderStyle} text-lovely`}>The little things our bride actually use, love, and swear by to make their bridal era feel lighter and more fun.</span>
            {/* <p className="text-creamey text">
            Discover our handpicked selection of trending items
          </p> */}
          </div>
          <Button
            asChild
            variant="outline"
            className="hidden md:flex items-center hover:bg-everGreen hover:text-creamey border-0 bg-lovely text-creamey  mt-4 md:mt-0"
          >
            <Link href="/shop">
              View All <ArrowRight className=" ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="overflow-hidden -mx-2 pt-6" ref={emblaRef}>
            <div className="flex pt-2">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="flex-none w-[66.67vw] sm:w-[45vw] md:w-[33vw] lg:w-[33vw] xl:w-[25vw] pl-2 pr-2"
                >
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Carousel for actual products
          <div className="overflow-hidden -mx-2 pt-6" ref={emblaRef}>
            <div className="flex pt-2">
              {packages.map((packageItem) => (
                <div
                  key={packageItem._id}
                  className="flex-none w-[66.67vw] sm:w-[45vw] md:w-[33vw] lg:w-[33vw] xl:w-[25vw] pl-2 pr-2 h-full"
                >
                  <div className="h-full">
                    <PackageCard packageItem={packageItem} />
                  </div>
                </div>
              ))}
              {featuredProducts?.map((product) => {
                const productID = product._id;
                const fav = wishList.find(
                  (favorite) => favorite.productId === productID
                );
                return (
                  <div
                    key={product._id}
                    className="flex-none w-[66.67vw] sm:w-[45vw] md:w-[33vw] lg:w-[33vw] xl:w-[25vw] pl-2 pr-2 h-full"
                  >
                    <div className="h-full">
                      <ProductCard
                        product={product}
                        favorite={fav ? true : false}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* View All Button for Mobile */}
        <div className="flex justify-center w-full mt-6">
          <Button
            asChild
            variant="outline"
            className="flex md:hidden w-fit items-center hover:bg-everGreen hover:text-creamey border-0 bg-lovely text-creamey"
          >
            <Link href="/shop">
              View All <ArrowRight className=" ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {/* </div> */}
      </div>
    </section>
  );
};

export default FeaturedProducts;
