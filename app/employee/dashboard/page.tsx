'use client';

import { Calendar, Clock, CheckCircle2, ArrowRight, User, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getTodayAttendance } from '@/lib/attendance';
import type { Employee } from '@/lib/types';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { PageHeader, StatCard } from '@/components/ui/page-header';

const mockData = {
    employee: {
        name: 'Sarah Chen',
        totalPresent: 18,
        lateArrivals: 2,
    },
    recentActivity: [
        { date: '2026-05-19', day: 'Monday', checkIn: '08:52 AM', checkOut: '05:30 PM', status: 'On Time' },
        { date: '2026-05-18', day: 'Sunday', checkIn: '—', checkOut: '—', status: 'Weekend' },
        { date: '2026-05-17', day: 'Saturday', checkIn: '—', checkOut: '—', status: 'Weekend' },
        { date: '2026-05-16', day: 'Friday', checkIn: '09:15 AM', checkOut: '05:45 PM', status: 'Late' },
        { date: '2026-05-15', day: 'Thursday', checkIn: '08:48 AM', checkOut: '05:20 PM', status: 'On Time' },
    ],
};

export default function EmployeeDashboard() {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [todayStatus, setTodayStatus] = useState<string>('Not Clocked In');
    const [checkInTime, setCheckInTime] = useState<string>('');
    const [attendanceStatus, setAttendanceStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedEmployee = localStorage.getItem('employee');
        if (storedEmployee) {
            const emp = JSON.parse(storedEmployee);
            setEmployee(emp);
            loadTodayAttendance(emp.employee_id);
        } else {
            setIsLoading(false);
        }

        const interval = setInterval(() => {
            if (storedEmployee) {
                const emp = JSON.parse(storedEmployee);
                loadTodayAttendance(emp.employee_id);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadTodayAttendance = async (employeeId: string) => {
        try {
            const status = await getTodayAttendance(employeeId);

            if (status.hasCheckedIn && status.attendance) {
                setTodayStatus('Checked In');
                setCheckInTime(
                    new Date(status.attendance.attendance_check_in).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                );
                setAttendanceStatus(status.attendance.attendance_status);
            } else {
                setTodayStatus('Not Clocked In');
                setCheckInTime('');
                setAttendanceStatus('');
            }
        } catch (err) {
            console.error('Error loading attendance:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <PageHeader
                    title={`Welcome back, ${employee?.employee_name || mockData.employee.name}!`}
                    subtitle={currentDate}
                    icon={<User className="h-7 w-7 text-white" />}
                    gradient={true}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={<CheckCircle2 className="h-6 w-6" />}
                        label="Today's Status"
                        value={todayStatus}
                        subtitle={checkInTime ? `at ${checkInTime}` : 'Not checked in yet'}
                        color={todayStatus === 'Checked In' ? 'emerald' : 'slate'}
                    />

                    <StatCard
                        icon={<Calendar className="h-6 w-6" />}
                        label="Days Present"
                        value={mockData.employee.totalPresent}
                        subtitle="This month"
                        color="blue"
                    />

                    <StatCard
                        icon={<Clock className="h-6 w-6" />}
                        label="Late Arrivals"
                        value={mockData.employee.lateArrivals}
                        subtitle="This month"
                        color="amber"
                    />
                </div>

                {/* Enhanced CTA Card */}
                <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 rounded-2xl p-8 shadow-2xl overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">
                                    Mark Today's Attendance
                                </h3>
                            </div>
                            <p className="text-blue-100 text-base">
                                {todayStatus === 'Checked In'
                                    ? "Don't forget to clock out before leaving"
                                    : "Don't forget to log your check-in time"}
                            </p>
                        </div>
                        <Link
                            href="/employee/mark"
                            className="flex items-center gap-3 bg-white hover:bg-blue-50 text-blue-600 px-8 py-4 rounded-xl text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            Mark Attendance
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
