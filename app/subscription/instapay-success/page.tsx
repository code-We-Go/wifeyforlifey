"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { thirdFont } from "@/fonts";
import Link from "next/link";

function InstapaySuccessContent() {
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

        <p className="text-center text-lovely text-lg mb-4">
          Your Request has been created successfully!
        </p>

        {/* Instructions */}
        <div className="bg-lovely/10 rounded-2xl p-6 mb-6">
          <h2
            className={`${thirdFont.className} text-3xl text-lovely mb-6 text-center`}
          >
            our team will review your request and we will send you a confirmation email as soon as possible
          </h2>
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
                <br></br>
                Business days are from Monday to Friday.
                Business hours are from 5 PM to 11 PM.
                <br></br>
                Requests made on Saturday and Sunday will be reviewed on Monday.
              </p>
            </div>
          </div>
        </div>

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

export default function InstapaySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-creamey flex items-center justify-center">
        <div className="animate-pulse text-lovely text-xl">Loading...</div>
      </div>
    }>
      <InstapaySuccessContent />
    </Suspense>
  );
}
