"use client";
import { thirdFont } from "@/fonts";
import { fadeIn } from "@/variants/fadIn";
import { motion } from "framer-motion";
import React from "react";
import { useTranslations, useLocale } from "next-intl";

const AboutPage = () => {
  const t = useTranslations("aboutPage");
  const locale = useLocale();
  const isAr = locale === "ar";

  const brandRenderer = (chunks: React.ReactNode) => (
    <span className="font-extrabold">{chunks}</span>
  );

  const highlightRenderer = (chunks: React.ReactNode) => (
    <span className="font-extrabold">{chunks}</span>
  );

  return (
    <div
      className="container-custom flex w-full justify-center items-center min-h-[calc(100vh-128px)] h-auto text-lovely bg-creamey"
    >
      <div className="w-full py-8 lg:py-16 flex flex-col justify-center items-center gap-4 md:gap-8 lg:gap-16">
        <motion.div
          variants={fadeIn({ direction: "up", delay: 0.2 })}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-start w-full"
        >
          <h1
            className={`${
              isAr ? "font-bold" : thirdFont.className
            } tracking-normal text-3xl md:text-4xl font-bold mb-2 md:mb-4 text-lovely`}
          >
            {t("title")}
          </h1>
          <h5 className="font-semibold text-lg md:text-xl mb-3 text-lovely/95">
            {t("subtitle")}
          </h5>
          <p className="text-base md:text-lg text-lovely/90 mb-4 leading-relaxed">
            {t.rich("introP1", { brand: brandRenderer })}
          </p>
          <p className="text-base md:text-lg leading-relaxed mb-3">
            {t("introP2")}
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            {t.rich("introP3", { brand: brandRenderer })}
          </p>
        </motion.div>

        <div className="relative w-full md:w-[80vw] lg:w-[70vw] aspect-video rounded-2xl overflow-hidden shadow-2xl border border-lovely/10">
          <iframe
            src="https://drive.google.com/file/d/1Iyeq7D5_9NFjjM-0lJONHp4XuXggmOng/preview"
            className="absolute top-0 left-0 w-full h-full border-0"
            allowFullScreen={true}
            allow="encrypted-media"
          />
        </div>

        <motion.div
          variants={fadeIn({ direction: "up", delay: 0.2 })}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-start w-full"
        >
          <h1
            className={`${
              isAr ? "font-bold" : thirdFont.className
            } tracking-normal text-2xl md:text-3xl font-semibold mb-2 md:mb-4 text-lovely`}
          >
            {t("whyTitle")}
          </h1>

          <p className="text-base md:text-lg text-lovely/90 mb-4 leading-relaxed">
            {t("whyP1")}
          </p>

          <p className="text-base md:text-lg leading-relaxed">
            {t.rich("whyP2", { highlight: highlightRenderer })}
          </p>
        </motion.div>

        <motion.div
          variants={fadeIn({ direction: "up", delay: 0.2 })}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-start w-full"
        >
          <h1
            className={`${
              isAr ? "font-bold" : thirdFont.className
            } tracking-normal text-2xl md:text-3xl font-semibold mb-2 md:mb-4 text-lovely`}
          >
            {t("offerTitle")}
          </h1>

          <p className="text-base md:text-lg text-lovely/90 mb-4 leading-relaxed">
            <span className="font-bold tracking-wide">
              {t("offerStressFreeTitle")}
            </span>
            : {t("offerStressFreeDesc")}
          </p>
          <p className="text-base md:text-lg text-lovely/90 mb-4 leading-relaxed">
            <span className="font-bold tracking-wide">
              {t("offerEmotionalTitle")}
            </span>
            : {t("offerEmotionalDesc")}
          </p>
          <p className="text-base md:text-lg text-lovely/90 mb-4 leading-relaxed">
            <span className="font-bold tracking-wide">
              {t("offerWomenOwnedTitle")}
            </span>
            : {t("offerWomenOwnedDesc")}
          </p>
          <p className="text-base md:text-lg text-lovely/90 mb-4 leading-relaxed">
            <span className="font-bold tracking-wide">
              {t("offerSisterhoodTitle")}
            </span>
            : {t.rich("offerSisterhoodDesc", { brand: brandRenderer })}
          </p>
        </motion.div>

        <motion.div
          variants={fadeIn({ direction: "up", delay: 0.2 })}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-start w-full"
        >
          <h1
            className={`${
              isAr ? "font-bold" : thirdFont.className
            } tracking-normal text-2xl md:text-3xl font-semibold mb-4 md:mb-6 text-lovely`}
          >
            {t("valuesTitle")}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-creamey border border-lovely/10 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start text-start">
              <span className="text-2xl mb-2">🌷</span>
              <h6 className="font-bold text-base md:text-lg mb-2 text-lovely">{t("valueEmpathyTitle")}</h6>
              <p className="text-sm md:text-base text-lovely/90 leading-relaxed">
                {t("valueEmpathyDesc")}
              </p>
            </div>
            <div className="bg-creamey border border-lovely/10 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start text-start">
              <span className="text-2xl mb-2">🌿</span>
              <h6 className="font-bold text-base md:text-lg mb-2 text-lovely">{t("valueEmpowermentTitle")}</h6>
              <p className="text-sm md:text-base text-lovely/90 leading-relaxed">
                {t("valueEmpowermentDesc")}
              </p>
            </div>
            <div className="bg-creamey border border-lovely/10 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start text-start">
              <span className="text-2xl mb-2">🧵</span>
              <h6 className="font-bold text-base md:text-lg mb-2 text-lovely">{t("valuePersonalizationTitle")}</h6>
              <p className="text-sm md:text-base text-lovely/90 leading-relaxed">
                {t("valuePersonalizationDesc")}
              </p>
            </div>
            <div className="bg-creamey border border-lovely/10 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start text-start">
              <span className="text-2xl mb-2">💬</span>
              <h6 className="font-bold text-base md:text-lg mb-2 text-lovely">{t("valueHonestyTitle")}</h6>
              <p className="text-sm md:text-base text-lovely/90 leading-relaxed">
                {t("valueHonestyDesc")}
              </p>
            </div>
            <div className="bg-creamey border border-lovely/10 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start text-start">
              <span className="text-2xl mb-2">🎀</span>
              <h6 className="font-bold text-base md:text-lg mb-2 text-lovely">{t("valueThoughtfulnessTitle")}</h6>
              <p className="text-sm md:text-base text-lovely/90 leading-relaxed">
                {t("valueThoughtfulnessDesc")}
              </p>
            </div>
            <div className="bg-creamey border border-lovely/10 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start text-start">
              <span className="text-2xl mb-2">👑</span>
              <h6 className="font-bold text-base md:text-lg mb-2 text-lovely">{t("valueWomenForWomenTitle")}</h6>
              <p className="text-sm md:text-base text-lovely/90 leading-relaxed">
                {t("valueWomenForWomenDesc")}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeIn({ direction: "up", delay: 0.2 })}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-start w-full"
        >
          <h1
            className={`${
              isAr ? "font-bold" : thirdFont.className
            } tracking-normal text-2xl md:text-3xl font-semibold mb-2 md:mb-4 text-lovely`}
          >
            {t("promiseTitle")}
          </h1>

          <p className="text-base md:text-lg text-lovely/90 mb-4 leading-relaxed">
            {t("promiseP1")}
          </p>
          <p className="text-base md:text-lg leading-relaxed mb-2">
            {t("promiseP2")}
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            {t.rich("promiseP3", { brand: brandRenderer })}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
