"use client";
import { lifeyFont, thirdFont } from "@/fonts";
import React, { useRef, useEffect, useState } from "react";
import { motion, MotionProps } from "framer-motion";
import { fadeIn } from "@/variants/fadIn";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { EmblaOptionsType } from "embla-carousel";
import EmblaCarouselAutoScroll from "@/components/embla/EmblaCarouselAutoScroll";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import HeroCarousel from "./components/HeroCarouselPL";
import { CarouselTransition } from "./components/MaterialCarousel";
import { BottomBlurOut } from "./components/ButtomBlurOut";
import FlipCard from "./components/FlipCard";
import FlipingCardNew from "./components/FlipingCardNew";
import { wifeyFont } from "@/fonts";
import { VideoPlaylist } from "../interfaces/interfaces";
import VideoCard from "@/components/playlists/VideoCard";
import OurPartnersExp from "@/components/sections/OurPartnersExp";
import { TimeLine } from "./components/TimeLine";
import FAQ from "./components/FAQ";

const OPTIONS: EmblaOptionsType = { loop: true };

const ClubPage = () => {
  const MotionSection = motion<"section">("section");
  const bgSectionRef = useRef<HTMLDivElement>(null);

  const [featuredPlaylists, setFeaturedPlaylists] = useState<VideoPlaylist[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchFeaturedPlaylists = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/playlists?featured=true&all=true");
        const data = await res.json();
        if (res.ok) {
          setFeaturedPlaylists(data.data || []);
        } else {
          setError(data.error || "Failed to fetch featured playlists");
        }
      } catch (err) {
        setError("Failed to fetch featured playlists");
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedPlaylists();
  }, []);

  return (
    <div className="relative   flex flex-col justify-start  items-center w-full py-16   ">
      <motion.div
        variants={fadeIn({ direction: "up", delay: 0.2 })}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="text-start mb-8 container-custom"
      >
        <h1
          className={`${thirdFont.className} tracking-normal text-2xl md:text-4xl font-bold mb-2 text-lovely`}
        >
          Welcome to The
          <span className={`${lifeyFont.className} mx-1`}>
            Wifey Experience 💖
          </span>
          {/* <span className={`${lifeyFont.className}`}>W</span><span style={{ transform: "scaleY(1.5)" }} className={`${wifeyFont.className} uppercase tracking-tighter font-light italic mr-1`}>ifey </span> Experience 💖 */}
        </h1>
        <p className="text-base md:text-lg text-lovely/95 mb-1">
          {/* <span className="font-bold">More than just a planner </span> —
          it&apos;s your full bridal-era support system. */}
          So glad you found us — we’ve been looking for you! 💗
        </p>
        <p className="text-base text-lovely/95 leading-relaxed">
          Building your home shouldn&apos;t feel{" "}
          <span className="font-bold">stressful</span> or{" "}
          <span className="font-bold">lonely</span>. That&apos;s why we created
          the Wifey experience — your-all-in-one bridal bestie to guide,support
          and celebrate you from &quot;I don&apos;t know where to start&quot; to
          &quot;I&apos;ve got this!&quot; 💍✨
        </p>
      </motion.div>

      <div className="w-full container-custom  max-w-4xl  ">
        <div className="relative   w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src="https://drive.google.com/file/d/1DoGEuz8e1GCmzytt3N3acAWF1u4NkfaA/preview"
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen={true}
            allow="encrypted-media"
          />
        </div>
      </div>
      <div className="w-full  text-center text-lovely mt-10 md:mt-24">
        <div className="flex flex-col items-center w-full container-custom justify-center gap-2">
          {/* <h2 className={`${lifeyFont.className} mx-1 font-bold`}>
            The Wifey Experience
          </h2> */}

          <h6 className="text-lovely/90 mt-2 font-bold text-left w-full">
            Here’s what you get when you’re part of the Wifey’s community
          </h6>

          <div className="text-lovely/90 w-full text-left mt-1">
            <ol className="list-decimal pl-4">
              <li className="mb-2">
                Instant 1 full year access to:
                <ul className="list-disc pl-6">
                  <li>Our Exclusive online channel</li>
                  <li>Partner discounts &amp; trust list</li>
                  <li>Support Circle — brides &amp; experts by your side</li>
                </ul>
              </li>
              <li>
                Your Gehaz Bestie Planner - a beautiful keepsake that’s yours
                for a lifetime
              </li>
            </ol>
          </div>
        </div>
        <TimeLine />
        <Button
          asChild
          variant="outline"
          className="bg-lovely animate-pulse hover:bg-lovely hover:text-creamey text-base font-semibold text-creamey hover:font-bold tracking-wide transition duration-300 border-0   mt-4 "
        >
          <Link href="/subscription/687396821b4da119eb1c13fe">
            Join Now <ArrowRight className=" ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div
        id="gehazPlanner"
        // variants={fadeIn({ direction: "up", delay: 0.2 })}
        // initial="hidden"
        // whileInView="show"
        // viewport={{ once: true, amount: 0.15 }}
        className="text-start container-custom  mt-16 py-16 w-full bg-lovely text-creamey"
      >
        <h1
          className={`${thirdFont.className} tracking-wider text-xl md:text-3xl font-semibold mb-6 text-creamey`}
        >
          Step 1 — Gehaz Bestie Planner{" "}
        </h1>
        <p className={`  text-lg md:text-xl  mb-2 text-creamey`}>
          We know you’re <span className="font-bold"> overwhelmed</span> —
          endless lists, <span className="font-bold">conflicting advice</span>,
          and not knowing where to start can make planning your gehaz{" "}
          <span className="font-bold">stressful</span>
          instead of exciting.{" "}
        </p>
        <p className={`  text-lg md:text-xl  mb-2 text-creamey`}>
          That’s why we created the{" "}
          <span className="font-bold"> Gehaz Bestie Planner </span>— your
          lifelong,
          <span className="font-bold"> organized</span>, and easy-to-follow
          guide that takes you through:{" "}
        </p>
        <p className="text-base md:text-lg text-creamey/95 mb-2">
          <span className="block">- Every room in your home</span>
          <span className="block">
            - Essentials vs Nice-to-Haves so you don’t overspend
          </span>
          <span className="block">
            - Quantity recommendations so you buy just enough
          </span>
          <span className="block">
            - Emotions Journaling to keep you grounded through the chaos
          </span>
        </p>
        <p className="text-base text-creamey/95 leading-relaxed">
          💡 It’s yours for life — reuse it for home upgrades, moves, or when
          helping someone else plan.
        </p>

        {/* Gehaz Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="relative w-full h-64 md:h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/experience/gehaz1.png"
              alt="Gehaz Planner Preview 1"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-full h-64 md:h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/experience/gehaz2.png"
              alt="Gehaz Planner Preview 2"
              fill
              className="object-cover"
            />
          </div>
        </div>
        {/* <div className="grid grid-cols-1  gap-4 mt-4">
          <div className="relative w-full h-64 md:min-h-[800px]  rounded-lg overflow-hidden">
            <Image
              src="/experience/planner3.jpeg"
              alt="planner 3"
              fill
              className="object-cover"
            />
          </div>
        </div> */}
      </div>
      <div id="channel" className="text-start mb-16 pt-16 container-custom">
        <h1
          className={`${thirdFont.className} tracking-wider text-xl md:text-3xl font-bold mb-6 text-lovely`}
        >
          Step 2: Exclusive Gehaz Educational Channel
        </h1>
        <p className={`  text-lg md:text-xl  mb-2 text-lovely`}>
          We know you’re staring at hundreds of options — Should I get a{" "}
          <span className="font-bold">granite </span>or
          <span className="font-bold">stainless steel</span> cookware set? Is
          this fabric even good quality?” Google searches only make it more{" "}
          <span className="font-bold">confusing</span>.
        </p>
        <p className={`  text-lg md:text-xl  my-2 text-lovely`}>
          That&apos;s why we created{" "}
          <span className="font-bold"> The Gehaz Educational Channel</span>
        </p>
        <ul className="text-base md:text-lg text-lovely/95 mb-2 list-disc pl-6">
          <li>
            Explains the different types of product available in the market
          </li>
          <li>
            Gives you <span className="font-bold">clear</span>,{" "}
            <span className="font-bold">visual</span>,{" "}
            <span className="font-bold">bite-sized answers</span> so you can
            make decisions without second-guessing
          </li>
          <li>Real-bride demos so you see how products work in real life</li>
          <li>
            <span className="font-bold"> Interviews with industry experts</span>{" "}
            (designers, appliances experts) sharing insider tips on what’s worth
            your money
          </li>
        </ul>
        <div className="grid grid-cols-1 gap-4 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPlaylists.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                No featured playlists found.
              </div>
            ) : (
              featuredPlaylists
                .slice(0, 3)
                .map((playlist) => (
                  <VideoCard key={playlist._id} playlist={playlist} />
                ))
            )}
          </div>
        </div>
      </div>
      <div
        id="partnerships"
        className="text-start py-16 w-full bg-lovely container-custom  text-creamey"
      >
        <h1
          className={`${thirdFont.className} tracking-normal text-xl md:text-3xl font-bold mb-6 text-creamey`}
        >
          Step 3 — Partnerships & Perks
        </h1>
        <p className={`  text-lg md:text-xl  mb-2 text-creamey`}>
          We know it’s easy to feel <span className="font-bold">lost</span> —
          <span className="font-bold">too many brands</span>,
          <span className="font-bold"> pushy salespeople</span>, and the fear of
          buying something you’ll regret.
        </p>
        <p className={`  text-lg md:text-xl  mb-2 text-creamey`}>
          That’s why we built our{" "}
          <span className="font-bold"> Partnerships & Perks program</span>
        </p>
        <h3
          className={`${thirdFont.className} mt-4 mb-2 font-semibold tracking-wider text-base md:text-xl`}
        >
          What will you get?
        </h3>
        <ul className="text-base md:text-lg text-creamey/95 mb-2 list-disc pl-6">
          <li>
            Trusted partners list that grows over time — your membership keeps
            increasing in value{" "}
            <span className="italic">&quot;Wifey approved ;)&quot;</span>
          </li>
          <li>
            Community-only discounts so you save money on the things you
            actually need
          </li>
        </ul>
        <OurPartnersExp />
      </div>
      <div id="support" className="text-start pt-16 mb-16 container-custom">
        <h1
          className={`${thirdFont.className} tracking-normal text-xl md:text-3xl font-bold mb-6 text-lovely`}
        >
          Step 4 : Support Group{" "}
        </h1>
        <p className={`  text-lg md:text-xl  mb-2 text-lovely`}>
          We know the bridal journey can feel{" "}
          <span className="font-bold">lonely </span>— the{" "}
          <span className="font-bold">stress</span>,{" "}
          <span className="font-bold">pressure</span>, and questions you
          can&apos;t always share with family or friends.
        </p>
        <p className={`  text-lg md:text-xl  mb-2 text-lovely`}>
          That&apos;s why we created the Wifey Support Circle — your safe space
          to be <span className="font-bold">supported</span>,
          <span className="font-bold"> celebrated </span>, and
          <span className="font-bold"> understood </span>.
        </p>
        <ul className="text-base md:text-lg text-lovely/95 mb-2 list-disc pl-6">
          <li>
            Private WhatsApp community where brides and Wifey&apos;s trusted
            experts support each other
          </li>
          <li>
            Monthly emotional check-in webinars to give you a safe space to vent
            out
          </li>
          <li>
            Discounted 1:1 expert sessions (gynecology, sex education, interior
            design &amp; more)
          </li>
          <li>A space where you&apos;re seen, supported, and celebrated.</li>
        </ul>
        <div className="grid grid-cols-2 gap-2 mt-8">
          <div className="relative w-full h-[300px] sm:h-[500px] md:h-[600px] lg:h-[800px] xl:h-[900px] rounded-lg overflow-hidden">
            <Image
              src="/experience/support1.png"
              alt="Gehaz Planner Preview 1"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative w-full h-[300px] sm:h-[500px] md:h-[600px] lg:h-[800px] xl:h-[900px] rounded-lg overflow-hidden">
            <Image
              src="/experience/support2.png"
              alt="Gehaz Planner Preview 2"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
      <p className="text-lovely text-start w-full pb-12 container-custom">
        {" "}
        PS: Within 24 hours of subscription, You&apos;ll receive the invitation
        to Join our private WhatsApp community
      </p>
      <div
        // variants={fadeIn({ direction: "up", delay: 0.2 })}
        // initial="hidden"
        // whileInView="show"
        // viewport={{ once: true, amount: 0.15 }}
        className="text-start mb-16 w-full container-custom"
      >
        <h1
          className={`${thirdFont.className} tracking-normal text-xl md:text-3xl font-bold mb-6 text-lovely`}
        >
          ❤️ You’re not just buying a planner.
        </h1>
        <h2
          className={`${thirdFont.className} tracking-normal text-lg md:text-2xl font-bold mb-6 text-lovely`}
        >
          You’re joining a full experience — made for brides, by a bride, to
          make sure you never feel lost, alone, or unsure again.{" "}
        </h2>
      </div>

      {/* <div className=" grid w-full lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12  h-auto pt-16 pb-20 grid-cols-1 md:grid-cols-2 ">

        <FlipingCardNew exp="/experience/exp1.jpeg" sol="/experience/exp3.jpeg"/>
        <FlipingCardNew exp="/experience/exp2.jpeg" sol="/experience/exp3.jpeg"/>
        <FlipingCardNew exp="/experience/exp3.jpeg" sol="/experience/exp3.jpeg"/>
        <FlipingCardNew exp="/experience/exp4.jpeg" sol="/experience/exp4.jpeg"/>
 
        </div> */}
      <MotionSection className=" text-start   bg-lovely p-8 w-full max-w-2xl  rounded-2xl animate-bounce-slow">
        <h2
          className={`${thirdFont.className} w-full text-center tracking-wide text-2xl pr-4  font-bold mb-4 text-creamey`}
        >
          ✨ This is the Wifey Experience
        </h2>
        <p className="text-lg text-creamey/90 mb-2">
          Organized. Supportive. Real.
        </p>
        <p className="text-lg text-creamey/90 mb-2">
          And always wrapped in love.
        </p>
        <h3 className="text-lg  mb-2 text-creamey/90">
          Ready to feel held, heard, and hyped up for your bridal era?
        </h3>
        <p className="text-base text-creamey/90">
          You&apos;re one click away from joining your new favorite club
        </p>
        <div className="flex w-full justify-center">
          <Button
            asChild
            variant="outline"
            className="bg-creamey text-base font-semibold hover:text-lovely hover:font-bold tracking-wide transition duration-300 border-0 hover:bg-creamey hover:border-creamey hover:border text-lovely  mt-4 "
          >
            <Link href="/subscription/687396821b4da119eb1c13fe">
              Join Now <ArrowRight className=" ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </MotionSection>
      <FAQ />
    </div>
  );
};

export default ClubPage;
