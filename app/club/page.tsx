'use client'
import { lifeyFont, thirdFont } from "@/fonts";
import React from "react";
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

const OPTIONS: EmblaOptionsType = { loop: true }



const ClubPage = () => {
  const MotionSection = motion<'section'>('section');

  return (
    <div className="container-custom py-16 max-lg:max-w-6xl xl:max-w-7xl mx-auto overflow-x-hidden">
      <MotionSection 
  variants={fadeIn({ direction: "up", delay: 0.2 })}
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
        <div className="mt-8">
          <EmblaCarouselAutoScroll
            slides={[
              <div key={1} className="relative h-[400px]">
                <Image src="/joinNow/Brid and Bridesmaids.png" alt="Welcome to Wifey Experience" fill className="object-cover rounded-lg" />
              </div>,
              <div key={2} className="relative h-[400px]">
                <Image src="/joinNow/Brid and Bridesmaids.png" alt="Bridal Support System" fill className="object-cover rounded-lg" />
              </div>
            ]}
            options={OPTIONS}
          />
        </div>
      </MotionSection>

      <MotionSection 
        variants={fadeIn({ direction: "up", delay: 0.1 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
      className="mb-12 bg-creamey ">
        <h2 className={`${thirdFont.className} tracking-wide text-4xl font-bold mb-6 text-lovely`}>
          💗 So… what is The Wifey Experience?
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          It&apos;s a full support system for brides like you — created by someone who&apos;s been exactly where you are. It&apos;s organized, comforting, and a little sparkly (just like your ring ✨).
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Here&apos;s what you get when you join The Wifey Experience:
        </p>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative h-[300px] cursor-pointer hover:opacity-90 transition-opacity">
                <Image src="/joinNow/Brid and Bridesmaids.png" alt="Wifey Experience" fill className="object-cover rounded-lg" />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <Image src="/joinNow/Brid and Bridesmaids.png" alt="Wifey Experience" width={1200} height={800} className="rounded-lg" />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <div className="relative h-[300px] cursor-pointer hover:opacity-90 transition-opacity">
                <Image src="/joinNow/Brid and Bridesmaids.png" alt="Wifey Experience" fill className="object-cover rounded-lg" />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <Image src="/joinNow/experience-2.jpg" alt="Wifey Experience" width={1200} height={800} className="rounded-lg" />
            </DialogContent>
          </Dialog>
        </div>
      </MotionSection>

      <MotionSection 
        variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
      className="mb-12 flex flex-col gap-4 md:flex-row">
       <div className="w-full md:w-1/2">
        <h2 className={`${thirdFont.className} tracking-wide text-4xl font-bold mb-6 text-lovely`}>
          💍 Step 1: The Gehaz Planner
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          Say goodbye to random Facebook lists and stress.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          Your Wifey Gehaz Planner includes 10 detailed MotionSections covering everything you need to buy for your home — furniture, appliances, bedding, kitchenware, fashion, makeup, and more. It breaks down what&apos;s essential before the wedding vs. what can wait — so you&apos;re never overwhelmed or over-budget.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          And yes, this planner stays with you way after the wedding. It grows with you 💕
        </p>
        </div>
        <div className="w-full md:w-1/2">
          <EmblaCarouselAutoScroll
            slides={[
              <div key={1} className="relative h-[400px]">
                <Image src="/joinNow/planner-1.jpg" alt="Gehaz Planner" fill className="object-cover rounded-lg" />
              </div>,
              <div key={2} className="relative h-[400px]">
                <Image src="/joinNow/planner-2.jpg" alt="Planner Details" fill className="object-cover rounded-lg" />
              </div>,
              <div key={3} className="relative h-[400px]">
                <Image src="/joinNow/planner-3.jpg" alt="Planner Features" fill className="object-cover rounded-lg" />
              </div>
            ]}
            options={OPTIONS}
          />
        </div>
      </MotionSection>

      <MotionSection 
        variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
      className="mb-12">
        <h2 className={`${thirdFont.className} tracking-wide text-4xl font-bold mb-6 text-lovely`}>
          🎀 Step 2: Your Private Video Channel
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          You don&apos;t just get a list — you get the knowledge behind the list.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          Once ytrueab your planner, you&apos;ll get access to our exclusive video channel — a private library with 11 playlists explaining every MotionSection in the planner:
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          Types of wood, which brands are trustworthy, what bedding suits your style, how to clean each item — all broken down simply, so you feel confident, not confused.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          Because when you know better, you buy better — and no Facebook comment MotionSection can shake you. 💅
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((num) => (
            <Dialog key={num}>
              <DialogTrigger asChild>
                <div className="relative h-[250px] cursor-pointer hover:opacity-90 transition-opacity">
                  <Image 
                    src={`/joinNow/video-${num}.jpg`} 
                    alt={`Video Preview ${num}`} 
                    fill 
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-lovely" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <div className="aspect-video">
                  <iframe 
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/VIDEO_ID_${num}`}
                    allowFullScreen
                  />
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </MotionSection>

      <MotionSection 
        variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
      className="mb-12">
        <h2 className={`${thirdFont.className} tracking-wide text-4xl font-bold mb-6 text-lovely`}>
          Step 3: Planner-Only Discounts & Deals
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          We&apos;ve teamed up with trusted vendors and clinics to make your gehaz planning smoother — and way more affordable.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          You&apos;ll get access to exclusive discounts and special offers made just for our brides. So when you&apos;re ready to shop, you know where to go (and who to avoid 👀). - no sponsorship fluff
        </p>
        <div className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <Dialog key={num}>
                <DialogTrigger asChild>
                  <div className="relative h-[200px] cursor-pointer hover:opacity-90 transition-opacity">
                    <Image 
                      src={`/joinNow/discount-${num}.jpg`} 
                      alt={`Discount Partner ${num}`} 
                      fill 
                      className="object-cover rounded-lg"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <Image 
                    src={`/joinNow/discount-${num}.jpg`} 
                    alt={`Discount Partner ${num}`} 
                    width={1200} 
                    height={800} 
                    className="rounded-lg"
                  />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection 
        variants={fadeIn({ direction: "up", delay: 0.2 })}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
      className="mb-12">
        <h2 className={`${thirdFont.className} tracking-wide text-4xl font-bold mb-6 text-lovely`}>
          Step 4: Wifey Support Circle
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          Let&apos;s talk about the part no one prepares you for:
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          The burnout. The pressure. The crying-in-the-kitchen-at-1AM moments.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          You&apos;ll be invited to our private WhatsApp group — where brides support brides. No judgment. No drama. Just tips, laughs, reminders to breathe, and proof that you&apos;re not alone.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          You&apos;ll also get access to:
        </p>
        <div className="ml-8 mb-4">
          <p className="text-lg text-gray-600 leading-relaxed">• Bridal consultations</p>
          <p className="text-lg text-gray-600 leading-relaxed">• Emotional check-ins</p>
          <p className="text-lg text-gray-600 leading-relaxed">• Real answers to &quot;is it just me or…?&quot;</p>
        </div>
        <div className="mt-8">
          <EmblaCarouselAutoScroll
            slides={[
              <div key={1} className="relative h-[400px]">
                <Image src="/joinNow/support-1.jpg" alt="Support Circle" fill className="object-cover rounded-lg" />
              </div>,
              <div key={2} className="relative h-[400px]">
                <Image src="/joinNow/support-2.jpg" alt="Community Support" fill className="object-cover rounded-lg" />
              </div>
            ]}
            options={OPTIONS}
          />
        </div>
      </MotionSection>

      <MotionSection className="mb-12">
        <h2 className={`${thirdFont.className} tracking-wide text-4xl font-bold mb-6 text-lovely`}>
          💖 Why It Feels Different
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Because it feels like having a real-life bridal bestie who&apos;s been through it all — organized everything for you, explained every detail, and never judged you for feeling overwhelmed.
        </p>
        <div className="mt-8">
          <div className="grid grid-cols-2 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative h-[300px] cursor-pointer hover:opacity-90 transition-opacity">
                  <Image src="/joinNow/different-1.jpg" alt="Why It's Different" fill className="object-cover rounded-lg" />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <Image src="/joinNow/different-1.jpg" alt="Why It's Different" width={1200} height={800} className="rounded-lg" />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative h-[300px] cursor-pointer hover:opacity-90 transition-opacity">
                  <Image src="/joinNow/different-2.jpg" alt="Personal Experience" fill className="object-cover rounded-lg" />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <Image src="/joinNow/different-2.jpg" alt="Personal Experience" width={1200} height={800} className="rounded-lg" />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="text-center bg-pinkey p-8 rounded-lg">
        <h2 className={`${thirdFont.className} tracking-wide text-4xl font-bold mb-4 text-lovely`}>
          ✨ This is the Wifey Experience
        </h2>
        <p className="text-xl text-gray-700 mb-4">
          Organized. Supportive. Real.
        </p>
        <p className="text-xl text-gray-700 mb-8">
          And always wrapped in love.
        </p>
        <h3 className="text-2xl font-semibold mb-4 text-lovely">
          Ready to feel held, heard, and hyped up for your bridal era?
        </h3>
        <p className="text-lg text-gray-600">
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