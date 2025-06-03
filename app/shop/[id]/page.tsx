"use client";
import { useState } from "react";
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
import { mockProducts } from "@/models/Product";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/shop/ProductCard";
import { Product, Variant } from "@/app/interfaces/interfaces";
import { thirdFont } from "@/fonts";

export default function ProductPage() {

  const params = useParams();
  const productId = params.id as string;
  const { toast } = useToast();
  const { addItem } = useCart();

  const product = mockProducts.find((p) => p._id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(product?.variations[0]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttribute, setSelectedAttribute] = useState<{ name: string; stock: number } | undefined>(
    selectedVariant?.attributes[0]
  );
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

  const handleAttributeChange = (attribute: { name: string; stock: number }) => {
    setSelectedAttribute(attribute);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedAttribute) return;

    addItem({
      productId: product._id,
      productName: product.title,
      price: product.price.local,
      attributes:selectedAttribute,
      variant:selectedVariant,
      imageUrl: selectedVariant.images[0].url,
      quantity
    });

    toast({
      title: "Added to cart",
      description: `${product.title} (${quantity} ${
        quantity === 1 ? "item" : "items"
      }) has been added to your cart.`,
    });
  };

  // Related products (simple implementation: same category but different product)
  const relatedProducts = mockProducts
    .filter((p) => p.categoryID === product.categoryID && p._id !== product._id)
    .slice(0, 4);

  return (
    <div className="container-custom py-8 md:py-12">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-muted-foreground">/</span>
                <Link
                  href="/shop"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Shop
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-muted-foreground">/</span>
                <Link
                  href={`/shop?category=${product.categoryID}`}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  {product.categoryID.charAt(0).toUpperCase() +
                    product.categoryID.slice(1)}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-muted-foreground">/</span>
                <span className="text-sm font-medium text-foreground line-clamp-1">
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
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className={`${thirdFont.className} text-everGreen tracking-normal text-4xl font-display font-medium`}>
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

          <div className="text-2xl font-medium">
            LE{product.price.local.toFixed(2)}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {/* Variants Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((variant, index) => (
                  <Button
                    key={index}
                    variant={selectedVariant === variant ? "default" : "outline"}
                    onClick={() => handleVariantChange(variant)}
                    className="rounded-full"
                  >
                    {variant.name}
                  </Button>
                ))}
              </div>
            </div>

            {selectedVariant && (
              <div>
                <h3 className="text-sm font-medium mb-2">{selectedVariant.attributeName}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedVariant.attributes.map((attr, index) => (
                    <Button
                      key={index}
                      variant={selectedAttribute === attr ? "default" : "outline"}
                      onClick={() => handleAttributeChange(attr)}
                      className="rounded-full"
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
            <div className="text-sm font-medium mb-2">Quantity</div>
            <div className="flex items-center space-x-2">
              <Button
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
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={!selectedAttribute || quantity >= selectedAttribute.stock}
              >
                <span className="sr-only">Increase quantity</span>
                <span aria-hidden>+</span>
              </Button>
              {selectedAttribute && (
                <span className="text-sm text-muted-foreground ml-2">
                  {selectedAttribute.stock} available
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              size="lg"
              className="rounded-full bg-lovely hover:bg-everGreen text-creamey"
              onClick={handleAddToCart}
              disabled={!selectedVariant || !selectedAttribute}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="bg-lovely hover:bg-everGreen text-creamey hover:text-creamey rounded-full">
              <Heart className="mr-2 h-5 w-5" />
              Add to Wishlist
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-sm">Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center hover:cursor-pointer"
            onClick={handleShare}>
              <Share2 className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-sm">Share this product</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-4">
            <div className="prose max-w-none">
              <p>{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="details" className="py-4">
            <div className="space-y-4">
              <h3 className="font-medium">Product Details</h3>
              <ul className="list-disc pl-5 space-y-2">
                {product.productDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
              <h3 className="font-medium mt-6">Product Care</h3>
              <ul className="list-disc pl-5 space-y-2">
                {product.productCare.map((care, index) => (
                  <li key={index}>{care}</li>
                ))}
              </ul>
              <h3 className="font-medium mt-6">Dimensions</h3>
              <ul className="list-disc pl-5 space-y-2">
                {product.productDimensions.map((dimension, index) => (
                  <li key={index}>{dimension}</li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
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
      )}
    </div>
  );
}
