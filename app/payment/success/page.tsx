// pages/success.tsx
'use client'
import Fireworks from "./components/Fireworks";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/providers/CartProvider";

export default function SuccessPage() {
  const {clearCart} = useCart()
  useEffect(() => {
    
  clearCart()

  }, [])
  
  return (
    <div className="flex bg-creamey w-full items-center pt-0 md:pt-4 justify-center md:justify-start h-autp md:min-h-[calc(100vh-128px)] min-h-[calc(100vh-64px)]  flex-col gap-6 relative overflow-hidden">
      <Fireworks />

      <div className="text-center z-10">
      <div className="relative h-[400px] md:h-[300px] lg:h-[330px] rounded-lg overflow-hidden">
          <Image
            src="/joinNow/Brid and Bridesmaids.png"
            alt="Hero Image"
            fill
            priority
            className="object-contain aspect-auto rounded-lg"
          />
        </div>

        {/* <h1 className="text-5xl font-bold text-green-600">🎉 Success!</h1> */}
        <h1 className="mt-2 text-lg sm:text-xl md:text-2xl font-bold text-lovely">🎉 Your Order was created successfully. 🎉</h1>
        <div className="mt-6 flex gap-4 justify-center">
          <Link href="/" passHref>
            <button className="px-6 border-2 border-lovely py-2   text-lovely rounded-2xl font-semibold  transition">
              Go to Home
            </button>
          </Link>
          <Link href="/shop" passHref>
            <button className="px-6 py-2 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
