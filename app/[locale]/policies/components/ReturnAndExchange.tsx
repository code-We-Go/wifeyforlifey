import React from "react";
import { useTranslations } from "next-intl";

interface PolicyProps {
  selectedTab: string;
  setSelectedTab?: React.Dispatch<React.SetStateAction<string>>;
}

const ReturnAndExchange: React.FC<PolicyProps> = ({ selectedTab }) => {
  const t = useTranslations("policiesPage.returnExchange");

  return (
    <div
      className={`${
        selectedTab === "return-and-exchange"
          ? "flex flex-col gap-6"
          : "hidden"
      } h-auto w-full text-lovely`}
    >
      <h1 className="font-bold text-2xl md:text-3xl text-lovely mb-2">
        {t("title")}
      </h1>

      <p className="text-base md:text-lg leading-relaxed">{t("intro")}</p>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t("section1Title")}
        </h2>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t("returnsItem1")}</li>
          <li>{t("returnsItem2")}</li>
          <li>{t("returnsItem3")}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t("section2Title")}
        </h2>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t("cantReturnItem1")}</li>
          <li>{t("cantReturnItem2")}</li>
          <li>{t("cantReturnItem3")}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t("section3Title")}
        </h2>
        <ul className="list-disc list-inside space-y-1.5 ms-2 text-lovely/90">
          <li>{t("refundItem1")}</li>
          <li>{t("refundItem2")}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t("section4Title")}
        </h2>
        <p className="text-lovely/90 leading-relaxed">{t("exchangesDesc")}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-xl md:text-2xl text-lovely">
          {t("section5Title")}
        </h2>
        <p className="text-lovely/90">{t("startDesc")}</p>
        <ul className="space-y-2 ms-2 text-lovely/90">
          <li className="flex items-center gap-2">
            <span>📧</span>
            <span className="font-medium">{t("emailLabel")}:</span>
            <a
              href="mailto:support@wifeyforlifey.com"
              className="underline font-semibold hover:text-lovely/80"
            >
              support@wifeyforlifey.com
            </a>
          </li>
          <li className="flex items-center gap-2">
            <span>📞</span>
            <span className="font-medium">{t("whatsappLabel")}:</span>
            <a
              href="https://wa.me/201055691340"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-lovely/80"
              dir="ltr"
            >
              +20 10 55691340
            </a>
          </li>
        </ul>
      </div>

      <p className="text-lovely font-medium text-lg pt-4 border-t border-lovely/20 leading-relaxed">
        {t("closing")}
      </p>
    </div>
  );
};

export default ReturnAndExchange;

