"use client";
import { Suspense, useContext } from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Filter,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShoppingBag,
  Calendar,
  X,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { Product, Ipackage } from "@/app/interfaces/interfaces";
import ProductCard from "@/components/shop/ProductCard";
import PackageCard from "@/components/shop/PackageCard";
import CategoryCard from "@/components/shop/CategoryCard";
import SubcategoryCard from "@/components/shop/SubcategoryCard";
import { lifeyFont, thirdFont } from "@/fonts";
import { wishListContext } from "@/app/context/wishListContext";
import PartnerSessionsSection from "@/components/partners/PartnerSessionsSection";
import { headerStyle, subHeaderStyle } from "@/app/styles/style";
import { localizeProduct, localizePackage } from "@/app/lib/localize";

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  categoryID?: string;
}

function Fullback() {
  return <div className="w-full h-[calc(100vh-128px)]">Loading ...</div>;
}

function ShopPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const t = useTranslations("shopPage");
  const tCommon = useTranslations("common");
  const { wishList, setWishList } = useContext(wishListContext);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get category and subcategory from URL params
  const selectedCategoryId = searchParams.get("category") || "";
  const selectedSubcategoryId = searchParams.get("subcategory") || "";

  const activeTab = searchParams.get("tab") || "subscriptions";
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Ipackage[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Keep this if needed for filters, or remove. 
  // For this refactor, I will focus on populating subcategoriesList.
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: selectedCategoryId,
    subcategory: selectedSubcategoryId,
    minPrice: 0,
    maxPrice: 100000,
    sortBy: "newest",
    search: "",
  });

  // Embla Carousel for Categories (Might be unused now)
  const [categoriesEmblaRef, categoriesEmblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    direction: isRtl ? "rtl" : "ltr",
  });
  const [canScrollPrevCategories, setCanScrollPrevCategories] = useState(false);
  const [canScrollNextCategories, setCanScrollNextCategories] = useState(false);

  // Embla Carousel for Subcategories
  const [subcategoriesEmblaRef, subcategoriesEmblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    direction: isRtl ? "rtl" : "ltr",
  });
  const [canScrollPrevSubcategories, setCanScrollPrevSubcategories] = useState(false);
  const [canScrollNextSubcategories, setCanScrollNextSubcategories] = useState(false);



  // Fetch active subcategories directly
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await fetch(`/api/subcategories?active=true&type=product&locale=${locale}`);
        const data = await response.json();
        const rawSubcategories = data.data || [];

        // Map subCategoryName to name to match interface
        const mappedSubcategories = rawSubcategories.map((sub: any) => ({
          _id: sub._id,
          name: (locale === "ar" && sub.translations?.ar?.subCategoryName)
            ? sub.translations.ar.subCategoryName
            : (sub.subCategoryName || sub.name),
          description: (locale === "ar" && sub.translations?.ar?.description)
            ? sub.translations.ar.description
            : sub.description,
          image: sub.image,
          categoryID: sub.categoryID
        }));

        setSubcategoriesList(mappedSubcategories);
        setCategories([]);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchSubcategories();
  }, [locale]);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.subcategory)
          queryParams.append("subcategory", filters.subcategory);
        if (filters.minPrice)
          queryParams.append("minPrice", filters.minPrice.toString());
        if (filters.maxPrice)
          queryParams.append("maxPrice", filters.maxPrice.toString());
        if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
        if (filters.search) queryParams.append("search", filters.search);

        const response = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await response.json();
        const rawProducts: Product[] = Array.isArray(data) ? data : [];
        setProducts(rawProducts.map((p) => localizeProduct(p, locale)));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, locale]);

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      setPackagesLoading(true);
      try {
        const response = await fetch("/api/packages?all=true&active=true");
        const data = await response.json();
        const fetchedPackages = Array.isArray(data.data) ? data.data : [];

        // Custom Gehaz Bestie Planner package to show first
        const gehazBestiePlanner: Ipackage = {
          _id: "custom-gehaz-bestie-planner",
          slug: "GehazBestiePlanner",
          name: locale === "ar" ? "بلانر رفيقة الجهاز" : "Gehaz Bestie Planner",
          imgUrl: "/experience/gehaz1.png",
          images: ["/experience/gehaz1.png"],
          price: 1500,
          duration: 0,
          items: [],
          notes: locale === "ar" ? [
            "بتجهزي شقتك؟",
            "دليلك الكامل لبيتك غرفة بغرفة — 11 باب يقسموا جهازك لأساسيات وكماليات عشان متصرفيش في غير محله 💕"
          ] : [
            "Buying your gehaz?",
            "Your home, room by room — 11 chapters, Essentials vs Nice-to-Haves, and quantity guides so you never overspend."
          ],
          cards: [],
          active: true,
          translations: {
            ar: {
              name: "بلانر رفيقة الجهاز",
              notes: [
                "بتجهزي شقتك؟",
                "دليلك الكامل لبيتك غرفة بغرفة — 11 باب يقسموا جهازك لأساسيات وكماليات عشان متصرفيش في غير محله 💕"
              ],
            },
          },
        };
        const weddingBestiePlanner: Ipackage = {
          _id: "custom-wedding-bestie-planner",
          slug: "WeddingBestiePlanner",
          name: locale === "ar" ? "بلانر رفيقة الفرح" : "Wedding Bestie Planner",
          imgUrl: "/weddingPlanningPlanner/mob.jpeg",
          images: ["/weddingPlanningPlanner/mob.jpeg"],
          price: 1700,
          duration: 0,
          items: [],
          notes: locale === "ar" ? [
            "بتنظمي يوم فرحك؟",
            "يومك الكبير خطوة بخطوة — جدولين مهام: واحد ليكي وواحد لعريسك، مع عد تنازلي من قبلها بشهرين لحد ليلة الفرح 💍"
          ] : [
            "Planning your wedding day?",
            "Your big day, step by step — two checklists included: one for you, one for your groom. Countdown tasks from 2 months out to the night before."
          ],
          cards: [],
          active: true,
          translations: {
            ar: {
              name: "بلانر رفيقة الفرح",
              notes: [
                "بتنظمي يوم فرحك؟",
                "يومك الكبير خطوة بخطوة — جدولين مهام: واحد ليكي وواحد لعريسك، مع عد تنازلي من قبلها بشهرين لحد ليلة الفرح 💍"
              ],
            },
          },
        };

        // Filter out any fetched packages with slug "GehazBestiePlanner" to avoid duplicates
        const filteredPackages = fetchedPackages.filter(
          (pkg: Ipackage) => pkg.slug !== "GehazBestiePlanner" && pkg.slug !== "wedding-bestie-planner"
        );

        // Prepend the custom package to the filtered packages and localize all
        setPackages([
          gehazBestiePlanner,
          weddingBestiePlanner,
          ...filteredPackages.map((pkg: Ipackage) => localizePackage(pkg, locale)),
        ]);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPackages();
  }, [locale]);

  const scrollPrevCategories = useCallback(() => {
    if (categoriesEmblaApi) categoriesEmblaApi.scrollPrev();
  }, [categoriesEmblaApi]);

  const scrollNextCategories = useCallback(() => {
    if (categoriesEmblaApi) categoriesEmblaApi.scrollNext();
  }, [categoriesEmblaApi]);

  const scrollPrevSubcategories = useCallback(() => {
    if (subcategoriesEmblaApi) subcategoriesEmblaApi.scrollPrev();
  }, [subcategoriesEmblaApi]);

  const scrollNextSubcategories = useCallback(() => {
    if (subcategoriesEmblaApi) subcategoriesEmblaApi.scrollNext();
  }, [subcategoriesEmblaApi]);



  const onSelectCategories = useCallback(() => {
    if (!categoriesEmblaApi) return;
    setCanScrollPrevCategories(categoriesEmblaApi.canScrollPrev());
    setCanScrollNextCategories(categoriesEmblaApi.canScrollNext());
  }, [categoriesEmblaApi]);

  const onSelectSubcategories = useCallback(() => {
    if (!subcategoriesEmblaApi) return;
    setCanScrollPrevSubcategories(subcategoriesEmblaApi.canScrollPrev());
    setCanScrollNextSubcategories(subcategoriesEmblaApi.canScrollNext());
  }, [subcategoriesEmblaApi]);



  useEffect(() => {
    if (!categoriesEmblaApi) return;
    onSelectCategories();
    categoriesEmblaApi.on("select", onSelectCategories);
    categoriesEmblaApi.on("reInit", onSelectCategories);
  }, [categoriesEmblaApi, onSelectCategories]);

  useEffect(() => {
    if (!subcategoriesEmblaApi) return;
    onSelectSubcategories();
    subcategoriesEmblaApi.on("select", onSelectSubcategories);
    subcategoriesEmblaApi.on("reInit", onSelectSubcategories);
  }, [subcategoriesEmblaApi, onSelectSubcategories]);



  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      subcategory: "",
      minPrice: 0,
      maxPrice: 100000,
      sortBy: "newest",
      search: "",
    });
    // Clear URL params
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("subcategory");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategorySelect = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", categoryId);
    params.delete("subcategory"); // Reset subcategory when selecting a new category
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setFilters((prev) => ({ ...prev, category: categoryId, subcategory: "" }));
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("subcategory", subcategoryId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setFilters((prev) => ({ ...prev, subcategory: subcategoryId }));
  };

  const handleBackToCategories = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("subcategory");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setFilters((prev) => ({ ...prev, category: "", subcategory: "" }));
  };

  const handleBackToSubcategories = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("subcategory");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setFilters((prev) => ({ ...prev, subcategory: "" }));
  };

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Find max price in the product list
  const maxProductPrice =
    products.length > 0
      ? Math.ceil(Math.max(...products.map((product) => product.price.local)))
      : 100000;

  const tabs = [
    { id: "subscriptions", label: t("tabPlanners"), icon: Sparkles },
    { id: "products", label: t("tabProducts"), icon: ShoppingBag },
    { id: "sessions", label: t("tabSessions"), icon: Calendar },
  ];

  return (
    <div className="container-custom py-8 md:py-12">
      <div className="flex flex-col space-y-4">
        {/* Page Header */}
        <div className="flex flex-col space-y-2">
          <h1
            className={`${thirdFont.className}  text-lovely ${headerStyle}`}
          >
            {t("title")}
          </h1>
          {/* <p className="text-lovely/90">
            Discover our curated collection of products designed just for you.
          </p> */}
        </div>

        {/* Tabs Navigation */}
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center min-w-[80px] space-y-2 group transition-colors`}
            >
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${activeTab === tab.id
                  ? "bg-lovely text-creamey shadow-lg "
                  : "bg-creamey text-lovely border border-lovely/20 hover:border-lovely"
                  }`}
              >
                <tab.icon className="w-6 h-6" />
              </div>
              <span
                className={`text-sm font-medium transition-colors ${activeTab === tab.id
                  ? "text-lovely font-bold"
                  : "text-lovely/70"
                  }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content based on Active Tab */}

        {/* Subscriptions (Packages) Tab */}
        {activeTab === "subscriptions" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {packagesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lovely mx-auto"></div>
                <p className="mt-4 text-lovely/90">{t("loadingSubscriptions")}</p>
              </div>
            ) : packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-4">
                {packages.map((packageItem) => (
                  <div key={packageItem._id} className="min-w-0">
                    <PackageCard packageItem={packageItem} />
                  </div>
                ))}
              </div>
            )
              : (
                <div className="text-center py-12">
                  <p className="text-lovely text-lg">
                    {t("noSubscriptions")}
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* Breadcrumb Navigation */}
            {selectedSubcategoryId && (
              <div className="flex items-center gap-2 text-sm text-lovely/70">
                <button
                  onClick={handleBackToCategories}
                  className="hover:text-lovely transition-colors"
                >
                  {t("allCategories")}
                </button>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                <span className="text-lovely font-medium">
                  <span className="text-lovely font-medium">
                    {subcategoriesList.find(s => s._id === selectedSubcategoryId)?.name || t("subcategory")}
                  </span>
                </span>
              </div>
            )}

            {/* Show All Active Subcategories when no subcategory is selected */}
            {!selectedSubcategoryId && (
              <div>
                {/* <h2 className={`${thirdFont.className} ${headerStyle} text-lovely mb-6`}>
                  Browse by Subcategory
                </h2> */}

                {subcategoriesList.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subcategoriesList.map((subcategory) => (
                      <SubcategoryCard
                        key={subcategory._id}
                        subcategory={subcategory}
                        onClick={() => handleSubcategorySelect(subcategory._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lovely/70">{t("noSubcategories")}</p>
                  </div>
                )}
              </div>
            )}

            {/* Show Products when subcategory is selected OR when "Show All" is enabled */}
            {(selectedSubcategoryId || filters.category === "all") && (
              <>
                {/* Search and Filters Bar - Only for Products */}
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="relative w-full md:w-96">
                    <Input
                      placeholder={t("searchPlaceholder")}
                      value={filters.search}
                      onChange={(e) => updateFilter("search", e.target.value)}
                      className="ps-10 pe-4 bg-creamey placeholder:text-lovely/90 border-lovely/90"
                    />
                    <div className="absolute start-3 top-1/2 transform -translate-y-1/2 text-lovely/90">
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
                        <SelectValue placeholder={t("sortBy")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">{t("newest")}</SelectItem>
                        <SelectItem value="price_asc">
                          {t("priceAsc")}
                        </SelectItem>
                        <SelectItem value="price_desc">
                          {t("priceDesc")}
                        </SelectItem>
                        <SelectItem value="popular">{t("popular")}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Sheet>
                      <SheetTrigger
                        asChild
                        className="bg-creamey border border-lovely/90 text-lovely/90"
                      >
                        <Button variant="outline">
                          <Filter className="h-4 w-4 me-2" />
                          {t("filters")}
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="bg-creamey text-lovely">
                        <SheetHeader className="text-lovely">
                          <SheetTitle className="text-lovely">
                            {t("filterTitle")}
                          </SheetTitle>
                          <SheetDescription className="text-lovely">
                            {t("filterDescription")}
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-6">
                          {/* Show All Products Option */}
                          <div className="space-y-3">
                          </div>

                          <Separator />

                          {/* Subcategory Filter */}
                          <div className="space-y-3">
                            <h3 className="font-medium">{t("subcategory")}</h3>
                            <Select
                              value={filters.subcategory || "none"}
                              onValueChange={(value) => updateFilter("subcategory", value === "none" ? "" : value)}
                            >
                              <SelectTrigger className="w-full bg-creamey border-lovely">
                                <SelectValue placeholder={t("subcategory")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">{t("allCategories")}</SelectItem>
                                {subcategoriesList.map((subcategory) => (
                                  <SelectItem
                                    key={subcategory._id}
                                    value={subcategory._id}
                                  >
                                    {subcategory.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Separator />

                          {/* Price Range Filter */}
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{t("priceRange")}</h3>
                              <span className="text-sm text-lovely">
                                {filters.minPrice} - {filters.maxPrice}
                              </span>
                            </div>
                            <Slider
                              className="bg-pinkey"
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
                          <Button
                            onClick={resetFilters}
                            variant="outline"
                            className="w-full bg-lovely text-creamey hover:text-creamey hover:bg-lovely/90"
                          >
                            {t("resetFilters")}
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                {/* Active Filters */}
                {(filters.category || filters.subcategory || filters.minPrice > 0 || filters.maxPrice < maxProductPrice) && filters.category !== "all" && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-lovely/90">{t("activeFilters")}</span>
                    {filters.category && filters.category !== "" && (
                      <Badge
                        onClick={() => {
                          updateFilter("category", "");
                          updateFilter("subcategory", "");
                        }}
                        className="cursor-pointer bg-pinkey"
                      >
                        {t("categoryFilter")}: {categories.find((c) => c._id === filters.category)?.name}
                        <X className="ms-1 h-3 w-3" />
                      </Badge>
                    )}
                    {filters.subcategory && filters.subcategory !== "" && (
                      <Badge
                        onClick={() => updateFilter("subcategory", "")}
                        className="cursor-pointer bg-pinkey"
                      >
                        {" "}
                        {subcategoriesList.find((s) => s._id === filters.subcategory)?.name}
                        <X className="ms-1 h-3 w-3" />
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
                        {tCommon("price")}: {filters.minPrice} - {filters.maxPrice}
                        <X className="ms-1 h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                )}

                {/* Products Grid */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lovely mx-auto"></div>
                    <p className="mt-4 text-lovely/90">{t("loadingProducts")}</p>
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 py-4">
                    {products.map((product) => {
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
                    <div className="mx-auto w-24 h-24 mb-4 text-lovely">
                      <SlidersHorizontal className="w-full h-full" />
                    </div>
                    <h3 className="text-lg text-lovely font-semibold">
                      {t("noProductsFound")}
                    </h3>
                    <p className="text-lovely mt-2">
                      {t("adjustFiltersDesc")}
                    </p>
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="mt-4 bg-lovely/90 text-creamey hover:text-creamey hover:bg-lovely"
                    >
                      {t("resetFilters")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* <h2
              className={`${thirdFont.className} text-2xl font-bold mb-6 text-lovely`}
            >
              Partner Sessions
            </h2> */}
            <PartnerSessionsSection />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPageWrapper() {
  return (
    <Suspense fallback={<Fullback />}>
      <ShopPage />
    </Suspense>
  );
}



function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
