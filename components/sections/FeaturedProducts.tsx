"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Video, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { wishListContext } from "@/app/context/wishListContext";
import axios from "axios";

import React, { useContext, useEffect, useState } from "react";
import ProductCard from "../shop/ProductCard";
import { thirdFont } from "@/fonts";
import { Product } from "@/app/interfaces/interfaces";

const FeaturedProducts = () => {
  const { wishList, setWishList } = useContext(wishListContext);
  const [featuredProducts,setFeaturedProducts] = useState <Product[]>()

  // const featuredProducts = mockProducts
  //   .filter((product) => product.featured)
  //   .slice(0, 3);
    useEffect(() => {
      const  fetchProducts = async () => {
        const res = await axios("/api/products?featured=true")
        setFeaturedProducts(res.data.data)
      }

    fetchProducts()
   
    }, [])
    
  return (
    <section className="  bg-creamey ">
      {/* <div className='inset-0 bg-black/10 backdrop-blur-[4px]'> */}
      <div className="py-16 container-custom ">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2
              className={`${thirdFont.className} tracking-normal text-4xl md:text-5xl  lg:text-6xl   font-semibold text-everGreen mb-2`}
            >
              Featured Products
            </h2>
            {/* <p className="text-creamey text">
            Discover our handpicked selection of trending items
          </p> */}
          </div>
          <Button
            asChild
            variant="outline"
            className="hover:bg-everGreen hover:text-creamey border-0 bg-lovely text-creamey  mt-4 md:mt-0"
          >
            <Link href="/shop">
              View All <ArrowRight className=" ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featuredProducts?.map((product) => {
            const productID = product._id;
            const fav = wishList.find(
              (favorite) => favorite.productId === productID
            );
            return (
              <ProductCard
                key={product._id}
                product={product}
                favorite={fav ? true : false}
              />
            );
          })}
        </div>
        {/* </div> */}
      </div>
    </section>
  );
};

export default FeaturedProducts;
