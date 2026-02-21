'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Shield,
  GraduationCap,
  Languages,
  Clock,
  Heart,
  CheckCircle,
  MessageCircle,
  Calendar,
} from 'lucide-react';

export interface TherapistData {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  specializations?: string[];
  languages?: string[];
  yearsExperience?: number | null;
  approachDescription?: string | null;
  qualifications?: { degree: string; institution: string; year: string }[];
  isVerified: boolean;
  isAvailable: boolean;
}

interface TherapistProfileCardProps {
  therapist: TherapistData;
  variant?: 'compact' | 'full';
  showActions?: boolean;
  onMessage?: () => void;
  onSchedule?: () => void;
}

export function TherapistProfileCard({
  therapist,
  variant = 'full',
  showActions = true,
  onMessage,
  onSchedule,
}: TherapistProfileCardProps) {
  const specializations = therapist.specializations || [];
  const languages = therapist.languages || ['English'];
  const qualifications = therapist.qualifications || [];

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            {therapist.avatarUrl ? (
              <img
                src={therapist.avatarUrl}
                alt={therapist.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-cyan-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">{therapist.name}</h3>
              {therapist.isVerified && (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-400 truncate">
              {specializations.slice(0, 2).join(' • ')}
              {specializations.length > 2 && ` +${specializations.length - 2}`}
            </p>
          </div>

          {/* Status */}
          <Badge
            className={`${
              therapist.isAvailable
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
            }`}
          >
            {therapist.isAvailable ? 'Available' : 'Busy'}
          </Badge>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/[0.03] border-white/10 overflow-hidden">
        {/* Header with gradient */}
        <div className="h-24 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-veil-600/20 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-4 border-[#0a0a12] flex items-center justify-center">
              {therapist.avatarUrl ? (
                <img
                  src={therapist.avatarUrl}
                  alt={therapist.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-cyan-400" />
              )}
            </div>
          </div>
        </div>

        <CardHeader className="pt-14 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl text-white">{therapist.name}</CardTitle>
                {therapist.isVerified && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Verified</span>
                  </div>
                )}
              </div>
              {therapist.yearsExperience && (
                <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {therapist.yearsExperience}+ years of experience
                </p>
              )}
            </div>
            <Badge
              className={`${
                therapist.isAvailable
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}
            >
              {therapist.isAvailable ? 'Available' : 'Currently Busy'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Bio */}
          {therapist.bio && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-veil-400" />
                About
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">{therapist.bio}</p>
            </div>
          )}

          {/* Approach */}
          {therapist.approachDescription && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Therapeutic Approach
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {therapist.approachDescription}
              </p>
            </div>
          )}

          {/* Specializations */}
          {specializations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec) => (
                  <Badge
                    key={spec}
                    variant="outline"
                    className="text-xs bg-cyan-500/5 text-cyan-400 border-cyan-500/20"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Qualifications */}
          {qualifications.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                Education
              </h4>
              <div className="space-y-2">
                {qualifications.map((qual, i) => (
                  <div key={i} className="text-sm text-gray-400">
                    <span className="font-medium text-gray-300">{qual.degree}</span>
                    {qual.institution && ` — ${qual.institution}`}
                    {qual.year && ` (${qual.year})`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4 text-blue-400" />
                Languages
              </h4>
              <p className="text-sm text-gray-400">{languages.join(', ')}</p>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Button
                onClick={onMessage}
                variant="outline"
                className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button
                onClick={onSchedule}
                className="flex-1 bg-gradient-to-r from-veil-600 to-veil-500 hover:from-veil-500 hover:to-veil-400"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
