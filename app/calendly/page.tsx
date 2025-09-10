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
    <div className="w-full min-h-screen bg-creamey h-auto flex justify-center items-center p-4">
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
    </div>
  );
};

export default CalendlyWidget;
