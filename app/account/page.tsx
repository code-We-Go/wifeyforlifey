"use client";

import {
  UserCircle,
  Heart,
  ShoppingBag,
  Gift,
  BadgeCheck,
  BadgeAlert,
  Package,
  Truck,
  CheckCircle,
  Edit,
  Camera,
  ShoppingCart,
  Trash2,
  Crown,
  Handshake,
  Percent,
  CirclePercent,
  Star,
  Bell,
  MessageCircle,
  Reply,
  User,
} from "lucide-react";
import { useEffect, useState, useContext, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import { lifeyFont, thirdFont } from "@/fonts";
import { wishListContext } from "../context/wishListContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import CartItemSmall from "../cart/CartItemSmall";
import { useAuth } from "@/hooks/useAuth";
import {
  ILoyaltyTransaction,
  IOrder,
  INotification,
} from "../interfaces/interfaces";
import { useCart } from "@/providers/CartProvider";
import { UploadDropzone } from "@/utils/uploadthing";
import { compressImage } from "@/utils/imageCompression";
import PartnersGrid from "./partners/PartnersGrid";
import FavoritesGrid from "./favorites/FavoritesGrid";
import { generateDeviceFingerprint } from "@/utils/fingerprint";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const AccountPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { wishList, setWishList } = useContext(wishListContext);
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "partners";

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Set the default tab in URL on initial load if not already present
  useEffect(() => {
    if (!searchParams.get("tab")) {
      router.push(`/account?tab=${activeTab}`, { scroll: false });
    }
  }, []);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const { loyaltyPoints, refreshLoyaltyPoints } = useAuth();
  const [userInfo, setUserInfo] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    imageUrl: "",
    birthDate: "",
    weddingDate: "",
  });
  const [isDetailsModalOpen, setDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [modalStatus, setModalStatus] = useState<string>("pending");
  const [modalPayment, setModalPayment] = useState<string>("pending");
  const [showUploader, setShowUploader] = useState(false);

  // Continue Watching (latest progress record)
  type ContinueItem = {
    playlistId: string;
    videoId: string;
    thumbnailUrl?: string;
    playlistTitle?: string;
    videoTitle?: string;
  } | null;
  const [continueItem, setContinueItem] = useState<ContinueItem>(null);
  const [continueLoading, setContinueLoading] = useState(false);
  const handleRemoveFromWishlist = (
    productId: string,
    variant: any,
    attributes: any
  ) => {
    setWishList((prevList) =>
      prevList.filter(
        (item) =>
          item.productId !== productId ||
          item.variant !== variant ||
          item.attributes !== attributes
      )
    );
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    });
  };
  const { addItem } = useCart();
  const { toast } = useToast();
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<
    ILoyaltyTransaction[]
  >([]);
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Helper functions for notifications
  const formatNotificationDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  const getNotificationText = (notification: INotification): string => {
    switch (notification.actionType) {
      case "like":
        return `liked your ${notification.targetType}`;
      case "comment":
        return `commented on your ${notification.targetType}`;
      case "reply":
        return `replied to your comment`;
      default:
        return `interacted with your ${notification.targetType}`;
    }
  };

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    setLoadingNotifications(true);
    try {
      const response = await axios.get("/api/notifications");
      setNotifications(response.data.notifications);
      const unreadCount = response.data.notifications.filter(
        (n: INotification) => !n.read
      ).length;
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await axios.put("/api/notifications", { notificationId });
      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      // Update unread count
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await axios.put("/api/notifications", { markAll: true });
      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      // Reset unread count
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const fetchLoyaltyTransactions = async () => {
    if (!session?.user?.email) return;
    setLoadingLoyalty(true);
    try {
      const response = await axios.post("/api/loyalty/transactions", {
        email: session.user.email,
      });
      console.log("responseAccount" + response.data.transactions.length);
      setLoyaltyTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("Error fetching loyalty transactions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch loyalty transactions",
        variant: "destructive",
      });
    } finally {
      setLoadingLoyalty(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Loyality") {
      fetchLoyaltyTransactions();
    } else if (activeTab === "notifications") {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session]);

  const handleMoveToCart = (item: any) => {
    addItem(item);
    handleRemoveFromWishlist(item.productId, item.variant, item.attributes);
    toast({
      title: "Added to cart",
      description: `${item.productName} has been moved to your cart.`,
    });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
      fetchUserOrders();
      fetchNotifications();

      // Check for fingerprint in sessionStorage for Google login tracking
      if (typeof window !== "undefined") {
        const fingerprint = sessionStorage.getItem("deviceFingerprint");
        console.log(
          "Account page - Retrieved fingerprint from sessionStorage:",
          fingerprint
        );

        if (fingerprint) {
          // Clear it after use
          sessionStorage.removeItem("deviceFingerprint");
          console.log("Account page - Cleared fingerprint from sessionStorage");

          // Record login with fingerprint
          if (session.user.id) {
            recordLoginAttempt(
              session.user.id,
              fingerprint,
              session?.user?.firstName || ""
            );
          } else {
            console.error("Cannot record login attempt: User ID is undefined");
          }
        }
      }
    }
  }, [session]);

  // Fetch latest progress for subscribed users to power Continue Watching
  useEffect(() => {
    const loadContinueWatching = async () => {
      try {
        if (!session?.user?.isSubscribed) {
          setContinueItem(null);
          return;
        }
        setContinueLoading(true);
        const res = await fetch(`/api/playlist-progress`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to load progress list");
        }
        const data = await res.json();
        const list = (data?.progressList || []) as any[];
        // Find the most recent entry that has a lastWatchedVideoID
        const latest = list.find((p) => p?.lastWatchedVideoID && p?.playlistID);
        if (latest) {
          setContinueItem({
            playlistId: String(latest.playlistID?._id || latest.playlistID),
            videoId: String(
              latest.lastWatchedVideoID?._id || latest.lastWatchedVideoID
            ),
            thumbnailUrl:
              latest.lastWatchedVideoID?.thumbnailUrl ||
              latest.playlistID?.thumbnailUrl,
            playlistTitle: latest.playlistID?.title,
            videoTitle: latest.lastWatchedVideoID?.title,
          });
        } else {
          setContinueItem(null);
        }
      } catch (e) {
        console.warn("Continue Watching load failed", e);
        setContinueItem(null);
      } finally {
        setContinueLoading(false);
      }
    };

    // Only attempt after session state is known
    if (status !== "loading") {
      loadContinueWatching();
    }
  }, [status, session?.user?.isSubscribed]);

  // Function to record login attempt with device fingerprint
  const recordLoginAttempt = async (
    userId: string,
    customFingerprint: string,
    firstName: string
  ) => {
    try {
      console.log(
        "Account page - Recording login with fingerprint:",
        customFingerprint
      );

      // Import the generateDeviceFingerprint utility
      const { generateDeviceFingerprint } = await import("@/utils/fingerprint");

      // Get comprehensive device info
      const deviceInfo = generateDeviceFingerprint() || {
        // Fallback if fingerprinting fails
        fingerprint: customFingerprint,
        userAgent: navigator.userAgent,
      };

      // Send to API endpoint
      await axios.post("/api/auth/login-tracking", {
        userId,
        email: session?.user?.email,
        firstName: firstName,
        success: true,
        ...deviceInfo,
        timestamp: new Date(),
      });

      console.log("Account page - Login tracking data sent successfully");
    } catch (error) {
      console.error("Account page - Error recording login attempt:", error);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleComperession = async (files: File[]) => {
    setIsUploading(true);
    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          if (file.type.startsWith("image/")) {
            return await compressImage(file);
          }
          return file;
        })
      );
      return compressedFiles;
    } catch (error) {
      console.error("Error during compression:", error);
      return files;
    } finally {
      setIsUploading(false);
    }
  };

  const fetchUserData = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await axios.get(
        `/api/user/profile?email=${session.user.email}`
      );
      const userData = response.data.user;
      console.log("userFront" + userData.lastName);

      setUserInfo({
        name: userData.username || "User",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "user@example.com",
        imageUrl: userData.imageURL || "",
        birthDate: userData.birthDate
          ? new Date(userData.birthDate).toISOString().split("T")[0]
          : "",
        weddingDate: userData.weddingDate
          ? new Date(userData.weddingDate).toISOString().split("T")[0]
          : "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to session data if API call fails
      setUserInfo({
        name: session.user.name || "User",
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
        email: session.user.email || "user@example.com",
        imageUrl: session.user.image || "",
        birthDate: "",
        weddingDate: "",
      });
    }
  };

  const fetchUserOrders = async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `/api/orders?email=${session.user.email}`
      );
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-creamey" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-creamey" />;
      case "confirmed":
        return <Package className="h-4 w-4 text-creamey" />;
      default:
        return <Package className="h-4 w-4 text-creamey" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSaveInfo = async () => {
    if (!session?.user?.email) return;

    try {
      // Get current user data to check if dates are being added for the first time
      const currentUserResponse = await axios.get(
        `/api/user/profile?email=${session.user.email}`
      );
      const currentUser = currentUserResponse.data.user;

      const isFirstTimeBirthDate = !currentUser.birthDate && userInfo.birthDate;
      const isFirstTimeWeddingDate =
        !currentUser.weddingDate && userInfo.weddingDate;
      const isFirstTimeFirstName =
        currentUser.firstName === "" && userInfo.firstName;
      const isFirstTimeLastName =
        currentUser.lastName === "" && userInfo.lastName;

      const response = await axios.put(`/api/user/profile`, {
        email: session.user.email,
        username: userInfo.name,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        imageURL: userInfo.imageUrl,
        birthDate: userInfo.birthDate,
        weddingDate: userInfo.weddingDate,
      });

      if (response.data.success) {
        // Award loyalty points for first-time entries
        const bonusTypes = [
          { check: isFirstTimeBirthDate, type: "birthday" },
          { check: isFirstTimeWeddingDate, type: "wedding" },
          { check: isFirstTimeFirstName, type: "firstname" },
          { check: isFirstTimeLastName, type: "lastname" },
        ];
        for (const bonus of bonusTypes) {
          if (bonus.check) {
            try {
              const bonusResponse = await axios.post(
                "/api/loyalty/award-bonus",
                {
                  email: session.user.email,
                  bonusType: bonus.type,
                }
              );
              if (bonusResponse.data.success) {
                toast({
                  variant: "added",
                  title: "🎉 Loyalty Points Earned!",
                  description: bonusResponse.data.message,
                });
              }
            } catch (bonusError) {
              console.error(`Error awarding ${bonus.type} bonus:`, bonusError);
            }
          }
        }

        toast({
          variant: "added",
          title: "Success",
          description: "Profile information updated successfully",
        });
        setEditingInfo(false);

        // Refresh user data and loyalty points to get updated information
        fetchUserData();
        refreshLoyaltyPoints();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile information",
        variant: "destructive",
      });
    }
  };

  // Show loading state while session is loading
  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  // Show loading state while session is loading
  if (!session?.user) {
    return <div>Not authenticated</div>;
  }

  const user = {
    name: session.user.name || "User",
    email: session.user.email || "user@example.com",
    isSubscribed: session.user.isSubscribed || false,
    subscriptionExpiryDate: session.user.subscriptionExpiryDate,
    imgUrl: session.user.image,
    loyaltyPoints: loyaltyPoints,
    wishlistItems: wishList.length,
    orders: orders.length,
  };

  const stats = [
    {
      name: "Loyalty Points",
      value: user.loyaltyPoints.lifeTimePoints,
      icon: Gift,
      color: "text-lovely",
      bgColor: "bg-creamey",
    },
    {
      name: "Wishlist Items",
      value: user.wishlistItems,
      icon: Heart,
      color: "text-lovely",
      bgColor: "bg-creamey",
    },
    {
      name: "Total Orders",
      value: user.orders,
      icon: ShoppingBag,
      color: "text-lovely",
      bgColor: "bg-creamey",
    },
  ];

  const tabs = [
    { id: "partners", label: "Discounts", icon: CirclePercent },
    { id: "favorites", label: "Favorites", icon: Star },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "Loyality", label: "Loyalty", icon: Gift },
    { id: "info", label: "Info", icon: UserCircle },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "orders", label: "Recent Orders", icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6 text-creamey">
      {/* Profile Header */}
      <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          {userInfo.imageUrl ? (
            <div className="rounded-full h-24 w-24 border-2 border-lovely relative flex-shrink-0">
              <Image
                className="rounded-full object-cover"
                alt={user.name}
                src={userInfo.imageUrl}
                fill
                unoptimized
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <UserCircle className="h-16 w-16 text-gray-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1
              className={`text-2xl sm:text-4xl font-bold text-lovely tracking-normal break-words ${thirdFont.className}`}
            >
              {user.name}
            </h1>
            <p className="text-sm font-semibold text-lovely/80 break-all">
              {userInfo.firstName} {userInfo.lastName}
            </p>
            <p className="text-sm font-semibold text-lovely/80 break-all">
              {user.email}
            </p>
            <p className="text-sm font-semibold flex items-center gap-2 text-lovely/80">
              Subscription :{" "}
              <span>
                {user.isSubscribed ? (
                  <BadgeCheck className="text-lovely/80" />
                ) : (
                  <BadgeAlert />
                )}
              </span>
            </p>
            {session?.user?.subscription?.packageId ===
              "68bf6ae9c4d5c1af12cdcd37" && (
              // "68bf6ae9c4d5c1af12cdcd37" && (
              <Link href="/subscription/687396821b4da119eb1c13fe?upgrade=1000">
                <Button
                  size="sm"
                  className="mt-2 bg-lovely text-creamey rounded-md hover:bg-lovely/80 whitespace-normal h-auto py-2 text-center"
                >
                  Upgrade now to the Full Wifey Experience
                </Button>
              </Link>
            )}
            {user.isSubscribed && (
              <p className="text-lovely/80 text-sm font-semibold">
                Expires at :{" "}
                {user.subscriptionExpiryDate
                  ? (() => {
                      const expiry = new Date(user.subscriptionExpiryDate);
                      const now = new Date();
                      const tenYearsFromNow = new Date(
                        now.setFullYear(now.getFullYear() + 10)
                      );
                      return expiry > tenYearsFromNow ? (
                        <span className="inline-flex gap-2 items-end">
                          Lifetime Wifey <Crown />
                        </span>
                      ) : (
                        expiry.toLocaleDateString()
                      );
                    })()
                  : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-lovely px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className={`absolute rounded-md ${stat.bgColor} p-3`}>
                <stat.icon
                  className={`h-6 w-6 ${stat.color}`}
                  aria-hidden="true"
                />
              </div>
              <p className="ml-16 truncate text-sm text-creamey font-semibold">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-creamey">
                {stat.value}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Continue Watching (subscribed users) */}
      {session?.user?.isSubscribed && continueLoading && (
        <div className="bg-creamey text-lovely rounded-xl p-4 md:p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="relative w-40 h-24 rounded overflow-hidden flex-shrink-0">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
              <div className="mt-2">
                <Skeleton className="h-10 w-24 rounded" />
              </div>
            </div>
          </div>
        </div>
      )}

      {session?.user?.isSubscribed && !continueLoading && continueItem && (
        <div className="bg-creamey text-lovely rounded-xl p-4 md:p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="relative w-40 h-24 rounded overflow-hidden flex-shrink-0">
              <img
                src={continueItem.thumbnailUrl || "/video/1.png"}
                alt={continueItem.videoTitle || "Continue watching"}
                className="object-cover w-full h-full"
              />
              <Link
                href={`/playlists/${continueItem.playlistId}?videoId=${continueItem.videoId}`}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <span className="sr-only">Continue</span>
              </Link>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold">Continue Watching</h3>
              <p className="text-sm text-lovely/90 truncate">
                {continueItem.videoTitle || "Latest watched video"}
                {continueItem.playlistTitle
                  ? ` • ${continueItem.playlistTitle}`
                  : ""}
              </p>
              <div className="mt-2">
                <Button
                  onClick={() =>
                    router.push(
                      `/playlists/${continueItem.playlistId}?videoId=${continueItem.videoId}`
                    )
                  }
                  className="bg-lovely text-creamey hover:bg-lovely"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-pinkey overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // Update URL with the new tab
                router.push(`/account?tab=${tab.id}`, { scroll: false });
                if (
                  tab.id === "notifications" &&
                  unreadNotificationsCount > 0
                ) {
                  markAllNotificationsAsRead();
                }
              }}
              className={`flex items-center space-x-1 sm:space-x-2 py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-lovely text-lovely font-semibold"
                  : "border-transparent text-lovely/90 hover:text-lovely duration-300 hover:border-lovely"
              }`}
            >
              <div className="relative">
                <tab.icon className="h-4 w-4" />
                {tab.id === "notifications" && unreadNotificationsCount > 0 && (
                  <div className="absolute max-md:-left-2 pt-[2px] -top-2 md:-right-2 bg-lovely text-creamey text-xs rounded-full h-4 w-4 flex items-center text-center justify-center">
                    <span>
                      {unreadNotificationsCount > 9
                        ? "9+"
                        : unreadNotificationsCount}
                    </span>
                  </div>
                )}
              </div>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "notifications" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-lovely">
                Notifications
              </h2>
            </div>
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
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-lovely mx-auto mb-4" />
                    <p className="text-lovely">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    // Create a wrapper component based on whether there's a link
                    const NotificationWrapper = ({
                      children,
                    }: {
                      children: React.ReactNode;
                    }) => {
                      // Function to mark notification as read when clicked
                      const handleNotificationClick = async () => {
                        if (!notification.read) {
                          try {
                            // Mark notification as read
                            const response = await fetch(
                              `/api/notifications/${notification._id}/read`,
                              {
                                method: "PUT",
                              }
                            );

                            if (response.ok) {
                              // Update UI to show notification as read
                              setNotifications((prev) =>
                                prev.map((n) =>
                                  n._id === notification._id
                                    ? { ...n, read: true }
                                    : n
                                )
                              );
                            }
                          } catch (error) {
                            console.error(
                              "Error marking notification as read:",
                              error
                            );
                          }
                        }
                      };

                      if (notification.link) {
                        console.log("link" + notification.link);
                        return (
                          <Link
                            href={notification.link}
                            onClick={handleNotificationClick}
                            className="block cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            {children}
                          </Link>
                        );
                      }

                      return <div>{children}</div>;
                    };

                    return (
                      <div
                        key={notification._id}
                        className={`border rounded-lg overflow-hidden ${
                          notification.read
                            ? "border-gray-200"
                            : "border-lovely"
                        }`}
                      >
                        <NotificationWrapper>
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="relative">
                                  {notification.userId?.imageURL ? (
                                    <div className="relative ">
                                      <div className="rounded-full w-10 h-10 overflow-hidden">
                                        <Image
                                          src={notification.userId.imageURL}
                                          alt={
                                            notification.userId?.firstName ||
                                            "User"
                                          }
                                          width={40}
                                          height={40}
                                          className=""
                                        />
                                      </div>
                                      <div className="absolute -bottom-1 -right-1 bg-lovely rounded-full p-1">
                                        {notification.actionType === "like" && (
                                          <Heart className="h-3 w-3 text-white" />
                                        )}
                                        {notification.actionType ===
                                          "comment" && (
                                          <MessageCircle className="h-3 w-3 text-white" />
                                        )}
                                        {notification.actionType ===
                                          "reply" && (
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
                                        {notification.actionType ===
                                          "comment" && (
                                          <MessageCircle className="h-3 w-3 text-white" />
                                        )}
                                        {notification.actionType ===
                                          "reply" && (
                                          <Reply className="h-3 w-3 text-white" />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-lovely font-medium">
                                    {notification.userId.firstName +
                                      notification.userId.lastName}{" "}
                                    {getNotificationText(notification)}
                                  </p>
                                  {notification.content && (
                                    <p className="text-sm text-lovely/70 mt-1">
                                      &quot;
                                      {notification.content.length > 100
                                        ? notification.content.substring(
                                            0,
                                            100
                                          ) + "..."
                                        : notification.content}
                                      &quot;
                                    </p>
                                  )}
                                  <p className="text-xs text-lovely/60 mt-2">
                                    {formatNotificationDate(
                                      notification.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-lovely flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        </NotificationWrapper>
                      </div>
                    );
                  })
                )}
              </div>
            )}{" "}
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-lovely">
                Recent Orders
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-lovely mx-auto mb-4" />
                <p className="text-lovely">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order._id}
                    className="bg-lovely text-creamey  rounded-lg shadow overflow-hidden"
                  >
                    <div className="border-b  px-4 py-5 text-creamey sm:px-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center text-creamey space-x-3 min-w-0">
                          {getStatusIcon(order.status || "pending")}
                          <h3 className="text-lg font-medium leading-6  truncate">
                            Order : {order._id}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-4 flex-shrink-0">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                              order.status || "pending"
                            )}`}
                          >
                            {order.status
                              ? order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)
                              : "Pending"}
                          </span>
                          <span className="text-sm text-creamey">
                            {new Date(
                              order.createdAt || ""
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-creamey">
                          <span className="font-medium ">Total:</span>{" "}
                          {order.total} LE
                        </div>
                        <Button
                          className="bg-creamey text-lovely hover:bg-everGreen hover:text-creamey duration-300 transition"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setModalStatus(order.status || "pending");
                            setModalPayment(order.payment || "pending");
                            setDetailsModal(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  className="bg-lovely text-creamey rounded-2xl hover:border hover:border-lovely hover:bg-creamey hover:text-lovely"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllOrders(!showAllOrders)}
                >
                  {showAllOrders ? "Hide All" : "See All"}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2 className="text-lg  text-lovely mb-4 font-semibold">
              Wishlist Items
            </h2>
            {wishList.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-lovely mx-auto mb-4" />
                <p className="text-lovely font-semibold">
                  Your wishlist is empty
                </p>
              </div>
            ) : (
              <div className="grid w-full gap-4">
                {wishList.slice(0, 6).map((item, index) => (
                  <div
                    key={index}
                    className="bg-card bg-everGreen text-creamey rounded-lg p-4 md:p-6 shadow-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Product */}
                      <div className="md:col-span-5 flex items-center space-x-4">
                        <div className="relative w-16 h-16 overflow-hidden md:h-20 md:w-20 rounded-md  flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="object-cover "
                          />
                        </div>
                        <div>
                          <h5 className="font-medium line-clamp-1">
                            {item.productName}
                          </h5>
                        </div>
                      </div>

                      <div className="md:col-span-1 hidden md:block text-center">
                        {item.variant.name}
                      </div>
                      <div className="md:col-span-1 hidden md:block text-center">
                        {item.attributes.name}
                      </div>

                      {/* Price */}
                      <div className="md:col-span-1 hidden md:block text-center">
                        LE{item.price.toFixed(2)}
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-4 flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-creamey  hover:text-creamey hover:border hover:border-creamey bg-lovely hover:bg-saga"
                          onClick={() => handleMoveToCart(item)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Move to Cart
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-lovely/90 hover:font-semibold"
                          onClick={() =>
                            handleRemoveFromWishlist(
                              item.productId,
                              item.variant,
                              item.attributes
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Loyality" && (
          <div className="">
            <h2 className="text-lg font-semibold text-lovely mb-4">
              Loyalty Points
            </h2>
            <div className="w-full justify-center items-center">
              {loadingLoyalty ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : loyaltyTransactions.length === 0 ? (
                <div className="text-center py-8 text-lovely">
                  No loyalty transactions found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-lovely/20">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-lovely uppercase">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-lovely uppercase">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-lovely uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-lovely uppercase">
                          Reason
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-lovely uppercase">
                          Bonus
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lovely/10">
                      {loyaltyTransactions.map((tx, idx) => (
                        <tr className="text-lovely" key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {tx.timestamp
                              ? new Date(tx.timestamp).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap capitalize">
                            {tx.type}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {tx.type === "earn"
                              ? `+${tx.amount}`
                              : `-${tx.amount}`}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {tx.reason || "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {tx.bonusID && tx.bonusID?.bonusPoints
                              ? `+${tx.bonusID.bonusPoints}`
                              : `${tx.type === "earn" ? `+${tx.amount}` : "-"}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-lovely">
                Profile Information
              </h2>
              <Button
                className="border border-lovely text-lovely bg-creamey hover:bg-creamey hover:text-lovely hover:cursor-pointer"
                variant="outline"
                size="sm"
                onClick={() => setEditingInfo(!editingInfo)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {editingInfo ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className=" rounded-lg border-2  shadow-xl p-6">
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {userInfo.imageUrl ? (
                      <div className="relative h-20 w-20 rounded-full overflow-hidden group">
                        <Image
                          src={userInfo.imageUrl}
                          alt="Profile"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {editingInfo && (
                          <div
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => setShowUploader(true)}
                          >
                            <Camera className="h-8 w-8 text-creamey" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center relative group">
                        <UserCircle className="h-12 w-12 text-gray-400" />
                        {editingInfo && (
                          <div
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => setShowUploader(true)}
                          >
                            <Camera className="h-8 w-8 text-creamey" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-lovely/80">Profile Picture</p>
                    {editingInfo && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-lovely/80">
                          Click the camera icon to change
                        </p>
                        <button
                          type="button"
                          className="p-1 rounded-full bg-lovely hover:bg-lovely/80 transition"
                          onClick={() => setShowUploader(true)}
                          aria-label="Change profile picture"
                        >
                          <Camera className="h-4 w-4 text-creamey" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Name */}
                <div className="flex gap-2 max-md:flex-col items-center">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-lovely/90 whitespace-nowrap"
                  >
                    User Name :
                  </Label>
                  {editingInfo ? (
                    <Input
                      id="name"
                      value={userInfo.name}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="bg-creamey border-lovely text-lovely"
                    />
                  ) : (
                    <p className=" text-sm text-lovely">{userInfo.name}</p>
                  )}
                </div>

                {/* First Name */}
                <div className="flex  max-md:flex-col items-center gap-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-lovely/90 whitespace-nowrap"
                  >
                    First Name :
                  </Label>
                  {editingInfo ? (
                    <Input
                      id="firstName"
                      value={userInfo.firstName}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="bg-creamey border-lovely text-lovely"
                    />
                  ) : (
                    <p className="text-sm text-lovely">{userInfo.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="flex max-md:flex-col items-center gap-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium whitespace-nowrap text-lovely/90"
                  >
                    Last Name :
                  </Label>
                  {editingInfo ? (
                    <Input
                      id="lastName"
                      value={userInfo.lastName}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="bg-creamey border-lovely text-lovely"
                    />
                  ) : (
                    <p className=" text-sm text-lovely">{userInfo.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="flex max-md:flex-col items-center gap-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-lovely/90 whitespace-nowrap"
                  >
                    Email Address :
                  </Label>
                  {editingInfo ? (
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="bg-creamey border-lovely text-lovely"
                    />
                  ) : (
                    <p className=" text-sm text-lovely">{userInfo.email}</p>
                  )}
                </div>

                {/* Birth Date */}
                <div className="flex max-md:flex-col items-center gap-2">
                  <Label
                    htmlFor="birthDate"
                    className="text-sm font-medium text-lovely/90 whitespace-nowrap"
                  >
                    Birth Date :
                  </Label>
                  {editingInfo ? (
                    <Input
                      id="birthDate"
                      type="date"
                      value={userInfo.birthDate}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          birthDate: e.target.value,
                        }))
                      }
                      className="bg-creamey border-lovely text-lovely"
                    />
                  ) : (
                    <p className="text-sm text-lovely">
                      {userInfo.birthDate
                        ? new Date(userInfo.birthDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  )}
                </div>

                {/* Wedding Date */}
                <div className="flex max-md:flex-col items-center gap-2">
                  <Label
                    htmlFor="weddingDate"
                    className="text-sm font-medium text-lovely/90 whitespace-nowrap"
                  >
                    Wedding Date :
                  </Label>
                  {editingInfo ? (
                    <Input
                      id="weddingDate"
                      type="date"
                      value={userInfo.weddingDate}
                      onChange={(e) =>
                        setUserInfo((prev) => ({
                          ...prev,
                          weddingDate: e.target.value,
                        }))
                      }
                      className="bg-creamey border-lovely text-lovely"
                    />
                  ) : (
                    <p className="text-sm text-lovely">
                      {userInfo.weddingDate
                        ? new Date(userInfo.weddingDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  )}
                </div>

                {/* Subscription Status */}
                <div className="flex max-md:flex-col items-center gap-2">
                  <Label className="text-sm font-medium text-lovely/90">
                    Subscription Status :
                  </Label>
                  <div className=" flex items-center space-x-1">
                    {user.isSubscribed ? (
                      <>
                        <BadgeCheck className="h-4 w-4 text-lovely" />
                        <span className="text-sm text-lovely">
                          Active Subscription
                        </span>
                      </>
                    ) : (
                      <>
                        <BadgeAlert className="h-4 w-4 text-lovely/80" />
                        <span className="text-sm text-lovely/80">
                          No Active Subscription
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {editingInfo && (
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleSaveInfo}
                      className="bg-lovely text-creamey hover:bg-lovely/90"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "partners" && (
          <div>
            {user.isSubscribed ? (
              <PartnersGrid />
            ) : (
              <div className="bg-lovely/10 border border-lovely rounded-lg p-6 text-center text-lovely font-semibold">
                Subscribe to get our partners discounts!
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div>
            {user.isSubscribed ? (
              <FavoritesGrid />
            ) : (
              <div className="bg-lovely/10 border border-lovely rounded-lg p-6 text-center text-lovely font-semibold">
                Subscribe to access your favorites!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Orders Section for "See All" button */}
      {showAllOrders && (
        <div id="orders-section" className="mt-12">
          <h2 className="text-2xl font-bold text-lovely mb-6">All Orders</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-lovely mb-2">
                No orders yet
              </h3>
              <p className="text-gray-500">
                Start shopping to see your order history here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.slice(3, orders.length).map((order) => (
                <div
                  key={order._id}
                  className="bg-lovely text-creamey  rounded-lg shadow overflow-hidden"
                >
                  <div className="border-b  px-4 py-5 text-creamey sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center text-creamey space-x-3 min-w-0">
                        {getStatusIcon(order.status || "pending")}
                        <h3 className="text-lg font-medium leading-6  truncate">
                          Order : {order._id}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            order.status || "pending"
                          )}`}
                        >
                          {order.status
                            ? order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)
                            : "Pending"}
                        </span>
                        <span className="text-sm text-creamey">
                          {new Date(order.createdAt || "").toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-creamey">
                        <span className="font-medium ">Total:</span>{" "}
                        {order.total} LE
                      </div>
                      <Button
                        className="bg-creamey text-lovely hover:bg-everGreen hover:text-creamey duration-300 transition"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setModalStatus(order.status || "pending");
                          setModalPayment(order.payment || "pending");
                          setDetailsModal(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isDetailsModalOpen && selectedOrder && (
        <div
          onClick={() => setDetailsModal(false)}
          className="fixed inset-0 bg-black  bg-opacity-50 flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-creamey scrollbar-hide h-[90vh] overflow-y-scroll rounded-2xl p-6 shadow-lg w-[90%] max-w-3xl text-everGreen"
          >
            <div className="flex mb-2 w-full items-center justify-end">
              <span
                className="hover:cursor-pointer"
                onClick={() => setDetailsModal(false)}
              >
                x
              </span>
            </div>
            <h2 className="text-lg font-bold text-everGreen mb-4">
              ORDER DETAILS
            </h2>
            <div className="text-left space-y-2">
              <p>
                <strong>Order ID:</strong>{" "}
                {selectedOrder.orderID || selectedOrder._id || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrder.email || "N/A"}
              </p>
              <p>
                <strong>Customer:</strong> {selectedOrder.firstName || ""}{" "}
                {selectedOrder.lastName || ""}
              </p>
              <p>
                <strong>Cart:</strong>
              </p>
              <div className="flex flex-col gap-2">
                {selectedOrder.cart?.map((item, index) => (
                  <CartItemSmall key={index} item={item} wishListBool={false} />
                ))}
              </div>
              <p>
                <strong>Phone:</strong> {selectedOrder.phone || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {selectedOrder.address || ""}
                {selectedOrder.address ? "," : ""} {selectedOrder.city || ""}
                {selectedOrder.city ? "," : ""} {selectedOrder.state || ""}
                {selectedOrder.state ? "," : ""} {selectedOrder.country || ""}
              </p>
              <p>
                <strong>Postal Code:</strong> {selectedOrder.postalZip || "N/A"}
              </p>
              {/* Status Dropdown */}
              <label className="block font-semibold mt-4">Status:</label>
              <select
                className="border p-2 bg-creamey w-full"
                value={modalStatus}
                disabled
                onChange={() => {}}
              >
                {[
                  "pending",
                  "confirmed",
                  "shipped",
                  "delivered",
                  "cancelled",
                ].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {/* Payment Dropdown */}
              <label className="block font-semibold mt-4">Payment:</label>
              <select
                className="border bg-creamey p-2 w-full"
                value={modalPayment}
                disabled
                onChange={() => {}}
              >
                {["pending", "failed", "confirmed"].map((payment) => (
                  <option key={payment} value={payment}>
                    {payment}
                  </option>
                ))}
              </select>
              <p>
                <strong>Sub-Total:</strong>{" "}
                {selectedOrder.subTotal !== undefined
                  ? selectedOrder.subTotal.toFixed(2)
                  : "N/A"}{" "}
                LE
              </p>
              {/* <p><strong>Shipping:</strong> {selectedOrder.shipping !== undefined ? selectedOrder.shipping.toFixed(2) : 'N/A'} LE</p> */}
              <p>
                <strong>Total:</strong>{" "}
                {selectedOrder.total !== undefined
                  ? selectedOrder.total.toFixed(2)
                  : "N/A"}{" "}
                LE
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {selectedOrder.createdAt
                  ? new Date(selectedOrder.createdAt).toLocaleString("en-EG", {
                      timeZone: "Africa/Cairo",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal for UploadDropzone */}
      {showUploader && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowUploader(false)}
        >
          <div
            className="bg-creamey p-6 rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Loading Overlay */}
            {isUploading && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity">
                <div className="bg-creamey rounded-2xl shadow-xl flex flex-col items-center px-8 py-8 min-w-[280px] animate-fadeIn">
                  <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-lovely border-b-4 mb-4"></div>
                  <span className="text-lg text-lovely font-bold mb-2">
                    Hang tight!
                  </span>
                  <span className="text-sm text-lovely/80 text-center mb-4">
                    We&apos;re compressing your image for a faster upload.
                  </span>
                  {/* Optional: Cancel button */}
                  {/* <button
                    className="mt-2 text-lovely underline text-xs hover:text-pinkey"
                    onClick={() => setIsUploading(false)}
                  >
                    Cancel
                  </button> */}
                </div>
              </div>
            )}
            <UploadDropzone
              endpoint="mediaUploader"
              onBeforeUploadBegin={handleComperession}
              onClientUploadComplete={(res) => {
                if (res && res[0] && res[0].url) {
                  setUserInfo((prev) => ({ ...prev, imageUrl: res[0].url }));
                  setShowUploader(false);
                }
              }}
              onUploadError={(error) => {
                console.error("Image upload failed:", error);
              }}
              appearance={{
                uploadIcon: "text-lovely",

                allowedContent: "text-lovely/90",
                button:
                  "bg-lovely text-creamey rounded-full px-6 py-2 font-bold hover:bg-lovely/80 transition hover:cursor-pointer",
                container: "flex text-lovely/80 flex-col items-center gap-4",
              }}
              className="w-64"
            />
            <button
              className="mt-4 text-lovely underline text-sm"
              onClick={() => setShowUploader(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AccountPageWithSuspense(props: any) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <AccountPage {...props} />
    </Suspense>
  );
}
