"use client";
import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { thirdFont } from "@/fonts";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/auth/forgot-password", { email });
      setMessage(res.data.message || "Check your email for a reset link.");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Error sending reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-patternPinkey ">
      <div className="md:min-h-[calc(100vh-128px)] md:h-auto h-[calc(100vh-64px)]  flex items-center justify-center bg-black/30 backdrop-blur-[3px] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md max-h-[90vh] rounded-2xl bg-creamey shadow-2xl w-full py-8 px-6 space-y-8">
          <h2
            className={`${thirdFont.className} tracking-normal font-bold mb-6 text-lovely`}
          >
            Forgot Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              className="bg-creamey border-lovely/90 border placeholder:text-lovely/80"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="bg-lovely text-creamey w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          {message && <p className="mt-4 text-lovely">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
