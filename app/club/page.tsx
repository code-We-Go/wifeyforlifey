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

const OPTIONS: EmblaOptionsType = { loop: true }



const ClubPage = () => {
  const MotionSection = motion<'section'>('section');
  const bgSectionRef = useRef<HTMLDivElement>(null);
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    const section = bgSectionRef.current;
    if (!section) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setShowBlur(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (

   
    <div className="relative container-custom py-16 max-lg:max-w-6xl xl:max-w-7xl mx-auto  overflow-x-hidden">
  
  <motion.div  variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}

      className="text-center mb-16">
        <h1 className={`${thirdFont.className} tracking-normal text-4xl md:text-5xl font-bold mb-6 text-lovely`}>
          Welcome to The Wifey Experience 💖
        </h1>
        <p className="text-xl md:text-2xl text-lovely/90 mb-8">
          More than just a planner — it&apos;s your full bridal-era support system.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          Planning your wedding and building your home shouldn&apos;t feel overwhelming or lonely. That&apos;s why Wifey for Lifey offers every bride a personalized experience that guides, supports, and celebrates you through every step — from confusion to confidence, from &quot;I don&apos;t know where to start&quot; to &quot;I&apos;ve got this!&quot;
        </p>

        </motion.div>

<HeroCarousel/>
<div ref={bgSectionRef} className=" h-[60vh] sm:h-[80vh]  lg:h-[180vh] aspect-auto bg-no-repeat bg-contain bg-expBG mb-10">
<BottomBlurOut />
</div>
{/* {showBlur && (
  <div
    className="fixed bottom-0 bg-transparent left-0 w-full h-[10vh] pointer-events-none z-50"
    style={{
      // background: "linear-gradient(to top, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0))",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)"
    }}
  />
)} */}

    





     

  
      <MotionSection className="text-center bg-lovely p-8 rounded-2xl animate-bounce-slow">
        <h2 className={`${thirdFont.className} tracking-wide text-4xl font-bold mb-4 text-creamey`}>
          ✨ This is the Wifey Experience
        </h2>
        <p className="text-xl text-creamey/70 mb-4">
          Organized. Supportive. Real.
        </p>
        <p className="text-xl text-creamey/70 mb-8">
          And always wrapped in love.
        </p>
        <h3 className="text-2xl font-semibold mb-4 text-creamey/90">
          Ready to feel held, heard, and hyped up for your bridal era?
        </h3>
        <p className="text-lg text-creamey/90">
          You&apos;re one click away from joining your new favorite club
        </p>
        <Button
            asChild
            variant="outline"
            className="bg-everGreen hover:text-creamey border-0 hover:bg-lovely text-creamey  mt-4 "
          >
            <Link href="/subscribtion">
              Join Now <ArrowRight className=" ml-2 h-4 w-4" />
            </Link>
          </Button>
      </MotionSection>
    </div>
  );
};

export default ClubPage;