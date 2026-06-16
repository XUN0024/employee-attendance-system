'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, FileText, TrendingUp, AlertCircle, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { AdminStatsSkeleton, ListSkeleton, Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
    totalEmployees: number;
    totalAdmins: number;
    pendingLeaveRequests: number;
    todayAttendance: number;
}

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalEmployees: 0,
        totalAdmins: 0,
        pendingLeaveRequests: 0,
        todayAttendance: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // Load total employees
            const { data: employees, error: empError } = await supabase
                .from('employees')
                .select('employee_id, role');

            if (!empError && employees) {
                setStats(prev => ({
                    ...prev,
                    totalEmployees: employees.length,
                    totalAdmins: employees.filter(e => e.role === 'admin').length,
                }));
            }

            // Load pending leave requests
            const { data: leaveRequests, error: leaveError } = await supabase
                .from('leave_requests')
                .select('leave_id')
                .eq('leave_status', 'Pending');

            if (!leaveError && leaveRequests) {
                setStats(prev => ({
                    ...prev,
                    pendingLeaveRequests: leaveRequests.length,
                }));
            }

            // Load today's attendance count
            const today = new Date().toISOString().split('T')[0];
            const { data: attendance, error: attError } = await supabase
                .from('attendances')
                .select('attendance_id')
                .eq('attendance_date', today);

            if (!attError && attendance) {
                setStats(prev => ({
                    ...prev,
                    todayAttendance: attendance.length,
                }));
            }

            // Load recent leave requests for activity feed
            const { data: recentLeaves, error: recentError } = await supabase
                .from('leave_requests')
                .select(`
                    leave_id,
                    leave_status,
                    leave_type,
                    created_at,
                    employees (employee_name)
                `)
                .order('created_at', { ascending: false })
                .limit(5);

            if (!recentError && recentLeaves) {
                setRecentActivity(recentLeaves);
            }
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved':
                return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
            case 'Rejected':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock className="h-4 w-4 text-amber-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            Pending: 'bg-amber-50 text-amber-700 border-amber-200',
            Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            Rejected: 'bg-red-50 text-red-700 border-red-200',
        };
        return styles[status as keyof typeof styles] || styles.Pending;
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div>
                        <Skeleton className="h-9 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    
                    <AdminStatsSkeleton />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ListSkeleton items={5} />
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <Skeleton className="h-6 w-32 mb-6" />
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">{currentDate}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Link
                        href="/admin/employees"
                        className="bg-white rounded-lg border border-zinc-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Total Employees</h3>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900">{stats.totalEmployees}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            {stats.totalAdmins} administrators
                        </p>
                    </Link>

                    <Link
                        href="/admin/leave-approvals"
                        className="bg-white rounded-lg border border-zinc-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Pending Leave Requests</h3>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900">{stats.pendingLeaveRequests}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Requires action
                        </p>
                    </Link>

                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Today's Attendance</h3>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900">{stats.todayAttendance}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Employees checked in
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Attendance Rate</h3>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900">
                            {stats.totalEmployees > 0 
                                ? Math.round((stats.todayAttendance / stats.totalEmployees) * 100)
                                : 0}%
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            Of total employees
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Leave Requests */}
                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-900">Recent Leave Requests</h2>
                            <Link
                                href="/admin/leave-approvals"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                View All →
                            </Link>
                        </div>

                        {recentActivity.length === 0 ? (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">No recent leave requests</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.leave_id}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="mt-1">
                                            {getStatusIcon(activity.leave_status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900">
                                                {activity.employees?.employee_name || 'Unknown Employee'}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {activity.leave_type} Leave
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {formatTimeAgo(activity.created_at)}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadge(
                                                activity.leave_status
                                            )}`}
                                        >
                                            {activity.leave_status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-6">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/admin/add-employee"
                                className="flex items-center gap-3 p-4 border border-zinc-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Add New Employee</p>
                                    <p className="text-sm text-slate-500">Create a new employee account</p>
                                </div>
                            </Link>

                            <Link
                                href="/admin/leave-approvals"
                                className="flex items-center gap-3 p-4 border border-zinc-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <FileText className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Review Leave Requests</p>
                                    <p className="text-sm text-slate-500">
                                        {stats.pendingLeaveRequests} pending approval
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="/admin/employees"
                                className="flex items-center gap-3 p-4 border border-zinc-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Users className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">View All Employees</p>
                                    <p className="text-sm text-slate-500">Manage employee accounts</p>
                                </div>
                            </Link>

                            <Link
                                href="/admin/reports"
                                className="flex items-center gap-3 p-4 border border-zinc-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Generate Reports</p>
                                    <p className="text-sm text-slate-500">Monthly attendance reports</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">System Information</p>
                            <p className="text-blue-700">
                                FEIJIP Employee Attendance System - Administrator Portal. 
                                All attendance timestamps are recorded using server time to prevent manipulation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
