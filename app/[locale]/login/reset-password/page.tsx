"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { thirdFont } from "@/fonts";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!token) return setMessage("Invalid or missing token.");
    axios
      .get(`/api/auth/reset-password?token=${token}`)
      .then((res) => {
        setValid(res.data.success);
      })
      .catch(() => {
        setMessage("Token invalid or expired.");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/auth/reset-password", {
        token,
        password,
      });
      setMessage(res.data.message || "Password reset successful.");
      if (res.data.success) {
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  if (!valid) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-lovely">
        <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
        <p>{message || "Token invalid or expired."}</p>
      </div>
    );
  }

  return (
    <div className=" bg-patternPinkey ">
      <div className="md:min-h-[calc(100vh-128px)] md:h-auto h-[calc(100vh-64px)]  flex items-center justify-center bg-black/30 backdrop-blur-[3px] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md max-h-[90vh] rounded-2xl bg-creamey shadow-2xl w-full py-8 px-6 space-y-8">
          <h2
            className={`${thirdFont.className} tracking-normal font-bold mb-6 text-lovely`}
          >
            Reset Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              className="bg-creamey border-lovely/90 border placeholder:text-lovely/80"
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              className="bg-creamey border-lovely/90 border placeholder:text-lovely/80"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="bg-lovely text-creamey w-full"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
          {message && <p className="mt-4 text-lovely">{message}</p>}
        </div>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-16 px-4 text-lovely">
          <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
          <p>Loading...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;
