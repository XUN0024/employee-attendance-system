'use client';

import { Calendar, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getTodayAttendance } from '@/lib/attendance';
import type { Employee } from '@/lib/types';

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

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">
                            Welcome back, {employee?.employee_name || mockData.employee.name}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">{currentDate}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`p-2 rounded-lg ${todayStatus === 'Checked In' ? 'bg-emerald-50' : 'bg-slate-50'}`}
                            >
                                <CheckCircle2
                                    className={`h-5 w-5 ${todayStatus === 'Checked In' ? 'text-emerald-600' : 'text-slate-400'}`}
                                />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Today's Status</h3>
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">{todayStatus}</p>
                        {checkInTime && (
                            <>
                                <p className="text-sm text-slate-500 mt-1">at {checkInTime}</p>
                                {attendanceStatus && (
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium mt-2 ${attendanceStatus === 'Present'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-amber-50 text-amber-700'
                                            }`}
                                    >
                                        {attendanceStatus}
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Days Present</h3>
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">{mockData.employee.totalPresent}</p>
                        <p className="text-sm text-slate-500 mt-1">This month</p>
                    </div>

                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Late Arrivals</h3>
                        </div>
                        <p className="text-2xl font-semibold text-slate-900">{mockData.employee.lateArrivals}</p>
                        <p className="text-sm text-slate-500 mt-1">This month</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-zinc-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent Attendance Activity</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-200">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Day
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Check In
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Check Out
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {mockData.recentActivity.map((record, index) => (
                                    <tr key={index} className="hover:bg-zinc-50 transition-colors">
                                        <td className="py-4 px-4 text-sm text-slate-900">{record.date}</td>
                                        <td className="py-4 px-4 text-sm text-slate-600">{record.day}</td>
                                        <td className="py-4 px-4 text-sm text-slate-900">{record.checkIn}</td>
                                        <td className="py-4 px-4 text-sm text-slate-900">{record.checkOut}</td>
                                        <td className="py-4 px-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${record.status === 'On Time'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : record.status === 'Late'
                                                        ? 'bg-amber-50 text-amber-700'
                                                        : 'bg-slate-50 text-slate-600'
                                                    }`}
                                            >
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Mark Today's Attendance</h3>
                            <p className="text-sm text-slate-600">
                                {todayStatus === 'Checked In'
                                    ? "Don't forget to clock out before leaving"
                                    : "Don't forget to log your check-in time"}
                            </p>
                        </div>
                        <Link
                            href="/employee/mark"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            Mark Attendance
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
