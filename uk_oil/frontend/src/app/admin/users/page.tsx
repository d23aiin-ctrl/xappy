"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  Building2,
  Phone,
  Mail,
} from "lucide-react";

interface User {
  badge_number: string;
  full_name: string;
  role: string;
  status: string;
  site_name?: string | null;
  phone_number: string;
  department?: string;
  job_title?: string;
}

const mockUsers: User[] = [
  { badge_number: "ADMIN001", full_name: "Vikram Mehta", role: "super_admin", status: "active", site_name: null, phone_number: "+919876543000", department: "IT", job_title: "System Administrator" },
  { badge_number: "HSE001", full_name: "Rajesh Sharma", role: "hse_manager", status: "active", site_name: "Mumbai Refinery", phone_number: "+919876543001", department: "HSE", job_title: "HSE Manager" },
  { badge_number: "HSE002", full_name: "Priya Desai", role: "hse_officer", status: "active", site_name: "Mumbai Refinery", phone_number: "+919876543002", department: "HSE", job_title: "HSE Officer" },
  { badge_number: "SUP001", full_name: "Amit Kumar", role: "supervisor", status: "active", site_name: "Mumbai Refinery", phone_number: "+919876543003", department: "Operations", job_title: "Shift Supervisor" },
  { badge_number: "SUP002", full_name: "Suresh Patil", role: "supervisor", status: "active", site_name: "Mumbai Refinery", phone_number: "+919876543004", department: "Operations", job_title: "Shift Supervisor" },
  { badge_number: "WRK001", full_name: "Ramesh Singh", role: "worker", status: "active", site_name: "Mumbai Refinery", phone_number: "+919876543005", department: "Operations", job_title: "Panel Operator" },
  { badge_number: "WRK002", full_name: "Ajay Yadav", role: "worker", status: "active", site_name: "Mumbai Refinery", phone_number: "+919876543006", department: "Operations", job_title: "Field Operator" },
  { badge_number: "CTR001", full_name: "Mohammed Khan", role: "contractor", status: "active", site_name: "Mumbai Refinery", phone_number: "+919876543010", department: "Contractor", job_title: "Scaffolder" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.badge_number.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: "bg-red-100 text-red-800",
      admin: "bg-red-100 text-red-800",
      hse_manager: "bg-emerald-100 text-emerald-800",
      hse_officer: "bg-emerald-100 text-emerald-800",
      compliance_officer: "bg-blue-100 text-blue-800",
      operations_director: "bg-purple-100 text-purple-800",
      supervisor: "bg-yellow-100 text-yellow-800",
      site_manager: "bg-orange-100 text-orange-800",
      worker: "bg-gray-100 text-gray-800",
      contractor: "bg-indigo-100 text-indigo-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage platform users and access permissions
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or badge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
        >
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="hse_manager">HSE Manager</option>
          <option value="hse_officer">HSE Officer</option>
          <option value="supervisor">Supervisor</option>
          <option value="worker">Worker</option>
          <option value="contractor">Contractor</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Supervisors</p>
          <p className="text-2xl font-bold text-yellow-600">
            {users.filter((u) => u.role === "supervisor").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Workers</p>
          <p className="text-2xl font-bold text-gray-600">
            {users.filter((u) => u.role === "worker").length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Badge
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <tr key={user.badge_number} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {user.full_name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.job_title}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-gray-600">
                    {user.badge_number}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="h-4 w-4 mr-1" />
                    {user.site_name || "All Sites"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
