"use client";

import { useState, useCallback, memo } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/fetcher";

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
  sortOrder: number;
  stripeProductId: string | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
}

const PlanRow = memo(function PlanRow({
  plan,
  onEdit,
  onToggle,
  onDelete,
  onSync,
}: {
  plan: PricingPlan;
  onEdit: (plan: PricingPlan) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onSync: (plan: PricingPlan) => void;
}) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{plan.name}</p>
          {plan.isPopular && <Badge variant="primary">Popular</Badge>}
        </div>
        <p className="text-sm text-slate-500">{plan.description}</p>
      </td>
      <td className="px-4 py-4">
        <Badge variant={plan.tier === "PREMIUM" ? "warning" : "default"}>
          {plan.tier}
        </Badge>
      </td>
      <td className="px-4 py-4">
        <p className="font-semibold text-slate-900">£{(plan.priceMonthly / 100).toFixed(2)}/mo</p>
        {plan.priceYearly && (
          <p className="text-sm text-slate-500">£{(plan.priceYearly / 100).toFixed(2)}/yr</p>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">
        {plan.features.length} features
      </td>
      <td className="px-4 py-4">
        <Badge variant={plan.isActive ? "success" : "default"}>
          {plan.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-4 py-4">
        {plan.stripePriceIdMonthly ? (
          <Badge variant="success">Connected</Badge>
        ) : (
          <button 
            onClick={() => onSync(plan)}
            className="text-amber-600 hover:text-amber-700 text-xs font-medium underline"
          >
            Click to Sync
          </button>
        )}
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(plan)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onToggle(plan.id, plan.isActive)}>
            {plan.isActive ? "Disable" : "Enable"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(plan.id)}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
});

export default function AdminPricingPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tier: "BASIC",
    priceMonthly: "",
    priceYearly: "",
    features: "",
    subjects: [] as string[],
    isPopular: false,
    isActive: true,
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  const { data: plans, isLoading, mutate } = useSWR<PricingPlan[]>("/api/pricing-plans", fetcher);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      description: "",
      tier: "BASIC",
      priceMonthly: "",
      priceYearly: "",
      features: "",
      subjects: ["MATHS", "ENGLISH"],
      isPopular: false,
      isActive: true,
      sortOrder: (plans?.length || 0) + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      tier: plan.tier,
      priceMonthly: (plan.priceMonthly / 100).toString(),
      priceYearly: plan.priceYearly ? (plan.priceYearly / 100).toString() : "",
      features: plan.features.join("\n"),
      subjects: plan.subjects,
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        tier: formData.tier,
        priceMonthly: parseFloat(formData.priceMonthly),
        priceYearly: formData.priceYearly ? parseFloat(formData.priceYearly) : null,
        features: formData.features.split("\n").filter((f) => f.trim()),
        subjects: formData.subjects,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        // Stripe prices are auto-created - no manual input needed
      };

      if (editingPlan) {
        await fetch(`/api/pricing-plans/${editingPlan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/pricing-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // Force SWR to refetch fresh data from server
      await mutate(undefined, { revalidate: true });
      setShowModal(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = useCallback(async (id: string, isActive: boolean) => {
    await fetch(`/api/pricing-plans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await mutate(undefined, { revalidate: true });
  }, [mutate]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing plan?")) return;
    await fetch(`/api/pricing-plans/${id}`, { method: "DELETE" });
    await mutate(undefined, { revalidate: true });
  }, [mutate]);

  // Sync a plan with Stripe (creates/updates Stripe product and prices)
  const handleSyncWithStripe = useCallback(async (plan: PricingPlan) => {
    if (!confirm(`Sync "${plan.name}" with Stripe? This will create Stripe products and prices.`)) return;
    
    try {
      await fetch(`/api/pricing-plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: plan.name,
          description: plan.description,
          priceMonthly: plan.priceMonthly / 100,
          priceYearly: plan.priceYearly ? plan.priceYearly / 100 : null,
        }),
      });
      await mutate(undefined, { revalidate: true });
      alert("Successfully synced with Stripe!");
    } catch (error) {
      console.error("Error syncing with Stripe:", error);
      alert("Failed to sync with Stripe");
    }
  }, [mutate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pricing Plans</h1>
          <p className="text-slate-500">Manage subscription pricing and features</p>
        </div>
        <Button onClick={openCreateModal}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Plan
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={3} />
      ) : !plans?.length ? (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-slate-500 mb-4">No pricing plans yet</p>
          <Button onClick={openCreateModal}>Create First Plan</Button>
        </Card>
      ) : (
        <Card variant="bordered" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Plan</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Tier</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Features</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Stripe</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    onEdit={openEditModal}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onSync={handleSyncWithStripe}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingPlan ? "Edit Plan" : "Create Plan"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Plan Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Basic Plan"
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
              </div>

              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the plan"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Monthly Price (£)"
                  type="number"
                  step="0.01"
                  value={formData.priceMonthly}
                  onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
                  placeholder="e.g., 49.00"
                />
                <Input
                  label="Yearly Price (£) - Optional"
                  type="number"
                  step="0.01"
                  value={formData.priceYearly}
                  onChange={(e) => setFormData({ ...formData, priceYearly: e.target.value })}
                  placeholder="e.g., 490.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Features (one per line)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Live classes&#10;Recording access&#10;24/7 support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subjects</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes("MATHS")}
                      onChange={(e) => {
                        const subjects = e.target.checked
                          ? [...formData.subjects, "MATHS"]
                          : formData.subjects.filter((s) => s !== "MATHS");
                        setFormData({ ...formData, subjects });
                      }}
                      className="rounded"
                    />
                    Maths
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes("ENGLISH")}
                      onChange={(e) => {
                        const subjects = e.target.checked
                          ? [...formData.subjects, "ENGLISH"]
                          : formData.subjects.filter((s) => s !== "ENGLISH");
                        setFormData({ ...formData, subjects });
                      }}
                      className="rounded"
                    />
                    English
                  </label>
                </div>
              </div>

              {/* Stripe prices are auto-created when you save */}
              {editingPlan && editingPlan.stripePriceIdMonthly && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium">✓ Stripe Connected</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Prices sync automatically. Changing prices here will create new Stripe prices for new subscribers.
                  </p>
                </div>
              )}
              {editingPlan && !editingPlan.stripePriceIdMonthly && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 font-medium">⚠ Not connected to Stripe</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Save this plan to auto-create Stripe products and prices.
                  </p>
                </div>
              )}

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded"
                  />
                  Mark as Popular
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingPlan ? "Save Changes" : "Create Plan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

