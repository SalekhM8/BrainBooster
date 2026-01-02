"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/fetcher";
import { ArrowLeft, Loader2, CreditCard, CheckCircle } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  tier: string;
  priceMonthly: number;
  priceYearly: number | null;
  features: string[];
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
}

function SubscribeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan");
  const subjectParam = searchParams.get("subject") || "BOTH";

  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    yearGroup: "GCSE",
  });

  // Fetch plan details
  const { data: plan, isLoading: planLoading } = useSWR<PricingPlan>(
    planId ? `/api/pricing-plans/${planId}` : null,
    fetcher
  );

  // Determine subjects based on selection
  const subjects = subjectParam === "BOTH" 
    ? ["MATHS", "ENGLISH"] 
    : [subjectParam];

  // Calculate price
  const getPrice = () => {
    if (!plan) return 0;
    const basePrice = billingInterval === "yearly" 
      ? (plan.priceYearly || plan.priceMonthly * 12) 
      : plan.priceMonthly;
    // Add 50% for both subjects
    const multiplier = subjectParam === "BOTH" ? 1.5 : 1;
    return Math.round((basePrice / 100) * multiplier);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billingInterval,
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          yearGroup: form.yearGroup,
          subjects,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  if (!planId) {
    return (
      <div className="min-h-screen bg-pastel-blue flex items-center justify-center p-4">
        <Card variant="bordered" className="max-w-md w-full p-8 text-center">
          <p className="text-slate-500 mb-4">No plan selected</p>
          <Link href="/pricing">
            <Button>View Plans</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (planLoading || !plan) {
    return (
      <div className="min-h-screen bg-pastel-blue flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pastel-blue-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pastel-blue">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b-2 border-pastel-blue-border/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/pricing" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Plans</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Complete Your Order
            </h1>
            <p className="text-slate-500 mb-8">
              You&apos;re subscribing to {plan.name}
            </p>

            <Card variant="bordered" className="p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>
                {plan.tier === "PREMIUM" && (
                  <Badge variant="warning">Premium</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {subjects.map((subject) => (
                  <Badge key={subject} variant={subject === "MATHS" ? "primary" : "warning"}>
                    {subject === "MATHS" ? "Mathematics" : "English"}
                  </Badge>
                ))}
              </div>

              {/* Billing Toggle */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => setBillingInterval("monthly")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    billingInterval === "monthly"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval("yearly")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    billingInterval === "yearly"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600"
                  }`}
                >
                  Yearly (Save 17%)
                </button>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-900">
                      £{getPrice()}
                    </span>
                    <span className="text-slate-500">
                      /{billingInterval === "yearly" ? "year" : "month"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <Card variant="bordered" className="p-6 bg-white">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-pastel-blue-border" />
                <h2 className="text-lg font-bold text-slate-900">Your Details</h2>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Year Group
                  </label>
                  <select
                    value={form.yearGroup}
                    onChange={(e) => setForm({ ...form, yearGroup: e.target.value })}
                    className="w-full rounded-lg border-2 border-pastel-blue-border bg-pastel-cream/50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pastel-blue-border"
                  >
                    <option value="KS3">KS3</option>
                    <option value="KS4">KS4</option>
                    <option value="GCSE">GCSE</option>
                    <option value="A_LEVEL">A-Level</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting to payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Continue to Payment
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-slate-400">
                  Secure payment powered by Stripe. Cancel anytime.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pastel-blue flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pastel-blue-border" />
      </div>
    }>
      <SubscribeForm />
    </Suspense>
  );
}

