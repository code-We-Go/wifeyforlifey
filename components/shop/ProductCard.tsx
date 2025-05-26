import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/models/Product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-card group">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 shadow-md">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="price-tag">${product.price.toFixed(2)}</span>
          <div className="flex items-center space-x-2">
            <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
              <Link href={`/shop/${product._id}`}>
                <span className="sr-only">View product</span>
                <span aria-hidden className="text-xs">View</span>
              </Link>
            </Button>
            <Button size="sm" variant="secondary" className="h-8 rounded-full">
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span className="text-xs">Add</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}