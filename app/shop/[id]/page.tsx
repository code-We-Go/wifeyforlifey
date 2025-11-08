"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
import { Product, Variant } from "@/app/interfaces/interfaces";
import { thirdFont } from "@/fonts";
import axios from "axios";
import ProductPageSkeleton from "./ProductPageSkeleton";

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { toast } = useToast();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>();
  const [loading, setLoading] = useState(true);
  const [stickerSelected, setStickerSelected] = useState(true); // Set to true by default
  const [stickerQuantity, setStickerQuantity] = useState(1);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios(`/api/products?productID=${productId}`);
        if (res.data.data) {
          setProduct(res.data.data);
          setSelectedVariant(res.data.data.variations[0]);
          setSelectedAttribute(res.data.data.variations[0].attributes[0]);
        } else {
          setProduct(null);
        }
      } catch (e) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    product?.variations[0]
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttribute, setSelectedAttribute] = useState<
    { name: string; stock: number } | undefined
  >(selectedVariant?.attributes[0]);
  const handleShare = async () => {
    const productUrl = `${window.location.origin}/shop/${productId}`;

    try {
      await navigator.clipboard.writeText(productUrl);
      toast({
        title: "Link Copied",
        description: "Product link has been copied to your clipboard.",
        variant: "added", // Use success variant (add to toastVariants if needed)
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy the link. Please try again.",
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
        <h1 className="text-2xl font-medium mb-4">Product not found</h1>
        <p className="text-muted-foreground mb-6">
          The product you are looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button asChild>
          <Link href="/shop">Back to Shop</Link>
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

  const handleAttributeChange = (attribute: {
    name: string;
    stock: number;
  }) => {
    setSelectedAttribute(attribute);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedAttribute) return;

    addItem({
      productId: product._id,
      productName: product.title,
      price: product.price.local,
      attributes: selectedAttribute,
      variant: selectedVariant,
      imageUrl: selectedVariant.images[0].url,
      quantity,
    });

    toast({
      title: "Added to cart",
      description: `${product.title} (${quantity} ${
        quantity === 1 ? "item" : "items"
      }) has been added to your cart.`,
      variant: "added",
    });
  };

  // Related products (simple implementation: same category but different product)
  // const relatedProducts = mockProducts
  //   .filter((p) => p.categoryID === product.categoryID && p._id !== product._id)
  //   .slice(0, 4);

  return (
    <div className="container-custom py-8 md:py-12">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="text-lovely/80 hover:text-lovely text-sm"
              >
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-pinkey">/</span>
                <Link
                  href="/shop"
                  className="text-lovely/80 hover:text-lovely text-sm"
                >
                  Shop
                </Link>
              </div>
            </li>
            {/* <li>
              <div className="flex items-center">
                <span className="mx-2 text-muted-foreground">/</span>
                <Link
                  href={`/shop?category=${product.subCategoryID.categoryID}`}
                  className="text-lovely/80 hover:text-lovely text-sm"
                >
                  {product.subCategoryID.subCategoryName}
                </Link>
              </div>
            </li> */}
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

      {/* Back to shop button - mobile only */}
      <div className="md:hidden mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/shop">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {selectedVariant && (
              <Image
                src={selectedVariant.images[selectedImage].url}
                alt={product.title}
                fill
                className="object-cover"
              />
            )}
          </div>

          {selectedVariant && selectedVariant.images.length > 1 && (
            <div className="flex space-x-2 overflow-auto pb-1">
              {selectedVariant.images.map((image, index) => (
                <button
                  key={index}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
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
        <div className="space-y-6">
          <div>
            <h1
              className={`${thirdFont.className} text-lovely tracking-normal text-4xl  font-medium`}
            >
              {product.title}
            </h1>
            {/* <div className="flex items-center mt-2">
              <div className="flex items-center mr-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < Math.floor(product.ratings || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.ratings} ratings
              </span>
            </div> */}
          </div>

          <div className="text-2xl text-lovely font-medium">
            LE{product.price.local.toFixed(2)}
          </div>

          <p className="text-lovely/90">{product.description}</p>

          {/* Variants Selection */}
          <div className="space-y-4">
            {/* <div>
              <h3 className="text-sm text-lovely font-medium mb-2">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((variant, index) => (
                  <Button
                    key={index}
                    variant={selectedVariant === variant ? "default" : "outline"}
                    onClick={() => handleVariantChange(variant)}
                    className="rounded-full text-lovely bg-pinkey"
                  >
                    {variant.name}
                  </Button>
                ))}
              </div>
            </div> */}

            {selectedVariant && (
              <div>
                <h3 className="text-sm text-lovely font-medium mb-2">
                  {selectedVariant.attributeName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedVariant.attributes.map((attr, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedAttribute === attr ? "default" : "outline"
                      }
                      onClick={() => handleAttributeChange(attr)}
                      className="rounded-full text-lovely bg-pinkey"
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
            <div className="text-sm text-lovely font-medium mb-2">Quantity</div>
            <div className="flex items-center space-x-2">
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
              <div className="w-12 text-center">{quantity}</div>
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
              {selectedAttribute && (
                <span
                  className={`text-sm ml-2 ${
                    selectedAttribute.stock === 0
                      ? "text-red-500 font-medium"
                      : selectedAttribute.stock <= 5
                      ? "text-orange-500 font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {/* {selectedAttribute.stock === 0
                    ? "Out of stock"
                    : `${selectedAttribute.stock} available`} */}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
              <ShoppingCart className="mr-2 h-5 w-5" />
              {selectedAttribute && selectedAttribute.stock === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-lovely hover:bg-everGreen text-creamey hover:text-creamey rounded-full"
            >
              <Heart className="mr-2 h-5 w-5" />
              Add to Wishlist
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            {/* <div className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-sm">Free shipping on orders over $50</span>
            </div> */}
            <div
              className="flex items-center text-lovely hover:cursor-pointer"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 mr-2 " />
              <span className="text-sm">Share this product</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stickers Section - Only show for specific subCategory */}
      {/* {product?.subCategoryID &&
        product.subCategoryID.toString() === "6904b3616ac4c0db524108ef" && (
          <div className="mt-8 w-full border-t pt-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-lovely">
                ✨ Add a Sticker Sheet to Your Order – Only 100 EGP!
              </h3>
              <p className="text-lovely/80 font-semibold">
                Customize your bridal era even more!
              </p>
              <p className="text-lovely/80 ">
                You can now add an exclusive Wifey for Lifey sticker sheet to
                your order for just 100 EGP.{" "}
              </p>

              <div className="flex flex-col md:flex-row w-full md:h-[450px] space-y-4 md:space-y-0 md:space-x-4 mt-4">
                <div
                  className={`relative w-full h-[440px] md:w-1/2 md:h-full border-2 rounded cursor-pointer ${
                    stickerSelected ? "border-lovely" : "border-gray-200"
                  }`}
                  onClick={() => setStickerSelected(!stickerSelected)}
                >
                  <Image
                    src="/stickers/stickers.jpeg"
                    alt="Sticker"
                    fill
                    className="object-contain rounded"
                  />
                  {stickerSelected && (
                    <div className="absolute top-1 right-1 bg-lovely text-white rounded-full w-5 h-5 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
                <div className="ml-2">
                  <h4 className="text-lovely font-medium mb-2">Perfect for:</h4>
                  <ul className="list-disc pl-5 text-lovely/80 space-y-1">
                    <li>
                      Decorating your Notebooks, laptops, mirrors, bottles or
                      bridal boxes
                    </li>
                    <li>
                      Adding a little extra love, sass & pink energy to your
                      wedding planning
                    </li>
                  </ul>
                </div>
              </div>

              {stickerSelected && (
                <div className="flex items-center space-x-2 mt-4">
                  <span className="text-lovely">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      className="px-3 py-1 text-lovely hover:bg-gray-100"
                      onClick={() =>
                        setStickerQuantity((prev) => Math.max(1, prev - 1))
                      }
                    >
                      -
                    </button>
                    <span className="px-3 py-1">{stickerQuantity}</span>
                    <button
                      className="px-3 py-1 text-lovely hover:bg-gray-100"
                      onClick={() => setStickerQuantity((prev) => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  if (stickerSelected) {
                    addItem({
                      productId: "sticker-addon",
                      productName: "Wifey Sticker Sheet",
                      price: 100,
                      imageUrl:
                        "https://www.shopwifeyforlifey.com/stickers/stickers.jpeg",
                      quantity: stickerQuantity,
                      variant: {
                        name: "Default",
                        attributeName: "Size",
                        attributes: [{ name: "Default", stock: 100 }],
                        images: [
                          {
                            url: "/stickers/stickers.jpeg",
                            type: "image",
                          },
                        ],
                      },
                      attributes: { name: "Default", stock: 100 },
                    });
                    toast({
                      title: "Sticker added to cart",
                      description: `${stickerQuantity} custom sticker(s) added to your cart`,
                    });
                  } else {
                    toast({
                      title: "Please select a sticker",
                      description: "Select a sticker to add to your cart",
                      variant: "destructive",
                    });
                  }
                }}
                className="bg-lovely text-creamey hover:bg-lovely/90 mt-4"
              >
                Add Sticker to Cart - {stickerQuantity * 100} LE
              </Button>
            </div>
          </div>
        )} */}
      {/* Product Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start border-b bg-creamey rounded-none">
            {/* <TabsTrigger value="description">Description</TabsTrigger> */}
            <TabsTrigger className="bg-creamey text-lovely" value="details">
              Product details
            </TabsTrigger>
          </TabsList>

          {/* Stickers Section - Separate from tabs */}

          {/* <TabsContent value="description" className="py-4">
            <div className="prose max-w-none">
              <p>{product.description}</p>
            </div>
          </TabsContent> */}
          <TabsContent value="details" className="bg-creamey text-lovely py-4">
            <div className="space-y-4">
              {/* <h3 className="font-medium">Product Details</h3> */}
              <ul className="list-disc pl-5 space-y-2">
                {product.productDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
              {/* <h3 className="font-medium mt-6">Product Care</h3>
              <ul className="list-disc pl-5 space-y-2">
                {product.productCare.map((care, index) => (
                  <li key={index}>{care}</li>
                ))}
              </ul> */}
              {/* <h3 className="font-medium mt-6">Dimensions</h3>
              <ul className="list-disc pl-5 space-y-2">
                {product.productDimensions.map((dimension, index) => (
                  <li key={index}>{dimension}</li>
                ))}
              </ul> */}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {/* {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-display font-medium mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} favorite={false} />
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
