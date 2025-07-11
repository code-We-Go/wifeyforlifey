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
import { Product } from '../interfaces/interfaces';
import ProductCard from "@/components/shop/ProductCard";
import { lifeyFont, thirdFont } from '@/fonts';
import { wishListContext } from "@/app/context/wishListContext";

interface Category {
  _id: string;
  name: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  _id: string;
  name: string;
  categoryID: string;
}

function Fullback (){
  return <div>Loading ...</div>
}

function ShopPage() {
  const { wishList, setWishList } = useContext(wishListContext);
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: initialCategory,
    subcategory: "",
    minPrice: 0,
    maxPrice: 100000,
    sortBy: "newest",
    search: "",
  });

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.subcategory) queryParams.append('subcategory', filters.subcategory);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.search) queryParams.append('search', filters.search);

        const response = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      subcategory: "",
      minPrice: 0,
      maxPrice: 100,
      sortBy: "newest",
      search: "",
    });
  };

  // Find max price in the product list
  const maxProductPrice = Math.ceil(
    Math.max(...products?.map(product => product.price.local))
  );

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col space-y-8">
        {/* Page Header */}
        <div className="flex flex-col space-y-4">
          <h1 className={`${thirdFont.className} text-4xl md:text-5xl text-lovely font-semibold`}>Shop</h1>
          <p className="text-lovely/90">
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
              className="pl-10 bg-creamey border-everGreen"
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
                      {categories?.map((category) => (
                        <div key={category._id} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category._id}`}
                              checked={filters.category === category._id}
                              onCheckedChange={(checked) => {
                                updateFilter("category", checked ? category._id : "");
                                updateFilter("subcategory", ""); // Reset subcategory when category changes
                              }}
                            />
                            <label
                              htmlFor={`category-${category._id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category.name}
                            </label>
                          </div>
                          {filters.category === category._id && category.subcategories.length > 0 && (
                            <div className="ml-6 space-y-2">
                              {category.subcategories?.map((subcategory) => (
                                <div key={subcategory._id} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`subcategory-${subcategory._id}`}
                                    checked={filters.subcategory === subcategory._id}
                                    onCheckedChange={(checked) => 
                                      updateFilter("subcategory", checked ? subcategory._id : "")
                                    }
                                  />
                                  <label
                                    htmlFor={`subcategory-${subcategory._id}`}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {subcategory.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
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
                      defaultValue={[filters.minPrice, filters.maxPrice]}
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
        {(filters.category || filters.subcategory || filters.minPrice > 0 || filters.maxPrice < maxProductPrice) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.category && (
              <Badge 
                onClick={() => {
                  updateFilter("category", "");
                  updateFilter("subcategory", "");
                }} 
                className="cursor-pointer bg-pinkey"
              >
                {categories.find(c => c._id === filters.category)?.name}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
            {filters.subcategory && (
              <Badge 
                onClick={() => updateFilter("subcategory", "")} 
                className="cursor-pointer bg-pinkey"
              >
                {categories
                  .find(c => c._id === filters.category)
                  ?.subcategories.find(s => s._id === filters.subcategory)?.name}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}
            {(filters.minPrice > 0 || filters.maxPrice < maxProductPrice) && (
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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-everGreen mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product) => {
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
  return (
    <Suspense fallback={<Fullback/>}>
      <ShopPage/>
    </Suspense>
  );
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
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-pinkey text-lovely", 
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