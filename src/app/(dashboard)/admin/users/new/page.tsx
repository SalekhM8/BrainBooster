"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "STUDENT",
    yearGroup: "GCSE",
    subjects: ["MATHS", "ENGLISH"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create user");
      }
      
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add New User</h1>
        <p className="text-slate-500">Create a new student, teacher, or admin</p>
      </div>

      <Card variant="bordered" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

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

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {form.role === "STUDENT" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Year Group
                </label>
                <select
                  value={form.yearGroup}
                  onChange={(e) => setForm({ ...form, yearGroup: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="KS3">KS3</option>
                  <option value="KS4">KS4</option>
                  <option value="GCSE">GCSE</option>
                  <option value="A_LEVEL">A-Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Subjects
                </label>
                <div className="flex gap-4">
                  {["MATHS", "ENGLISH"].map((subject) => (
                    <label key={subject} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.subjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, subjects: [...form.subjects, subject] });
                          } else {
                            setForm({ ...form, subjects: form.subjects.filter((s) => s !== subject) });
                          }
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">
                        {subject === "MATHS" ? "Maths" : "English"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={loading}>
              Create User
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

