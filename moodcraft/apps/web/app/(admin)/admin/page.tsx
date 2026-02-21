'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, Shield, FileText, Search, Settings, Stethoscope, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AdminData {
  metrics: {
    totalUsers: number;
    activeToday: number;
    newThisWeek: number;
    escalationsOpen: number;
  };
  recentUsers: { id: string; email: string; role: string; createdAt: string }[];
  recentAuditLogs: { id: string; action: string; actorId: string; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (json.success) setData(json.data);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-midnight p-8 flex items-center justify-center">
        <div className="oracle-spinner" />
      </main>
    );
  }

  return (
    <>
      
      <main className="min-h-screen bg-gradient-midnight p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold flex items-center gap-3">
                <Settings className="w-8 h-8 text-veil-400" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground">System management and compliance</p>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card">
              <CardContent className="p-4">
                <Users className="w-6 h-6 text-veil-400 mb-2" />
                <p className="text-2xl font-bold">{data?.metrics?.totalUsers || 0}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <Activity className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-2xl font-bold">{data?.metrics?.activeToday || 0}</p>
                <p className="text-xs text-muted-foreground">Active Today</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <Users className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-2xl font-bold">{data?.metrics?.newThisWeek || 0}</p>
                <p className="text-xs text-muted-foreground">New This Week</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <Shield className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-2xl font-bold">{data?.metrics?.escalationsOpen || 0}</p>
                <p className="text-xs text-muted-foreground">Open Escalations</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/therapists">
                <Card className="glass-card hover:border-cyan-500/50 transition-all cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Therapist Verification</h3>
                        <p className="text-xs text-muted-foreground">Review pending applications</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>User Management</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-64 bg-white/5"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data?.recentUsers?.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                      >
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{user.role}</Badge>
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => alert(`Edit user ${user.email} (Feature coming soon)`)}
                            >
                              Edit
                            </Button>
                        </div>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">No users found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Audit Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data?.recentAuditLogs?.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <p className="font-medium text-sm">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">{log.actorId?.slice(-6) || 'System'}</Badge>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">No audit logs</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span>Data Encryption (AES-256)</span>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span>Audit Logging</span>
                      <Badge variant="success">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span>Consent Management</span>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span>Data Anonymization</span>
                      <Badge variant="success">Configured</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
    </>
  );
}
