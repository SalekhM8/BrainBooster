"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard, Loader2 } from "lucide-react";

interface Stats {
  subscriptionStatus: string;
  subscriptionTier: string | null;
  upcomingSessions: number;
  watchedRecordings: number;
}

export default function SubscriptionPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Could not open billing portal");
      }
    } catch {
      alert("Failed to open billing portal");
    }
    setPortalLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pastel-blue-border" />
      </div>
    );
  }

  const isActive = stats?.subscriptionStatus === "ACTIVE";
  const isPremium = stats?.subscriptionTier === "PREMIUM";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>
        <p className="text-slate-500">Manage your plan and billing</p>
      </div>

      {/* Current Plan */}
      <Card variant="bordered" className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900">
                {isPremium ? "Premium" : "Essential"} Plan
              </h2>
              <Badge variant={isActive ? "success" : "error"}>
                {stats?.subscriptionStatus || "Inactive"}
              </Badge>
            </div>
            <p className="text-slate-500 mb-4">
              {isPremium 
                ? "You have access to all features including homework portal" 
                : "Access to live classes and recordings"}
            </p>
            <p className="text-2xl font-bold text-slate-900">
              £{isPremium ? "79" : "49"}<span className="text-base font-normal text-slate-500">/month</span>
            </p>
          </div>
          <div className="text-right">
            {!isPremium && isActive && (
              <Link href="/pricing">
                <Button>Upgrade to Premium</Button>
              </Link>
            )}
            {!isActive && (
              <Link href="/pricing">
                <Button>Reactivate</Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card variant="bordered" className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Your Features</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { name: "Live Classes", included: true },
            { name: "Recording Library", included: true },
            { name: "Progress Tracking", included: true },
            { name: "Email Support", included: true },
            { name: "Homework Portal", included: isPremium },
            { name: "Priority Support", included: isPremium },
            { name: "1-on-1 Consultations", included: isPremium },
            { name: "Parent Reports", included: isPremium },
          ].map((feature) => (
            <div key={feature.name} className="flex items-center gap-3">
              {feature.included ? (
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={feature.included ? "text-slate-700" : "text-slate-400"}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Usage Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card variant="bordered" className="p-6">
          <p className="text-sm text-slate-500 mb-1">Upcoming Classes</p>
          <p className="text-3xl font-bold text-slate-900">{stats?.upcomingSessions || 0}</p>
        </Card>
        <Card variant="bordered" className="p-6">
          <p className="text-sm text-slate-500 mb-1">Recordings Watched</p>
          <p className="text-3xl font-bold text-slate-900">{stats?.watchedRecordings || 0}</p>
        </Card>
      </div>

      {/* Manage Billing */}
      <Card variant="bordered" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Billing & Payment</h3>
            <p className="text-sm text-slate-500">
              Update payment method, view invoices, or cancel subscription
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={openBillingPortal}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4 mr-2" />
            )}
            Manage Billing
          </Button>
        </div>
      </Card>
    </div>
  );
}

