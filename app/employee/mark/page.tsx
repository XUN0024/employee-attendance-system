'use client';

import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Briefcase } from 'lucide-react';
import { clockIn, clockOut, getTodayAttendance, isClockInAllowed } from '@/lib/attendance';
import { supabase } from '@/lib/supabase';
import type { Employee } from '@/lib/types';

export default function MarkAttendancePage() {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [hasCheckedOut, setHasCheckedOut] = useState(false);
    const [checkInTime, setCheckInTime] = useState<string>('');
    const [checkOutTime, setCheckOutTime] = useState<string>('');
    const [attendanceStatus, setAttendanceStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [clockInAllowed, setClockInAllowed] = useState(true);
    const [clockInRestrictionReason, setClockInRestrictionReason] = useState<string>('');
    const [hasApprovedLeave, setHasApprovedLeave] = useState(false);
    const [leaveType, setLeaveType] = useState<string>('');

    useEffect(() => {
        // Load employee from localStorage
        const storedEmployee = localStorage.getItem('employee');
        if (storedEmployee) {
            const emp = JSON.parse(storedEmployee);
            setEmployee(emp);
            loadTodayAttendance(emp.employee_id);
        } else {
            setIsLoading(false);
        }

        // Update clock every second and check clock in eligibility
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // Check if clock in is allowed
            const timeCheck = isClockInAllowed(now);
            setClockInAllowed(timeCheck.allowed);
            if (!timeCheck.allowed) {
                setClockInRestrictionReason(timeCheck.reason || '');
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const loadTodayAttendance = async (employeeId: string) => {
        setIsLoading(true);
        try {
            // Check for approved leave today - use local date
            const today = new Date();
            const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const { data: leaveData } = await supabase
                .from('leave_requests')
                .select('leave_type')
                .eq('employee_id', employeeId)
                .eq('leave_status', 'Approved')
                .lte('start_date', localDateStr)
                .gte('end_date', localDateStr)
                .maybeSingle();

            if (leaveData) {
                setHasApprovedLeave(true);
                setLeaveType(leaveData.leave_type);
            } else {
                setHasApprovedLeave(false);
                setLeaveType('');
            }

            const status = await getTodayAttendance(employeeId);
            setHasCheckedIn(status.hasCheckedIn);
            setHasCheckedOut(status.hasCheckedOut);

            if (status.attendance) {
                setCheckInTime(
                    new Date(status.attendance.attendance_check_in).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })
                );
                setAttendanceStatus(status.attendance.attendance_status);

                if (status.attendance.attendance_check_out) {
                    setCheckOutTime(
                        new Date(status.attendance.attendance_check_out).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        })
                    );
                }
            }
        } catch (err) {
            console.error('Error loading attendance:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClockIn = async () => {
        if (!employee) return;

        setIsProcessing(true);
        setMessage(null);

        const startTime = Date.now();

        try {
            const result = await clockIn(employee.employee_id);

            const elapsed = Date.now() - startTime;
            console.log(`Clock in completed in ${elapsed}ms`);

            if (result.success && result.attendance) {
                setHasCheckedIn(true);
                setCheckInTime(
                    new Date(result.attendance.attendance_check_in).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })
                );
                setAttendanceStatus(result.attendance.attendance_status);
                setMessage({
                    type: 'success',
                    text: `Successfully clocked in at ${new Date(result.attendance.attendance_check_in).toLocaleTimeString()}`,
                });
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Failed to clock in',
                });
            }
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'An error occurred',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClockOut = async () => {
        if (!employee) return;

        setIsProcessing(true);
        setMessage(null);

        const startTime = Date.now();

        try {
            const result = await clockOut(employee.employee_id);

            const elapsed = Date.now() - startTime;
            console.log(`Clock out completed in ${elapsed}ms`);

            if (result.success && result.attendance) {
                setHasCheckedOut(true);
                if (result.attendance.attendance_check_out) {
                    setCheckOutTime(
                        new Date(result.attendance.attendance_check_out).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        })
                    );
                }
                setMessage({
                    type: 'success',
                    text: `Successfully clocked out at ${new Date(result.attendance.attendance_check_out!).toLocaleTimeString()}`,
                });
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Failed to clock out',
                });
            }
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'An error occurred',
            });
        } finally {
            setIsProcessing(false);
        }
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
                <div className="text-center">
                    <p className="text-slate-600">Please log in to mark attendance</p>
                </div>
            </div>
        );
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getTimeSlotStatus = () => {
        const hour = currentTime.getHours();
        if (hour >= 6 && hour < 9) {
            return { label: 'On Time Window', color: 'emerald' };
        } else if (hour >= 9 && hour < 18) {
            return { label: 'Late Window', color: 'amber' };
        } else {
            return { label: 'Clock In Closed', color: 'red' };
        }
    };

    const timeSlot = getTimeSlotStatus();

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Mark Attendance</h1>
                    <p className="text-sm text-slate-500 mt-1">Clock in and out for today</p>
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-lg border flex items-start gap-3 ${message.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200'
                                : message.type === 'warning'
                                    ? 'bg-amber-50 border-amber-200'
                                    : 'bg-red-50 border-red-200'
                            }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                        ) : message.type === 'warning' ? (
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <p
                            className={`text-sm font-medium ${message.type === 'success'
                                    ? 'text-emerald-700'
                                    : message.type === 'warning'
                                        ? 'text-amber-700'
                                        : 'text-red-700'
                                }`}
                        >
                            {message.text}
                        </p>
                    </div>
                )}

                {!clockInAllowed && !hasCheckedIn && !hasApprovedLeave && (
                    <div className="p-4 rounded-lg border bg-red-50 border-red-200 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-900">Clock In Not Available</p>
                            <p className="text-sm text-red-700 mt-1">{clockInRestrictionReason}</p>
                        </div>
                    </div>
                )}

                {hasApprovedLeave && (
                    <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">You are on {leaveType} Leave Today</p>
                            <p className="text-sm text-blue-700 mt-1">Clock in and clock out are disabled because you have an approved leave for today.</p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg border border-zinc-200 p-8">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Clock className="h-8 w-8 text-blue-600" />
                        <div className="text-center">
                            <div className="text-4xl font-bold text-slate-900 font-mono">{formatTime(currentTime)}</div>
                            <div className="text-sm text-slate-600 mt-1">{formatDate(currentTime)}</div>
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium mt-2 bg-${timeSlot.color}-50 text-${timeSlot.color}-700`}
                            >
                                {timeSlot.label}
                            </span>
                        </div>
                    </div>

                    {hasCheckedIn && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Today's Status</p>
                                    <p className="text-xs text-blue-700 mt-1">Checked in at {checkInTime}</p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-md text-xs font-medium ${attendanceStatus === 'Present'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}
                                >
                                    {attendanceStatus}
                                </span>
                            </div>
                            {hasCheckedOut && <p className="text-xs text-blue-700 mt-2">Checked out at {checkOutTime}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleClockIn}
                            disabled={isProcessing || hasCheckedIn || !clockInAllowed || hasApprovedLeave}
                            className="flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-50"
                        >
                            {isProcessing && !hasCheckedIn ? (
                                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                            ) : (
                                <LogIn className="h-6 w-6 text-emerald-600" />
                            )}
                            <div className="text-left">
                                <div className="font-semibold text-emerald-900">Clock In</div>
                                <div className="text-xs text-emerald-700">
                                    {hasApprovedLeave
                                        ? 'On leave today'
                                        : !clockInAllowed && !hasCheckedIn
                                            ? 'Not available now'
                                            : 'Mark your arrival'}
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={handleClockOut}
                            disabled={isProcessing || !hasCheckedIn || hasCheckedOut || hasApprovedLeave}
                            className="flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50"
                        >
                            {isProcessing && hasCheckedIn && !hasCheckedOut ? (
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            ) : (
                                <LogOut className="h-6 w-6 text-blue-600" />
                            )}
                            <div className="text-left">
                                <div className="font-semibold text-blue-900">Clock Out</div>
                                <div className="text-xs text-blue-700">
                                    {hasApprovedLeave ? 'On leave today' : 'Mark your departure'}
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">Clock In Schedule</h3>
                        <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex items-center justify-between">
                                <span>6:00 AM - 9:00 AM</span>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">On Time</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>9:01 AM - 6:00 PM</span>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">Late</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>6:01 PM - 5:59 AM</span>
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">Not Allowed</span>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <ul className="text-xs text-slate-600 space-y-1">
                                <li>• All timestamps are recorded using server time</li>
                                <li>• You can only clock in once per day</li>
                                <li>• Remember to clock out before leaving</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
