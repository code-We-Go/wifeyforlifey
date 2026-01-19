"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { thirdFont } from "@/fonts";
import Link from "next/link";

export default function InstapaySuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [total, setTotal] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [subscriptionId, setSubscriptionId] = useState<string>("");

  useEffect(() => {
    const totalParam = searchParams.get("total");
    const whatsappParam = searchParams.get("whatsapp");
    const subIdParam = searchParams.get("subscriptionId");

    if (!totalParam || !whatsappParam) {
      router.push("/");
      return;
    }

    setTotal(totalParam);
    setWhatsappNumber(whatsappParam);
    setSubscriptionId(subIdParam || "");
  }, [searchParams, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen bg-creamey flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-creamey rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-lovely">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-lovely rounded-full p-4">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Header */}
        <h1
          className={`${thirdFont.className} text-3xl md:text-4xl text-lovely text-center mb-4`}
        >
          🎉 Congratulations! 🎉
        </h1>

        <p className="text-center text-lovely text-lg mb-8">
          Your subscription order has been created successfully!
        </p>

        {/* Instructions */}
        <div className="bg-lovely/10 rounded-2xl p-6 mb-6">
          <h2
            className={`${thirdFont.className} text-3xl text-lovely mb-6 text-center`}
          >
            Follow these steps to confirm your order:
          </h2>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-lovely text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lovely mb-2">
                  Send the payment via Instapay
                </h4>
                <div className="bg-creamey rounded-lg p-4 border-2 border-pinkey">
                  <p className="text-sm text-lovely/80 mb-2">
                    Total Amount to Send:
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-lovely">
                      {total} EGP
                    </p>
                    <button
                      onClick={() => copyToClipboard(total)}
                      className="px-4 py-2 bg-lovely text-white rounded-lg hover:bg-lovely/90 transition text-sm"
                    >
                      Copy Amount
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-lovely text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lovely mb-2">
                  Take a screenshot of the payment confirmation
                </h4>
                <p className="text-sm text-lovely/80">
                  Make sure the screenshot clearly shows the payment amount and
                  transaction details.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-lovely text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lovely mb-2">
                  Send the screenshot to us on WhatsApp : {whatsappNumber}
                </h4>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-lovely text-creamey rounded-lg hover:bg-lovely/90 transition font-semibold"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Send Screenshot on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-pinkey/20 border-l-4 border-lovely p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-lovely mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-lovely mb-1">
                Important:
              </p>
              <p className="text-sm text-lovely/80">
                Your subscription will be activated once we verify your payment.
                This usually takes a few minutes during business hours.
              </p>
            </div>
          </div>
        </div>

        {/* Reference Number */}
        {/* {subscriptionId && (
          <div className="text-center mb-6">
            <p className="text-sm text-lovely/70 mb-1">
              Your Subscription Reference:
            </p>
            <p className="font-mono text-lovely font-semibold">
              {subscriptionId}
            </p>
          </div>
        )} */}

        {/* Back to Home Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-lovely text-creamey rounded-lg hover:bg-lovely/90 transition font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
