"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { useCart } from "@/providers/CartProvider";
import { wishListContext } from "@/app/context/wishListContext";

import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Search,
  ListVideo,
  Store,
  VenetianMask,
  Club,
  PartyPopper,
  TicketPercent,
  BookOpenText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { thirdFont } from "@/fonts";
const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Playlists", href: "/playlists" },
  { name: "Deals", href: "/playlists", icon: <TicketPercent /> },

  { name: "Gehaz", href: "/Gehaz" },
  { name: "About", href: "/about" },
];
const leftNavigation = [
  // { name: "Home", href: "/",icon:<ShoppingBag/> },
  { name: "Experience", href: "/club", icon: <PartyPopper /> },

  { name: "Playlists", href: "/playlists", icon: <ListVideo /> },
  { name: "Shop", href: "/shop", icon: <Store /> },
  { name: "About", href: "/about", icon: <VenetianMask /> },
];
const rightNavigation = [
  { name: "Blogs", href: "/blogs", icon: <BookOpenText /> },
  { name: "Wishlist", href: "/wishlist", icon: <Heart /> },
  { name: "Cart", href: "/cart", icon: <ShoppingBag /> },
  { name: "Account", href: "/account", icon: <User /> },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { wishList } = useContext(wishListContext);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 128) {
        // Scrolling down, hide header
        setIsVisible(false);
      } else {
        // Scrolling up, show header
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
        isScrolled ? "bg-lovely/50 backdrop-blur-md shadow-sm" : "bg-lovely",
        isVisible ? "translate-y-0" : "-translate-y-16 md:-translate-y-32"
      )}
    >
      {/* <div className="mx-auto"  > */}
      <div className={`mx-auto ${thirdFont.className} text-6xl font-semibold`}>
        <div className="flex h-16 md:h-32 items-center justify-center gap-8 xl:gap-16">
          {/* Desktop Navigation */}
          <nav className="hidden  text-lovely justify-center items-center md:flex px-2 py-8">
            {leftNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  " text-base font-medium  transition-colors hover:text-red-900",
                  pathname === item.href ? "text-red-900 " : "text-creamey"
                )}
              >
                <div className="flex md:px-2 lg:px-4 xl:px-8 border-l-2 border-creamey  flex-col gap-2 items-center justify-center">
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            ))}
            {/* Logo */}

            <Link
              href="/"
              className=" border-x-2 lg:flex-shrink-0 border-creamey items-center px-8 lg:px-16 space-x-2"
            >
              <Image
                className="aspect-auto"
                alt="logo"
                width={200}
                height={150}
                src={"/logo/WifeyforLifeyPrimaryLogowithSloganCream.png"}
              />
            </Link>
            {rightNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-base font-medium  transition-colors hover:text-red-900",
                  pathname === item.href ? "text-red-900 " : "text-creamey"
                )}
              >
                <div className="flex md:px-2 lg:px-4 xl:px-8 border-r-2 border-creamey  flex-col gap-2 items-center justify-center">
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          {/* <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div> */}

          {/* Mobile Menu Toggle */}
          <div className="flex w-full justify-between md:hidden items-center text-creamey">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetTitle className="hidden">test</SheetTitle>
              <SheetContent
                side="left"
                className="w-[300px] bg-lovely text-creamey sm:w-[400px]"
              >
                <div
                  className={`${thirdFont.className} flex flex-col h-full py-6 `}
                >
                  <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="font-display text-xl font-bold">
                      <Image
                        className="aspect-auto"
                        alt="logo"
                        width={200}
                        height={150}
                        src={
                          "/logo/WifeyforLifeyPrimaryLogowithSloganCream.png"
                        }
                      />
                    </Link>
                  </div>
                  <nav className="flex flex-col space-y-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "text-lg font-medium  hover:text-red-900",
                          pathname === item.href
                            ? "text-red-900"
                            : "text-creamey"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto text-lg space-y-4">
                    <Link href="/cart" className="flex items-center space-x-2">
                      <ShoppingBag className="h-5 w-5" />
                      <span>Cart</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center space-x-2"
                    >
                      <Heart
                        className={cn(
                          wishList.length > 0 ? "bg-red-900" : "",
                          "h-5 w-5"
                        )}
                      />
                      <span>Wishlist</span>
                    </Link>
                    <Link
                      href="/account"
                      className="flex items-center space-x-2"
                    >
                      <User className="h-5 w-5" />
                      <span>Account</span>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link
              href="/"
              className="  lg:flex-shrink-0  items-center px-8 lg:px-16 space-x-2"
            >
              <Image
                className="aspect-auto"
                alt="logo"
                width={200}
                height={150}
                src={"/logo/WifeyforLifeyPrimaryLogoCream.png"}
              />
            </Link>
            <div className="w-4"></div>
            {/* <Link href="/cart" className="relative mr-4">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link> */}
          </div>
        </div>
      </div>
    </header>
  );
}
