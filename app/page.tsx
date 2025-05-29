import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Video, ShoppingBag } from "lucide-react";
import { mockProducts } from "@/models/Product";
import { mockPlaylists } from "@/models/VideoPlaylist";
import ProductCard from "@/components/shop/ProductCard";
import VideoCard from "@/components/playlists/VideoCard";
import HeroSection from "@/components/sections/HeroSection";
import HeroTwo from "@/components/sections/HeroTwo";
import JoinNow from "@/components/sections/JoinNow";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import ExclusiveContent from "@/components/sections/ExclusiveContent";

export default function Home() {
  // Filter featured products

  const featuredPlaylists = mockPlaylists.slice(0, 2);

  return (
    <div className="flex  h-auto flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection/>
      <HeroTwo/>
      <JoinNow/>

      {/* Featured Products Section */}
<FeaturedProducts/>

      {/* Subscription Banner */}
      <ExclusiveContent/>

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
      {/* <section className="bg-accent py-16">
        <div className="container-custom text-center ">
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
      </section> */}
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
