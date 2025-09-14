"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Ipackage } from "@/app/interfaces/interfaces";
import { thirdFont } from "@/fonts";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

// const PricingCard = ({ packageItem }: { packageItem: Ipackage }) => {
//   const router = useRouter();

//   const handleViewDetails = () => {
//     router.push(`/packages/${packageItem._id}`);
//   };

//   return (
//     <div className="flex flex-col bg-lovely border-2 border-lovely rounded-lg transition-all duration-300 hover:shadow-lg w-full mx-auto h-full relative flex-grow">
//       <Image
//         width={90}
//         height={60}
//         className="absolute -top-5 -rotate-45 -left-5 z-20"
//         alt="fyonka"
//         src={"/fyonkaCreamey.png"}
//       />
//       {/* Header */}
//       <div className="bg-lovely p-3 text-center relative overflow-visible rounded-t-md">
//         <h3
//           className={`${thirdFont.className} text-2xl tracking-wide font-bold text-creamey`}
//         >
//           {packageItem.name}
//         </h3>
//         <div className="mt-2 text-center">
//           <span
//             className={`${thirdFont.className} text-2xl font-bold text-creamey`}
//           >
//             LE{packageItem.price.toFixed(2)}
//           </span>
//         </div>
//       </div>

//       {/* Features */}
//       <div className="bg-creamey p-3 flex-grow flex flex-col overflow-hidden">
//         <ul className="space-y-1 text-sm flex-grow">
//           {packageItem.items.map((item, index) => (
//             <li key={index} className="flex items-start">
//               <div className="flex-shrink-0 h-5 w-5 text-lovely">
//                 {item.included ? (
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 ) : (
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 )}
//               </div>
//               <span className="ml-2 text-lovely text-sm">{item.value}</span>
//             </li>
//           ))}
//         </ul>

//         {packageItem.notes && packageItem.notes.length > 0 && (
//           <div className="mt-2 pt-2 border-t border-lovely/20">
//             <h4 className="text-lovely font-medium mb-1 text-sm">Notes:</h4>
//             <ul className="space-y-1 mb-2">
//               {packageItem.notes.map((note, index) => (
//                 <li key={index} className="text-xs text-lovely/80">
//                   {note}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="p-3 bg-creamey border-t border-lovely/20 rounded-b-md mt-auto overflow-hidden">
//         <Button
//           onClick={handleViewDetails}
//           className="w-full bg-lovely hover:bg-lovely/90 text-creamey"
//         >
//           {/* <Package className="mr-2 h-4 w-4" /> */}
//           See More
//         </Button>
//       </div>
//     </div>
//   );
// };

const Pricing = () => {
  // const [packages, setPackages] = useState<Ipackage[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchPackages = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await fetch("/api/packages?all=true");
  //       const data = await response.json();
  //       setPackages(Array.isArray(data.data) ? data.data : []);
  //     } catch (error) {
  //       console.error("Error fetching packages:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchPackages();
  // }, []);

  return (
    <div className="w-full min-h-screen h-auto bg-creamey py-16 relative">
      <motion.div
        style={{
          rotate: useTransform(
            useScroll().scrollYProgress,
            [0, 0.2],
            [90, -30]
          ),
          scale: useTransform(useScroll().scrollYProgress, [0, 0.15], [0.5, 1]),
          opacity: useTransform(
            useScroll().scrollYProgress,
            [0, 0.1],
            [0.5, 1]
          ),
        }}
        className=" hidden md:block absolute top-20 left-10 z-10 opacity-30"
      >
        <Image
          src="/hero/WifeyForLifey Illustrations-26.png"
          alt="ring"
          width={120}
          height={100}
          className="aspect-auto"
        />
      </motion.div>
      <motion.div
        style={{
          rotate: useTransform(
            useScroll().scrollYProgress,
            [0, 0.2],
            [-60, 30]
          ),
          scale: useTransform(useScroll().scrollYProgress, [0, 0.15], [0.5, 1]),
          opacity: useTransform(
            useScroll().scrollYProgress,
            [0, 0.1],
            [0.5, 1]
          ),
        }}
        className="hidden md:block absolute bottom-24 right-10 z-10 opacity-30"
      >
        <Image
          src="/hero/WifeyForLifey Illustrations-28.png"
          alt="fyonka"
          width={200}
          height={200}
          className="aspect-auto"
        />
      </motion.div>
      <div className="container mx-auto px-4 flex flex-col items-center relative z-20">
        <div className="text-center mb-12">
          <h2
            className={`${thirdFont.className} text-4xl md:text-5xl lg:text-6xl font-semibold text-lovely `}
          >
            Our Wifey Packages
          </h2>
        </div>

        <div className="w-full md:w-[60%] mx-auto overflow-x-auto">
          <div className="rounded-lg overflow-hidden shadow-md border border-lovely">
            <table className="w-full max-w-7xl border-collapse bg-creamey table-fixed">
              <thead>
                <tr className="bg-lovely text-creamey">
                  <th className="p-5 border border-pinkey text-center w-1/3">
                    <h3 className={`${thirdFont.className} text-xl font-bold`}>
                      Features
                    </h3>
                  </th>
                  {[
                    { title: "The Full Wifey Experience" },
                    { title: "Mini Experience" },
                  ].map((pkg, index) => (
                    <th
                      key={index}
                      className="p-5 text-center border border-pinkey w-1/3"
                    >
                      <h3
                        className={`${thirdFont.className} tracking-wide text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis`}
                      >
                        {pkg.title}
                      </h3>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "Receiving your Gehaz Bestie Planner at your doorstep",
                  "access to your exclusive online channel",
                  "Joining the private WhatsApp Support Circle — brides & experts by your side",
                  "Unlocking exclusive partners deals",
                  "Wifey Points",
                  "Bridal Session",
                ].map((feature, index) => {
                  // Define package features in the same order as the features array
                  const packageFeatures = [
                    // Full Experience package features (index 0)
                    [true, true, true, true, true, false],
                    // Mini Experience package features (index 1)
                    [true, false, false, false, true, true],
                  ];

                  // Get inclusion status for each package based on feature index
                  const fullExperienceIncluded = packageFeatures[0][index];
                  const miniExperienceIncluded = packageFeatures[1][index];

                  return (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0 ? "bg-creamey" : "bg-creamey/90"
                      }
                    >
                      <td className="p-1 border border-pinkey font-medium text-lovely w-2/4 overflow-hidden text-ellipsis">
                        {feature}
                      </td>
                      <td className="p-2 text-center w-1/4 border border-pinkey">
                        {fullExperienceIncluded ? (
                          <div className="flex justify-center">
                            <div className="h-6 w-6 text-everGreen">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="h-6 w-6 text-lovely">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center w-1/4 border border-pinkey">
                        {miniExperienceIncluded ? (
                          <div className="flex justify-center">
                            <div className="h-6 w-6 text-everGreen">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="h-6 w-6 text-lovely">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-creamey">
                  <td className="p-2 border border-pinkey font-medium text-lovely w-2/4"></td>
                  <td className="p-2 text-center w-1/4 border border-pinkey">
                    <Link
                      href="/packages/687396821b4da119eb1c13fe"
                      className="font-bold text-lovely hover:text-lovely/70 transition-all underline"
                    >
                      See More
                    </Link>
                  </td>
                  <td className="p-2 text-center w-1/4 border border-pinkey">
                    <Link
                      href="/packages/68bf6ae9c4d5c1af12cdcd37"
                      className="font-bold text-lovely hover:text-lovely/70 transition-all underline"
                    >
                      See More
                    </Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Logos section */}
        {/* <div className="mt-24 text-center">
          <p className="text-lovely/70 mb-8">You&apos;re in good company</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            {[
              "/logos/artima.jpeg",
              "/logos/curlit.jpeg",
              "/logos/facefull.jpeg",
              "/logos/level.jpeg",
              "/logos/shosh.jpeg",
            ].map((logo, index) => (
              <div key={index} className="h-12 w-auto">
                <Image
                  src={logo}
                  alt="Company logo"
                  width={120}
                  height={48}
                  className="h-full w-auto object-contain rounded-md"
                />
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Pricing;
