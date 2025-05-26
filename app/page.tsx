import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Video, ShoppingBag } from "lucide-react";
import { mockProducts } from "@/models/Product";
import { mockPlaylists } from "@/models/VideoPlaylist";
import ProductCard from "@/components/shop/ProductCard";
import VideoCard from "@/components/playlists/VideoCard";
import { Gluten, lifeyFont, wifeyFont } from "./layout";

export default function Home() {
  // Filter featured products
  const featuredProducts = mockProducts
    .filter((product) => product.featured)
    .slice(0, 3);
  const featuredPlaylists = mockPlaylists.slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-pink-gradient py-16 md:py-24">
        <div className="container-custom grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 md:pr-12">
            <h1
              className={`${lifeyFont.className} text-4xl md:text-5xl lg:text-6xl  font-bold text-primary-foreground`}
            >
              Embrace Your Style & Passion
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Shop unique products and unlock exclusive video content to express
              your true self.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/shop">
                  Shop Now <ShoppingBag className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Link href="/playlists">
                  Explore Playlists <Video className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[500px] rounded-lg overflow-hidden animate-float">
            <Image
              src="https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg"
              alt="Hero Image"
              fill
              priority
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-display font-medium text-primary-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Discover our handpicked selection of trending items
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0">
              <Link href="/shop">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Banner */}
      <section className="bg-secondary py-16">
        <div className="container-custom">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-display font-medium text-primary-foreground">
                  Unlock Exclusive Content
                </h2>
                <p className="text-muted-foreground">
                  Subscribe to gain access to premium video playlists,
                  tutorials, and behind-the-scenes content.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-primary mr-2" />
                    <span>Premium video tutorials</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-primary mr-2" />
                    <span>Early access to new content</span>
                  </div>
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-primary mr-2" />
                    <span>Exclusive behind-the-scenes</span>
                  </div>
                </div>
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/subscribe">Subscribe Now</Link>
                </Button>
              </div>
              <div className="relative h-[300px] rounded-lg overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/6457518/pexels-photo-6457518.jpeg"
                  alt="Subscription Banner"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Playlists Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-display font-medium text-primary-foreground mb-2">
                Featured Playlists
              </h2>
              <p className="text-muted-foreground">
                Explore our curated video collections
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0">
              <Link href="/playlists">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredPlaylists.map((playlist) => (
              <VideoCard key={playlist._id} playlist={playlist} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-accent py-16">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="text-3xl font-display font-medium text-accent-foreground mb-4">
            Join Our Community
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to our newsletter for the latest product drops, exclusive
            content, and special offers.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              className="rounded-full flex-1"
            />
            <Button type="submit" className="rounded-full">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

// Input component for the newsletter form
function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`px-4 py-2 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
}
