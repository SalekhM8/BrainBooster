"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

export default function AdminProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ users: 0, sessions: 0, recordings: 0 });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          users: data.totalUsers || 0,
          sessions: data.totalSessions || 0,
          recordings: data.totalRecordings || 0,
        });
      });
  }, []);

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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pastel-blue-border" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500">Manage your administrator account</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="bordered" className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{stats.users}</p>
          <p className="text-sm text-slate-500">Total Users</p>
        </Card>
        <Card variant="bordered" className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{stats.sessions}</p>
          <p className="text-sm text-slate-500">Sessions</p>
        </Card>
        <Card variant="bordered" className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{stats.recordings}</p>
          <p className="text-sm text-slate-500">Recordings</p>
        </Card>
      </div>

      {/* Profile Info */}
      <Card variant="bordered" className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{user.firstName} {user.lastName}</h2>
            <p className="text-slate-500">{user.email}</p>
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
                <p className="font-medium text-slate-900">{user.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Last Name</p>
                <p className="font-medium text-slate-900">{user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Role</p>
                <p className="font-medium text-slate-900">Administrator</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

