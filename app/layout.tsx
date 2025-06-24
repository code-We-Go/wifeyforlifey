import { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const wifeyFont = localFonts({
  src: "./fonts/AcuminVariableConcept.otf",
});

export const lifeyFont = localFonts({
  src: "./fonts/Nickainley.otf",
});

export const Gluten = localFonts({
  src: "./fonts/Gluten.ttf",
});

export const metadata: Metadata = {
  title: "Wifey For Lifey",
  description: "Shop trendy products and subscribe to exclusive video content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="w-full">
      <body className={`w-full min-h-screen ${wifeyFont.className} bg-creamey`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <UserProvider>
              <CartProvider>
                <WishListProvider>
                  <ModalProvider>
                    <div className="relative flex min-h-screen flex-col">
                      <Header />
                      <main className="flex-1">{children}</main>
                      <Footer />
                    </div>
                    <ProductModal />
                    <Toaster />
                  </ModalProvider>
                </WishListProvider>
              </CartProvider>
            </UserProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
