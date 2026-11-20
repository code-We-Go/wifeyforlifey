"use client";
import PolicyTab from "./PolicyTab";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsAndConditions from "./TermsAndConditions";
import CookiePolicy from "./CookiePolicy";
import ReturnAndExchange from "./ReturnAndExchange";
import { thirdFont } from "@/fonts";
import ShippingPolicy from "./ShippingPolicy";
import LoyaltyPolicy from "./LoyaltyPolicy";
import { useTranslations, useLocale } from "next-intl";

const PoliciesContent = () => {
  const t = useTranslations("policiesPage");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [activeTab, setActiveTab] = useState("privacy-policy");

  const validTabs = [
    "privacy-policy",
    "terms-and-conditions",
    "return-and-exchange",
    "loyalty",
    "loyalty-policy",
    "shipping-policy",
    "cookie-policy",
  ];

  const searchParams = useSearchParams();

  useEffect(() => {
    const firstKey = Array.from(searchParams.keys())[0];
    if (firstKey && validTabs.includes(firstKey)) {
      setActiveTab(firstKey === "loyalty-policy" ? "loyalty" : firstKey);
    }
  }, [searchParams]);

  const profileTabs = [
    { title: t("tabs.privacyPolicy"), value: "privacy-policy" },
    { title: t("tabs.termsAndConditions"), value: "terms-and-conditions" },
    { title: t("tabs.returnAndExchange"), value: "return-and-exchange" },
    { title: t("tabs.loyaltyPolicy"), value: "loyalty" },
    { title: t("tabs.shippingPolicy"), value: "shipping-policy" },
  ];

  const currentTab =
    profileTabs.find((tab) => tab.value === activeTab) ||
    (activeTab === "cookie-policy"
      ? { title: t("tabs.cookiePolicy"), value: "cookie-policy" }
      : profileTabs[0]);

  return (
    <div
      className={`container-custom pt-16 min-h-screen h-auto w-full text-lovely bg-backgroundColor flex flex-col justify-start items-center`}
    >
      <div className="py-6 lg:py-16 flex flex-col gap-6 w-full justify-start items-start border-b border-lovely/20">
        <div
          className={`flex ${
            isAr ? "font-bold" : thirdFont.className
          } w-full items-center gap-4`}
        >
          <div className="w-1/4 text-2xl md:text-3xl text-lovely/80 font-bold">
            {t("legal")}
          </div>
          <div className="text-2xl md:text-3xl text-lovely font-extrabold">
            {currentTab.title}
          </div>
        </div>
        <div
          className={`w-full ${
            isAr ? "font-bold" : thirdFont.className
          } lg:hidden flex gap-6 overflow-x-auto scrollbar-hidden pb-2`}
        >
          {profileTabs.map((tab, index) => (
            <PolicyTab
              key={index}
              title={tab.title}
              value={tab.value}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ))}
        </div>
      </div>
      <div className="flex w-full gap-8">
        <div className="hidden w-1/4 h-auto min-h-screen relative lg:block">
          <div
            className={`flex ${
              isAr ? "font-bold" : thirdFont.className
            } sticky mt-24 top-20 flex-col gap-5`}
          >
            {profileTabs.map((tab, index) => (
              <PolicyTab
                key={index}
                title={tab.title}
                value={tab.value}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            ))}
          </div>
        </div>
        <div className="w-full py-10 lg:py-20 lg:w-3/4 h-auto min-h-screen flex flex-col leading-relaxed">
          <PrivacyPolicy
            selectedTab={activeTab}
            setSelectedTab={setActiveTab}
          />
          <TermsAndConditions
            selectedTab={activeTab}
            setSelectedTab={setActiveTab}
          />
          <ReturnAndExchange
            selectedTab={activeTab}
            setSelectedTab={setActiveTab}
          />
          <LoyaltyPolicy
            selectedTab={activeTab}
            setSelectedTab={setActiveTab}
          />
          <ShippingPolicy
            selectedTab={activeTab}
            setSelectedTab={setActiveTab}
          />
          <CookiePolicy
            selectedTab={activeTab}
            setSelectedTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

export default PoliciesContent;

