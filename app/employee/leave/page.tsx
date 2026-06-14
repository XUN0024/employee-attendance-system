'use client';

import { useState, useEffect } from 'react';
import { Calendar, FileText, Loader2, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';
import { submitLeaveRequest, getEmployeeLeaveRequests } from '@/lib/leave';
import type { Employee, LeaveRequest } from '@/lib/types';

export default function LeavePage() {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    // Form fields
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [leaveType, setLeaveType] = useState<'Annual' | 'Sick' | 'Emergency' | 'Medical'>('Annual');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const storedEmployee = localStorage.getItem('employee');
        if (storedEmployee) {
            const emp = JSON.parse(storedEmployee);
            setEmployee(emp);
            loadLeaveRequests(emp.employee_id || emp.employeeId);
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadLeaveRequests = async (employeeId: string) => {
        setIsLoading(true);
        try {
            const result = await getEmployeeLeaveRequests(employeeId);
            if (result.success && result.requests) {
                setLeaveRequests(result.requests);
            }
        } catch (err) {
            console.error('Error loading leave requests:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employee) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const result = await submitLeaveRequest(
                employee.employee_id || (employee as any).employeeId,
                startDate,
                endDate,
                leaveType,
                reason
            );

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Leave request submitted successfully!',
                });
                setShowForm(false);
                setStartDate('');
                setEndDate('');
                setReason('');
                loadLeaveRequests(employee.employee_id || (employee as any).employeeId);
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Failed to submit leave request',
                });
            }
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'An error occurred',
            });
        } finally {
            setIsSubmitting(false);
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'Rejected':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const calculateDays = (start: string, end: string) => {
        const startD = new Date(start);
        const endD = new Date(end);
        const diff = Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24));
        return diff + 1;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <p className="text-slate-600">Please log in to access leave requests</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Leave Requests</h1>
                        <p className="text-sm text-slate-500 mt-1">Submit and track your leave applications</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        New Request
                    </button>
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-lg border flex items-start gap-3 ${
                            message.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-red-50 border-red-200'
                        }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <p
                            className={`text-sm font-medium ${
                                message.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                            }`}
                        >
                            {message.text}
                        </p>
                    </div>
                )}

                {showForm && (
                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Submit Leave Request</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Leave Type
                                </label>
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="Annual">Annual Leave</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Emergency">Emergency Leave</option>
                                    <option value="Medical">Medical Leave</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief explanation for your leave request..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>Submit Request</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-lg border border-zinc-200">
                    <div className="p-6 border-b border-zinc-200">
                        <h2 className="text-lg font-semibold text-slate-900">My Leave Requests</h2>
                    </div>
                    <div className="divide-y divide-zinc-200">
                        {leaveRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No leave requests yet</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    Click "New Request" to submit your first leave application
                                </p>
                            </div>
                        ) : (
                            leaveRequests.map((request) => (
                                <div key={request.leave_id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-slate-900">
                                                    {request.leave_type} Leave
                                                </h3>
                                                <span
                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${getStatusBadge(
                                                        request.leave_status
                                                    )}`}
                                                >
                                                    {getStatusIcon(request.leave_status)}
                                                    {request.leave_status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(request.start_date).toLocaleDateString()} -{' '}
                                                    {new Date(request.end_date).toLocaleDateString()}
                                                </div>
                                                <span className="text-slate-400">•</span>
                                                <span>
                                                    {calculateDays(request.start_date, request.end_date)} day(s)
                                                </span>
                                            </div>
                                            {request.reason && (
                                                <p className="text-sm text-slate-600 mt-2">{request.reason}</p>
                                            )}
                                            <p className="text-xs text-slate-400 mt-2">
                                                Submitted on {new Date(request.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
