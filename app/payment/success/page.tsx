// pages/success.tsx
"use client";
import Fireworks from "./components/Fireworks";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/providers/CartProvider";
import { useSearchParams } from "next/navigation";

function SuccessPage() {
  const { clearCart } = useCart();
  const [subscription, setSubscription] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [sessionOrder, setSessionOrder] = useState<any | null>(null);
  const searchParams = useSearchParams();
  useEffect(() => {
    const subscription = searchParams.get("subscription");
    const account = searchParams.get("account");
    const partnerSession = searchParams.get("session");
    const orderId = searchParams.get("orderId");
    if (subscription) {
      setSubscription(subscription);
    }
    if (account) {
      setAccount(account);
    }
    if (partnerSession && orderId) {
      fetch(`/api/partner-sessions/order?orderId=${orderId}`)
        .then((r) => r.json())
        .then((d) => setSessionOrder(d.order))
        .catch(() => setSessionOrder(null));
    }

    clearCart();
  }, []);

  return (
    <div className="flex h-auto py-5 bg-creamey w-full items-center pt-0 md:pt-4 justify-center  h-autp md:min-h-[calc(100vh-128px)] min-h-[calc(100vh-64px)]  flex-col gap-6 relative overflow-hidden">
      <Fireworks />

      <div className="text-center z-10">
        <div className="relative h-[350px] md:h-[300px] lg:h-[270px] rounded-lg overflow-hidden">
          <Image
            src="/joinNow/Brid and Bridesmaids.png"
            alt="Hero Image"
            fill
            priority
            className="object-contain aspect-auto rounded-lg"
          />
        </div>

        {/* <h1 className="text-5xl font-bold text-green-600">🎉 Success!</h1> */}
        {subscription ? (
          <div className="text-lovely">
            {" "}
            <h1 className="mt-2 text-lg sm:text-xl md:text-2xl font-bold text-lovely">
              🎉 Your Subscription was created successfully. 🎉
            </h1>
            {!account &&
              (subscription !== "mini" ? (
                <p>
                  Your subscription was created successfully, now create your
                  account to enjoy our exclusive educational channel and
                  partnerships
                </p>
              ) : (
                <p>
                  Your subscription was created successfully, Book your session
                  now.
                </p>
              ))}
            <p>Look out for an email from your bestie 👯‍♀️.</p>
          </div>
        ) : sessionOrder ? (
          <div className="text-lovely">
            <h1 className="mt-2 text-lg sm:text-xl md:text-2xl font-bold text-lovely">
              🎉 Your Session is Confirmed. 🎉
            </h1>
            <p className="mt-2">Partner: {sessionOrder.partnerName}</p>
            <p className="mt-1">Session: {sessionOrder.sessionTitle}</p>
            <div className="mt-4 p-4 border border-lovely rounded-2xl bg-creamey">
              <p className="font-semibold">
                click the link below to arrange your appointment:
              </p>
              <a
                href={`https://wa.me/${String(
                  sessionOrder.whatsappNumber
                ).replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-lovely underline"
              >
                Whatsapp link
              </a>
              {/* <p className=" text-lovely/80">
                you will be able to arrange the appointment time with{" "}
                {sessionOrder.partnerName}
              </p> */}
            </div>
          </div>
        ) : (
          <h1 className="mt-2 text-lg sm:text-xl md:text-2xl font-bold text-lovely">
            🎉 Your Order was created successfully. 🎉
          </h1>
        )}
        {account && subscription && (
          <div className="mt-6 flex gap-4 justify-center">
            <Link href="/account" passHref>
              <button className="px-6 border-2 border-lovely py-2   text-lovely rounded-2xl font-semibold  transition">
                Go to Account
              </button>
            </Link>
            {subscription !== "mini" && (
              <Link href="/playlists" passHref>
                <button className="px-6 py-2 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition">
                  Go to Playlists
                </button>
              </Link>
            )}
            {subscription === "mini" && (
              <Link href="/booking" passHref>
                <button className="px-6 py-2 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition">
                  Book My Session
                </button>
              </Link>
            )}
          </div>
        )}

        {!subscription && (
          <div className="mt-6 flex gap-4 justify-center">
            <Link href="/" passHref>
              <button className="px-6 border-2 border-lovely py-2   text-lovely rounded-2xl font-semibold  transition">
                Go to Home
              </button>
            </Link>
            <Link href="/shop" passHref>
              <button className="px-6 py-2 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition">
                Continue Shopping
              </button>
            </Link>
          </div>
        )}
        {!account && subscription && (
          <div className="mt-6 flex gap-4 justify-center">
            {/* <Link href="/register" passHref>
            <button className="px-6 border-2 border-lovely py-2   text-lovely rounded-2xl font-semibold  transition">
              Register Now
            </button>
          </Link> */}
            {subscription !== "mini" && (
              <Link href="/register" passHref>
                <button className="px-6 py-2 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition">
                  Register Now
                </button>
              </Link>
            )}
            {subscription === "mini" && (
              <>
                <Link href="/booking" passHref>
                  <button className="px-6 border-2 border-lovely py-2 text-lovely rounded-2xl font-semibold transition">
                    Book My Session
                  </button>
                </Link>
                <Link href="/shop" passHref>
                  <button className="px-6 py-2 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition">
                    Continue Shopping
                  </button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default function SuccessPageInSusspense() {
  return (
    <Suspense
      fallback={<div className="w-full h-[calc(100vh-128)]"> ...Loading</div>}
    >
      <SuccessPage />
    </Suspense>
  );
}
