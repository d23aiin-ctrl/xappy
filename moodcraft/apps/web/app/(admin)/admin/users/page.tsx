'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Trash,
  Eye,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastActive: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleAddUser = () => {
    toast({
      title: 'Add User',
      description: 'User creation form coming soon.',
    });
  };

  const handleViewUser = (user: User) => {
    toast({
      title: 'View User',
      description: `Viewing details for ${user.name}`,
    });
  };

  const handleEditUser = (user: User) => {
    toast({
      title: 'Edit User',
      description: `Editing ${user.name}`,
    });
  };

  const handleDeleteUser = (user: User) => {
    toast({
      title: 'Delete User',
      description: `Are you sure you want to delete ${user.name}?`,
      variant: 'destructive',
    });
  };

  useEffect(() => {
    // Simulated data
    setUsers([
      { id: '1', name: 'Maya Chen', email: 'maya@demo.cerebro.app', role: 'INDIVIDUAL', status: 'active', createdAt: '2024-01-10', lastActive: '2 hours ago' },
      { id: '2', name: 'James Wright', email: 'james@demo.cerebro.app', role: 'INDIVIDUAL', status: 'active', createdAt: '2024-01-08', lastActive: '1 day ago' },
      { id: '3', name: 'Dr. Elena Rodriguez', email: 'therapist@cerebro.app', role: 'THERAPIST', status: 'active', createdAt: '2024-01-05', lastActive: '3 hours ago' },
      { id: '4', name: 'Sarah Mitchell', email: 'hr@techflow.io', role: 'HR', status: 'active', createdAt: '2024-01-12', lastActive: '1 hour ago' },
      { id: '5', name: 'John Admin', email: 'admin@cerebro.app', role: 'ADMIN', status: 'active', createdAt: '2024-01-01', lastActive: 'Just now' },
      { id: '6', name: 'Inactive User', email: 'inactive@demo.app', role: 'INDIVIDUAL', status: 'inactive', createdAt: '2023-12-01', lastActive: '30 days ago' },
    ]);
    setLoading(false);
  }, []);

  const roleColors: Record<string, string> = {
    INDIVIDUAL: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    THERAPIST: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    HR: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ADMIN: 'bg-veil-500/20 text-veil-400 border-veil-500/30',
    SUPER_ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400',
    inactive: 'bg-gray-500/20 text-gray-400',
    suspended: 'bg-red-500/20 text-red-400',
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="oracle-spinner" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-7 h-7 text-emerald-400" />
                User Management
              </h1>
              <p className="text-gray-400 mt-1">Manage all platform users</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={handleAddUser}>
              <Users className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/[0.02] border-white/10 p-4">
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </Card>
            <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold text-emerald-400">{users.filter((u) => u.status === 'active').length}</p>
            </Card>
            <Card className="bg-cyan-500/5 border-cyan-500/20 p-4">
              <p className="text-sm text-gray-400">Therapists</p>
              <p className="text-2xl font-bold text-cyan-400">{users.filter((u) => u.role === 'THERAPIST').length}</p>
            </Card>
            <Card className="bg-amber-500/5 border-amber-500/20 p-4">
              <p className="text-sm text-gray-400">HR Users</p>
              <p className="text-2xl font-bold text-amber-400">{users.filter((u) => u.role === 'HR').length}</p>
            </Card>
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <Button
              variant="outline"
              className={`border-white/10 ${showFilters ? 'bg-white/10' : ''}`}
              onClick={() => {
                setShowFilters(!showFilters);
                toast({
                  title: showFilters ? 'Filters hidden' : 'Filters shown',
                  description: 'Filter options coming soon.',
                });
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Users Table */}
          <Card className="bg-white/[0.02] border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Role</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Last Active</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={roleColors[user.role]}>{user.role}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[user.status]}>{user.status}</Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{user.lastActive}</td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10">
                            <DropdownMenuItem onClick={() => handleViewUser(user)} className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="cursor-pointer text-red-400">
                              <Trash className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
