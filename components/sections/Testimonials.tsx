"use client";
import { thirdFont } from "@/fonts";
import React, { useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { motion, useScroll, useTransform } from "framer-motion";
import { TestimonialCard } from "./testomonials/TestomonialsCard";
import { headerStyle } from "@/app/styles/style";
import { useTranslations } from "next-intl";
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
const mobTestimonials = [
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
    direction: "right", // Example image
  },

  {
    name: "dr_nadine_rashed",
    text: "انا دكتورة جلدية وتجميل وبجد بشكرك علي المعلومات الصحيحة اللي بتقدميها بطريقة جميلة ✨❤",
    supporters: "1,805 supporters",
    img: "https://randomuser.me/api/portraits/men/34.jpg",
    direction: "left",
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
  const t = useTranslations("home.testimonials");
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax transforms for each card (tweak values for desired effect)
  const leftY1 = useTransform(scrollYProgress, [-0.1, 0.3], [-250, 0]);
  const leftY2 = useTransform(scrollYProgress, [-0.1, 0.4], [-200, 0]);
  const leftY3 = useTransform(scrollYProgress, [0, 0.45], [-180, 0]);
  const rightY1 = useTransform(scrollYProgress, [-0.1, 0.3], [250, 0]);
  const rightY2 = useTransform(scrollYProgress, [-0.1, 0.4], [200, 0]);
  const rightY3 = useTransform(scrollYProgress, [0, 0.45], [180, 0]);

  const paragraphOpacities = [
    useTransform(scrollYProgress, [0, 0.3], [0.4, 1]),
    useTransform(scrollYProgress, [0, 0.4], [0.3, 1]),
    useTransform(scrollYProgress, [0, 0.45], [0.3, 1]),
  ];
  return (
    <section
      ref={sectionRef}
      className="relative w-full flex min-h-[75vh] md:min-h-[100vh] flex-col items-center md:justify-center justify-end py-16 bg-creamey"
    >
      <div className="flex md:hidden gap-4 w-full max-w-full mx-auto overflow-x-auto py-8 scrollbar-hide snap-x snap-mandatory">
        {mobTestimonials.slice(0, 2).map((t, i) => (
          <div key={i} className="">
            <TestimonialCard {...t} index={i} />
          </div>
        ))}
      </div>
      <div className="flex flex-col h-full md:justify-center justify-end items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lovely/90 text-base font-medium">
            {t("badge")}
          </span>
        </div>
        <h2
          className={`${thirdFont.className} text-lovely ${headerStyle} text-center mb-4 whitespace-pre-line`}
        >
          {t("title")}
        </h2>
        <p className="text-lg text-lovely/90 text-center max-w-xl">
          {t("subtitle")}
        </p>
      </div>

      <div className=" w-full flex justify-center">
        {/* Cards left with parallax */}
        <div
          className="hidden md:flex flex-col gap-6 absolute start-3 top-8 h-full justify-center items-start"
          style={{ width: "320px" }}
        >
          <motion.div style={{ x: leftY1, opacity: paragraphOpacities[0] }}>
            <TestimonialCard {...testimonials[0]} index={0} />
          </motion.div>
          <motion.div style={{ x: leftY2, opacity: paragraphOpacities[1] }}>
            <TestimonialCard {...testimonials[1]} index={1} />
          </motion.div>
          <motion.div style={{ x: leftY3, opacity: paragraphOpacities[2] }}>
            <TestimonialCard {...testimonials[2]} index={2} />
          </motion.div>
        </div>
        {/* Cards right with parallax */}
        <div
          className="hidden md:flex flex-col gap-6 absolute end-3 top-10 h-full justify-center items-end"
          style={{ width: "320px" }}
        >
          <motion.div style={{ x: rightY1, opacity: paragraphOpacities[0] }}>
            <TestimonialCard {...testimonials[3]} index={3} />
          </motion.div>
          <motion.div style={{ x: rightY2, opacity: paragraphOpacities[1] }}>
            <TestimonialCard {...testimonials[4]} index={4} />
          </motion.div>
          <motion.div style={{ x: rightY3, opacity: paragraphOpacities[2] }}>
            <TestimonialCard {...testimonials[5]} index={5} />
          </motion.div>
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
            {t("cta")}
          </button>
          {/* <span className="text-gray-500 text-sm mt-2">
            It’s free and takes less than a minute!
          </span> */}
        </div>
      </div>
      <div className="flex md:hidden gap-4 w-full max-w-full mx-auto overflow-x-auto pt-20 py-8 scrollbar-hide snap-x snap-mandatory">
        {mobTestimonials.slice(2, 4).map((t, i) => (
          <div key={i} className="">
            <TestimonialCard {...t} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
