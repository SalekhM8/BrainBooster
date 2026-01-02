"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/fetcher";

interface Subscription {
  id: string;
  tier: string;
  status: string;
  homeworkSiteAccess: boolean;
  homeworkSiteUrl: string | null;
  homeworkUsername: string | null;
  homeworkPassword: string | null;
  currentPeriodEnd: string | null;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  subjects: string | null;
  yearGroup: string | null;
  subscription: Subscription | null;
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const { data: user, isLoading, mutate } = useSWR<User>(
    `/api/users/${resolvedParams.id}`,
    fetcher
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "STUDENT",
    isActive: true,
    yearGroup: "GCSE",
    subjects: [] as string[],
    password: "",
    // Subscription fields
    tier: "BASIC",
    status: "ACTIVE",
    homeworkSiteAccess: false,
    homeworkSiteUrl: "",
    homeworkUsername: "",
    homeworkPassword: "",
  });

  useEffect(() => {
    if (user) {
      const subjects = user.subjects ? JSON.parse(user.subjects) : [];
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        yearGroup: user.yearGroup || "GCSE",
        subjects,
        password: "",
        tier: user.subscription?.tier || "BASIC",
        status: user.subscription?.status || "ACTIVE",
        homeworkSiteAccess: user.subscription?.homeworkSiteAccess || false,
        homeworkSiteUrl: user.subscription?.homeworkSiteUrl || "",
        homeworkUsername: user.subscription?.homeworkUsername || "",
        homeworkPassword: user.subscription?.homeworkPassword || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        isActive: form.isActive,
        yearGroup: form.yearGroup,
        subjects: form.subjects,
      };

      if (form.password) {
        payload.password = form.password;
      }

      // Include subscription data for students
      if (user?.subscription) {
        payload.subscription = {
          tier: form.tier,
          status: form.status,
          homeworkSiteAccess: form.homeworkSiteAccess,
          homeworkSiteUrl: form.homeworkSiteUrl || null,
          homeworkUsername: form.homeworkUsername || null,
          homeworkPassword: form.homeworkPassword || null,
        };
      }

      const res = await fetch(`/api/users/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user");
      }

      setMessage({ type: "success", text: "User updated successfully" });
      
      // Revalidate this user's data
      await mutate();
      
      // Force revalidate ALL user-related caches (including list pages with any query params)
      // This uses a more aggressive approach to ensure list pages refresh
      await globalMutate(
        (key) => typeof key === "string" && key.includes("/api/users"),
        undefined,
        { revalidate: true }
      );
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pastel-blue-border" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card variant="bordered" className="p-12 text-center">
        <p className="text-slate-500">User not found</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </Card>
    );
  }

  const isPremium = form.tier === "PREMIUM";
  const isStudent = form.role === "STUDENT";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit User</h1>
          <p className="text-slate-500">{user.email}</p>
        </div>
        <Badge variant={user.isActive ? "success" : "default"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Basic Info */}
      <Card variant="bordered" className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {isStudent && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year Group</label>
                <select
                  value={form.yearGroup}
                  onChange={(e) => setForm({ ...form, yearGroup: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="KS3">KS3</option>
                  <option value="KS4">KS4</option>
                  <option value="GCSE">GCSE</option>
                  <option value="A_LEVEL">A-Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subjects</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.subjects.includes("MATHS")}
                      onChange={(e) => {
                        const subjects = e.target.checked
                          ? [...form.subjects, "MATHS"]
                          : form.subjects.filter((s) => s !== "MATHS");
                        setForm({ ...form, subjects });
                      }}
                      className="rounded"
                    />
                    Maths
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.subjects.includes("ENGLISH")}
                      onChange={(e) => {
                        const subjects = e.target.checked
                          ? [...form.subjects, "ENGLISH"]
                          : form.subjects.filter((s) => s !== "ENGLISH");
                        setForm({ ...form, subjects });
                      }}
                      className="rounded"
                    />
                    English
                  </label>
                </div>
              </div>
            </>
          )}

          <Input
            label="New Password (leave blank to keep current)"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>
      </Card>

      {/* Subscription (Students Only) */}
      {isStudent && user.subscription && (
        <Card variant="bordered" className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Subscription</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tier</label>
                <select
                  value={form.tier}
                  onChange={(e) => {
                    const newTier = e.target.value;
                    setForm({
                      ...form,
                      tier: newTier,
                      homeworkSiteAccess: newTier === "PREMIUM",
                    });
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="BASIC">Basic</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="PAST_DUE">Past Due</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Homework Portal Credentials (Premium Students Only) */}
      {isStudent && isPremium && user.subscription && (
        <Card variant="bordered" className="p-6 bg-indigo-50 border-indigo-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📚</span>
            <h2 className="text-lg font-semibold text-slate-900">Homework Portal Credentials</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Enter the login details for the homework platform. The student will see these in their profile.
          </p>
          <div className="space-y-4">
            <Input
              label="Homework Site URL"
              value={form.homeworkSiteUrl}
              onChange={(e) => setForm({ ...form, homeworkSiteUrl: e.target.value })}
              placeholder="https://homework.brainbooster.com"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Username"
                value={form.homeworkUsername}
                onChange={(e) => setForm({ ...form, homeworkUsername: e.target.value })}
                placeholder="student_username"
              />
              <Input
                label="Password"
                value={form.homeworkPassword}
                onChange={(e) => setForm({ ...form, homeworkPassword: e.target.value })}
                placeholder="homework_password"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.homeworkSiteAccess}
                onChange={(e) => setForm({ ...form, homeworkSiteAccess: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-700">Enable Homework Portal Access</span>
            </label>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} isLoading={saving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
