import React from 'react'
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, TrendingUp, Video, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";



const ExclusiveContent = () => {
  return (
    <section className="bg-pattern1  ">
                <div className='inset-0 w-full h-full py-16 bg-black/5 backdrop-blur-[3px]'>

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
    </div>
  </section>
  )
}

export default ExclusiveContent