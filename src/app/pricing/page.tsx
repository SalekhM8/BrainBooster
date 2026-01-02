"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/fetcher";

type Subject = "MATHS" | "ENGLISH" | "BOTH";

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
  const [selectedSubject, setSelectedSubject] = useState<Subject>("BOTH");

  // Fetch dynamic pricing plans
  const { data: plans, isLoading } = useSWR<PricingPlan[]>(
    "/api/pricing-plans?active=true",
    fetcher
  );

  // Calculate price based on subjects
  const getPrice = (plan: PricingPlan) => {
    const basePrice = plan.priceMonthly / 100;
    // If both subjects selected and plan supports both, add 50%
    if (selectedSubject === "BOTH" && plan.subjects.length === 2) {
      return Math.round(basePrice * 1.5);
    }
    return basePrice;
  };

  // Filter features to show appropriate subjects
  const getSubjectBadges = (plan: PricingPlan) => {
    const badges = [];
    if ((selectedSubject === "MATHS" || selectedSubject === "BOTH") && plan.subjects.includes("MATHS")) {
      badges.push(<Badge key="maths" variant="primary">Mathematics</Badge>);
    }
    if ((selectedSubject === "ENGLISH" || selectedSubject === "BOTH") && plan.subjects.includes("ENGLISH")) {
      badges.push(<Badge key="english" variant="warning">English</Badge>);
    }
    return badges;
  };

  // Sorted plans (basic first, then premium)
  const sortedPlans = useMemo(() => {
    if (!plans) return [];
    return [...plans].sort((a, b) => {
      if (a.tier === "BASIC" && b.tier === "PREMIUM") return -1;
      if (a.tier === "PREMIUM" && b.tier === "BASIC") return 1;
      return a.priceMonthly - b.priceMonthly;
    });
  }, [plans]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900">BrainBooster</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">← Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 px-6 text-center">
        <Badge variant="primary" className="mb-4">Simple Pricing</Badge>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Invest in Your Future
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Choose your subjects and start learning with expert tutors today.
        </p>
      </section>

      {/* Subject Selection */}
      <section className="pb-8 px-6">
        <div className="max-w-md mx-auto">
          <label className="block text-sm font-medium text-slate-700 text-center mb-3">
            Select Subject(s)
          </label>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { value: "MATHS", label: "Maths Only" },
              { value: "ENGLISH", label: "English Only" },
              { value: "BOTH", label: "Both Subjects" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedSubject(option.value as Subject)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  selectedSubject === option.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} variant="bordered" className="p-8 animate-pulse">
                  <div className="h-6 w-24 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-48 bg-slate-200 rounded mb-6" />
                  <div className="h-10 w-32 bg-slate-200 rounded mb-6" />
                  <div className="space-y-3 mb-8">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 bg-slate-200 rounded" />
                    ))}
                  </div>
                  <div className="h-10 bg-slate-200 rounded" />
                </Card>
              ))}
            </div>
          ) : sortedPlans.length === 0 ? (
            <Card variant="bordered" className="p-12 text-center">
              <p className="text-slate-500">No pricing plans available at the moment.</p>
              <p className="text-sm text-slate-400 mt-2">Please check back later.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {sortedPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`p-8 relative ${
                    plan.isPopular ? "border-2 border-primary-600" : "border border-slate-200"
                  }`}
                >
                  {plan.isPopular && (
                    <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">£{getPrice(plan)}</span>
                    <span className="text-slate-500">/month</span>
                    {plan.priceYearly && (
                      <p className="text-sm text-slate-400 mt-1">
                        or £{Math.round((plan.priceYearly / 100) * (selectedSubject === "BOTH" ? 1.5 : 1))}/year (save 17%)
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {getSubjectBadges(plan)}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                        <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href={`/subscribe?plan=${plan.id}&subject=${selectedSubject}`}>
                    <Button
                      variant={plan.isPopular ? "primary" : "outline"}
                      className="w-full"
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
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "Can I switch plans later?", a: "Yes! You can upgrade or downgrade at any time." },
              { q: "What year groups do you cover?", a: "We cover KS3, KS4, GCSE, and A-Level for both subjects." },
              { q: "How do live classes work?", a: "Classes are via Zoom. Join with one click from your dashboard." },
              { q: "Can I cancel anytime?", a: "Yes, cancel anytime. You keep access until your period ends." },
            ].map((faq) => (
              <Card key={faq.q} variant="bordered" className="p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <p className="text-center text-sm text-slate-400">
          © 2024 BrainBooster. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
