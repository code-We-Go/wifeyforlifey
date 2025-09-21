"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { thirdFont } from "@/fonts";
import { FaGoogle } from "react-icons/fa";
import { BadgeAlert } from "lucide-react";
import { bgCreameyButton, bgRedButton } from "../constants";
import axios from "axios";
import { generateDeviceFingerprint } from "@/utils/fingerprint";

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Using imported generateDeviceFingerprint from utils/fingerprint.ts

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    setRedirectPath(redirect);
  }, [searchParams]);

  // We've moved the login tracking to the account page
  // This prevents duplicate login records
  useEffect(() => {
    if (session?.user?.id) {
      console.log(
        "Session detected in login page, user ID:",
        session.user.id,
        "email:",
        session.user.email
      );
      // Login tracking is now handled in the account page
      // No need to clear fingerprint here as it will be handled in account page
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Generate device fingerprint before credential login
      const deviceInfo = generateDeviceFingerprint();
      const fingerprint = deviceInfo?.fingerprint || null;
      console.log("Generated fingerprint for credential login:", fingerprint);

      if (fingerprint) {
        // Store fingerprint in sessionStorage before credential login
        sessionStorage.setItem("deviceFingerprint", fingerprint);
        console.log("Stored fingerprint in sessionStorage for credential login:", fingerprint);
      } else {
        console.warn("No fingerprint generated for credential login");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Login successful, redirect
      const redirectTo = redirectPath ? `/${redirectPath}` : "/account";
      router.push(redirectTo);
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Generate device fingerprint before Google sign-in
      const deviceInfo = generateDeviceFingerprint();
      const fingerprint = deviceInfo?.fingerprint || null;
      console.log("Generated fingerprint for Google login:", fingerprint);

      if (fingerprint) {
        // Store fingerprint in sessionStorage before redirecting to Google
        sessionStorage.setItem("deviceFingerprint", fingerprint);
        console.log("Stored fingerprint in sessionStorage:", fingerprint);
      } else {
        console.warn("No fingerprint generated for Google login");
      }

      const callbackUrl = redirectPath ? `/${redirectPath}` : "/account";
      await signIn("google", {
        callbackUrl,
      });
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setError("An error occurred during Google sign-in. Please try again.");
    }
  };

  return (
    <div className=" bg-patternPinkey ">
      <div className="md:min-h-[calc(100vh-128px)] md:h-auto h-[calc(100vh-64px)]  flex items-center justify-center bg-black/30 backdrop-blur-[3px] py-12 px-4 sm:px-6 lg:px-8">
        {/* <div className='md:min-h-[calc(100vh-128px)] md:h-auto h-[calc(100vh-64px)] bg-black/30 backdrop-blur-[3px] flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8'> */}
        <div className="max-w-md max-h-[90vh] rounded-2xl bg-creamey shadow-2xl w-full py-8 px-6 space-y-8">
          <div>
            <h2
              className={`${thirdFont.className} mt-6 text-center text-4xl font-bold tracking-normal text-lovely`}
            >
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4 ">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="placeholder:text-pinkey rounded-none border-pinkey relative block w-full px-3 py-2 border-2 bg-creamey/90  text-lovely/90 rounded-t-md focus:outline-none focus:ring-everGreen focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="placeholder:text-pinkey rounded-none border-pinkey relative block w-full px-3 py-2 border-2 bg-creamey/90  text-lovely/90 rounded-t-md focus:outline-none focus:ring-everGreen focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <div className="text-right mt-2">
                  <a
                    href="/login/forgot-password"
                    className="text-xs text-lovely underline hover:cursor-pointer"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-lovely flex gap-2 w-full justify-center items-center text-sm text-center">
                {error}{" "}
                <span className="text-xs">
                  <BadgeAlert className="text-xs w-5" />
                </span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative  w-full flex justify-center py-2 px-4 border border-transparent text-sm  rounded-md ${bgCreameyButton} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
          <div className="relative flex my-6">
            <div className="w-full inset-0 flex items-center">
              <div className="w-full border-t border-lovely"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-lovely whitespace-nowrap">Or</span>
            </div>
            <div className="w-full inset-0 flex items-center">
              <div className="w-full border-t border-lovely"></div>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`group relative  w-full flex justify-center py-2 px-4 border border-transparent  rounded-md ${bgCreameyButton} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Signing in with Google .." : "Sign in with Google"}
              {!loading && (
                <span className="ml-2">
                  <FaGoogle />
                </span>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-lovely">
              Don&apos;t have an account?{" "}
              <a href="/register" className="font-medium underline">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaylistPageWrapper() {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <LoginPage />
    </Suspense>
  );
}
