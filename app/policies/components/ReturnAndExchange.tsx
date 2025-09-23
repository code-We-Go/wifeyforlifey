import React from "react";

const ReturnAndExchange = ({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div
      className={`${
        selectedTab === "return-and-exchange" ? "flex flex-col gap-4" : "hidden"
      } h-auto w-full`}
    >
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-xl mb-2">Return & Exchange Policy</h1>

        <p>
          At Wifey for Lifey, we care about your satisfaction and promise to
          handle any issues with fairness and clarity. Please read our return
          and exchange policy below.
        </p>

        <div>
          <h2 className="font-bold text-lg mt-4">1. Returns</h2>
          <ul>
            <li>Returns are only accepted if the item is faulty or damaged.</li>
            <li>
              You must report the issue within 24 hours of receiving your item.
            </li>
            <li>
              The item must be unused and returned in its original packaging.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-lg mt-4">2. What You Can’t Return</h2>
          <ul>
            <li>Opened or used planners.</li>
            <li>Products damaged due to misuse.</li>
            <li>Digital content (e.g., videos or downloadable materials).</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-lg mt-4">3. Refund Process</h2>
          <ul>
            <li>
              Approved refunds will be issued to your original payment method
              within 7 business days.
            </li>
            <li>
              Shipping costs are non-refundable unless the error was on our
              side.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-lg mt-4">4. Exchanges</h2>
          <p>
            We do not offer product exchanges unless the wrong item was
            delivered to you.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-lg mt-4">5. How to Start a Return</h2>
          <p>To start a return or report an issue, please contact us:</p>
          <ul>
            <li>
              📧 Email:{" "}
              <a href="mailto:support@wifeyforlifey.com">
                support@wifeyforlifey.com
              </a>
            </li>
            <li>📞 WhatsApp: +20 10 55691340</li>
          </ul>
        </div>

        <p className="mt-4">
          We appreciate your trust in Wifey for Lifey and are here to support
          you through any concerns.
        </p>
      </div>
    </div>
  );
};

export default ReturnAndExchange;
