"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const CalendlyWidget = () => {
  const router = useRouter();

  useEffect(() => {
    // Prevent going back
    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", () => {
      history.pushState(null, "", window.location.href);
    });

    return () => {
      window.removeEventListener("popstate", () => {});
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-creamey h-auto flex flex-col gap-4 justify-center items-center p-4">
      <div
        className="calendly-inline-widget rounded-lg"
        data-url="https://calendly.com/wifeyforlifeycorp/all-about-appliances?hide_gdpr_banner=1&background_color=d32333&text_color=fbf3e0&primary_color=fbf3e0"
        style={{
          minWidth: "450px",
          height: "700px",
        }}
      />

      <script
        type="text/javascript"
        src="https://assets.calendly.com/assets/external/widget.js"
        async
      />
      <div className="text-center max-w-xl text-lovely">
        <button
          onClick={() => router.push("/calendly3")}
          className="px-6 py-2 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition"
        >
          Click for a surprise from wifey!
        </button>
      </div>
    </div>
  );
};

export default CalendlyWidget;
