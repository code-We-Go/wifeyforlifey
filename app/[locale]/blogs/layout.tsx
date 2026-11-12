import React from "react";
import GehazBestieOverlay from "./components/GehazBestieOverlay";

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-screen">
      {children}
      <GehazBestieOverlay />
    </section>
  );
}
