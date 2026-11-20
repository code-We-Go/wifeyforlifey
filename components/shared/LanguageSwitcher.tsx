"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTransition } from "react";

interface LanguageSwitcherProps {
  variant?: "header" | "mobile" | "footer";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "header",
  className,
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (newLocale: "en" | "ar") => {
    if (newLocale === locale) return;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      router.refresh();
    });
  };

  if (variant === "mobile") {
    return (
      <div
        className={cn(
          "flex items-center w-full max-w-[200px] border border-creamey/30 bg-creamey/10 rounded-full p-1",
          className
        )}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <button
          type="button"
          onClick={() => switchLanguage("en")}
          disabled={isPending}
          className={cn(
            "flex flex-1 items-center justify-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
            locale === "en"
              ? "bg-creamey text-lovely shadow-sm font-semibold"
              : "text-creamey hover:bg-creamey/20"
          )}
        >
          <span>EN</span>
        </button>
        <button
          type="button"
          onClick={() => switchLanguage("ar")}
          disabled={isPending}
          className={cn(
            "flex flex-1 items-center justify-center space-x-1 px-3 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
            locale === "ar"
              ? "bg-creamey text-lovely shadow-sm font-semibold"
              : "text-creamey hover:bg-creamey/20"
          )}
        >
          <span>عربي</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center border border-creamey/30 bg-creamey/10 rounded-full p-0.5",
        className
      )}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <button
        type="button"
        onClick={() => switchLanguage("en")}
        disabled={isPending}
        className={cn(
          "flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
          locale === "en"
            ? "bg-creamey text-lovely shadow-sm font-semibold"
            : "text-creamey hover:bg-creamey/20"
        )}
        title="English"
      >
        <span>EN</span>
      </button>
      <button
        type="button"
        onClick={() => switchLanguage("ar")}
        disabled={isPending}
        className={cn(
          "flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
          locale === "ar"
            ? "bg-creamey text-lovely shadow-sm font-semibold"
            : "text-creamey hover:bg-creamey/20"
        )}
        title="العربية"
      >
        <span>عربي</span>
      </button>
    </div>
  );
}
