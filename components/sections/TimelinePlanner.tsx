"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { thirdFont } from "@/fonts";

export default function TimelinePlanner() {
  return (
    <section className="w-full bg-creamy py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12  items-start">
          {/* Left Content */}
          <div className="space-y-6 h-3/4 flex flex-col justify-between">
            <div className="space-y-4 leading-relaxed">
              <h2 
                className={`${thirdFont.className} text-3xl md:text-4xl lg:text-5xl font-bold text-lovely tracking-normal`}
              >
                Overthinking? We don&apos;t know her.
              </h2>
              <h3 
                className={`${thirdFont.className} text-2xl md:text-3xl lg:text-4xl font-bold text-lovely tracking-normal`}
              >
                Our Wedding Day Timeline Planner does it in under 2 minutes.
              </h3>
            </div>

            <div className="space-y-4 ">
              <p className="text-lovely font-semibold text-base md:text-lg">
                The first-ever automated wedding timeline tool created specifically for brides to help you:
              </p>
              
              <ul className="space-y-1 pl-6 text-lovely font-semibold">
                <li className="flex items-start gap-2">
                  <span className="text-lovely font-bold ">•</span>
                  <span className="text-sm md:text-base ">
                    Know whether to start with hair or makeup
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lovely font-bold ">•</span>
                  <span className="text-sm md:text-base">
                    Choose the right time slots when booking each vendor
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lovely font-bold ">•</span>
                  <span className="text-sm md:text-base">
                    Know exactly when to arrive at the venue
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lovely font-bold ">•</span>
                  <span className="text-sm md:text-base">
                    Create timelines for the bride, groom, bridesmaids & groomsmen
                  </span>
                </li>
              </ul>

              <p className="text-lovely  text-sm md:text-base pt-2">
                Built using real wedding-day logic — not guesses.
              </p>
            </div>

            <div className="pt-4 w-full flex justify-center">
              <Link href="/wedding-timeline">
                <Button 
                  className="bg-lovely hover:bg-lovely/90 text-white  font-normal text-base  px-8 md:px-12 py-5 md:py-8 rounded-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Create My Wedding Timeline
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Timeline Image */}
          <div className="order-2 flex justify-center lg:justify-end">
            <div className="relative w-full flex flex-col items-center justify-center max-w-md lg:max-w-lg">
              <div className="relative  aspect-[3/4] w-3/4 rounded-sm overflow-hidden shadow-2xl border-2 border-lovely/80">
                <Image
                  src="/timeline/media.jpg"
                  alt="Wedding Day Timeline Planner Preview"
                  fill
                  className="object-contain bg-creamy"
                  priority
                />
              </div>
                      <div className="mt-4 text-center">
          <p className="text-lovely text-sm md:text-base ">
            Customizable and shareable — so your wedding planning stays stress-free.
          </p>
        </div>
              
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-pinkey/10 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-pinkey/10 rounded-full blur-2xl -z-10"></div>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        {/* <div className="mt-12 text-center">
          <p className="text-lovely text-sm md:text-base italic">
            Customizable and shareable — so your wedding planning stays stress-free.
          </p>
        </div> */}
      </div>
    </section>
  );
}
