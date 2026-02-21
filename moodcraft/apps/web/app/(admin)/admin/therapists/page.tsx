'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AppHeader } from '@/components/shared/app-header';
import {
  Stethoscope,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Shield,
  FileText,
  GraduationCap,
  Languages,
  Heart,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

interface TherapistApplication {
  id: string;
  userId: string;
  name: string;
  email: string;
  licenseNumber: string;
  licenseState: string;
  licenseType?: string;
  yearsExperience: number | null;
  specializations: string[];
  languages: string[];
  bio: string | null;
  approachDescription: string | null;
  qualifications: { degree: string; institution: string; year: string }[];
  isVerified: boolean;
  isAvailable: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TherapistVerificationPage() {
  const [applications, setApplications] = useState<TherapistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<TherapistApplication | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/therapists');
      const data = await res.json();
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (applicationId: string) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/therapists/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistProfileId: applicationId,
          action: 'approve',
        }),
      });

      if (res.ok) {
        await fetchApplications();
        setSelectedApp(null);
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/therapists/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistProfileId: applicationId,
          action: 'reject',
          reason: rejectionReason,
        }),
      });

      if (res.ok) {
        await fetchApplications();
        setSelectedApp(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setProcessing(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesTab =
      activeTab === 'pending'
        ? !app.isVerified && app.verificationStatus !== 'REJECTED'
        : activeTab === 'approved'
        ? app.isVerified
        : app.verificationStatus === 'REJECTED';

    const matchesSearch =
      !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </main>
    );
  }

  // Detail View
  if (selectedApp) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-600/3 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-white mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Applications
              </Button>

              {/* Application Header */}
              <Card className="bg-white/[0.03] border-white/10 mb-6 overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-veil-600/20 relative">
                  <div className="absolute -bottom-8 left-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-4 border-[#0a0a12] flex items-center justify-center">
                      <User className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={
                        selectedApp.isVerified
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : selectedApp.verificationStatus === 'REJECTED'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }
                    >
                      {selectedApp.isVerified
                        ? 'Verified'
                        : selectedApp.verificationStatus === 'REJECTED'
                        ? 'Rejected'
                        : 'Pending Review'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="pt-12 pb-6">
                  <h2 className="text-xl font-bold text-white">{selectedApp.name}</h2>
                  <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    {selectedApp.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Applied: {new Date(selectedApp.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* License Info */}
                <Card className="bg-white/[0.03] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      License Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">License Number</span>
                      <span className="text-white font-mono">{selectedApp.licenseNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">State/Region</span>
                      <span className="text-white">{selectedApp.licenseState}</span>
                    </div>
                    {selectedApp.licenseType && (
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Type</span>
                        <span className="text-white">{selectedApp.licenseType}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Experience</span>
                      <span className="text-white">{selectedApp.yearsExperience || 0} years</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Qualifications */}
                <Card className="bg-white/[0.03] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      Qualifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedApp.qualifications?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedApp.qualifications.map((qual, i) => (
                          <div key={i} className="p-3 bg-white/5 rounded-lg">
                            <p className="text-white font-medium">{qual.degree}</p>
                            <p className="text-sm text-gray-400">
                              {qual.institution} {qual.year && `(${qual.year})`}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No qualifications listed</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Specializations & Languages */}
              <Card className="bg-white/[0.03] border-white/10 mb-6">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.specializations?.length > 0 ? (
                        selectedApp.specializations.map((spec) => (
                          <Badge
                            key={spec}
                            variant="outline"
                            className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                          >
                            {spec}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">None listed</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.languages?.map((lang) => (
                        <Badge
                          key={lang}
                          variant="outline"
                          className="bg-veil-500/10 text-veil-400 border-veil-500/30"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bio & Approach */}
              {(selectedApp.bio || selectedApp.approachDescription) && (
                <Card className="bg-white/[0.03] border-white/10 mb-6">
                  <CardContent className="p-6 space-y-4">
                    {selectedApp.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-veil-400" />
                          Professional Bio
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{selectedApp.bio}</p>
                      </div>
                    )}
                    {selectedApp.approachDescription && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-cyan-400" />
                          Therapeutic Approach
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {selectedApp.approachDescription}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {!selectedApp.isVerified && selectedApp.verificationStatus !== 'REJECTED' && (
                <Card className="bg-white/[0.03] border-white/10">
                  <CardContent className="p-6">
                    <h4 className="text-sm font-medium text-white mb-4">Verification Decision</h4>

                    <div className="mb-4">
                      <label className="text-sm text-gray-400 mb-2 block">
                        Rejection Reason (required if rejecting)
                      </label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide a reason for rejection..."
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleReject(selectedApp.id)}
                        disabled={processing}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Reject Application
                      </Button>
                      <Button
                        onClick={() => handleApprove(selectedApp.id)}
                        disabled={processing}
                        className="bg-gradient-to-r from-emerald-600 to-cyan-600"
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Approve & Verify
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedApp.verificationStatus === 'REJECTED' && selectedApp.verificationNotes && (
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-medium text-sm">Rejection Reason</p>
                        <p className="text-red-300/70 text-sm mt-1">{selectedApp.verificationNotes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </main>
      </>
    );
  }

  // List View
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-600/3 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-veil-600/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link href="/admin">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Stethoscope className="w-7 h-7 text-cyan-400" />
                    Therapist Verification
                  </h1>
                  <p className="text-gray-400 text-sm">Review and verify therapist applications</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email, or license..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white w-72"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card
                className={`bg-white/5 border-white/10 cursor-pointer transition-all ${
                  activeTab === 'pending' ? 'border-amber-500/50' : 'hover:border-white/20'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xl font-bold text-white">
                      {applications.filter((a) => !a.isVerified && a.verificationStatus !== 'REJECTED').length}
                    </p>
                    <p className="text-xs text-gray-400">Pending Review</p>
                  </div>
                </CardContent>
              </Card>
              <Card
                className={`bg-white/5 border-white/10 cursor-pointer transition-all ${
                  activeTab === 'approved' ? 'border-emerald-500/50' : 'hover:border-white/20'
                }`}
                onClick={() => setActiveTab('approved')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xl font-bold text-white">
                      {applications.filter((a) => a.isVerified).length}
                    </p>
                    <p className="text-xs text-gray-400">Verified</p>
                  </div>
                </CardContent>
              </Card>
              <Card
                className={`bg-white/5 border-white/10 cursor-pointer transition-all ${
                  activeTab === 'rejected' ? 'border-red-500/50' : 'hover:border-white/20'
                }`}
                onClick={() => setActiveTab('rejected')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-xl font-bold text-white">
                      {applications.filter((a) => a.verificationStatus === 'REJECTED').length}
                    </p>
                    <p className="text-xs text-gray-400">Rejected</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applications List */}
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  {activeTab === 'pending'
                    ? 'Pending Applications'
                    : activeTab === 'approved'
                    ? 'Verified Therapists'
                    : 'Rejected Applications'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No applications found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredApplications.map((app) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer group"
                        onClick={() => setSelectedApp(app)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                              <User className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{app.name}</p>
                              <p className="text-sm text-gray-400">{app.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-300 font-mono">{app.licenseNumber}</p>
                              <p className="text-xs text-gray-500">{app.licenseState}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        {app.specializations?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {app.specializations.slice(0, 3).map((spec) => (
                              <Badge
                                key={spec}
                                variant="outline"
                                className="text-xs bg-white/5 text-gray-400 border-white/10"
                              >
                                {spec}
                              </Badge>
                            ))}
                            {app.specializations.length > 3 && (
                              <Badge variant="outline" className="text-xs bg-white/5 text-gray-500 border-white/10">
                                +{app.specializations.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </>
  );
}
