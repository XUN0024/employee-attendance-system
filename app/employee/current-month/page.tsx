'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, Briefcase } from 'lucide-react';
import { getMonthlyAttendance, getAttendanceStats } from '@/lib/attendance';
import type { Employee, Attendance } from '@/lib/types';
import type { AttendanceStats } from '@/lib/attendance';
import { TableSkeleton, StatCardSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function CurrentMonthPage() {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [stats, setStats] = useState<AttendanceStats>({
        workDays: 0,
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        leaveDays: 0,
        attendanceRate: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedEmployee = localStorage.getItem('employee');
        if (storedEmployee) {
            const emp = JSON.parse(storedEmployee);
            setEmployee(emp);
            loadAttendanceData(emp.employee_id || emp.employeeId, selectedYear, selectedMonth);
        } else {
            setIsLoading(false);
        }
    }, [selectedYear, selectedMonth]);

    const loadAttendanceData = async (employeeId: string, year: number, month: number) => {
        setIsLoading(true);
        try {
            const [attendanceData, statsData] = await Promise.all([
                getMonthlyAttendance(employeeId, year, month),
                getAttendanceStats(employeeId, year, month),
            ]);

            setAttendance(attendanceData);
            setStats(statsData);
        } catch (err) {
            console.error('Error loading attendance data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const goToPreviousMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        // Don't allow navigating to future months
        if (selectedYear === currentYear && selectedMonth === currentMonth) {
            return;
        }

        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const goToCurrentMonth = () => {
        const today = new Date();
        setSelectedYear(today.getFullYear());
        setSelectedMonth(today.getMonth() + 1);
    };

    const getMonthName = (month: number) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1];
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            Present: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
            Late: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle },
            Absent: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
            Leave: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Briefcase },
        };

        const style = styles[status as keyof typeof styles] || styles.Present;
        const Icon = style.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
                <Icon className="h-3.5 w-3.5" />
                {status}
            </span>
        );
    };

    const formatTime = (timestamp: string | null) => {
        if (!timestamp) return '—';
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateWorkingHours = (checkIn: string, checkOut: string | null) => {
        if (!checkOut) return '—';

        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = end.getTime() - start.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    const isCurrentMonth = () => {
        const today = new Date();
        return selectedYear === today.getFullYear() && selectedMonth === (today.getMonth() + 1);
    };

    const canGoNext = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        return !(selectedYear === currentYear && selectedMonth === currentMonth);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortedAttendance = [...attendance].sort((a, b) => {
        const dateA = new Date(a.attendance_date).getTime();
        const dateB = new Date(b.attendance_date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div>
                        <Skeleton className="h-9 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="h-10 w-32 rounded-xl" />
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-10 w-32 rounded-xl" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-slate-50 rounded-xl p-4 border-l-4 border-slate-300">
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-8 w-12" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <TableSkeleton rows={10} />
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <p className="text-slate-600">Please log in to view attendance history</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Attendance History</h1>
                        <p className="text-sm text-slate-500 mt-1">View your personal attendance records</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-zinc-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={goToPreviousMonth}
                            className="flex items-center gap-2 px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            Previous
                        </button>

                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-slate-600" />
                            <h2 className="text-xl font-semibold text-slate-900">
                                {getMonthName(selectedMonth)} {selectedYear}
                            </h2>
                            {isCurrentMonth() && (
                                <span className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md font-medium">
                                    Current Month
                                </span>
                            )}
                            {!isCurrentMonth() && (
                                <button
                                    onClick={goToCurrentMonth}
                                    className="ml-2 px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                                >
                                    Go to Current
                                </button>
                            )}
                        </div>

                        <button
                            onClick={goToNextMonth}
                            disabled={!canGoNext()}
                            className="flex items-center gap-2 px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                        >
                            Next
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                        <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-slate-400">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-slate-600" />
                                <p className="text-xs text-slate-600 font-medium">Work Days</p>
                            </div>
                            <p className="text-2xl font-semibold text-slate-900">{stats.workDays}</p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <p className="text-xs text-blue-700 font-medium">Att. Days</p>
                            </div>
                            <p className="text-2xl font-semibold text-blue-900">{stats.totalDays}</p>
                        </div>

                        <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-400">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <p className="text-xs text-emerald-700 font-medium">Present</p>
                            </div>
                            <p className="text-2xl font-semibold text-emerald-900">{stats.presentDays}</p>
                        </div>

                        <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-400">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <p className="text-xs text-amber-700 font-medium">Late</p>
                            </div>
                            <p className="text-2xl font-semibold text-amber-900">{stats.lateDays}</p>
                        </div>

                        <div className="bg-sky-50 rounded-lg p-4 border-l-4 border-sky-400">
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="h-4 w-4 text-sky-600" />
                                <p className="text-xs text-sky-700 font-medium">Leave</p>
                            </div>
                            <p className="text-2xl font-semibold text-sky-900">{stats.leaveDays}</p>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                                <p className="text-xs text-purple-700 font-medium">Att. Rate</p>
                            </div>
                            <p className="text-2xl font-semibold text-purple-900">{stats.attendanceRate}%</p>
                        </div>
                    </div>
                </div>

                {/* Employee Table */}
                <div className="bg-white rounded-lg border border-zinc-200">
                    <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Daily Records</h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Read-only view of your attendance records
                            </p>
                        </div>
                        <button
                            onClick={toggleSortOrder}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                        >
                            <Calendar className="h-4 w-4" />
                            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                        </button>
                    </div>

                    {attendance.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No attendance records for this month</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-slate-50">
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Date</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Check In</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Check Out</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Working Hours</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {sortedAttendance.map((record) => (
                                        <tr key={record.attendance_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4 text-sm font-medium text-slate-900">
                                                {formatDate(record.attendance_date)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm text-slate-900">
                                                        {formatTime(record.attendance_check_in)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm text-slate-900">
                                                        {formatTime(record.attendance_check_out)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {calculateWorkingHours(record.attendance_check_in, record.attendance_check_out)}
                                            </td>
                                            <td className="py-4 px-4">
                                                {getStatusBadge(record.attendance_status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Attendance Summary</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li><strong>Work Days:</strong> Total working days in the month (excluding weekends)</li>
                                <li><strong>Att. Days:</strong> Days you actually clocked in/out</li>
                                <li><strong>Attendance Rate:</strong> (Att. Days / Work Days) × 100%</li>
                                <li>This is a read-only view. Contact HR for any discrepancies.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
