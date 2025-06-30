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
  UserCircle,
  Music,
  Gift,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { thirdFont } from "@/fonts";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

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
  { name: "Shop", href: "/shop", icon: <Store /> },
  { name: "Playlists", href: "/playlists", icon: <ListVideo /> },
  { name: "Deals", href: "/deals", icon: <TicketPercent /> },
  { name: "About", href: "/about", icon: <VenetianMask /> },
];
const rightNavigation = [
  { name: "Club", href: "/club", icon: <PartyPopper /> },
  { name: "Wishlist", href: "/wishlist", icon: <Heart /> },
  { name: "Cart", href: "/cart", icon: <ShoppingBag /> },
];

const accountItems = [
  { icon: UserCircle, label: 'Profile', href: '/account' },
  { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
  { icon: ShoppingBag, label: 'Orders', href: '/account/orders' },
  { icon: Music, label: 'Playlists', href: '/account/playlists' },
  { icon: Gift, label: 'Loyalty Points', href: '/account/loyalty' },
  { icon: Settings, label: 'Settings', href: '/account/settings' },
];

export default function Header() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { wishList } = useContext(wishListContext);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 128);
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

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };
  const handleLogout = async() => {
    await logout();
  }

  return (
    <header
      className={cn(
        "sticky container-custom top-0 z-50 w-full transition-all duration-300 ease-in-out",
        isScrolled ? "bg-lovely/50 backdrop-blur-md shadow-sm" : "bg-lovely",
        isVisible ? "translate-y-0" : "-translate-y-16 md:-translate-y-32"
      )}
    >
      {/* <div className="mx-auto"  > */}
      <div className={`mx-auto ${thirdFont.className} text-6xl font-semibold`}>
        <div className="flex h-16 md:h-32 items-center justify-center gap-8 lg:gap-16 xl:gap-32">
          {/* Desktop Navigation */}
          <nav className="hidden container-custome md:flex w-full text-lovely  px-2 py-8">
          <div className="justify-start items-center flex  w-full">
            {leftNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  " text-base font-medium  transition-colors hover:text-red-900",
                  pathname === item.href ? "text-red-900 " : "text-creamey"
                )}
              >
                <div className="flex  border-l-2 border-creamey px-2 md:px-4 flex-col gap-2 items-center justify-center">
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            ))}
            </div>  
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
            <div className="justify-end items-center flex  w-full">

            {rightNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-base font-medium  transition-colors hover:text-red-900",
                  pathname === item.href ? "text-red-900 " : "text-creamey"
                )}
              >
                <div className="flex  border-r-2 border-creamey  flex-col gap-2 items-center justify-center">
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            ))}
            </div>
            {/* Account with Hover Modal */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex md:px-2 text-creamey hover:text-red-900 lg:px-4 xl:px-8 border-r-2 border-creamey flex-col gap-2 items-center justify-center cursor-pointer">
                  <User />
                  <span className="text-base font-medium  ">Account</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-0 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-4">
                  <nav className="space-y-1">
                    {
                    
                    isAuthenticated?accountItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md group transition-colors"
                      >
                        <item.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                        {item.label}
                      </Link>
                    )):<div></div>}
                   
                   {

              isAuthenticated ?   
               <div className="border-t border-gray-200 mt-2 pt-2">
                      <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md group transition-colors"
                      onClick={handleLogout}>
                        <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" />
                        Sign Out
                      </button>
                    </div>
                    :
                    <div className="">
                    <Link href={'/login'} className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md group transition-colors">
                   
                      Sign In
                    </Link>
                    <Link href={'/register'} className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md group transition-colors">
                   
                      Sign up
                    </Link>
                  </div>
}
                  </nav>
                </div>
              </HoverCardContent>
            </HoverCard>
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
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
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
                    <Link href="/" className="font-display text-xl font-bold" onClick={handleLinkClick}>
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
                        onClick={handleLinkClick}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto text-lg space-y-4">
                    <Link href="/cart" className="flex items-center space-x-2" onClick={handleLinkClick}>
                      <ShoppingBag className="h-5 w-5" />
                      <span>Cart</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center space-x-2"
                      onClick={handleLinkClick}
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
                      onClick={handleLinkClick}
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
            <div className="mr-2 gap-4 flex">
            <Link href={'/wishlist'}>
            <Heart />
            </Link>
            <Link href={'/cart'}>
            <ShoppingBag />
            </Link>
            </div>
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
