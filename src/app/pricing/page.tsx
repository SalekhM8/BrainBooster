"use client";

import { useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/fetcher";
import { Check, Loader2 } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  tier: string;
  priceMonthly: number;
  priceYearly: number | null;
  features: string[];
  subjects: string[];
  isPopular: boolean;
  isActive: boolean;
}

export default function PricingPage() {
  // Fetch dynamic pricing plans from database
  const { data: plans, isLoading, error } = useSWR<PricingPlan[]>(
    "/api/pricing-plans?active=true",
    fetcher
  );

  // Sort plans by sortOrder/price
  const sortedPlans = useMemo(() => {
    if (!plans || !Array.isArray(plans)) return [];
    return [...plans].sort((a, b) => a.priceMonthly - b.priceMonthly);
  }, [plans]);

  return (
    <div className="min-h-screen bg-pastel-blue">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-pastel-cream border-b border-pastel-blue-border/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pastel-blue-border rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-pastel-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-pastel-blue-text">BrainBooster</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">← Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 px-6 text-center">
        <Badge variant="primary" className="mb-4">Simple Pricing</Badge>
        <h1 className="text-4xl font-bold text-pastel-blue-text mb-4">
          Invest in Your Future
        </h1>
        <p className="text-lg text-pastel-blue-text/70 max-w-xl mx-auto">
          Choose your plan and start learning with expert tutors today.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-pastel-blue-border" />
            </div>
          ) : error ? (
            <Card variant="bordered" className="p-12 text-center bg-pastel-cream">
              <p className="text-red-600">Failed to load pricing plans.</p>
              <p className="text-sm text-slate-400 mt-2">Please refresh the page.</p>
            </Card>
          ) : sortedPlans.length === 0 ? (
            <Card variant="bordered" className="p-12 text-center bg-pastel-cream">
              <p className="text-slate-500">No pricing plans available at the moment.</p>
              <p className="text-sm text-slate-400 mt-2">Please check back later.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {sortedPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`p-8 relative bg-pastel-cream ${
                    plan.isPopular ? "border-2 border-pastel-blue-border ring-2 ring-pastel-blue-border/20" : "border border-pastel-blue-border/50"
                  }`}
                >
                  {plan.isPopular && (
                    <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  
                  <h3 className="text-2xl font-bold text-pastel-blue-text mb-2">{plan.name}</h3>
                  <p className="text-pastel-blue-text/60 text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-pastel-blue-text">£{Math.round(plan.priceMonthly / 100)}</span>
                    <span className="text-pastel-blue-text/60">/month</span>
                    {plan.priceYearly && (
                      <p className="text-sm text-pastel-blue-text/50 mt-1">
                        or £{Math.round(plan.priceYearly / 100)}/year (save 17%)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-pastel-blue-text/80">
                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href={`/subscribe?plan=${plan.id}`}>
                    <Button
                      variant={plan.isPopular ? "primary" : "secondary"}
                      className="w-full"
                      size="lg"
                    >
                      {plan.tier === "PREMIUM" ? "Go Premium" : "Get Started"}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-pastel-cream">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-pastel-blue-text text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "Can I switch plans later?", a: "Yes! You can upgrade or downgrade at any time." },
              { q: "What year groups do you cover?", a: "We cover KS3, KS4, GCSE, and A-Level for both subjects." },
              { q: "How do live classes work?", a: "Classes are via Zoom. Join with one click from your dashboard." },
              { q: "Can I cancel anytime?", a: "Yes, cancel anytime. You keep access until your period ends." },
            ].map((faq) => (
              <Card key={faq.q} variant="bordered" className="p-6 bg-white">
                <h3 className="font-semibold text-pastel-blue-text mb-2">{faq.q}</h3>
                <p className="text-sm text-pastel-blue-text/70">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-pastel-blue-border/30 bg-pastel-cream">
        <p className="text-center text-sm text-pastel-blue-text/50">
          © 2024 BrainBooster. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
