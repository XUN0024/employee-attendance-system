'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Loader2, FileText, User, Clock } from 'lucide-react';
import { getPendingLeaveRequests, getAllLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '@/lib/leave';
import type { LeaveRequest } from '@/lib/types';

interface LeaveRequestWithEmployee extends LeaveRequest {
    employees?: {
        employee_name: string;
        employee_email: string;
    };
}

export default function LeaveApprovalsPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequestWithEmployee[]>([]);
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadLeaveRequests();
    }, [filter]);

    const loadLeaveRequests = async () => {
        setIsLoading(true);
        try {
            const result = filter === 'pending' 
                ? await getPendingLeaveRequests()
                : await getAllLeaveRequests();
                
            if (result.success && result.requests) {
                setLeaveRequests(result.requests as any);
            }
        } catch (err) {
            console.error('Error loading leave requests:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (leaveId: string) => {
        setProcessingId(leaveId);
        setMessage(null);

        try {
            const result = await approveLeaveRequest(leaveId);
            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Leave request approved successfully!',
                });
                loadLeaveRequests();
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Failed to approve request',
                });
            }
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'An error occurred',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (leaveId: string) => {
        setProcessingId(leaveId);
        setMessage(null);

        try {
            const result = await rejectLeaveRequest(leaveId);
            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Leave request rejected',
                });
                loadLeaveRequests();
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Failed to reject request',
                });
            }
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'An error occurred',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const calculateDays = (start: string, end: string) => {
        const startD = new Date(start);
        const endD = new Date(end);
        const diff = Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24));
        return diff + 1;
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            Pending: 'bg-amber-50 text-amber-700 border-amber-200',
            Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            Rejected: 'bg-red-50 text-red-700 border-red-200',
        };
        return styles[status as keyof typeof styles] || styles.Pending;
    };

    const getLeaveTypeColor = (type: string) => {
        const colors = {
            Annual: 'bg-blue-100 text-blue-700',
            Sick: 'bg-purple-100 text-purple-700',
            Emergency: 'bg-orange-100 text-orange-700',
            Medical: 'bg-pink-100 text-pink-700',
        };
        return colors[type as keyof typeof colors] || colors.Annual;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Leave Approvals</h1>
                    <p className="text-sm text-slate-500 mt-1">Review and approve employee leave requests</p>
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
                            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
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

                <div className="flex gap-2 border-b border-zinc-200">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            filter === 'pending'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Pending
                        {filter === 'pending' && leaveRequests.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {leaveRequests.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            filter === 'all'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        All Requests
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {leaveRequests.length === 0 ? (
                        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">
                                {filter === 'pending' ? 'No pending leave requests' : 'No leave requests found'}
                            </p>
                        </div>
                    ) : (
                        leaveRequests.map((request) => (
                            <div
                                key={request.leave_id}
                                className="bg-white rounded-lg border border-zinc-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">
                                                    {request.employees?.employee_name || 'Unknown Employee'}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    {request.employees?.employee_email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className={`px-3 py-1 rounded-md text-sm font-medium ${getLeaveTypeColor(request.leave_type)}`}>
                                                {request.leave_type} Leave
                                            </span>
                                            <span className={`px-3 py-1 rounded-md text-sm font-medium border ${getStatusBadge(request.leave_status)}`}>
                                                {request.leave_status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {new Date(request.start_date).toLocaleDateString()} -{' '}
                                                    {new Date(request.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Clock className="h-4 w-4" />
                                                <span>{calculateDays(request.start_date, request.end_date)} day(s)</span>
                                            </div>
                                        </div>

                                        {request.reason && (
                                            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                                <p className="text-sm text-slate-700">
                                                    <span className="font-medium">Reason: </span>
                                                    {request.reason}
                                                </p>
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-400 mt-3">
                                            Submitted on {new Date(request.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    {request.leave_status === 'Pending' && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleApprove(request.leave_id)}
                                                disabled={processingId === request.leave_id}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processingId === request.leave_id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.leave_id)}
                                                disabled={processingId === request.leave_id}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
