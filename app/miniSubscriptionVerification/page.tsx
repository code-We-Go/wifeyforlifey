"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { VideoPlaylist } from "@/app/interfaces/interfaces";

function MiniSubscriptionVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for gift verification
  const [isGift, setIsGift] = useState<boolean | null>(null);
  const [giftSenderEmail, setGiftSenderEmail] = useState("");
  const [giftRecipientEmail, setGiftRecipientEmail] = useState("");
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [isEditingRecipient, setIsEditingRecipient] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  
  // State for purchase email verification (non-gift)
  const [purchaseEmail, setPurchaseEmail] = useState("");
  const [isPurchaseVerified, setIsPurchaseVerified] = useState(false);
  
  // State for playlist selection
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState<VideoPlaylist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [savingSelection, setSavingSelection] = useState(false);

  // Get subscription ID from URL params
  const subscriptionId = searchParams.get("subscriptionId");

  useEffect(() => {
    if (subscriptionId) {
      // Fetch subscription data to pre-fill recipient email if it's a gift
      fetchSubscriptionData();
    }
  }, [subscriptionId]);

  const fetchSubscriptionData = async () => {
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptionData(data);
        if (data.isGift) {
          setIsGift(true);
          setGiftRecipientEmail(data.giftRecipientEmail || "");
        }
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    }
  };

  const handleGiftVerification = async () => {
    if (!giftSenderEmail) {
      setVerificationError("Please enter the gift sender's email (purchaser's email)");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      // Verify the gift sender email (purchaser's email) matches the subscription
      const res = await fetch(`/api/subscriptions/verify-gift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftSenderEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Verification successful, proceed to recipient confirmation
        setGiftRecipientEmail(data.giftRecipientEmail || "");
        setSubscriptionData(data.subscription);
        setIsGift(true);
      } else {
        setVerificationError(data.error || "Verification failed. Please check the email.");
      }
    } catch (error) {
      setVerificationError("An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRecipientUpdate = async () => {
    if (!giftRecipientEmail || !newRecipientEmail) {
      setVerificationError("Please enter both old and new recipient emails");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const res = await fetch(`/api/subscriptions/update-recipient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldRecipientEmail: giftRecipientEmail,
          newRecipientEmail: newRecipientEmail,
        }),
      });

      if (res.ok) {
        setIsEditingRecipient(false);
        setGiftRecipientEmail(newRecipientEmail);
        setSubscriptionData((prev: any) => ({
          ...prev,
          giftRecipientEmail: newRecipientEmail
        }));
        // Proceed to playlist selection
        setIsPlaylistModalOpen(true);
      } else {
        const data = await res.json();
        setVerificationError(data.error || "Failed to update recipient email");
      }
    } catch (error) {
      setVerificationError("An error occurred while updating");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePurchaseVerification = async () => {
    if (!purchaseEmail) {
      setVerificationError("Please enter your purchase email");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const res = await fetch(`/api/subscriptions/verify-purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsPurchaseVerified(true);
        setSubscriptionData(data.subscription);
        // Proceed to playlist selection
        setIsPlaylistModalOpen(true);
      } else {
        setVerificationError(data.error || "Verification failed. Please check the email.");
      }
    } catch (error) {
      setVerificationError("An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProceedToPlaylist = async () => {
    // Update the subscription with the confirmed recipient email
    setIsVerifying(true);
    setVerificationError("");

    try {
      const res = await fetch(`/api/subscriptions/update-recipient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldRecipientEmail: giftRecipientEmail,
          newRecipientEmail: giftRecipientEmail, // Same email, just confirming
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubscriptionData((prev: any) => ({
          ...prev,
          email: data.email,
          giftRecipientEmail: data.giftRecipientEmail
        }));
        setIsPlaylistModalOpen(true);
      } else {
        const data = await res.json();
        setVerificationError(data.error || "Failed to confirm recipient email");
      }
    } catch (error) {
      setVerificationError("An error occurred while confirming");
    } finally {
      setIsVerifying(false);
    }
  };

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

  const handlePlaylistConfirm = async () => {
    if (!selectedPlaylistId || savingSelection) return;
    setSavingSelection(true);
    console.log("Subscription Data:", subscriptionData);
    console.log("Subscription ID:", subscriptionData?._id);
    try {
      const res = await fetch("/api/subscriptions/allowed-playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          playlistId: selectedPlaylistId,
          subscriptionId: subscriptionData?._id 
        }),
      });
      if (res.ok) {
        setIsPlaylistModalOpen(false);
        router.push(`/playlists/${selectedPlaylistId}`);
      }
    } finally {
      setSavingSelection(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-creamey flex md:items-start md:py-16 justify-center items-center px-4 py-8">
      <div className="max-w-2xl w-full rounded-2xl shadow-lg p-4 text-lovely">
        <div className="text-center mb-2 md:mb-4">
          <div className="relative h-[200px] mb-2 md:mb-4 rounded-lg overflow-hidden">
            <Image
              src="/cristmas/hero.png"
              alt="Mini Experience"
              fill
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-lovely ">
           ✨ Welcome home, Wifey! ✨
          </h1>
          <p className="text-lovely/80">
            We’re so excited you’re here, my beautiful bride 💖 
            <br />
Let’s verify your experience and choose your playlist! your bridal era officially starts now.          </p>
        </div>

        {/* Step 1: Check if it's a gift */}
        {isGift === null && (
          <div className="space-y-2 md:space-y-4 text-center">
            <h2 className="text-xl font-semibold">Is this subscription a gift?</h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setIsGift(true)}
                className="px-8 py-3 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition"
              >
               🎁 I received this as a gift
              </button>
              <button
                onClick={() => setIsGift(false)}
                className="px-8 py-3 border-2 border-lovely text-lovely rounded-lg font-semibold hover:bg-lovely/10 transition"
              >
                💖 I bought this for myself
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Gift sender verification */}
        {isGift === true && !giftRecipientEmail && (
          <div className="space-y-1 md:space-y-2 text-center">
            <h2 className="text-xl font-semibold">Verify Gift Sender Email</h2>
            <p className="text-lovely/80">
              Please enter the email used to purchase this gift
            </p>
            <div className="space-y-1 md:space-y-2">
              <input
                type="email"
                value={giftSenderEmail}
                onChange={(e) => setGiftSenderEmail(e.target.value)}
                placeholder="Gift sender's email (purchaser's email)"
                className="w-full bg-creamey placeholder:text-lovely/50 px-4 py-3 border-2 border-lovely/30 rounded-lg focus:outline-none focus:border-lovely"
              />
              {verificationError && (
                <p className="text-red-500 text-sm">{verificationError}</p>
              )}
              <button
                onClick={handleGiftVerification}
                disabled={isVerifying}
                className="w-full px-6 py-3 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition disabled:opacity-50"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2b: Purchase email verification (non-gift) */}
        {isGift === false && !isPurchaseVerified && (
          <div className=" text-center">
            <h2 className="text-xl font-semibold">Verify Your Purchase</h2>
            <p className="text-lovely/80">
              Please enter the email address you used to purchase this subscription
            </p>
            <div className="space-y-1 md:space-y-2">
              <input
                type="email"
                value={purchaseEmail}
                onChange={(e) => setPurchaseEmail(e.target.value)}
                placeholder="Your purchase email"
                className="w-full bg-creamey placeholder:text-lovely/50 px-4 py-3 border-2 border-lovely/30 rounded-lg focus:outline-none focus:border-lovely"
              />
              {verificationError && (
                <p className="text-red-500 text-sm">{verificationError}</p>
              )}
              <button
                onClick={handlePurchaseVerification}
                disabled={isVerifying}
                className="w-full px-6 py-3 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition disabled:opacity-50"
              >
                {isVerifying ? "Verifying..." : "Verify & Choose Playlist"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Recipient confirmation/edit */}
        {isGift === true && giftRecipientEmail && !isPlaylistModalOpen && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Confirm Recipient Email</h2>
            <p className="text-lovely/80">
              This subscription will be applied to the following email:
            </p>
            {!isEditingRecipient ? (
              <div className="space-y-4">
                <div className="p-4 bg-lovely/10 rounded-lg">
                  <p className="font-semibold text-lg">{giftRecipientEmail}</p>
                </div>
                {verificationError && (
                  <p className="text-red-500 text-sm">{verificationError}</p>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={handleProceedToPlaylist}
                    disabled={isVerifying}
                    className="flex-1 px-6 py-3 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition disabled:opacity-50"
                  >
                    {isVerifying ? "Confirming..." : "Confirm & Continue"}
                  </button>
                  <button
                    onClick={() => setIsEditingRecipient(true)}
                    disabled={isVerifying}
                    className="flex-1 px-6 py-3 border-2 border-lovely text-lovely rounded-lg font-semibold hover:bg-lovely/10 transition disabled:opacity-50"
                  >
                    Change Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Recipient Email
                  </label>
                  <input
                    type="email"
                    value={giftRecipientEmail}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-lovely/30 rounded-lg bg-lovely/5 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Recipient Email
                  </label>
                  <input
                    type="email"
                    value={newRecipientEmail}
                    onChange={(e) => setNewRecipientEmail(e.target.value)}
                    placeholder="Enter new recipient email"
                    className="w-full px-4 py-3 border-2 border-lovely/30 rounded-lg focus:outline-none focus:border-lovely"
                  />
                </div>
                {verificationError && (
                  <p className="text-red-500 text-sm">{verificationError}</p>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={handleRecipientUpdate}
                    disabled={isVerifying}
                    className="flex-1 px-6 py-3 bg-lovely text-creamey rounded-lg font-semibold hover:bg-lovely/90 transition disabled:opacity-50"
                  >
                    {isVerifying ? "Updating..." : "Update & Continue"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingRecipient(false);
                      setNewRecipientEmail("");
                      setVerificationError("");
                    }}
                    className="flex-1 px-6 py-3 border-2 border-lovely text-lovely rounded-lg font-semibold hover:bg-lovely/10 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Playlist Selection Modal */}
        <Dialog open={isPlaylistModalOpen} onOpenChange={setIsPlaylistModalOpen}>
          <DialogContent className="bg-creamey text-lovely max-h-[90vh] overflow-y-scroll sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Choose Your Playlist</DialogTitle>
              <p>
                Note: you have to choose only one playlist. If you click confirm
                there's no way to choose another one.
                <br />
                It expires after 6 months from activation.
              </p>
            </DialogHeader>
            {loadingPlaylists ? (
              <div className="py-6 text-center">Loading playlists...</div>
            ) : playlistsError ? (
              <div className="py-6 text-center text-red-500">
                {playlistsError}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                onClick={handlePlaylistConfirm}
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

export default function MiniSubscriptionVerification() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-creamey flex justify-center items-center">
          <p className="text-lovely text-xl">Loading...</p>
        </div>
      }
    >
      <MiniSubscriptionVerificationContent />
    </Suspense>
  );
}