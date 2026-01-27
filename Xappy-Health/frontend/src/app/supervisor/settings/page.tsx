"use client";

import { useEffect, useState } from "react";
import { User, Bell, Shield, Save, Check } from "lucide-react";

interface UserProfile {
  id: string;
  badge_number: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  role: string;
  department?: string;
  site?: { name: string };
  shift_pattern?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_new_reports: true,
    email_acknowledgments: true,
    email_escalations: true,
    push_near_miss: true,
    push_incidents: true,
    push_handovers: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/v1/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/v1/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      fetchProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-xappy-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      {saved && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          Profile updated successfully
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge Number
              </label>
              <input
                type="text"
                value={profile?.badge_number || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={profile?.role?.replace(/_/g, " ") || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site
              </label>
              <input
                type="text"
                value={profile?.site?.name || "Not assigned"}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Pattern
              </label>
              <input
                type="text"
                value={profile?.shift_pattern || "Not set"}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-xappy-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Email Notifications
            </h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-gray-600">New report submissions</span>
                <input
                  type="checkbox"
                  checked={notifications.email_new_reports}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      email_new_reports: e.target.checked,
                    })
                  }
                  className="h-5 w-5 text-xappy-primary rounded focus:ring-xappy-primary"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-600">
                  Pending acknowledgment reminders
                </span>
                <input
                  type="checkbox"
                  checked={notifications.email_acknowledgments}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      email_acknowledgments: e.target.checked,
                    })
                  }
                  className="h-5 w-5 text-xappy-primary rounded focus:ring-xappy-primary"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-600">Escalation alerts</span>
                <input
                  type="checkbox"
                  checked={notifications.email_escalations}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      email_escalations: e.target.checked,
                    })
                  }
                  className="h-5 w-5 text-xappy-primary rounded focus:ring-xappy-primary"
                />
              </label>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Push Notifications
            </h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-gray-600">Near-miss reports</span>
                <input
                  type="checkbox"
                  checked={notifications.push_near_miss}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      push_near_miss: e.target.checked,
                    })
                  }
                  className="h-5 w-5 text-xappy-primary rounded focus:ring-xappy-primary"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-600">Incident reports</span>
                <input
                  type="checkbox"
                  checked={notifications.push_incidents}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      push_incidents: e.target.checked,
                    })
                  }
                  className="h-5 w-5 text-xappy-primary rounded focus:ring-xappy-primary"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-600">Shift handover reminders</span>
                <input
                  type="checkbox"
                  checked={notifications.push_handovers}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      push_handovers: e.target.checked,
                    })
                  }
                  className="h-5 w-5 text-xappy-primary rounded focus:ring-xappy-primary"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Change PIN
            </h4>
            <p className="text-sm text-gray-500 mb-3">
              Contact your site administrator to change your login PIN.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Active Sessions
            </h4>
            <p className="text-sm text-gray-500 mb-3">
              You are currently logged in on this device.
            </p>
            <button className="text-sm text-red-600 hover:text-red-700">
              Log out of all other devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
