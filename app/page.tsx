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
import Playlists from "@/components/sections/Playlists";
import { thirdFont } from "@/fonts";
import BrandCharacters from "@/components/sections/BrandCharacters";

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
<Playlists/>
 <BrandCharacters/>
      {/* Newsletter Section */}
      <section className="bg-creamey py-16">
        <div className="container-custom text-center ">
          <h2 className={`${thirdFont.className} text-4xl md:text-5xl  lg:text-6xl font-semibold text-accent-foreground mb-4`}>
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
            <Button type="submit" className="bg-everGreen hover:bg-lovely text-creamey rounded-full">
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
