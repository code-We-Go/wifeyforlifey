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

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { toast } = useToast();
  const { addItem } = useCart();

  const product = mockProducts.find((p) => p._id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

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

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addItem({
      productId: product._id || "",
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} (${quantity} ${
        quantity === 1 ? "item" : "items"
      }) has been added to your cart.`,
    });
  };

  // Related products (simple implementation: same category but different product)
  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p._id !== product._id)
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
                  href={`/shop?category=${product.category}`}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  {product.category.charAt(0).toUpperCase() +
                    product.category.slice(1)}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-muted-foreground">/</span>
                <span className="text-sm font-medium text-foreground line-clamp-1">
                  {product.name}
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
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-auto pb-1">
              {product.images.map((image, index) => (
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
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
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
            <h1 className="text-3xl font-display font-medium">
              {product.name}
            </h1>
            <div className="flex items-center mt-2">
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
                {product.ratings} ({product.reviews?.length || 0} reviews)
              </span>
            </div>
          </div>

          <div className="text-2xl font-medium">
            ${product.price.toFixed(2)}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

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
                disabled={quantity >= product.stock}
              >
                <span className="sr-only">Increase quantity</span>
                <span aria-hidden>+</span>
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                {product.stock} available
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              size="lg"
              className="rounded-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="rounded-full">
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
            <div className="flex items-center">
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
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-4">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                in dui mauris. Vivamus hendrerit arcu sed erat molestie
                vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh
                porttitor. Ut in nulla enim.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="details" className="py-4">
            <div className="space-y-4">
              <h3 className="font-medium">Product Details</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Category: {product.category}</li>
                <li>Stock: {product.stock} units</li>
                <li>Rating: {product.ratings} / 5</li>
                <li>Material: Premium Quality</li>
                <li>Style: Modern</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-4">
            <div className="space-y-6">
              <h3 className="font-medium">Customer Reviews</h3>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{review.username}</div>
                          <div className="flex mt-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`h-4 w-4 ${
                                  idx < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reviews yet. Be the first to review this product!</p>
              )}
              <Button>Write a Review</Button>
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
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
