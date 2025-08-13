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
    <div className="relative   flex flex-col justify-start  items-center w-full py-16   overflow-x-hidden">
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
          More than just a planner — it&apos;s your full bridal-era support
          system.
        </p>
        <p className="text-base text-lovely/95 leading-relaxed">
          Planning your wedding and building your home shouldn&apos;t feel
          overwhelming or lonely. That&apos;s why Wifey for Lifey offers every
          bride a personalized experience that guides, supports, and celebrates
          you through every step — from confusion to confidence, from &quot;I
          don&apos;t know where to start&quot; to &quot;I&apos;ve got
          this!&quot;
        </p>
      </motion.div>

      <div className="w-full container-custom  max-w-4xl px-4 ">
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
        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className={`${lifeyFont.className} mx-1 font-bold`}>
            The Wifey Experience
          </h2>

          <h6 className="text-lovely/90 mt-2">
            Here’s what you get when you’re part of the Wifey’s community{" "}
          </h6>
          <h6 className="text-lovely/90 mt-2 text-center">
            Here’s what happens when you subscribe:{" "}
          </h6>
          <p className="text-lovely/90 mt-1 max-w-lg">
            ✨ You’ll unlock 1 full year of access to The Wifey Experience — our
            exclusive digital channel, partner discounts, and support circle
            where brides and experts are just a message away.{" "}
          </p>
          <p className="text-lovely/90 mt-1 max-w-lg">
            ✨ Plus, you’ll receive your Gehaz Bestie Planner — a beautiful
            keepsake that’s yours for a lifetime, guiding you through every
            section of your home (see the Shipping Details section for delivery
            info){" "}
          </p>
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
          className={`${thirdFont.className} tracking-normal text-xl md:text-3xl font-bold mb-6 text-creamey`}
        >
          😵‍💫 Don&apos;t know what to buy or where to start?
        </h1>
        <h2
          className={`${thirdFont.className} tracking-normal text-lg md:text-2xl font-bold mb-2 text-creamey`}
        >
          💡 Start with Your Gehaz, Your Way Planner
        </h2>
        <p className="text-base md:text-lg text-creamey/95 mb-2">
          This isn&apos;t just a planner — it&apos;s your lifelong reference
          guide. Designed with real brides in mind, it walks you through every
          room, every category, and every item you&apos;ll need to build your
          home — with clear sections, &quot;essentials vs nice-to-haves,&quot;
          quantities recommendation and Emotions Journaling!
        </p>
        <p className="text-base text-creamey/95 leading-relaxed">
          ✅ The best part? It stays useful for life — you&apos;ll reference it
          again and again during upgrades, moves, or even gifting.
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
        <div className="grid grid-cols-1  gap-4 mt-4">
          <div className="relative w-full h-64 md:min-h-[800px]  rounded-lg overflow-hidden">
            <Image
              src="/experience/planner3.jpeg"
              alt="planner 3"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
      <div
        id="channel"
        // variants={fadeIn({ direction: "up", delay: 0.2 })}
        // initial="hidden"
        // whileInView="show"
        // viewport={{ once: true, amount: 0.15 }}
        className="text-start mb-16 pt-16 container-custom"
      >
        <h1
          className={`${thirdFont.className} tracking-normal text-xl md:text-3xl font-bold mb-6 text-lovely`}
        >
          ❓Confused about which type to choose?
        </h1>
        <h2
          className={`${thirdFont.className} tracking-normal text-lg md:text-2xl font-bold mb-2 text-lovely`}
        >
          💡 Unlock the Private Learning Channel (included in your yearly
          subscription){" "}
        </h2>
        <p className="text-base md:text-lg text-lovely/95 mb-2">
          Not sure what kind of mattress to choose? Or whether you should get a
          food processor or a full kitchen machine? This exclusive channel
          breaks it all down for you — in simple, visual videos covering
          furniture, appliances, fabrics, and more.{" "}
        </p>
        <p className="text-base text-lovely/95 leading-relaxed">
          Interviews with experts from different industries who are here to give
          you all the tips you didn’t know you need! ✅ Real bride-tested.
          Expert-approved. No overwhelm, just clarity{" "}
        </p>
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

          {/* <div className="relative w-full h-[400px] md:h-[900px] rounded-lg overflow-hidden">
            <Image
              src="/experience/playlists1.png"
              alt="Gehaz Planner Preview 1"
              fill
              className="object-contain "
            />
          </div> */}
        </div>
      </div>
      <div
        id="partnerships"
        // variants={fadeIn({ direction: "up", delay: 0.2 })}
        // initial="hidden"
        // whileInView="show"
        // viewport={{ once: true, amount: 0.15 }}
        className="text-start  py-16   bg-lovely container-custom text-creamey"
      >
        <h1
          className={`${thirdFont.className} tracking-normal text-xl md:text-3xl font-bold mb-6 text-creamey`}
        >
          😰 Overwhelmed by too many options & don’t know who to trust or where
          to shop?{" "}
        </h1>
        <h2
          className={`${thirdFont.className} tracking-normal text-lg md:text-2xl font-bold mb-6 text-creamey`}
        >
          💡 We’ve got the partnerships — you get the perks
        </h2>
        <p className="text-base md:text-lg text-creamey/95 ">
          As part of your yearly subscription, you get access to exclusive Wifey
          deals with trusted brands across furniture, appliances, home
          essentials, and more.{" "}
        </p>
        <p className="text-base text-creamey/95 leading-relaxed">
          ✅ We’ve done the research so you don’t have to — you’ll save money
          and avoid regretful purchases.
        </p>
        <p className="text-base font-bold text-creamey/95 leading-relaxed">
          We’ve got brands you love, and we’ll keep adding more!
        </p>
        <h3
          className={`${thirdFont.className} mt-4 mb-2 font-semibold tracking-wider text-base md:text-xl`}
        >
          What you are getting :
        </h3>
        <p>❤️ Trusted partner list.</p>
        <p>❤️ Exclusive discounts just for experience subscribers.</p>
        <p>❤️ Guidance on every purchase.</p>
        <OurPartnersExp />
        {/* <div className="grid grid-cols-1 gap-4 mt-8">
          <div className="relative w-full h-[400px] md:h-[900px] rounded-lg overflow-hidden">
            <Image
              src="/experience/partners1.png"
              alt="Gehaz Planner Preview 1"
              fill
              className="object-contain "
            />
          </div>

        </div> */}
      </div>
      <div
        id="support"
        // variants={fadeIn({ direction: "up", delay: 0.2 })}
        // initial="hidden"
        // whileInView="show"
        // viewport={{ once: true, amount: 0.15 }}
        className="text-start pt-16 mb-16 container-custom"
      >
        <h1
          className={`${thirdFont.className} tracking-normal text-xl md:text-3xl font-bold mb-6 text-lovely`}
        >
          😩 Feeling stressed, emotional, or just need someone who gets it?{" "}
        </h1>
        <h2
          className={`${thirdFont.className} tracking-normal text-lg md:text-2xl font-bold mb-6 text-lovely`}
        >
          💡 Your Wifey Support Circle (included in your yearly subscription)
        </h2>
        <p className="text-base md:text-lg text-lovely/95 ">
          This isn’t just a support group — it’s a sisterhood. You’ll be added
          to our private WhatsApp group of brides like you, where we support
          each other with advice, venting, and cheerleading.
        </p>
        <p className="text-base text-lovely/95 leading-relaxed">
          You’ll also get:{" "}
        </p>
        <p className="text-base text-lovely/95 leading-relaxed">
          ✨ Free monthly emotional check-in webinars
        </p>
        <p className="text-base text-lovely/95 leading-relaxed">
          ✨ Discounted expert sessions on sex education, gynecology, interior
          design, and more
        </p>
        <p className="text-base text-lovely/95 leading-relaxed">
          ✨ A space where you’re seen, supported, and celebrated.
        </p>
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
