import React from "react";

import { User, Star, Heart, Award } from "lucide-react";

const timelineData = [
  {
    title: "Gehaz Planner",
    description: "Become a member and start your journey with us.",
  },
  {
    title: "Earn Points",
    description: "Participate in activities and earn loyalty points.",
  },
  {
    title: "Exclusive Perks",
    description: "Unlock special rewards and offers just for you.",
  },
  {
    title: "Celebrate Achievements",
    description: "Get recognized for your milestones and loyalty.",
  },
];

export const TimeLine = () => {
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
            <div className="flex-1 flex justify-end pr-8">
              {idx % 2 === 0 && (
                <div className="bg-lovely rounded-lg shadow-lg px-6 py-4 border border-lovely max-w-xs w-full text-start">
                  <h3 className="text-xl font-semibold text-creamey mb-1">
                    {item.title}
                  </h3>
                  <p className="text-creamey/90">{item.description}</p>
                </div>
              )}
            </div>
            {/* Timeline icon (center) */}
            <div className="flex flex-col items-center z-10">
              <div className="relative w-12 h-12  rounded-full  flex items-center justify-center ">
                <Heart className="h-10 w-10 text-creamey bg-lovely p-1 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

                <span className="relative z-10 text-base  text-creamey drop-shadow-sm">
                  {idx + 1}
                </span>
              </div>
            </div>
            {/* Right section */}
            <div className="flex-1 flex justify-start pl-8">
              {idx % 2 !== 0 && (
                <div className="bg-lovely rounded-lg shadow-lg px-6 py-4 border border-lovely max-w-xs w-full text-left">
                  <h3 className="text-xl font-semibold text-creamey mb-1">
                    {item.title}
                  </h3>
                  <p className="text-creamey/90">{item.description}</p>
                </div>
              )}
            </div>
            {/* Connecting lines (absolutely positioned, continuous) */}
            {idx !== 0 && (
              <div
                className="absolute bg-lovely left-1/2 top-0 -translate-x-1/2 z-0"
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
                className="absolute rounded-lg left-1/2 bottom-0 bg-lovely -translate-x-1/2 z-0"
                style={{
                  height: "50%",
                  width: "4px",
                  //   background: "linear-gradient(to top, #e0aaff, #fbc2eb)",
                  borderRadius: "2px",
                }}
              />
            )}
          </div>
          //       <div
          //         className={` absolute left-1/2 bottom-0 z-0`}
          //         style={{
          //           width: "40px",
          //           height: "40px",
          //           borderTopLeftRadius: "40px",
          //           borderTop: "4px solid #D32333",
          //           ...(idx % 2 !== 0
          //             ? { borderLeft: "4px solid #D32333" }
          //             : { borderRight: "4px solid #D32333" }),
          //           transform: `${
          //             idx % 2 !== 0 ? "rotate(90deg)" : "-rotate(90deg)"
          //           } `,
          //         }}
          //       />
          //     )}
          //   </div>
        ))}
      </div>
    </div>
  );
};
