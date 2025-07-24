"use client";
import { thirdFont } from "@/fonts";
import React from "react";
import { useRouter } from "next/navigation";
import { TestimonialCard } from "./testomonials/TestomonialsCard";
const testimonials = [
  {
    name: "sandy_wadea",
    text: "y3ni msh 3arfa mngher el guide bta3k ya nariman kont amlt a amtn bhbk ❤❤ ",
    supporters: "8,780 supporters",
    logo: "C",
    direction: "left",
  },
  {
    name: "a_y_muhammed",
    text: "سؤال بس ازاي معرفتكيش من قبل كد 😍😍سهولة في توصيل المعلومة وفعلاً معلومات مفيدة👏 غير انك ماشاء الله قمر ومريحة جداً .. شكرااا ❤",
    supporters: "4,488 supporters",
    img: "https://yt3.ggpht.com/ytc/AKedOLQwKaleighCohen=s88-c-k-c0x00ffffff-no-rj",
    direction: "left", // Example image
  },
  {
    name: "gehad_kk",
    text: "انا بشكرك لأنك دعمتي وبتدعمي اي بنت ولو بكلمة حتي ❤ ",
    supporters: "641 supporters",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    direction: "left",
  },
  {
    name: "yara_abd_elaal",
    text: "شكراً بجد انك بتخلي حياتنا اسهل انا كنت ضاغطة نفسي جدا لازم اجيب كتير دلوقتي انا بجيب اللي بحبه بس عامة بحبك ❤❤",
    supporters: "112 supporters",
    img: "https://randomuser.me/api/portraits/men/33.jpg",
    direction: "right",
  },
  {
    name: "dr_nadine_rashed",
    text: "انا دكتورة جلدية وتجميل وبجد بشكرك علي المعلومات الصحيحة اللي بتقدميها بطريقة جميلة ✨❤",
    supporters: "1,805 supporters",
    img: "https://randomuser.me/api/portraits/men/34.jpg",
    direction: "right",
  },
  {
    name: "misnn21399",
    text: "ياه  كان نفسي في المراتب وانواعها بجد شكراً 😂❤❤",
    supporters: "",
    logo: "SP",
    direction: "right",
  },
];

const Testimonials = () => {
  const router = useRouter();
  return (
    <section className="relative w-full flex min-h-[75vh] md:min-h-[100vh] flex-col items-center md:justify-center justify-end py-16 bg-creamey">
      <div className="flex md:hidden gap-4 w-full max-w-full mx-auto overflow-x-auto py-8 scrollbar-hide snap-x snap-mandatory">
        {testimonials.map((t, i) => (
          <div key={i} className="">
            <TestimonialCard {...t} index={i} />
          </div>
        ))}
      </div>
      <div className="flex flex-col h-full md:justify-center justify-end items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lovely/90 text-base font-medium">
            Loved by 100,000+ bride
          </span>
        </div>
        <h2
          className={`${thirdFont.className} text-lovely tracking-normal text-4xl md:text-6xl font-bold text-center mb-4 `}
        >
          Think Wifey&apos;s Tiktok was helpful?
          <br />
          This is 10x the tea
        </h2>
        <p className="text-lg text-lovely/90 text-center max-w-xl">
          Subscribe now and be a part of your favorite community.
        </p>
      </div>
      <div className=" w-full flex justify-center">
        {/* Cards left */}
        <div
          className="hidden md:flex flex-col gap-6 absolute left-3 top-8 h-full justify-center items-start"
          style={{ width: "320px" }}
        >
          {testimonials.slice(0, 3).map((t, i) => (
            <TestimonialCard key={i} {...t} index={i} />
          ))}
        </div>
        {/* Cards right */}
        <div
          className="hidden md:flex flex-col gap-6 absolute right-3 top-10 h-full justify-center items-end"
          style={{ width: "320px" }}
        >
          {testimonials.slice(3).map((t, i) => (
            <TestimonialCard key={i + 3} {...t} index={i + 3} />
          ))}
        </div>
        {/* Center content for mobile */}

        {/* Center button */}
        <div className="flex flex-col items-center justify-center z-10">
          <button
            onClick={() =>
              router.push("/subscription/687396821b4da119eb1c13fe")
            }
            className="mt-8 hover:bg-lovely/90 bg-lovely text-creamey font-bold py-4 px-10 rounded-full text-xl shadow-lg transition"
          >
            Subscribe Now
          </button>
          {/* <span className="text-gray-500 text-sm mt-2">
            It’s free and takes less than a minute!
          </span> */}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
