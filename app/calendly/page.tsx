"use client";

import React, { useEffect } from "react";

const CalendlyWidget = () => {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-creamey h-auto flex justify-center items-center">
      <div
        className="calendly-inline-widget"
        data-url="https://calendly.com/wifeyforlifeycorp/all-about-appliances?hide_gdpr_banner=1&background_color=f9f9ef&primary_color=ff0000"
        style={{
          minWidth: "320px",
          height: "700px",
        }}
      />
    </div>
  );
};

export default CalendlyWidget;
