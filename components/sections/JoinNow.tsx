import { lifeyFont, thirdFont } from '@/fonts'
import {  ShoppingBag, Video } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import Link from "next/link";


const JoinNow = () => {
  return (
    <section className="bg-pinkey text-lovely py-16 md:py-24">
    <div className="container-custom grid md:grid-cols-2 gap-8 items-center">
      <div className="space-y-6 md:pr-12">
        <h1
          className={`${thirdFont.className} text-4xl md:text-5xl  lg:text-6xl  font-bold `}
        >
          Subscribe Now & Join Our Club .
        </h1>
        <p className="text-lg md:text-xl ">
         unlock exclusive content ,Planning Tips, and Insider Deals!

.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="rounded-full bg-lovely hover:bg-everGreen text-creamey">
            <Link href="/packages">
              Subscribe
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full bg-creamey text-lovely hover:bg-everGreen hover:text-creamey"
          >
            <Link href="/playlists">
              see what&apos;s inside
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative bg-creamey h-[300px] md:h-[500px] rounded-lg overflow-hidden animate-float">
        <Image
        
          src="/joinNow/Brid and Bridesmaids.png"
          alt="Hero Image"
          fill
          priority
          className="object-contain aspect-auto rounded-lg"
        />
      </div>
    </div>
  </section>
  )
}

export default JoinNow