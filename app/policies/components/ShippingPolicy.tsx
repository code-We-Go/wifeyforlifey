import React from "react";

const ShippingPolicy = ({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const shippingZones = [
    {
      zone: "Zone 1",
      region: "Greater Cairo",
      areas:
        "Cairo & Giza: Madinat Nasr, El Obour, El Shorouk, New Cairo, 15th May City, Alexandria Desert Road (up to Kilo 28), Maadi, Shubra El Kheima, 6th of October",
      deliveryTime: "1 day",
    },
    {
      zone: "Zone 2",
      region: "Alexandria",
      areas: "Alexandria: Alexandria Desert Road (up to Kilo 21)",
      deliveryTime: "1–2 days",
    },
    {
      zone: "Zone 3",
      region: "Delta & Canal Cities",
      areas:
        "Tanta, Mahalla, Zefta, Zagazig, El-Menya El-Qadima, El-Salam City, El-Fayoum, El-Qanater, Banha, Kafr El-Sheikh, Damietta, Mansoura, Port Said, Ismailia, Suez",
      deliveryTime: "1–3 days",
    },
    {
      zone: "Zone 4",
      region: "Upper Egypt",
      areas: "Beni Suef, Minya, Assiut, Mallawi",
      deliveryTime: "2–4 days",
    },
    {
      zone: "Zone 5",
      region: "Upper Egypt 2 / Red Sea / North Coast",
      areas:
        "Qena, Luxor, Aswan, Farafra Oasis, Ras Gharib, Safaga, North Coast, Marsa Matruh",
      deliveryTime: "3–5 days",
    },
    {
      zone: "Zone 6",
      region: "Remote Areas",
      areas:
        "New Valley, North Sinai, Marsa Alam, Abu Simbel, Salloum, Halayeb, Shalateen, El-Wahat, South Sinai",
      deliveryTime: "5 days",
    },
  ];
  return (
    <div
      className={`${
        selectedTab === "shipping-policy" ? "flex flex-col gap-4" : "hidden"
      }  h-auto w-full`}
    >
      {/* <div>
            <p>At ANCHUVA, we value your trust and are committed to safeguarding your personal information. This Privacy Notice explains how we collect, use, share, and protect your data when you interact with our website, services, or products.</p>
        </div>
        <div className='flex flex-col'>
            <div>

            <h1 className='font-bold text-xl' className='font-semibold'text-lg>Information We Collect</h1>
            <p>Personal Information</p>
We collect personal data you provide directly to us, such as:
•	Contact details: Name, email address, phone number, and mailing address.
•	Payment information: Credit/debit card details or other payment methods.
•	Account information: Login credentials and purchase history.
</p>
            </div> */}

      {/* </div> */}
      <h1 className="text-3xl font-bold mb-6">📦 Shipping Details</h1>

      <p className="mb-4 text-lovely/90">
        We offer delivery services across Egypt, segmented into six zones.
        Delivery times vary by location and are calculated in business days.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border border-lovely/90 rounded-lg overflow-hidden">
          <thead className="bg-pinkey">
            <tr>
              <th className="p-3 border border-lovely/90 text-left font-semibold">
                Zone
              </th>
              <th className="p-3 border border-lovely/90 text-left font-semibold">
                Region
              </th>
              <th className="p-3 border border-lovely/90 text-left font-semibold">
                Areas Covered
              </th>
              <th className="p-3 border border-lovely/90 text-left font-semibold">
                Delivery Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-pinkey   divide-lovely/90">
            {shippingZones.map((zone) => (
              <tr key={zone.zone}>
                <td className="p-3 border border-lovely/90 font-medium whitespace-nowrap">
                  {zone.zone}
                </td>
                <td className="p-3 border border-lovely/90">{zone.region}</td>
                <td className="p-3 border border-lovely/90">{zone.areas}</td>
                <td className="p-3 border border-lovely/90">
                  {zone.deliveryTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-6 text-sm text-lovely/90">
        <p>
          🕒 Delivery times are based on business days from order confirmation.
        </p>
        <p>🚧 Some rural or remote areas may experience additional delays.</p>
      </section>
    </div>
  );
};

export default ShippingPolicy;
