import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Video, ShoppingBag } from "lucide-react";
// import { mockProducts } from "@/models/Product";
// import { mockPlaylists } from "@/models/VideoPlaylist";
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
import Newsletters from "@/components/sections/Newsletters";

export default function Home() {
  // Filter featured products

  // const featuredPlaylists = mockPlaylists.slice(0, 2);

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
<Newsletters/>
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
