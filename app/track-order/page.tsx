"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { IOrder, ISubscription } from "@/app/interfaces/interfaces";

type TrackingItem = IOrder | ISubscription;

// Type guard to check if item is an order
const isOrder = (item: TrackingItem): item is IOrder => {
  return (item as IOrder).cart !== undefined;
};

// Type guard to check if item is a subscription
const isSubscription = (item: TrackingItem): item is ISubscription => {
  return (item as ISubscription).packageID !== undefined;
};

function TrackOrderPage() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");
  const subscriptionIdFromUrl = searchParams.get("subscriptionId");
  const emailFromUrl = searchParams.get("email");

  const [trackingId, setTrackingId] = useState(
    orderIdFromUrl || subscriptionIdFromUrl || ""
  );
  const [email, setEmail] = useState(emailFromUrl || "");
  const [trackingType, setTrackingType] = useState<"order" | "subscription">(
    subscriptionIdFromUrl ? "subscription" : "order"
  );
  const [trackingStatus, setTrackingStatus] = useState<TrackingItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch status when component mounts if ID or email is in URL
  useEffect(() => {
    if (orderIdFromUrl) {
      fetchOrderStatus(orderIdFromUrl);
    } else if (subscriptionIdFromUrl) {
      fetchSubscriptionStatus(subscriptionIdFromUrl);
    } else if (emailFromUrl) {
      fetchSubscriptionByEmail(emailFromUrl);
    }
  }, [orderIdFromUrl, subscriptionIdFromUrl, emailFromUrl]);

  const fetchOrderStatus = async (id: string) => {
    if (!id.trim()) {
      setError("Please enter an order ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/orders/track?orderId=${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order status");
      }

      setTrackingStatus(data);
      setTrackingType("order");
    } catch (err: any) {
      setError(
        err.message || "An error occurred while fetching the order status"
      );
      setTrackingStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async (id: string) => {
    if (!id.trim()) {
      setError("Please enter a subscription ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/subscriptions/track?subscriptionId=${id}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch subscription status");
      }

      setTrackingStatus(data);
      setTrackingType("subscription");
    } catch (err: any) {
      setError(
        err.message ||
          "An error occurred while fetching the subscription status"
      );
      setTrackingStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionByEmail = async (emailAddress: string) => {
    if (!emailAddress.trim()) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/subscriptions/track?email=${encodeURIComponent(emailAddress)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch subscription status");
      }

      setTrackingStatus(data);
      setTrackingType("subscription");
    } catch (err: any) {
      setError(
        err.message ||
          "An error occurred while fetching the subscription status"
      );
      setTrackingStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingType === "order") {
      fetchOrderStatus(trackingId);
    } else if (email) {
      fetchSubscriptionByEmail(email);
    } else {
      fetchSubscriptionStatus(trackingId);
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case "processing":
  //     case "pending":
  //       return "text-yellow-600";
  //     case "shipped":
  //     case "confirmed":
  //       return "text-blue-600";
  //     case "delivered":
  //       return "text-green-600";
  //     case "cancelled":
  //     case "returned":
  //       return "text-red-600";
  //     default:
  //       return "text-creamey";
  //   }
  // };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-lovely mb-8 text-center">
        Track Your {trackingType === "order" ? "Order" : "Planner"}
      </h1>

      <div className="max-w-2xl mx-auto bg-creamey rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-center mb-4">
          <div className="flex rounded-md overflow-hidden">
            <button
              onClick={() => setTrackingType("order")}
              className={`px-4 py-2 ${
                trackingType === "order"
                  ? "bg-lovely text-creamey"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Track Order
            </button>
            <button
              onClick={() => setTrackingType("subscription")}
              className={`px-4 py-2 ${
                trackingType === "subscription"
                  ? "bg-lovely text-creamey"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Track Planner
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-6">
          {trackingType === "order" ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Enter your order ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="flex-grow bg-creamey border-pinkey"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Enter your subscription ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-grow bg-creamey border-pinkey"
                />
              </div>
              <div className="flex items-center">
                <hr className="flex-grow border-lovely/90" />
                <span className="px-4 text-lovely/90">OR</span>
                <hr className="flex-grow border-lovely/90" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-creamey border-pinkey"
                />
              </div>
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="bg-lovely text-creamey hover:bg-lovely/90 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4  animate-spin" />
                Searching...
              </>
            ) : trackingType === "order" ? (
              "Track Order"
            ) : (
              "Track Planner"
            )}
          </Button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {trackingStatus && trackingType === "order" && (
          <div className="border bg-lovely text-creamey rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isOrder(trackingStatus)
                ? `Order #${trackingStatus.orderID || trackingStatus._id}`
                : `Planner #${trackingStatus.shipmentID || trackingStatus._id}`}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex gap-2">
                <p className="text-creamey mb-1">Order Date:</p>
                <p className="font-medium">
                  {trackingStatus.createdAt
                    ? new Date(trackingStatus.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="flex gap-2">
                <p className="text-creamey mb-1">Shipping Status:</p>
                <p
                  className={`font-medium 

                  `}
                >
                  {trackingStatus.status || "Pending"}
                </p>
              </div>
              {trackingStatus.shipmentID && (
                <div>
                  <p className="text-creamey mb-1">Tracking Number:</p>
                  <p className="font-medium">{trackingStatus.shipmentID}</p>
                </div>
              )}
              {/* {trackingStatus.status && (
                <div>
                  <p className="text-creamey mb-1">Estimated Delivery:</p>
                  <p className="font-medium">{trackingStatus.status}</p>
                </div>
              )} */}
              <div className="flex gap-2">
                <p className="text-creamey mb-1">Total Amount:</p>
                <p className="font-medium">
                  EGP {trackingStatus.total?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Shipping Address:</h3>
              <p>{trackingStatus.address || "N/A"}</p>
              <p>
                {trackingStatus.city || "N/A"},{" "}
                {trackingStatus.country || "N/A"}
              </p>
              {trackingStatus.postalZip && (
                <p>Postal Code: {trackingStatus.postalZip}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                {trackingType === "order" ? "Order Items:" : "Planner Details:"}
              </h3>
              <ul className="divide-y">
                {trackingStatus &&
                isOrder(trackingStatus) &&
                trackingStatus.cart &&
                trackingStatus.cart.length > 0 ? (
                  trackingStatus.cart.map((item, index) => (
                    <li key={index} className="py-2">
                      {item.productName} x {item.quantity} - EGP{" "}
                      {item.price.toFixed(2)}
                    </li>
                  ))
                ) : trackingStatus && isSubscription(trackingStatus) ? (
                  <li className="py-2">
                    <div className="flex flex-col gap-1">
                      <p>Wifey Planner</p>
                      {trackingStatus.packageID && (
                        <p className="text-sm">
                          Package ID: {trackingStatus.packageID}
                        </p>
                      )}
                      {trackingStatus.subscribed && (
                        <p className="text-sm">
                          Subscription Active:{" "}
                          {trackingStatus.subscribed ? "Yes" : "No"}
                        </p>
                      )}
                    </div>
                  </li>
                ) : (
                  <li className="py-2">No items found</li>
                )}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-creamey">
                Need help with your order?{" "}
                <Link href="/contact" className=" hover:underline">
                  Contact us
                </Link>
              </p>
            </div>
          </div>
        )}

        {trackingStatus && trackingType === "subscription" && (
          <div className="border bg-lovely text-creamey rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Planner #
              {isSubscription(trackingStatus)
                ? trackingStatus.shipmentID || trackingStatus._id
                : trackingStatus._id}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-creamey mb-1">Subscription Date:</p>
                <p className="font-medium">
                  {trackingStatus.createdAt
                    ? new Date(trackingStatus.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-creamey mb-1">Shipping Status:</p>
                <p className={`font-medium `}>
                  {trackingStatus.status || "Pending"}
                </p>
              </div>
              {trackingStatus.email && (
                <div>
                  <p className="text-creamey mb-1">Email:</p>
                  <p className="font-medium">{trackingStatus.email}</p>
                </div>
              )}
              <div className="flex gap-2">
                <p className="text-creamey mb-1">Total Amount:</p>
                <p className="font-medium">
                  EGP {trackingStatus.total?.toFixed(2) || "0.00"}
                </p>
              </div>
              {trackingStatus.shipmentID && (
                <div>
                  <p className="text-creamey mb-1">Shipment ID:</p>
                  <p className="font-medium">{trackingStatus.shipmentID}</p>
                </div>
              )}
              {/* {trackingStatus.packageID && (
                <div>
                  <p className="text-creamey mb-1">Package ID:</p>
                  <p className="font-medium">{trackingStatus.packageID}</p>
                </div>
              )} */}
            </div>

            {trackingStatus.address && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Shipping Address:</h3>
                <p>{trackingStatus.address || "N/A"}</p>
                <p>
                  {trackingStatus.city || "N/A"},{" "}
                  {trackingStatus.country || "N/A"}
                </p>
                {trackingStatus.postalZip && (
                  <p>Postal Code: {trackingStatus.postalZip}</p>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-creamey">
                Need help with your planner?{" "}
                <Link href="/contact" className=" hover:underline">
                  Contact us
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackingPageWrapper() {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <TrackOrderPage />
    </Suspense>
  );
}
