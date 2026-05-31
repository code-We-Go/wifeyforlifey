"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function GlobalThemeWrapper({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const isGroom = session?.user?.subSubscription?.role === "groom";
  const isAccountRoute = pathname?.includes("account");

  const themeStyle = (isGroom && isAccountRoute)
    ? {
        "--color-lovely": "18 102 92", // everGreen RGB
        "--color-pinkey": "129 200 187", // saga RGB
      } as React.CSSProperties
    : {};

  return (
    <div style={themeStyle} className="w-full h-full flex flex-col min-h-screen">
      {children}
    </div>
  );
}
