"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "BrainBooster",
    supportEmail: "support@brainbooster.com",
    timezone: "Europe/London",
    defaultYearGroup: "GCSE",
    sessionDuration: "60",
    stripeEnabled: false,
    stripePublicKey: "",
    emailNotifications: true,
    maintenanceMode: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure platform settings and preferences</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-emerald-800">Settings saved successfully!</p>
        </div>
      )}

      {/* General Settings */}
      <Card variant="bordered" className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">General</h2>
        <div className="space-y-4">
          <Input
            label="Site Name"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
          />
          <Input
            label="Support Email"
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Session Settings */}
      <Card variant="bordered" className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Sessions</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Default Year Group</label>
            <select
              value={settings.defaultYearGroup}
              onChange={(e) => setSettings({ ...settings, defaultYearGroup: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="KS3">KS3</option>
              <option value="KS4">KS4</option>
              <option value="GCSE">GCSE</option>
              <option value="A_LEVEL">A-Level</option>
            </select>
          </div>
          <Input
            label="Default Session Duration (minutes)"
            type="number"
            value={settings.sessionDuration}
            onChange={(e) => setSettings({ ...settings, sessionDuration: e.target.value })}
          />
        </div>
      </Card>

      {/* Payment Settings */}
      <Card variant="bordered" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Payments (Stripe)</h2>
          <Badge variant={settings.stripeEnabled ? "success" : "warning"}>
            {settings.stripeEnabled ? "Connected" : "Not Connected"}
          </Badge>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="stripeEnabled"
              checked={settings.stripeEnabled}
              onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="stripeEnabled" className="text-sm text-slate-700">
              Enable Stripe payments
            </label>
          </div>
          <Input
            label="Stripe Public Key"
            value={settings.stripePublicKey}
            onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
            placeholder="pk_live_..."
            disabled={!settings.stripeEnabled}
          />
          <p className="text-sm text-slate-500">
            Configure Stripe keys in your environment variables for production use.
          </p>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card variant="bordered" className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="emailNotifications" className="text-sm text-slate-700">
              Send email notifications for new sessions and recordings
            </label>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card variant="bordered" className="p-6 border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Maintenance Mode</p>
              <p className="text-sm text-slate-500">Temporarily disable the site for maintenance</p>
            </div>
            <Button
              variant={settings.maintenanceMode ? "primary" : "outline"}
              onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
            >
              {settings.maintenanceMode ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={saving}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}

