"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("No session ID found");
      return;
    }

    // Verify the session (optional - webhook handles the actual activation)
    // For now, we just show success since webhook will have processed it
    const timer = setTimeout(() => {
      setStatus("success");
      setMessage("Your account has been created successfully!");
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-pastel-blue flex items-center justify-center p-4">
        <Card variant="bordered" className="max-w-md w-full p-8 text-center">
          <Loader2 className="w-12 h-12 text-pastel-blue-border animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Processing your subscription...</h1>
          <p className="text-slate-500">Please wait while we set up your account.</p>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-pastel-blue flex items-center justify-center p-4">
        <Card variant="bordered" className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-slate-500 mb-6">{message}</p>
          <Link href="/pricing">
            <Button>Try Again</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pastel-blue flex items-center justify-center p-4">
      <Card variant="bordered" className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to BrainBooster!</h1>
        <p className="text-slate-500 mb-6">
          {message}
        </p>
        
        <div className="bg-pastel-blue/30 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-slate-700 mb-2">
            <strong>Important:</strong> Check your email for your login credentials.
          </p>
          <p className="text-sm text-slate-500">
            A temporary password has been sent to your email. You can change it after logging in.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/auth/login" className="block">
            <Button className="w-full" size="lg">
              Login to Your Account
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

