import { Metadata } from "next";
import { Inter, Playfair_Display, Cairo } from "next/font/google";
import "./globals.css";
import "./scrollbar-hide.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { CartProvider } from "@/providers/CartProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import localFonts from "next/font/local";
import UserProvider from "./UserProvider";
import WishListProvider from "./WishListProvider";
import { ModalProvider } from "./context/ModalContext";
import ProductModal from "@/components/shop/ProductModal";
import { AnnouncementProvider } from "../context/announcementContext";
import ConditionalAnnouncmentBar from "@/components/ConditionalAnnouncmentBar";
import DiscountPopup from "@/components/DiscountPopup";
import NewsletterPopup from "@/components/NewsletterPopup";
import AppliancesWebinarGlobalPopup from "@/components/shared/AppliancesWebinarGlobalPopup";
import SideCart from "@/components/cart/SideCart";
import { GoogleTagManager } from "@next/third-parties/google";
import GlobalThemeWrapper from "./GlobalThemeWrapper";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const wifeyFont = localFonts({
  src: "./fonts/AcuminVariableConcept.otf",
});

const lifeyFont = localFonts({
  src: "./fonts/Nickainley.otf",
});

const Gluten = localFonts({
  src: "./fonts/Gluten.ttf",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isAr = locale === "ar";
  return {
    title: isAr ? "وايفي فور لايفي | Wifey For Lifey" : "Wifey For Lifey",
    description: isAr
      ? "تسوقي منتجات مميزة واشتركي في محتوى الفيديو الحصري لتخطيط وتنظيم الفرح"
      : "Shop trendy products and subscribe to exclusive video content",
    alternates: {
      languages: {
        en: "/",
        ar: "/ar",
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRtl = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`w-full bg-creamey ${cairo.variable}`}
    >
      <GoogleTagManager gtmId="GTM-KQMB2B2F" />

      <body
        className={`w-full min-h-screen ${
          isRtl ? cairo.className : wifeyFont.className
        } bg-creamey`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KQMB2B2F"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
            >
              <UserProvider>
                <CartProvider>
                  <WishListProvider>
                    <AnnouncementProvider>
                      <ModalProvider>
                        <GlobalThemeWrapper>
                          <div className="relative flex min-h-screen flex-col">
                            <ConditionalAnnouncmentBar />
                            <Header />
                            <main className="flex-1">{children}</main>
                            <Footer />
                          </div>
                          <ProductModal />
                          <SideCart />

                          <DiscountPopup />
                          <NewsletterPopup />
                          <AppliancesWebinarGlobalPopup />
                          <Toaster />
                        </GlobalThemeWrapper>
                      </ModalProvider>
                    </AnnouncementProvider>
                  </WishListProvider>
                </CartProvider>
              </UserProvider>
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
