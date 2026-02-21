'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  time: string;
  duration: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'confirmed' | 'pending' | 'completed';
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CURRENT_WEEK = [22, 23, 24, 25, 26, 27, 28];

export default function SchedulePage() {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState(24);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const handleNewAppointment = () => {
    toast({
      title: 'New Appointment',
      description: 'Appointment scheduling form coming soon.',
    });
  };

  const handlePrevWeek = () => {
    setCurrentWeekOffset(currentWeekOffset - 1);
    toast({ description: 'Showing previous week' });
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset(currentWeekOffset + 1);
    toast({ description: 'Showing next week' });
  };

  const handleJoinCall = (patientId: string) => {
    toast({
      title: 'Joining video call',
      description: `Starting video session with ${patientId}`,
    });
  };

  const handlePhoneCall = (patientId: string) => {
    toast({
      title: 'Starting call',
      description: `Initiating phone call with ${patientId}`,
    });
  };

  const appointments: Appointment[] = [
    { id: '1', patientId: 'P-7829', time: '09:00 AM', duration: '50 min', type: 'video', status: 'confirmed' },
    { id: '2', patientId: 'P-4521', time: '10:30 AM', duration: '50 min', type: 'phone', status: 'confirmed' },
    { id: '3', patientId: 'P-9012', time: '02:00 PM', duration: '50 min', type: 'video', status: 'pending' },
    { id: '4', patientId: 'P-3345', time: '04:00 PM', duration: '30 min', type: 'phone', status: 'confirmed' },
  ];

  const typeIcons = {
    video: <Video className="w-4 h-4" />,
    phone: <Phone className="w-4 h-4" />,
    'in-person': <User className="w-4 h-4" />,
  };

  const statusColors = {
    confirmed: 'bg-emerald-500/20 text-emerald-400',
    pending: 'bg-amber-500/20 text-amber-400',
    completed: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Calendar className="w-7 h-7 text-cyan-400" />
                Schedule
              </h1>
              <p className="text-gray-400 mt-1">Manage your patient appointments</p>
            </div>
            <Button className="bg-cyan-600 hover:bg-cyan-500" onClick={handleNewAppointment}>
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">January 2024</h3>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="w-8 h-8" onClick={handlePrevWeek}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="w-8 h-8" onClick={handleNextWeek}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Week view */}
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, i) => (
                  <div key={day} className="text-center">
                    <p className="text-xs text-gray-500 mb-2">{day}</p>
                    <button
                      onClick={() => setSelectedDay(CURRENT_WEEK[i])}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                        selectedDay === CURRENT_WEEK[i]
                          ? 'bg-cyan-500 text-white'
                          : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      {CURRENT_WEEK[i]}
                    </button>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">{appointments.length}</p>
                    <p className="text-xs text-gray-500">Today's Sessions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">
                      {appointments.filter((a) => a.status === 'confirmed').length}
                    </p>
                    <p className="text-xs text-gray-500">Confirmed</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Appointments List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                January {selectedDay}, 2024
              </h3>

              {appointments.map((apt, i) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-white/[0.02] border-white/10 p-4 hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-white">{apt.time.split(' ')[0]}</p>
                          <p className="text-xs text-gray-500">{apt.time.split(' ')[1]}</p>
                        </div>
                        <div className="w-px h-12 bg-white/10" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{apt.patientId}</h4>
                            <Badge className={statusColors[apt.status]}>
                              {apt.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              {typeIcons[apt.type]}
                              {apt.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {apt.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {apt.type === 'video' && (
                          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500" onClick={() => handleJoinCall(apt.patientId)}>
                            <Video className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        )}
                        {apt.type === 'phone' && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => handlePhoneCall(apt.patientId)}>
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {appointments.length === 0 && (
                <Card className="bg-white/[0.02] border-white/10 p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No appointments scheduled</p>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
