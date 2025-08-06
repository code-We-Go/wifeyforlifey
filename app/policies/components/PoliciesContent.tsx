"use client";
import PolicyTab from "./PolicyTab";
import { useSearchParams } from "next/navigation";
import React, { SetStateAction, useEffect, useState } from "react";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsAndConditions from "./TermsAndConditions";
import CookiePolicy from "./CookiePolicy";
import ReturnAndExchange from "./ReturnAndExchange";
import { thirdFont } from "@/fonts";
import ShippingPolicy from "./ShippingPolicy";
import LoyaltyPolicy from "./LoyaltyPolicy";

const PoliciesContent = () => {
  const [activeTab, setActiveTab] = useState("privacy-policy");
  const [title, setTitle] = useState("PRIVACY POLICY");
  const validTabs = [
    "terms-and-conditions",
    "privacy-policy",
    "return-and-exchange",
    "shipping-policy",
    "loyalty-policy",
  ];

  const searchParams = useSearchParams();

  useEffect(() => {
    const firstKey = Array.from(searchParams.keys())[0];
    if (firstKey && validTabs.includes(firstKey)) {
      setActiveTab(firstKey);
    }
  }, [searchParams]);

  const profileTabs = [
    { title: "PRIVACY POLICY", value: "privacy-policy" },
    { title: "TERMS AND CONDITIONS", value: "terms-and-conditions" },
    { title: "RETURN AND EXCHANGE", value: "return-and-exchange" },
    { title: "SHIPMENT INFO", value: "shipping-policy" },
    { title: "LOYALTY POLICY", value: "loyalty" },
  ];

  useEffect(() => {
    const title = profileTabs.find((tab) => tab.value === activeTab);
    if (title) setTitle(title.title);
  }, [activeTab]);

  function setSelectedTab(value: SetStateAction<string>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div
      className={`container-custom pt-16 min-h-screen h-auto w-full text-lovely bg-backgroundColor flex flex-col container-custom justify-start items-center`}
    >
      <div className="py-6 lg:py-16 flex flex-col gap-6 w-full justify-start items-start border-b border-gray-600">
        <div className={`flex ${thirdFont.className} w-full`}>
          <div className="w-1/4 text-3xl">LEGAL</div>
          <div className="text-3xl">{title}</div>
        </div>
        <div
          className={`w-full ${thirdFont.className} lg:hidden flex gap-6 overflow-y-hidden scrollbar-hidden`}
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
      <div className="flex w-full">
        <div className="hidden w-1/4 h-auto min-h-screen relative lg:block">
          <div
            className={`flex ${thirdFont.className} sticky mt-24 top-20 left-1 flex-col gap-5`}
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
        <div className="w-full py-10 lg:py-20 lg:w-3/4 h-auto min-h-screen flex flex-col">
          <PrivacyPolicy
            selectedTab={activeTab}
            setSelectedTab={setActiveTab}
          />
          <TermsAndConditions
            selectedTab={activeTab}
            setSelectedTab={setActiveTab}
          />
          <CookiePolicy selectedTab={activeTab} setSelectedTab={setActiveTab} />
          <ReturnAndExchange
            selectedTab={activeTab}
            setSelectedTab={setActiveTab}
          />
          <ShippingPolicy
            selectedTab={activeTab}
            setSelectedTab={setSelectedTab}
          />
          <LoyaltyPolicy
            selectedTab={activeTab}
            setSelectedTab={setSelectedTab}
          />
        </div>
      </div>
    </div>
  );
};

export default PoliciesContent;
