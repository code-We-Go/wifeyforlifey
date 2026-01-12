// pages/success.tsx
"use client";
import Fireworks from "./components/Fireworks";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { VideoPlaylist } from "@/app/interfaces/interfaces";
import { useCart } from "@/providers/CartProvider";
import { useSearchParams } from "next/navigation";

function SuccessPage() {
  const { clearCart } = useCart();
  const [subscription, setSubscription] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [sessionOrder, setSessionOrder] = useState<any | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState<VideoPlaylist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );
  const [savingSelection, setSavingSelection] = useState(false);
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

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoadingPlaylists(true);
      setPlaylistsError(null);
      try {
        const res = await fetch("/api/playlists?all=true", {
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok) {
          setPlaylists(data.data || []);
        } else {
          setPlaylistsError(data.error || "Failed to load playlists");
        }
      } catch (e) {
        setPlaylistsError("Failed to load playlists");
      } finally {
        setLoadingPlaylists(false);
      }
    };

    if (isPlaylistModalOpen) {
      fetchPlaylists();
    }
  }, [isPlaylistModalOpen]);

  return (
    <div className="flex h-auto py-5 bg-creamey w-full items-center pt-0 md:pt-4 justify-center  h-autp md:min-h-[calc(100vh-128px)] min-h-[calc(100vh-64px)]  flex-col gap-6 relative overflow-hidden">
      <Fireworks />

      <div className="text-center z-10">
        <div className="relative h-[350px] md:h-[300px] lg:h-[270px] rounded-lg overflow-hidden">
          <Image
            src="/cristmas/hero.png"
            // src="/joinNow/Brid and Bridesmaids.png"
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
              <button
                onClick={() => setIsPlaylistModalOpen(true)}
                className="px-6 py-2 bg-creamey text-lovely border-lovely rounded-lg font-semibold hover:cursor-pointer transition"
              >
                Choose My Playlist
              </button>
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
                <button
                  onClick={() => setIsPlaylistModalOpen(true)}
                  className="px-6 py-2 bg-creamey text-lovely  border-lovely border-2 rounded-lg font-semibold hover:cursor-pointer transition"
                >
                  Choose My Playlist
                </button>
                <Link href="/shop" passHref>
                  <button className="px-6 py-2 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition">
                    Continue Shopping
                  </button>
                </Link>
              </>
            )}
          </div>
        )}
        <Dialog
          open={isPlaylistModalOpen}
          onOpenChange={setIsPlaylistModalOpen}
        >
          <DialogContent className="bg-creamey text-lovely max-h-[90vh] overflow-y-scroll sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Choose Your Playlist</DialogTitle>
              <p>
                Note : you have to choose only one playlist , if you clicked
                confirm there&apos;s no way to choose another one , you can let
                the choosing for later in your account.
              </p>
            </DialogHeader>
            {loadingPlaylists ? (
              <div className="py-6 text-center">Loading playlists...</div>
            ) : playlistsError ? (
              <div className="py-6 text-center text-red-500">
                {playlistsError}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                {playlists.map((p) => (
                  <div
                    key={p._id as string}
                    onClick={() => setSelectedPlaylistId(p._id as string)}
                    className={`cursor-pointer border rounded-lg overflow-hidden ${
                      selectedPlaylistId === p._id
                        ? "border-pinkey border-8"
                        : "border-lovely"
                    }`}
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={p.thumbnailUrl}
                        alt={p.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium line-clamp-1">{p.title}</h3>
                        <span className="text-xs">
                          {p.videos?.length || 0}{" "}
                          {(p.videos?.length || 0) === 1 ? "video" : "videos"}
                        </span>
                      </div>
                      <p className="text-sm text-lovely/80 mt-1 line-clamp-2">
                        {Array.isArray(p.description)
                          ? p.description.join(" ")
                          : (p as any).description}
                      </p>
                    </div>
                  </div>
                ))}
                {playlists.length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    No playlists found.
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <button
                className="px-6 py-2 border-2 border-lovely text-lovely rounded-2xl font-semibold"
                onClick={() => setIsPlaylistModalOpen(false)}
              >
                Cancel
              </button>
              <button
                disabled={!selectedPlaylistId || savingSelection}
                className="px-6 py-2 bg-lovely text-creamey rounded-lg font-semibold disabled:opacity-50"
                onClick={async () => {
                  if (!selectedPlaylistId || savingSelection) return;
                  setSavingSelection(true);
                  try {
                    const res = await fetch("/api/subscriptions/allowed-playlists", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ playlistId: selectedPlaylistId }),
                    });
                    if (res.ok) {
                      setIsPlaylistModalOpen(false);
                      router.push(`/playlists/${selectedPlaylistId}`);
                    }
                  } finally {
                    setSavingSelection(false);
                  }
                }}
              >
                {savingSelection ? "Saving..." : "Confirm"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
