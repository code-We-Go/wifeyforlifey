"use client";

import { useEffect, useState } from "react";
import { X, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { lifeyFont, thirdFont, wifeyFont } from "@/fonts";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const dismissed =
        typeof window !== "undefined" &&
        localStorage.getItem("wb_newsletter_dismissed") === "true";
      const subscribed =
        typeof window !== "undefined" &&
        localStorage.getItem("wb_newsletter_subscribed") === "true";
      if (!dismissed && !subscribed) {
        const t = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const close = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("wb_newsletter_dismissed", "true");
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/newSletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      const duplicate =
        typeof data?.message === "string" &&
        data.message.toLowerCase().includes("duplicate");
      if (res.ok || duplicate) {
        setSuccess(true);
        try {
          localStorage.setItem("wb_newsletter_subscribed", "true");
        } catch {}
      } else {
        setError(data?.message || "Failed to subscribe. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText("WIFEY10");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md mx-4 bg-creamey rounded-lg shadow-xl">
        <button onClick={close} className="absolute top-2 right-2 text-lovely">
          <X size={22} />
        </button>

        <div className="p-6">
          {!success ? (
            <div className="space-y-4">
              <h2 className={`${thirdFont.className} tracking-wide text-2xl pt-4 font-semibold text-lovely text-center`}>
                Join Our Newsletter And Get 10% Off !!
              </h2>
              <div className="relative w-full h-[200px] lg:h-[300px]">
                <Image
                  objectFit="contain"
                  fill
                  alt="discount"
                  src={"/experience/partners1.jpg"}
                ></Image>
              </div>
              <p className="text-lovely/90 text-center">
                Subscribe and instantly get 10% off your next
                order/subscription.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="bg-creamey lowercase border-lovely placeholder:text-lovely/80"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="submit"
                  className="w-full rounded-2xl bg-lovely hover:bg-lovely/90 text-creamey"
                  disabled={loading}
                >
                  {loading ? "Joining..." : "Join Now"}
                </Button>
              </form>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-semibold text-lovely">You’re In!</h2>
              <p className="text-lovely/90">Use this code for 10% off:</p>
              <div className="flex items-center justify-center gap-2">
                <div className="px-4 py-2 rounded-2xl border border-lovely bg-creamey text-lovely font-semibold tracking-wider">
                  WIFEY10
                </div>
                <Button
                  type="button"
                  onClick={copyCode}
                  className="rounded-2xl bg-lovely hover:bg-lovely/90 text-creamey"
                >
                  <Copy className="h-4 w-4 mr-2" /> {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <Button
                onClick={close}
                className="w-full rounded-2xl bg-creamey text-lovely border border-lovely hover:bg-creamey/90"
              >
                Start Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
