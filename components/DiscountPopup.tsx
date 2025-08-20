"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { thirdFont } from "@/fonts";
import { Check } from "lucide-react";

const DiscountPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Show popup after 10 seconds
    const timer = setTimeout(() => {
      // Check if user has already seen the popup (stored in localStorage)
      const hasSeenPopup = localStorage.getItem("hasSeenDiscountPopup");
      if (!hasSeenPopup) {
        setIsOpen(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark that user has seen the popup
    localStorage.setItem("hasSeenDiscountPopup", "true");
    // Reset subscription state when closing
    setIsSubscribed(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/newSletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        setEmail("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to subscribe. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-creamey border-lovely">
        {!isSubscribed ? (
          <>
            <DialogHeader>
              <DialogTitle
                className={`${thirdFont.className} text-2xl text-lovely text-center`}
              >
                Get 10% Off Your First Order!
              </DialogTitle>
              <DialogDescription className="text-center text-lovely/90">
                Join our newsletter and receive a 10% discount code instantly.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="relative overflow-hidden rounded-lg">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-pinkey/30 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pinkey/30 rounded-full"></div>
                <div className="relative z-10 p-6 flex flex-col items-center">
                  <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      className="rounded-full bg-creamey border-lovely placeholder:text-lovely/70"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full bg-lovely hover:bg-everGreen text-creamey rounded-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Joining..." : "Get My Discount"}
                    </Button>
                  </form>
                  <button
                    onClick={handleClose}
                    className="mt-4 text-lovely/70 text-sm hover:text-lovely"
                  >
                    No thanks, I&apos;ll pay full price
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle
                className={`${thirdFont.className} text-2xl text-lovely text-center`}
              >
                Thank You for Subscribing!
              </DialogTitle>
              <DialogDescription className="text-center text-lovely/90">
                Your discount code is ready to use
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="relative overflow-hidden rounded-lg">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-pinkey/30 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pinkey/30 rounded-full"></div>
                <div className="relative z-10 p-6 flex flex-col items-center">
                  <div className="bg-everGreen/20 rounded-full p-3 mb-4">
                    <Check className="h-8 w-8 text-everGreen" />
                  </div>
                  <div className="text-lovely font-bold text-5xl mb-2">
                    WIFEY10
                  </div>
                  <p className="text-lovely/80 text-sm mb-6">
                    Use this code at checkout for 10% off your first order
                  </p>
                  <Button
                    onClick={handleClose}
                    className="w-full bg-lovely hover:bg-everGreen text-creamey rounded-full"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DiscountPopup;
