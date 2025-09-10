"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { thirdFont } from "@/fonts";

const BookingPage = () => {
  return (
    <div className="w-full min-h-screen bg-creamey h-auto flex flex-col justify-start items-center py-8">
      <h1
        className={`${thirdFont.className} text-3xl md:text-4xl font-bold text-lovely mb-8`}
      >
        Book Your Session
      </h1>
      <p className="text-center max-w-2xl mb-12 text-lovely/80">
        As part of your mini subscription, you can book one of our exclusive
        sessions. Please select the session type you would like to attend:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="relative bg-lovely p-2 pt-4 border-lovely border-2 group rounded-lg">
          <Image
            width={80}
            height={50}
            className="absolute -top-5 -rotate-45 -left-5 z-20"
            alt="fyonka"
            src={"/fyonkaCreamey.png"}
          />
          <div className="bg-lovely p-4">
            <h2
              className={`${thirdFont.className} text-2xl tracking-wide font-semibold text-center text-creamey mb-3`}
            >
              All About Appliances
            </h2>
            <p className="text-creamey mb-6">
              Learn everything you need to know about selecting the right
              appliances for your home. Our experts will guide you through the
              essential considerations for each appliance type.
            </p>
            <Link href="/calendly" className="block w-full">
              <button className="w-full py-3 bg-creamey text-lovely rounded-lg font-medium hover:bg-creamey/90 transition">
                Book This Session
              </button>
            </Link>
          </div>
        </div>

        <div className="relative bg-lovely p-2 pt-4 border-lovely border-2 group rounded-lg">
          <Image
            width={80}
            height={50}
            className="absolute -top-5 -rotate-45 -left-5 z-20"
            alt="fyonka"
            src={"/fyonkaCreamey.png"}
          />
          <div className="bg-lovely p-4">
            <h2
              className={`${thirdFont.className} text-2xl text-center tracking-wide font-semibold text-creamey mb-3`}
            >
              Self-Care During Gehaz Planning
            </h2>
            <p className="text-creamey mb-6">
              A heart-to-heart session dedicated to your wellbeing as a
              bride-to-be. Learn how to navigate the emotional side of gehaz
              planning and protect your inner peace during this exciting
              journey.
            </p>
            <Link href="/calendly2" className="block w-full">
              <button className="w-full py-3 bg-creamey text-lovely rounded-lg font-medium hover:bg-creamey/90 transition">
                Book This Session
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
