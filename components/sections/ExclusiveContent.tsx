import React from 'react'
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, TrendingUp, Video, ShoppingBag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { thirdFont } from '@/fonts';



const ExclusiveContent = () => {
  return (
    <section className="bg-pattern1  ">
                <div className='inset-0 w-full h-full py-16 bg-black/5 backdrop-blur-[3px]'>

    <div className="container-custom ">
      <div className="bg-pinkey rounded-2xl p-8   shadow-lg">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 ">
              <h2 className={`${thirdFont.className} text-4xl md:text-5xl  lg:text-6xl text-lovely`}>
              Unlock Exclusive Content
            </h2>
            <p className="text-lovely">
              Subscribe to gain access to premium video playlists,
              tutorials, and behind-the-scenes content.
            </p>
            <div className="space-y-4 text-lovely">
              <div className="flex items-center">
                <Video className="h-5 w-5 text-lovely mr-2" />
                <span>Exclusive bridal video library</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-lovely mr-2" />
                <span>Gehaz Planner – A complete household planning guide </span>
              </div>
              <div className="flex items-center">
                <Users  className="h-5 w-5 text-lovely mr-2" />
                <span>Private WhatsApp Support Group</span>
              </div>
            </div>
            <Button asChild size="lg" className="bg-lovely hover:bg-creamey text-creamey transition duration-300 hover:text-lovely rounded-full">
              <Link href="/subscription">Subscribe Now</Link>
            </Button>
          </div>
          <div className="relative border-2 border-creamey h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/joinNow/SalesandcollabsU.png"
              alt="Subscription Banner"
              fill
              className="aspect-auto  object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  </section>
  )
}

export default ExclusiveContent