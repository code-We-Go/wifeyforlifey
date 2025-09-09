"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const CalendlyWidget = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    
    // Prevent going back
    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", () => {
      history.pushState(null, "", window.location.href);
    });
    
    return () => {
      // Cleanup script when component unmounts
      document.body.removeChild(script);
      window.removeEventListener("popstate", () => {});
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-creamey h-auto flex justify-center items-center">
      <div
        className="calendly-inline-widget"
        data-url="https://calendly.com/wifeyforlifeycorp/self-care-during-gehaz-planning-period?hide_gdpr_banner=1"
        style={{
          minWidth: "320px",
          height: "700px",
        }}
      />
    </div>
  );
};

export default CalendlyWidget;
