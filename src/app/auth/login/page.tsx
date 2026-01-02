"use client";

import { useState, useRef, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pastel-cream flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-pastel-blue-border p-8 xl:p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">BrainBooster</span>
        </Link>

        <div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white mb-4">
            Welcome back!
          </h1>
          <p className="text-pastel-blue/90 text-base xl:text-lg">
            Sign in to access your classes, recordings, and continue your learning journey.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {["S", "J", "E", "M"].map((initial, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-pastel-blue-border flex items-center justify-center text-white font-semibold text-sm">
                {initial}
              </div>
            ))}
          </div>
          <p className="text-pastel-blue/80 text-sm">500+ students learning with us</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6 sm:mb-10">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pastel-blue-border rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900">BrainBooster</span>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 md:p-8">
            <div className="text-center mb-5 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Sign in</h2>
              <p className="text-slate-500 text-sm">Enter your credentials to continue</p>
            </div>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs sm:text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <Input
                ref={emailRef}
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />

              <div>
                <Input
                  ref={passwordRef}
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
                <div className="mt-1.5 text-right">
                  <Link href="/auth/forgot-password" className="text-xs sm:text-sm text-pastel-blue-border hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-slate-500 text-xs sm:text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-pastel-blue-border font-medium hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs text-slate-400 px-4">
            By signing in, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pastel-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
