"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeIn } from "@/variants/fadIn";
import { lifeyFont, wifeyFont } from "@/fonts";
import { Heading3Icon } from "lucide-react";


const HeroSection = () => {
  return (
    // <div className="w-full pt-32 relative h-[calc(100vh-64px)] md:h-[calc(100vh-128px)] bg-creamey">
    <div className="w-full pt-16 md:pt-32 relative h-[calc(75vh-64px)] md:h-[calc(100vh-128px)] bg-creamey">
      <div className="relative h-[80%] md:h-[75%] flex pb-[25vh] lg:pb-[15vh] justify-start lg:w-2/3 xl:w-1/2 items-center sm:pb-[25vh] lg:justify-start lg:items-start">
       
               <motion.div
          variants={fadeIn({ direction: "right", delay: 0.2 })}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.6 }}
          className="relative text-lovely max-sm:text-sm uppercase ml-[5vw] sm:ml-[10vw] lg:ml-[8vw]"
        >
          <h2 className="italic mb-0 max-xs:text-xl max-sm:text-2xl max-md:text-3xl" style={{ transform: "scaleY(1.3)" }}>
           Your Bridal-Era Bestie for
            
          </h2>
          <h2 className="italic mb-0 leading-tight max-xs:text-xl max-md:text-2xl" style={{ transform: " scaleY(1.3)" }}>
            Wedding & Gehaz Planning
          </h2>
          <div className="flex items-center justify-start text-start gap-2 ">
            <div className="uppercase italic leading-[0.9]">
              <p className="mb-0 leading-[0.9]">              Because brides deserve clarity, support and peace Not pressure or noise.<br />
</p>
              {/* <p className="leading-[0.9] mb-0">Not pressure or noise.</p> */}
            </div>
            {/* <div>
              <p
                className={`italic text-5xl lowercase leading-tight sm:text-6xl lg:text-8xl mb-0 ${lifeyFont.className}`}
              >
                Community
              </p>
            </div> */}
          </div>
          {/* <div className="absolute -bottom-[5vh] -left-[5vw] sm:-left-[4vw] lg:-left-[2vw]">
            <Image
              unoptimized
              className="-rotate-12"
              width={50}
              height={50}
              alt="ring"
              src={"/hero/WifeyForLifey Illustrations-26.png"}
            />
          </div> */}
          <div className="absolute rotate-12  -top-[8vh] md:-top-[10vh] right-[5vw] sm:right-[10vw] lg:right-[1vw]">
            <Image
              unoptimized
              width={50}
              height={50}
              alt="butterflyes"
              src={"/hero/WifeyForLifey Illustrations-28.png"}
            />
          </div>
        </motion.div>

        {/* <motion.div
          variants={fadeIn({ direction: "right", delay: 0.2 })}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.6 }}
          className="relative text-lovely max-sm:text-sm uppercase ml-[5vw] sm:ml-[10vw] lg:ml-[8vw]"
        >
          <h1 className=" italic font-semibold line-clamp-2 normal-case leading-relaxed tracking-normal text-xl sm:text-2xl lg:text-4xl" >
            Your  <span 
                className={`italic leading-tight text-2xl lowercase  sm:text-3xl lg:text-5xl mb-0 ${lifeyFont.className}`}
            >
              Bridal-Era Bestie</span> for<br />
            Wedding & Gehaz Planning
          </h1>
          <div className={`normal-case leading-tight italic tracking-wide text-base sm:text-lg font-medium ${wifeyFont.className}`}>
            <p className="m-0">
              Because brides deserve clarity, support and peace.<br />
              Not pressure or noise.
            </p>
          </div>
          <div className="absolute rotate-12 -top-[3vh] right-[5vw] sm:right-[10vw] lg:-right-[2vw]">
            <Image
              unoptimized
              width={50}
              height={50}
              alt="ring"
              src={"/hero/WifeyForLifey Illustrations-28.png"}
            />
          </div>
        </motion.div> */}
      </div>
      <div className="w-full relative bottom-0 md:flex left-0 h-[20%] sm:h-[25%] border-t-lovely border-2 bg-pinkey">
        <motion.div
          variants={fadeIn({ direction: "left", delay: 0.2 })}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.6 }}
          className="aspect-auto absolute -top-[200px] sm:-top-[330px] right-[3vw] sm:right-[9vw] md:right-[8vw]"
        >
          <Image
            // className=" max-sm:scale-105 max-md:scale-125 md:aspect-auto"
            className=" max-sm:scale-110 max-md:scale-125 md:scale-105"
            // src="/hero/Brides Together.png"
            src="/cristmas/hero.png"
            alt="Brides Together"
            width={500}
            height={500}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
