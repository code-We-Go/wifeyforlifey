"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";

export default function GlobalThemeWrapper({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const hasAutoSetTheme = useRef(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isGroomSession = session?.user?.subSubscription?.role === "groom";

  useEffect(() => {
    // Auto-set groom theme only once per login, then let the user toggle freely
    if (status === "authenticated" && isGroomSession && !hasAutoSetTheme.current) {
      hasAutoSetTheme.current = true;
      setTheme("groom");
    }
    // Reset the flag when user logs out so next login triggers it again
    if (status === "unauthenticated") {
      hasAutoSetTheme.current = false;
    }
  }, [status, isGroomSession, setTheme]);

  const isGroomTheme = theme === "groom";

  const groomStyles = `
    :root, body {
      --color-lovely: 18 102 92;
      --color-pinkey: 129 200 187;
    }
  `;

  return (
    <>
      {isGroomTheme && mounted && (
        <style dangerouslySetInnerHTML={{ __html: groomStyles }} />
      )}
      <div className="w-full h-full flex flex-col min-h-screen">
        {children}
      </div>
    </>
  );
}
