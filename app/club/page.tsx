'use client'
import { lifeyFont, thirdFont } from "@/fonts";
import React, { useRef, useEffect, useState } from "react";
import { motion, MotionProps } from 'framer-motion';
import { fadeIn } from "@/variants/fadIn";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Image from "next/image";
import { EmblaOptionsType } from 'embla-carousel'
import EmblaCarouselAutoScroll from "@/components/embla/EmblaCarouselAutoScroll";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import HeroCarousel from "./components/HeroCarouselPL";
import { CarouselTransition } from "./components/MaterialCarousel";
import { BottomBlurOut } from "./components/ButtomBlurOut";
import FlipCard from "./components/FlipCard";
import FlipingCardNew from "./components/FlipingCardNew";

const OPTIONS: EmblaOptionsType = { loop: true }



const ClubPage = () => {
  const MotionSection = motion<'section'>('section');
  const bgSectionRef = useRef<HTMLDivElement>(null);



  return (

   
    <div className="relative container-custom flex flex-col justify-start  items-center w-full py-16   overflow-x-hidden">
  
  <motion.div  variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}

      className="text-start mb-16">
        <h1 className={`${thirdFont.className} tracking-normal text-2xl md:text-4xl font-bold mb-6 text-lovely`}>
          Welcome to The Wifey Experience 💖
        </h1>
        <p className="text-base md:text-lg text-lovely/95 mb-8">
          More than just a planner — it&apos;s your full bridal-era support system.
        </p>
        <p className="text-base text-lovely/95 leading-relaxed">
          Planning your wedding and building your home shouldn&apos;t feel overwhelming or lonely. That&apos;s why Wifey for Lifey offers every bride a personalized experience that guides, supports, and celebrates you through every step — from confusion to confidence, from &quot;I don&apos;t know where to start&quot; to &quot;I&apos;ve got this!&quot;
        </p>

        </motion.div>

        <div className="w-full  max-w-4xl px-4">
        <div className="relative   w-full" style={{ paddingTop: "56.25%" }}>
          <iframe 
            src="https://drive.google.com/file/d/1DoGEuz8e1GCmzytt3N3acAWF1u4NkfaA/preview"
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen={true} 
            allow="encrypted-media"
          />
        </div>
      </div>
        
        <div className=" grid w-full lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12  h-auto pt-16 pb-20 grid-cols-1 md:grid-cols-2 ">

        <FlipingCardNew exp="/experience/exp1.jpeg" sol="/experience/exp3.jpeg"/>
        <FlipingCardNew exp="/experience/exp2.jpeg" sol="/experience/exp3.jpeg"/>
        <FlipingCardNew exp="/experience/exp3.jpeg" sol="/experience/exp3.jpeg"/>
        <FlipingCardNew exp="/experience/exp4.jpeg" sol="/experience/exp4.jpeg"/>
 
        </div>
      <MotionSection className="text-center mt-20 md:mt-16 bg-lovely p-8 w-full max-w-lg  rounded-2xl animate-bounce-slow" >
        <h2 className={`${thirdFont.className} tracking-wide text-2xl pr-4  font-bold mb-4 text-creamey`}>
          ✨ This is the Wifey Experience
        </h2>
        <p className="text-lg text-creamey/90 mb-4">
          Organized. Supportive. Real.
        </p>
        <p className="text-lg text-creamey/90 mb-8">
          And always wrapped in love.
        </p>
        <h3 className="text-lg  mb-4 text-creamey/90">
          Ready to feel held, heard, and hyped up for your bridal era?
        </h3>
        <p className="text-base text-creamey/90">
          You&apos;re one click away from joining your new favorite club
        </p>
        <Button
            asChild
            variant="outline"
            className="bg-creamey hover:text-lovely hover:font-semibold transition duration-300 border-0 hover:bg-creamey hover:border-creamey hover:border text-lovely  mt-4 "
          >
            <Link href="/subscription">
              Join Now <ArrowRight className=" ml-2 h-4 w-4" />
            </Link>
          </Button>
      </MotionSection>



    





     


    </div>
  );
};

export default ClubPage;