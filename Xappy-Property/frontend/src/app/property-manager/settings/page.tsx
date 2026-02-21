"use client";

import { useState } from "react";
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Users,
  Mail,
  Smartphone,
  Globe,
  Save,
  Camera,
} from "lucide-react";

const tabs = [
  { id: "profile", name: "Profile", icon: User },
  { id: "company", name: "Company", icon: Building2 },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Shield },
  { id: "billing", name: "Billing", icon: CreditCard },
  { id: "team", name: "Team", icon: Users },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? "text-indigo-600" : "text-gray-400"}`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
                  JD
                </div>
                <div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 2MB</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    defaultValue="John"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    defaultValue="Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue="john@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    defaultValue="+44 7700 900000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    defaultValue="Property Manager"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "company" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Company Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    defaultValue="Xappy Property Management Ltd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    rows={3}
                    defaultValue="123 Property Lane, London, SW1A 1AA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Number</label>
                  <input
                    type="text"
                    defaultValue="12345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                  <input
                    type="text"
                    defaultValue="GB123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { title: "Compliance Alerts", desc: "Get notified when certificates are expiring", icon: Shield },
                  { title: "Maintenance Updates", desc: "Updates on job status changes", icon: Building2 },
                  { title: "New Tenant Applications", desc: "When a new tenant submits an application", icon: Users },
                  { title: "Payment Notifications", desc: "Deposit payments and cost approvals", icon: CreditCard },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 text-indigo-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <Mail className="h-4 w-4 ml-2 text-gray-400" />
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <Smartphone className="h-4 w-4 ml-2 text-gray-400" />
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <Globe className="h-4 w-4 ml-2 text-gray-400" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                  Update Password
                </button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Authenticator App</p>
                    <p className="text-sm text-gray-500">Use an authenticator app for 2FA</p>
                  </div>
                  <button className="px-3 py-1.5 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm font-medium">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Billing & Subscription</h2>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-indigo-900">Professional Plan</p>
                    <p className="text-sm text-indigo-700">Up to 100 properties</p>
                  </div>
                  <span className="text-2xl font-bold text-indigo-900">$99/mo</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-6 bg-blue-600 rounded mr-3 flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <span className="text-gray-900">**** **** **** 4242</span>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                  + Invite Member
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
                  { name: "Jane Smith", email: "jane@example.com", role: "Property Manager", status: "Active" },
                  { name: "Bob Wilson", email: "bob@example.com", role: "Agent", status: "Pending" },
                ].map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium mr-3">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        member.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {member.status}
                      </span>
                      <select className="text-sm border border-gray-300 rounded-lg px-2 py-1">
                        <option>{member.role}</option>
                        <option>Admin</option>
                        <option>Property Manager</option>
                        <option>Agent</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
