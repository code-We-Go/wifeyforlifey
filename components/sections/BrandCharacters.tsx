"use client";
import React from "react";
import ReactDOM from "react-dom/client";
import { EmblaOptionsType } from "embla-carousel";
import "./emblaScale.css";
import EmblaScaleCarousel from "../embla/EmblaScaleCarousel";
import { thirdFont } from "@/fonts";
const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 5;
export type Character = { name: string; image: string; description: string };
import Image from "next/image";
const characters = [
  {
    name: "THE EFFICIENT PLANNER",
    image: "/characters/Bride 2_The Efficeint Planner.png",
    description:
      "A bride who wants to stay organized and within budget but doesn’t want to compromise on style or details. She appreciates streamlined guidance and products that help her plan without feeling overwhelmed by the complexity of wedding planning.",
  },
  {
    name: "THE SENTIMENTAL ROMANTIC",
    image: "/characters/Bride1Thesentimentalromanticwithveil.png",
    description:
      "A bride who values personal touches and meaningful experiences. She's on a moderate budget, wants to invest in items and services that align with her values, and seeks guidance to create a special, stress-free day that reflects her relationship.",
  },
  {
    name: "THE BALANCED DREAMER",
    image: "/characters/Bride 3_The Balanced Dreamer.png",
    description:
      "A bride who dreams of a beautiful wedding that feels luxurious but also practical. She's conscious of her budget and wants a blend of elegance and affordability, valuing emotional support and thoughtful planning throughout her journey.",
  },
  {
    name: "THE CAREFREE LOVER",
    image: "/characters/Groom1TheCarefreeLover.png",
    description:
      "A relaxed and easy-going groom with a great sense of humor who keeps the wedding planning lighthearted and embraces the joy of the wedding journey without stressing over details. He’s all about being present, sharing laughs, and supporting his partner in whatever they need.",
  },
  {
    name: "THE PRACTICAL PLANNER",
    image: "/characters/Groom2ThePracticalPlanner.png",
    description:
      "A groom who is detail-oriented and organized. He takes a hands-on approach to ensure everything runs smoothly. He enjoys ticking things off his checklist and collaborating with his partner on decisions. Reliable and steady, he balances budgets, coordinates schedules, and ensures every aspect of the wedding is accounted for without losing sight of the couple’s shared vision.",
  },
  {
    name: "THE BUBBLY BESTIE",
    image: "/characters/BMTheBubblyBestie.png",
    description:
      "A vibrant and enthusiastic bridesmaid who brings energy and excitement to every moment. She’s the life of the party and the emotional cheerleader who keeps spirits high. Whether it’s helping pick out the perfect dress or hyping up the bride during fittings, her infectious positivity makes the wedding journey unforgettable.",
  },
  {
    name: "THE RELIABLE COORDINATOR",
    image: "/characters/BMTheReliableCoordinator.png",
    description:
      "The grounded and dependable bridesmaid who keeps everything on track. She’s the go-to problem solver, ready with practical solutions and a well-thought-out plan. From organizing schedules to double-checking vendors, she’s the backbone of the team, ensuring no detail is overlooked and the bride feels supported every step of the way.",
  },
];

const SLIDES = characters;
// const SLIDES = Array.from(Array(SLIDE_COUNT).keys())
const BrandCharacters = () => {
  return (
    <div className="relative w-full  h-auto pt-16  space-y-2 text-start bg-pinkey px-4 md:px-6">
      <h2
        className={`${thirdFont.className} text-4xl md:text-5xl  font-semibold lg:text-6xl text-lovely`}
      >
        Brand&apos;s Characters
      </h2>
      <EmblaScaleCarousel slides={SLIDES} options={OPTIONS} />
      <div className="rotate-12 md:absolute z-0 md:top-[10vh] max-md:hidden  md:right-[5vw] sm:right-[5vw] lg:right-[15vw]">
        {/* // className='rotate-12  -top-[5vh] -right-[30vw]  md:right-[5vw] sm:right-[5vw] lg:right-[6vw]'> */}
        <Image
          unoptimized
          className="aspect-auto"
          width={120}
          height={50}
          alt="fyonka"
          src={"/hero/WifeyForLifeyIllustrations-14.png"}
        ></Image>
      </div>
      <div className="hidden md:block absolute z-0 top-[20vh] left-[8vw] -rotate-12">
        <Image
          unoptimized
          className=" aspect-auto"
          width={120}
          height={50}
          alt="glasses"
          src={"/hero/Wifey For Lifey Illustrations-09.png"}
        ></Image>
      </div>
    </div>
  );
};

export default BrandCharacters;
