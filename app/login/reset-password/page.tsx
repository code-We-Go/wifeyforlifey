"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPasswordPage = () => {
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
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6 text-lovely">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
      {message && <p className="mt-4 text-lovely">{message}</p>}
    </div>
  );
};

export default ResetPasswordPage;
