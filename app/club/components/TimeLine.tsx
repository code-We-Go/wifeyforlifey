import React, { useRef } from "react";

import { User, Star, Heart, Award, ArrowDown } from "lucide-react";
import Image from "next/image";
import { FaHeart } from "react-icons/fa";

// Define the interface for timeline items
interface TimelineItem {
  title: string;
  description: string;
  image: string;
  scrollToId: string;
}

const timelineData: TimelineItem[] = [
  {
    title: "Gehaz Planner",
    description: "Become a member and start your journey with us.",
    image: "/experience/plannner.png",
    scrollToId: "gehazPlanner", // ID of the element to scroll to
  },
  {
    title: "Exclusive Gehaz Educational Channel",
    description: "Participate in activities and earn loyalty points.",
    image: "/experience/channnel.png",
    scrollToId: "channel", // Temporarily using gehazPlanner, will be updated later
  },
  {
    title: "Partnerships",
    description: "Unlock special rewards and offers just for you.",
    image: "/experience/partners.png",
    scrollToId: "partnerships", // Temporarily using gehazPlanner, will be updated later
  },
  {
    title: "Support Sessions",
    description: "Get recognized for your milestones and loyalty.",
    image: "/experience/exclusiveContent.png",
    scrollToId: "support", // Temporarily using gehazPlanner, will be updated later
  },
];

export const TimeLine = () => {
  // Function to handle scrolling to a specific element by ID
  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex flex-col items-center py-12">
      {/* Continuous vertical line */}
      <div className="absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-lovely to-pink-200 -translate-x-1/2 z-0" />
      <div className="w-full max-w-2xl z-10">
        {timelineData.map((item, idx) => (
          <div
            key={idx}
            className="relative flex w-full items-center"
            style={{ minHeight: "120px" }}
          >
            {/* Left section */}
            <div className="flex-1 flex justify-end pr-8 animate-float">
              {idx % 2 === 0 && (
                <div className="relative aspect-video  px-3 py-2 space-y-2  max-w-xs w-full text-lovely text-center">
                  <div className="relative  rounded-md w-full aspect-[9/6] border border-lovely">
                    <Image
                      className="rounded-md object-cover"
                      src={item.image}
                      alt={item.title}
                      fill
                    />
                  </div>
                  {/* <p className="text-creamey/90">{item.description}</p> */}
                  <h3
                    className="text-xl flex gap-1 text-center items-center justify-center font-semibold text-lovely mb-1 cursor-pointer hover:underline"
                    onClick={() => scrollToElement(item.scrollToId)}
                  >
                    {item.title}{" "}
                    <span>
                      <ArrowDown />
                    </span>
                  </h3>
                </div>
              )}
            </div>
            {/* Timeline icon (center) */}
            <div className="absolute  left-1/2  -translate-x-1/2  flex flex-col items-center z-10">
              <div className="relative  w-14 h-14  rounded-full  flex items-center justify-center ">
                {/* <Heart className="h-10 w-10 text-creamey bg-lovely p-1 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" /> */}
                <FaHeart className=" h-10 w-10 text-lovely  rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

                <span className="relative z-10 text-base  text-creamey drop-shadow-sm">
                  {idx + 1}
                </span>
              </div>
            </div>
            {/* Right section */}
            <div className="flex-1 flex justify-start  pl-8 animate-float">
              {idx % 2 !== 0 && (
                <div className="relative aspect-video  px-3 py-2 space-y-2  max-w-xs w-full text-lovely text-center">
                  <div className="relative rounded-md w-full aspect-[9/6] border border-lovely">
                    <Image
                      className="rounded-md"
                      src={item.image}
                      alt={item.title}
                      fill
                    />
                  </div>
                  {/* <p className="text-creamey/90">{item.description}</p> */}
                  <h3
                    className="text-xl flex gap-1 text-center items-center justify-center font-semibold text-lovely mb-1 cursor-pointer hover:underline"
                    onClick={() => scrollToElement(item.scrollToId)}
                  >
                    {item.title}{" "}
                    <span>
                      <ArrowDown />
                    </span>
                  </h3>
                </div>
              )}
            </div>
            {/* Connecting lines (absolutely positioned, continuous) */}
            {idx !== 0 && (
              <div
                className="absolute bg-pinkey left-1/2 top-0 -translate-x-1/2 z-0"
                style={{
                  height: "50%",
                  width: "4px",
                  //   background: "linear-gradient(to bottom, #e0aaff, #fbc2eb)",
                  borderRadius: "2px",
                }}
              />
            )}
            {idx !== timelineData.length - 1 && (
              <div
                className="absolute rounded-lg left-1/2 bottom-0 bg-pinkey -translate-x-1/2 z-0"
                style={{
                  height: "50%",
                  width: "4px",
                  //   background: "linear-gradient(to top, #e0aaff, #fbc2eb)",
                  borderRadius: "2px",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
