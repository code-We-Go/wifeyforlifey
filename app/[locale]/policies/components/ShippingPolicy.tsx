import React from "react";
import { useTranslations } from "next-intl";

interface PolicyProps {
  selectedTab: string;
  setSelectedTab?: React.Dispatch<React.SetStateAction<string>>;
}

const ShippingPolicy: React.FC<PolicyProps> = ({ selectedTab }) => {
  const t = useTranslations("policiesPage.shipping");

  const shippingZones = [
    {
      zone: `${t("colZone")} 1`,
      region: t("zone1Region"),
      areas: t("zone1Areas"),
    },
    {
      zone: `${t("colZone")} 2`,
      region: t("zone2Region"),
      areas: t("zone2Areas"),
    },
    {
      zone: `${t("colZone")} 3`,
      region: t("zone3Region"),
      areas: t("zone3Areas"),
    },
    {
      zone: `${t("colZone")} 4`,
      region: t("zone4Region"),
      areas: t("zone4Areas"),
    },
    {
      zone: `${t("colZone")} 5`,
      region: t("zone5Region"),
      areas: t("zone5Areas"),
    },
    {
      zone: `${t("colZone")} 6`,
      region: t("zone6Region"),
      areas: t("zone6Areas"),
    },
  ];

  return (
    <div
      className={`${
        selectedTab === "shipping-policy" ? "flex flex-col gap-6" : "hidden"
      } h-auto w-full text-lovely`}
    >
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("title")}</h1>

      <p className="text-base md:text-lg text-lovely/90 leading-relaxed">
        {t("intro")}
      </p>

      <div className="overflow-x-auto rounded-xl border border-lovely/30 shadow-sm">
        <table className="w-full text-start border-collapse">
          <thead className="bg-pinkey/80">
            <tr>
              <th className="p-3.5 border-b border-lovely/20 text-start font-semibold text-lovely">
                {t("colZone")}
              </th>
              <th className="p-3.5 border-b border-lovely/20 text-start font-semibold text-lovely">
                {t("colRegion")}
              </th>
              <th className="p-3.5 border-b border-lovely/20 text-start font-semibold text-lovely">
                {t("colAreas")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-pinkey/20 divide-y divide-lovely/15 text-sm md:text-base">
            {shippingZones.map((zone, idx) => (
              <tr key={idx} className="hover:bg-pinkey/40 transition-colors">
                <td className="p-3.5 font-bold whitespace-nowrap text-lovely">
                  {zone.zone}
                </td>
                <td className="p-3.5 font-medium whitespace-nowrap text-lovely">
                  {zone.region}
                </td>
                <td className="p-3.5 text-lovely/90">
                  {zone.areas}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="flex flex-col gap-2 text-sm md:text-base text-lovely/90 pt-4 border-t border-lovely/20">
        <p>{t("noteDelays")}</p>
        <p className="font-semibold text-lovely">{t("noteFreeShipping")}</p>
      </section>
    </div>
  );
};

export default ShippingPolicy;

