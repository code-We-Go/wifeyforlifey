"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import {
  ChevronLeft,
  Heart,
  ShoppingCart,
  Star,
  Share2,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/shop/ProductCard";
import { attribute, Product, Variant } from "@/app/interfaces/interfaces";
import { thirdFont } from "@/fonts";
import axios from "axios";
import ProductPageSkeleton from "./ProductPageSkeleton";
import { useLocale, useTranslations } from "next-intl";
import { localizeProduct } from "@/app/lib/localize";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("productPage");
  const tCommon = useTranslations("common");
  const { toast } = useToast();
  const { addItem, openCart } = useCart();

  const [rawProduct, setRawProduct] = useState<Product | null | undefined>();
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttribute, setSelectedAttribute] = useState<attribute | undefined>();

  // Safely localize the product document
  const product = useMemo(() => {
    return rawProduct ? localizeProduct(rawProduct, locale) : rawProduct;
  }, [rawProduct, locale]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios(`/api/products?productID=${productId}`);
        if (res.data?.data) {
          const fetched = res.data.data;
          setRawProduct(fetched);
          const localized = localizeProduct(fetched, locale);
          if (localized.variations && localized.variations.length > 0) {
            setSelectedVariant(localized.variations[0]);
            setSelectedAttribute(localized.variations[0].attributes?.[0]);
          }
        } else {
          setRawProduct(null);
        }
      } catch (e) {
        setRawProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, locale]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      const subId =
        (product as any).subCategoryID?._id || (product as any).subCategoryID;
      if (!subId) return;
      try {
        const res = await axios.get(`/api/products?subcategory=${subId}`);
        const data = Array.isArray(res.data)
          ? (res.data as Product[])
          : Array.isArray((res.data as any).data)
          ? ((res.data as any).data as Product[])
          : [];
        const filtered = data
          .filter((p) => p._id !== product._id)
          .slice(0, 4)
          .map((p) => localizeProduct(p, locale));
        setRelatedProducts(filtered);
      } catch (e) {
        setRelatedProducts([]);
      }
    };
    fetchRelatedProducts();
  }, [product, locale]);

  const handleShare = async () => {
    const productUrl = `${window.location.origin}/${locale}/shop/${productId}`;

    try {
      await navigator.clipboard.writeText(productUrl);
      toast({
        title: t("linkCopied"),
        description: t("linkCopiedDesc"),
        variant: "added",
      });
    } catch (error) {
      toast({
        title: tCommon("search"),
        description: t("linkCopyError"),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-medium mb-4">{t("productNotFound")}</h1>
        <p className="text-muted-foreground mb-6">
          {t("productNotFoundDesc")}
        </p>
        <Button asChild className="text-lovely">
          <Link className="text-lovely" href="/shop">
            {t("backToShop")}
          </Link>
        </Button>
      </div>
    );
  }

  const incrementQuantity = () => {
    if (selectedAttribute && quantity < selectedAttribute.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant);
    setSelectedAttribute(variant.attributes[0]);
    setSelectedImage(0);
    setQuantity(1);
  };

  const handleAttributeChange = (attribute: attribute) => {
    setSelectedAttribute(attribute);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedAttribute) return;

    addItem({
      productId: product._id,
      productName: product.title,
      price:
        selectedAttribute?.price ??
        selectedVariant?.price ??
        product.price.local,
      attributes: selectedAttribute,
      variant: selectedVariant,
      imageUrl: selectedVariant.images[0]?.url,
      quantity,
    });

    toast({
      title: t("addedToCart"),
      description: t("addedToCartDesc", {
        title: product.title,
        count: quantity,
      }),
      variant: "added",
    });
    openCart();
  };

  const currentPrice =
    selectedAttribute?.price && selectedAttribute.price > 0
      ? selectedAttribute.price
      : selectedVariant?.price && selectedVariant.price > 0
      ? selectedVariant.price
      : product.price.local;

  return (
    <div className="container-custom py-3 md:py-6">
      {/* Breadcrumbs */}
      <div className="mb-2 md:mb-3">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 rtl:space-x-reverse">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="text-lovely/80 hover:text-lovely text-sm"
              >
                {t("home")}
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-pinkey">/</span>
                <Link
                  href="/shop"
                  className="text-lovely/80 hover:text-lovely text-sm"
                >
                  {t("shop")}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-pinkey">/</span>
                <span className="text-sm font-medium text-lovely line-clamp-1">
                  {product.title}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-8 lg:gap-12">
        <div className="flex flex-col md:flex-row-reverse gap-4 w-full md:col-span-1 items-start">
          <div className="relative w-full md:flex-1 aspect-square overflow-hidden rounded-lg bg-muted">
            {selectedVariant && selectedVariant.images?.[selectedImage] && (
              <Image
                src={selectedVariant.images[selectedImage].url}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>

          {selectedVariant && selectedVariant.images && selectedVariant.images.length > 1 && (
            <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 rtl:space-x-reverse pb-1 md:pb-0 md:w-20 md:shrink-0 max-h-[500px] pe-1">
              {selectedVariant.images.map((image, index) => (
                <button
                  key={index}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-lovely ring-2 ring-lovely/30"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image.url}
                    alt={`${product.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2 md:space-y-3 md:col-span-1">
          <div>
            <h1
              className={`${thirdFont.className} text-lovely tracking-normal text-3xl sm:text-4xl font-medium`}
            >
              {product.title}
            </h1>
          </div>

          <div className="text-2xl text-lovely font-medium">
            {locale === "ar"
              ? `${currentPrice.toFixed(2)} ${tCommon("le")}`
              : `LE ${currentPrice.toFixed(2)}`}
          </div>

          <p className="text-lovely/90 leading-relaxed">{product.description}</p>

          {/* Variants Selection */}
          <div className="space-y-4">
            {selectedVariant && (
              <div>
                <div className="flex flex-wrap gap-2">
                  {selectedVariant.attributes &&
                    selectedVariant.attributes.length > 1 &&
                    selectedVariant.attributes.map((attr, index) => (
                      <Button
                        key={index}
                        variant={
                          selectedAttribute?.name === attr.name
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleAttributeChange(attr)}
                        className={
                          selectedAttribute?.name === attr.name
                            ? "rounded-full bg-lovely text-creamey"
                            : "rounded-full bg-pinkey text-lovely"
                        }
                        disabled={attr.stock <= 0}
                      >
                        {attr.name}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-lovely font-medium mb-2">{t("quantity")}</div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                className="text-lovely bg-pinkey"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <span className="sr-only">Decrease quantity</span>
                <span aria-hidden>-</span>
              </Button>
              <div className="w-12 text-center font-bold">{quantity}</div>
              <Button
                className="text-lovely bg-pinkey"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={
                  !selectedAttribute || quantity >= selectedAttribute.stock
                }
              >
                <span className="sr-only">Increase quantity</span>
                <span aria-hidden>+</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse pt-2">
            <Button
              size="lg"
              className="rounded-full bg-lovely hover:bg-everGreen text-creamey disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              disabled={
                !selectedVariant ||
                !selectedAttribute ||
                (selectedAttribute && selectedAttribute.stock === 0)
              }
            >
              <ShoppingCart className="mr-2 rtl:mr-0 rtl:ml-2 h-5 w-5" />
              {selectedAttribute && selectedAttribute.stock === 0
                ? t("outOfStock")
                : t("addToCart")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-lovely hover:bg-everGreen text-creamey hover:text-creamey rounded-full"
            >
              <Heart className="mr-2 rtl:mr-0 rtl:ml-2 h-5 w-5" />
              {t("addToWishlist")}
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <div
              className="flex items-center text-lovely hover:cursor-pointer"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
              <span className="text-sm">{t("shareProduct")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12" dir={locale === "ar" ? "rtl" : "ltr"}>
        <Tabs dir={locale === "ar" ? "rtl" : "ltr"} defaultValue="details">
          <TabsList
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="w-full justify-start rtl:justify-start border-b bg-creamey rounded-none"
          >
            <TabsTrigger className="bg-creamey text-lovely" value="details">
              {t("productDetails")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="bg-creamey text-lovely py-4">
            <div className="space-y-4">
              {product.productDetails && product.productDetails.length > 0 ? (
                <ul className="list-disc ps-5 space-y-2">
                  {product.productDetails.map((detail, index) => (
                    <li key={index} className="leading-relaxed">
                      {detail}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-lovely/80">{product.description}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-display font-medium mb-6 text-lovely">
            {t("youMayAlsoLike")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                favorite={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
