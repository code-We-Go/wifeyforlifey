"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { useCart } from "@/providers/CartProvider";
import { INotification } from "@/app/interfaces/interfaces";
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
  BookOpenText,
  Bell,
  MessageCircle,
  Reply,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { thirdFont } from "@/fonts";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Experience", href: "/club" },
  { name: "Playlists", href: "/playlists" },
  { name: "Shop", href: "/shop" },
  { name: "Blogs", href: "/blogs", icon: <BookOpenText /> },
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
];

const accountItems = [
  { icon: UserCircle, label: "Profile", href: "/account" },
  // { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
  // { icon: ShoppingBag, label: 'Orders', href: '/account/orders' },
  // { icon: Music, label: 'Playlists', href: '/account/playlists' },
  // { icon: Gift, label: 'Loyalty Points', href: '/account/loyalty' },
  // { icon: Settings, label: 'Settings', href: '/account/settings' },
];

export default function Header() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { wishList } = useContext(wishListContext);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setLoadingNotifications(true);
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);

        // Check if there are any unread notifications
        const hasUnread = data.notifications.some(
          (notification: { read: boolean }) => !notification.read
        );
        setHasUnreadNotifications(hasUnread);

        // Count unread notifications
        const count = data.notifications.filter(
          (notification: { read: boolean }) => !notification.read
        ).length;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Function to mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAll: true }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification: any) => ({
            ...notification,
            read: true,
          }))
        );
        setHasUnreadNotifications(false);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Fetch notifications when modal opens
  useEffect(() => {
    if (isNotificationsOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [isNotificationsOpen, isAuthenticated]);

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
      if (pathname === "/club" || pathname === "/shop") {
        if (currentScrollY > 128) {
          // Scrolling down, hide header
          setIsVisible(false);
        } else {
          // Scrolling up, show header
          setIsVisible(true);
        }
      } else if (currentScrollY > lastScrollY && currentScrollY > 128) {
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
  }, [lastScrollY, pathname]);

  // Add effect to close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".account-dropdown")) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add timeout for hover behavior
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (!isHovering && window.innerWidth >= 768) {
      timeoutId = setTimeout(() => {
        setIsAccountOpen(false);
      }, 150); // Small delay to allow moving mouse to dropdown
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isHovering]);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

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
                unoptimized
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

            {/* Account with custom dropdown that works on both desktop and touch devices */}
            <div className="relative account-dropdown">
              <button
                type="button"
                className="flex md:px-2 text-creamey hover:text-red-900 lg:px-4 xl:px-8 border-r-2 border-creamey flex-col gap-2 items-center justify-center cursor-pointer bg-transparent border-0"
                aria-label="Account"
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                onMouseEnter={() => {
                  // On desktop, show on hover
                  if (window.innerWidth >= 768) {
                    setIsHovering(true);
                    setIsAccountOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  // On desktop, set hovering to false (dropdown will close after delay)
                  if (window.innerWidth >= 768) {
                    setIsHovering(false);
                  }
                }}
              >
                <User />
                <span className="text-base font-medium">Account</span>
              </button>

              {/* Dropdown Content */}
              {isAccountOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 p-0 bg-creamey border text-lovely border-lovely/80 rounded-lg shadow-lg z-50"
                  onMouseEnter={() => {
                    // Keep dropdown open when hovering over content
                    if (window.innerWidth >= 768) {
                      setIsHovering(true);
                    }
                  }}
                  onMouseLeave={() => {
                    // Close dropdown when leaving content
                    if (window.innerWidth >= 768) {
                      setIsHovering(false);
                    }
                  }}
                >
                  <div className="p-4">
                    <nav className="space-y-1">
                      {isAuthenticated ? (
                        accountItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-3 py-2 text-sm font-medium text-lovely hover:underline rounded-md group transition-colors"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            <item.icon className="mr-3 h-4 w-4 text-lovely " />
                            {item.label}
                          </Link>
                        ))
                      ) : (
                        <div></div>
                      )}

                      {isAuthenticated ? (
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <button
                            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md group transition-colors"
                            onClick={() => {
                              handleLogout();
                              setIsAccountOpen(false);
                            }}
                          >
                            <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" />
                            Sign Out
                          </button>
                        </div>
                      ) : (
                        <div className="">
                          <Link
                            href={"/login"}
                            className="w-full flex items-center px-3 py-2 text-sm font-medium text-lovely hover:underline rounded-md group transition-colors"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            Sign In
                          </Link>
                          <Link
                            href={"/register"}
                            className="w-full flex items-center px-3 py-2 text-sm font-medium text-lovely hover:underline rounded-md group transition-colors"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            Sign up
                          </Link>
                        </div>
                      )}
                    </nav>
                  </div>
                </div>
              )}
            </div>
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
              <SheetTrigger asChild className="">
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
                    <Link
                      href="/"
                      className="font-display text-xl font-bold"
                      onClick={handleLinkClick}
                    >
                      <Image
                        unoptimized
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
                          "text-xl font-medium  hover:underline transition duration-300",
                          pathname === item.href ? "underline" : "text-creamey"
                        )}
                        onClick={handleLinkClick}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto text-lg space-y-4">
                    <Link
                      href="/cart"
                      className="flex items-center space-x-2"
                      onClick={handleLinkClick}
                    >
                      <ShoppingBag className="h-5 w-5" />
                      <span>Cart</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center space-x-2"
                      onClick={handleLinkClick}
                    >
                      <Heart className={cn("h-5 w-5")} />
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
                    {isAuthenticated && (
                      <button
                        className="w-full flex items-center gap-2 space-x-2 py-2 text-creamey hover:underline rounded-md group transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut className=" h-5 w-5 " />
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link
              href="/"
              className="  lg:flex-shrink-0  items-center px-8 lg:px-16 space-x-2"
            >
              <Image
                unoptimized
                className="aspect-auto"
                alt="logo"
                width={200}
                height={150}
                src={"/logo/WifeyforLifeyPrimaryLogoCream.png"}
              />
            </Link>
            <div className="mr-2 gap-4 flex">
              {isAuthenticated ? (
                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    // Mark all notifications as read
                    if (unreadCount > 0) {
                      markAllNotificationsAsRead();
                    }
                    // Open the notifications modal
                    setIsNotificationsOpen(true);
                  }}
                >
                  <Bell className="text-creamey" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -left-2 bg-creamey rounded-full w-5 h-5 border text-lovely border-lovely flex items-center justify-center text-xs font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </div>
                  )}
                </div>
              ) : (
                <Link href={"/wishlist"}>
                  <Heart />
                </Link>
              )}
              <Link href={"/cart"}>
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
      {/* Notifications Modal */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="sm:max-w-md bg-creamey">
          <DialogHeader>
            <DialogTitle className="text-lovely">Notifications</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            {loadingNotifications ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 animate-pulse"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">You have no notifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border rounded-lg overflow-hidden ${
                      notification.read ? "border-gray-200" : "border-lovely"
                    } cursor-pointer hover:bg-gray-100 transition-colors`}
                    onClick={async () => {
                      // Mark notification as read if it's not already
                      if (!notification.read) {
                        try {
                          const response = await fetch(
                            `/api/notifications/${notification._id}/read`,
                            {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                              },
                            }
                          );

                          if (response.ok) {
                            // Update local state to mark as read
                            setNotifications(
                              notifications.map((n) =>
                                n._id === notification._id
                                  ? { ...n, read: true }
                                  : n
                              )
                            );

                            // Update unread status if needed
                            const stillHasUnread = notifications.some(
                              (n) => n._id !== notification._id && !n.read
                            );
                            setHasUnreadNotifications(stillHasUnread);
                          }
                        } catch (error) {
                          console.error(
                            "Error marking notification as read:",
                            error
                          );
                        }
                      }

                      // Close the modal
                      setIsNotificationsOpen(false);

                      // Navigate to the link
                      if (notification.link) {
                        // Simple navigation without hash
                        router.push(notification.link);
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            {notification.userId?.imageURL ? (
                              <div className="relative">
                                <div className="rounded-full w-10 h-10 overflow-hidden">
                                  <Image
                                    src={notification.userId.imageURL}
                                    alt={
                                      notification.userId?.firstName || "User"
                                    }
                                    width={40}
                                    height={40}
                                  />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-lovely rounded-full p-1">
                                  {notification.actionType === "like" && (
                                    <Heart className="h-3 w-3 text-white" />
                                  )}
                                  {notification.actionType === "comment" && (
                                    <MessageCircle className="h-3 w-3 text-white" />
                                  )}
                                  {notification.actionType === "reply" && (
                                    <Reply className="h-3 w-3 text-white" />
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-500" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-lovely rounded-full p-1">
                                  {notification.actionType === "like" && (
                                    <Heart className="h-3 w-3 text-white" />
                                  )}
                                  {notification.actionType === "comment" && (
                                    <MessageCircle className="h-3 w-3 text-white" />
                                  )}
                                  {notification.actionType === "reply" && (
                                    <Reply className="h-3 w-3 text-white" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-lovely font-medium">
                              {notification.userId?.firstName}{" "}
                              {notification.userId?.lastName}{" "}
                              {notification.actionType === "like" &&
                                "liked your comment"}
                              {notification.actionType === "comment" &&
                                "commented on your video"}
                              {notification.actionType === "reply" &&
                                "replied to your comment"}
                            </p>
                            {notification.content && (
                              <p className="text-sm text-lovely/70 mt-1">
                                &quot;
                                {notification.content.length > 100
                                  ? notification.content.substring(0, 100) +
                                    "..."
                                  : notification.content}
                                &quot;
                              </p>
                            )}
                            <p className="text-xs text-lovely/60 mt-2">
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-lovely flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
