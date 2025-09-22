"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { IOrder } from "@/app/interfaces/interfaces";

// Using IOrder interface from interfaces.ts

function SearchParamsWrapper() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId");
  return orderIdFromUrl || null;
}

export default function TrackOrderPage() {
  const [orderIdFromUrl, setOrderIdFromUrl] = useState<string | null>(null);

  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get orderId from URL using Suspense
  useEffect(() => {
    const getOrderIdFromUrl = () => {
      const urlOrderId = document
        .querySelector("[data-orderid]")
        ?.getAttribute("data-orderid");
      if (urlOrderId) {
        setOrderIdFromUrl(urlOrderId);
        setOrderId(urlOrderId);
        fetchOrderStatus(urlOrderId); // Automatically track when orderId is found
      }
    };
    getOrderIdFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The automatic tracking is now handled in the first useEffect

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

      setOrderStatus(data);
    } catch (err: any) {
      setError(
        err.message || "An error occurred while fetching the order status"
      );
      setOrderStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderStatus(orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "text-yellow-600";
      case "shipped":
        return "text-blue-600";
      case "delivered":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-creamey";
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Suspense fallback={<div data-orderid=""></div>}>
        <div className="hidden">
          <SearchParamsWrapper />
        </div>
        <div data-orderid={SearchParamsWrapper()}></div>
      </Suspense>
      <h1 className="text-3xl font-bold text-lovely mb-8 text-center">
        Track Your Order
      </h1>

      <div className="max-w-2xl mx-auto bg-creamey rounded-lg shadow-md p-6 mb-8">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <Input
            type="text"
            placeholder="Enter your order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-grow"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-lovely text-creamey hover:bg-lovely/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4  animate-spin" />
                Searching...
              </>
            ) : (
              "Track Order"
            )}
          </Button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {orderStatus && (
          <div className="border bg-lovely text-creamey rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Order #{orderStatus.orderID || orderStatus._id}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-creamey mb-1">Order Date:</p>
                <p className="font-medium">
                  {orderStatus.createdAt
                    ? new Date(orderStatus.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-creamey mb-1">Status:</p>
                <p
                  className={`font-medium ${getStatusColor(
                    orderStatus.status || "pending"
                  )}`}
                >
                  {orderStatus.status || "Pending"}
                </p>
              </div>
              {orderStatus.shipmentID && (
                <div>
                  <p className="text-creamey mb-1">Tracking Number:</p>
                  <p className="font-medium">{orderStatus.shipmentID}</p>
                </div>
              )}
              {/* {orderStatus.status && (
                <div>
                  <p className="text-creamey mb-1">Estimated Delivery:</p>
                  <p className="font-medium">{orderStatus.status}</p>
                </div>
              )} */}
              <div>
                <p className="text-creamey mb-1">Total Amount:</p>
                <p className="font-medium">
                  EGP {orderStatus.total?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Shipping Address:</h3>
              <p>{orderStatus.address || "N/A"}</p>
              <p>
                {orderStatus.city || "N/A"}, {orderStatus.country || "N/A"}
              </p>
              {orderStatus.postalZip && (
                <p>Postal Code: {orderStatus.postalZip}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Order Items:</h3>
              <ul className="divide-y">
                {orderStatus.cart && orderStatus.cart.length > 0 ? (
                  orderStatus.cart.map((item, index) => (
                    <li key={index} className="py-2">
                      {item.productName} x {item.quantity} - EGP{" "}
                      {item.price.toFixed(2)}
                    </li>
                  ))
                ) : (
                  <li className="py-2">No items available</li>
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
      </div>
    </div>
  );
}
