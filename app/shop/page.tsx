"use client";
import {Suspense, useContext} from 'react'
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { mockProducts, productCategories, ProductFilters } from "@/models/Product";
import { Product } from '../interfaces/interfaces';
import ProductCard from "@/components/shop/ProductCard";
import { lifeyFont, thirdFont } from '@/fonts';
import { wishListContext } from "@/app/context/wishListContext";


function Fullback (){
  return <div>Loading ...</div>
}

 function ShopPage() {
  const { wishList, setWishList } = useContext(wishListContext);
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [filters, setFilters] = useState<ProductFilters>({
    category: initialCategory,
    minPrice: 0,
    maxPrice: 100,
    sortBy: "newest",
    search: "",
  });

  // Apply filters whenever they change
  useEffect(() => {
    let result = [...mockProducts];
    
    // Filter by category
    // if (filters.category) {
    //   result = result.filter(product => product.category === filters.category);
    // }
    
    // Filter by price range
    result = result.filter(
      product => product.price.local >= (filters.minPrice || 0) && product.price.local <= (filters.maxPrice || 100)
    );
    
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        product => 
          product.title.toLowerCase().includes(searchLower) || 
          product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort products
    if (filters.sortBy === "price_asc") {
      result.sort((a, b) => a.price.local - b.price.local);
    } else if (filters.sortBy === "price_desc") {
      result.sort((a, b) => b.price.local - a.price.local);
    } else if (filters.sortBy === "popular") {
      result.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
    } else {
      // Default to newest (could use createdAt in a real app)
      result.sort((a, b) => (b._id || "").localeCompare(a._id || ""));
    }
    
    setFilteredProducts(result);
  }, [filters]);

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 100,
      sortBy: "newest",
      search: "",
    });
  };

  // Find min and max price in the product list
  const maxProductPrice = Math.ceil(
    Math.max(...mockProducts.map(product => product.price.local))
  );

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col space-y-8">
        {/* Page Header */}
        <div className="flex flex-col space-y-4">
          <h1 className={`${thirdFont.className} text-4xl md:text-5xl  text-everGreen font-semibold`}>Shop</h1>
          <p className="text-muted-foreground">
            Discover our curated collection of products designed just for you.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Input
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="flex gap-4">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter("sortBy", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your product search with these filters.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Categories</h3>
                    <div className="grid gap-2">
                      {productCategories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category.id}`}
                            checked={filters.category === category.id}
                            onCheckedChange={(checked) => 
                              updateFilter("category", checked ? category.id : "")
                            }
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Price Range</h3>
                      <span className="text-sm text-muted-foreground">
                        ${filters.minPrice} - ${filters.maxPrice}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[filters.minPrice || 0, filters.maxPrice || maxProductPrice]}
                      max={maxProductPrice}
                      step={1}
                      onValueChange={(value) => {
                        updateFilter("minPrice", value[0]);
                        updateFilter("maxPrice", value[1]);
                      }}
                    />
                  </div>
                  <Separator />
                  <Button onClick={resetFilters} variant="outline" className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.category || filters.minPrice? filters.minPrice:1 > 0 || filters.maxPrice ? filters.maxPrice:1 < maxProductPrice) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.category && (
              <Badge 
                onClick={() => updateFilter("category", "")} 
                className="cursor-pointer bg-pinkey"
              >
                {productCategories.find(c => c.id === filters.category)?.name}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
            {(filters.minPrice ? filters.minPrice:1  > 0 || filters.maxPrice? filters.maxPrice:1 < maxProductPrice) && (
              <Badge 
                onClick={() => {
                  updateFilter("minPrice", 0);
                  updateFilter("maxPrice", maxProductPrice);
                }} 
                className="cursor-pointer bg-pinkey"
              >
                Price: ${filters.minPrice} - ${filters.maxPrice}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
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
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
              <SlidersHorizontal className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or search term.
            </p>
            <Button onClick={resetFilters} variant="outline" className="mt-4">
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPageWrapper(){
 return  <Suspense fallback={<Fullback/>}>
  <ShopPage/>
  </Suspense>
}

// Badge component for active filters
function Badge({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-pinkey text-lovely ", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}