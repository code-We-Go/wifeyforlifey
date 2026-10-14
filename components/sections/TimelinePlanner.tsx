"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { thirdFont } from "@/fonts";
import { headerStyle, subHeaderStyle } from "@/app/styles/style";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTranslations } from "next-intl";

export default function TimelinePlanner() {
  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>();
  const t = useTranslations("home.timelinePlanner");
  
  return (
    <section 
      ref={sectionRef}
      className={`w-full bg-creamey py-8 md:py-16 px-4 md:px-8 transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12  items-start">
          {/* Left Content */}
          <div className="space-y-2 h-3/4 flex flex-col justify-between">
            <div className="space-y-2 leading-relaxed">
              <h2 
                className={`${thirdFont.className} ${headerStyle} text-lovely tracking-normal`}
              >
                {t("heading1")}
              </h2>
              <h3 
                className={`${thirdFont.className} ${headerStyle} text-lovely tracking-normal`}
              >
                {t("heading2")}
              </h3>
            </div>

            <div className="space-y-2 ">
              <p className={`text-lovely ${subHeaderStyle}`}>
                {t("subtitle")}
              </p>
              
              <ul className="list-disc list-outside ps-8 md:ps-10 text-lovely font-normal space-y-1">
                <li className="text-sm md:text-base">
                  {t("point1")}
                </li>
                <li className="text-sm md:text-base">
                  {t("point2")}
                </li>
                <li className="text-sm md:text-base">
                  {t("point3")}
                </li>
                <li className="text-sm md:text-base">
                  {t("point4")}
                </li>
              </ul>

              <p className="text-lovely  text-sm md:text-base md:pt-2">
                {t("footerNote")}
              </p>
            </div>

            <div className="pt-2 w-full flex justify-center">
              <Link href="/wedding-timeline">
                <Button 
                  className="bg-lovely hover:bg-lovely/90 text-white  font-normal text-base  px-8 md:px-12 py-5 md:py-8 rounded-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {t("button")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Timeline Image */}
          <div className="order-2 flex justify-center lg:justify-end">
            <div className="relative w-full flex flex-col items-center justify-center max-w-md lg:max-w-lg">
              <div className="relative  aspect-[3/4] bg-creamey w-3/4 rounded-sm overflow-hidden shadow-2xl border-2 border-lovely/80">
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
            {t("caption")}
          </p>
        </div>
              
              {/* Decorative element */}
              <div className="absolute -bottom-4 -end-4 w-24 h-24 bg-pinkey/10 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -top-4 -start-4 w-32 h-32 bg-pinkey/10 rounded-full blur-2xl -z-10"></div>
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
