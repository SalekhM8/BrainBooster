"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/fetcher";

interface SubscriptionData {
  tier: string;
  status: string;
  currentPeriodEnd: string | null;
  homeworkSiteAccess: boolean;
  homeworkSiteUrl: string | null;
  homeworkUsername: string | null;
  homeworkPassword: string | null;
}

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  subjects: string[];
  yearGroup: string;
  subscription: SubscriptionData | null;
}

export default function StudentProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;

  const { data: profile, isLoading } = useSWR<ProfileData>("/api/profile", fetcher);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        firstName: profile.firstName,
        lastName: profile.lastName,
      }));
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      await update({
        ...session,
        user: { ...session?.user, firstName: form.firstName, lastName: form.lastName },
      });

      setMessage({ type: "success", text: "Profile updated successfully" });
      setIsEditing(false);
      setForm({ ...form, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pastel-blue-border" />
      </div>
    );
  }

  const subscription = profile?.subscription;
  const isPremium = subscription?.tier === "PREMIUM";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500">Manage your account settings</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Subscription Status Card */}
      <Card variant="bordered" className={`p-6 ${isPremium ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" : "bg-slate-50"}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Your Plan</p>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {subscription?.tier || "No Plan"}
              </h2>
              {isPremium && <span className="text-xl">⭐</span>}
            </div>
          </div>
          <Badge variant={subscription?.status === "ACTIVE" ? "success" : "error"} className="text-sm px-3 py-1">
            {subscription?.status || "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Subjects</p>
            <p className="font-medium text-slate-900">
              {profile?.subjects?.join(", ") || "None"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Year Group</p>
            <p className="font-medium text-slate-900">{profile?.yearGroup || "Not set"}</p>
          </div>
          {subscription?.currentPeriodEnd && (
            <div className="col-span-2">
              <p className="text-slate-500">Renews On</p>
              <p className="font-medium text-slate-900">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {!isPremium && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-2">
              Upgrade to Premium for homework portal access and more!
            </p>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
              Upgrade to Premium
            </Button>
          </div>
        )}
      </Card>

      {/* Homework Portal Credentials (Premium Only) */}
      {isPremium && subscription?.homeworkSiteAccess && (
        <Card variant="bordered" className="p-6 bg-indigo-50 border-indigo-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📚</span>
            <h3 className="text-lg font-semibold text-slate-900">Homework Portal Access</h3>
          </div>

          {subscription.homeworkUsername && subscription.homeworkPassword ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Use these credentials to log in to the homework platform:
              </p>
              {subscription.homeworkSiteUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 w-20">URL:</span>
                  <a
                    href={subscription.homeworkSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                  >
                    {subscription.homeworkSiteUrl}
                  </a>
                </div>
              )}
              <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-500 w-20">Username:</span>
                  <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                    {subscription.homeworkUsername}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 w-20">Password:</span>
                  <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                    {subscription.homeworkPassword}
                  </code>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-100 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                ⏳ Your homework portal credentials are being set up. Please check back soon or contact support.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Profile Info */}
      <Card variant="bordered" className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={`${profile?.firstName} ${profile?.lastName}`} size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-slate-500">{profile?.email}</p>
          </div>
        </div>

        {isEditing ? (
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

            <hr className="my-6" />

            <h3 className="font-semibold text-slate-900 mb-4">Change Password (optional)</h3>

            <Input
              label="Current Password"
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={form.newPassword !== form.confirmPassword && form.confirmPassword ? "Passwords don't match" : undefined}
            />

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} isLoading={loading}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">First Name</p>
                <p className="font-medium text-slate-900">{profile?.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Last Name</p>
                <p className="font-medium text-slate-900">{profile?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Role</p>
                <p className="font-medium text-slate-900 capitalize">{profile?.role?.toLowerCase()}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
