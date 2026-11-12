"use client";
import { thirdFont } from "@/fonts";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { headerStyle } from "@/app/styles/style";
import { useTranslations } from "next-intl";

const Newsletters = () => {
  const t = useTranslations("home.newsletter");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
          email: email, // Using email as number since the model expects a number field
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t("successTitle"),
          description: t("successDesc"),
          variant: "added",
        });
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
    <section className="bg-pinkey/80 py-16">
      <div className="container-custom text-center">
        <h2
          className={`${thirdFont.className} ${headerStyle} text-lovely mb-4`}
        >
          {t("title")}
        </h2>
        <p className="text-lovely/90 mb-8">
          {t("subtitle")}
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
        >
          <Input
            type="email"
            placeholder={t("placeholder")}
            className="rounded-full lowercase bg-creamey border-lovely placeholder:text-lovely/90 flex-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="hover:bg-everGreen bg-lovely text-creamey rounded-full"
            disabled={isLoading}
          >
            {isLoading ? t("joining") : t("button")}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Newsletters;

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`px-4 py-2 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
}
