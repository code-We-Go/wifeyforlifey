import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Video, ShoppingBag } from "lucide-react";
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
import OurPartners from "@/components/sections/OurPartners";
import OurPartners2 from "@/components/partners2/OurPartners2";
import Testimonials from "@/components/sections/Testimonials";
import FeaturedBlogs from "@/components/sections/FeaturedBlogs";
import Pricing from "./components/Pricing";
import TimelinePlanner from "@/components/sections/TimelinePlanner";
import BridalJourney from "@/components/sections/BridalJourney";
import ExpertSessions from "@/components/sections/ExpertSessions";
import WifeyCommunity from "@/components/sections/WifeyCommunity";
import BridalJourneyTwo from "@/components/sections/BridalJourneyTwo";
import CategoriesSection from "@/components/sections/CategoriesSection";
import Support360 from "@/components/sections/Support360";

export default function Home() {
  // Filter featured products

  // const featuredPlaylists = mockPlaylists.slice(0, 2);

  return (
    <div className="flex  h-auto flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Bridal Journey Section */}
      <BridalJourneyTwo />
      {/* <BridalJourney /> */}
      
      {/* <HeroTwo /> */}
      <JoinNow />
      
            {/* <CategoriesSection /> */}
      {/* 360 Support Section */}
      <Support360 />
      <TimelinePlanner />
      
      
      {/* Expert Sessions Section */}
      <ExpertSessions />
      
      {/* <Pricing /> */}

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Subscription Banner */}
      {/* <ExclusiveContent /> */}

      {/* Featured Playlists Section */}
      <Playlists />
      {/* <FeaturedBlogs /> */}
      {/* <BrandCharacters/> */}
      {/* Newsletter Section */}
      <OurPartners />

      <WifeyCommunity />
      <Testimonials />
      {/* <div className="relative h-32">

<OurPartners2/>
</div> */}
      <Newsletters />
    </div>
  );
}

// Input component for the newsletter form
// function Input({
//   className,
//   ...props
// }: React.InputHTMLAttributes<HTMLInputElement>) {
//   return (
//     <input
//       className={`px-4 py-2 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
//       {...props}
//     />
//   );
// }
