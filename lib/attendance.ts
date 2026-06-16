import { supabase } from './supabase';
import type { Attendance } from './types';

export interface ClockInResponse {
    success: boolean;
    attendance?: Attendance;
    error?: string;
}

export interface ClockOutResponse {
    success: boolean;
    attendance?: Attendance;
    error?: string;
}

export interface TodayAttendanceResponse {
    hasCheckedIn: boolean;
    hasCheckedOut: boolean;
    attendance?: Attendance;
}

// Configuration: Work start time (9:00 AM)
const WORK_START_HOUR = 9;
const WORK_START_MINUTE = 0;

// Clock In time restrictions
const CLOCK_IN_START_HOUR = 6; // 6:00 AM
const CLOCK_IN_START_MINUTE = 0;
const CLOCK_IN_END_HOUR = 18; // 6:00 PM
const CLOCK_IN_END_MINUTE = 0;

/**
 * Check if current time is within allowed clock in window
 */
export function isClockInAllowed(currentTime: Date): { allowed: boolean; reason?: string } {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();

    // Convert time to minutes for easier comparison
    const currentMinutes = hour * 60 + minute;
    const startMinutes = CLOCK_IN_START_HOUR * 60 + CLOCK_IN_START_MINUTE;
    const endMinutes = CLOCK_IN_END_HOUR * 60 + CLOCK_IN_END_MINUTE;

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return { allowed: true };
    }

    return {
        allowed: false,
        reason: `Clock in is only allowed between 6:00 AM and 6:00 PM`,
    };
}

/**
 * Get server timestamp from Supabase
 */
async function getServerTimestamp(): Promise<Date> {
    const { data, error } = await supabase.rpc('get_server_time');

    if (error || !data) {
        // Fallback to current time if RPC fails
        return new Date();
    }

    return new Date(data);
}

/**
 * Calculate attendance status based on check-in time
 */
function calculateAttendanceStatus(checkInTime: Date): 'Present' | 'Late' {
    const hour = checkInTime.getHours();
    const minute = checkInTime.getMinutes();

    // Late if after 9:00 AM
    if (hour > WORK_START_HOUR || (hour === WORK_START_HOUR && minute > WORK_START_MINUTE)) {
        return 'Late';
    }

    return 'Present';
}

/**
 * Check if employee has already clocked in today
 */
export async function getTodayAttendance(employeeId: string): Promise<TodayAttendanceResponse> {
    try {
        // Get current date in YYYY-MM-DD format (server-side)
        const { data: serverTime } = await supabase.rpc('get_server_time');
        const currentDate = serverTime ? new Date(serverTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('attendances')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('attendance_date', currentDate)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned (expected if no attendance yet)
            throw error;
        }

        if (!data) {
            return {
                hasCheckedIn: false,
                hasCheckedOut: false,
            };
        }

        return {
            hasCheckedIn: true,
            hasCheckedOut: !!data.attendance_check_out,
            attendance: data,
        };
    } catch (err) {
        console.error('Error fetching today attendance:', err);
        return {
            hasCheckedIn: false,
            hasCheckedOut: false,
        };
    }
}

/**
 * Clock In - Record employee arrival
 */
export async function clockIn(employeeId: string): Promise<ClockInResponse> {
    try {
        // Get server timestamp first
        const serverTime = await getServerTimestamp();

        // Check if employee has approved leave today
        const currentDate = serverTime.toISOString().split('T')[0];
        const { data: leaveData, error: leaveError } = await supabase
            .from('leave_requests')
            .select('leave_type')
            .eq('employee_id', employeeId)
            .eq('leave_status', 'Approved')
            .lte('start_date', currentDate)
            .gte('end_date', currentDate)
            .maybeSingle();

        if (leaveData) {
            return {
                success: false,
                error: `You have an approved ${leaveData.leave_type} leave today. Clock in is not allowed.`,
            };
        }

        // Check if clock in is allowed at this time
        const timeCheck = isClockInAllowed(serverTime);
        if (!timeCheck.allowed) {
            return {
                success: false,
                error: timeCheck.reason || 'Clock in is not allowed at this time',
            };
        }

        // Check if already clocked in today
        const todayStatus = await getTodayAttendance(employeeId);

        if (todayStatus.hasCheckedIn) {
            return {
                success: false,
                error: 'You have already clocked in today',
            };
        }

        // Calculate status
        const status = calculateAttendanceStatus(serverTime);

        // Insert attendance record
        const { data, error } = await supabase
            .from('attendances')
            .insert([
                {
                    employee_id: employeeId,
                    attendance_date: currentDate,
                    attendance_check_in: serverTime.toISOString(),
                    attendance_status: status,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            attendance: data,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to clock in',
        };
    }
}

/**
 * Clock Out - Record employee departure
 */
export async function clockOut(employeeId: string): Promise<ClockOutResponse> {
    try {
        // Get server timestamp
        const serverTime = await getServerTimestamp();
        const currentDate = serverTime.toISOString().split('T')[0];

        // Check if employee has approved leave today
        const { data: leaveData, error: leaveError } = await supabase
            .from('leave_requests')
            .select('leave_type')
            .eq('employee_id', employeeId)
            .eq('leave_status', 'Approved')
            .lte('start_date', currentDate)
            .gte('end_date', currentDate)
            .maybeSingle();

        if (leaveData) {
            return {
                success: false,
                error: `You have an approved ${leaveData.leave_type} leave today. Clock out is not allowed.`,
            };
        }

        // Check if clocked in today
        const todayStatus = await getTodayAttendance(employeeId);

        if (!todayStatus.hasCheckedIn) {
            return {
                success: false,
                error: 'You must clock in before you can clock out',
            };
        }

        if (todayStatus.hasCheckedOut) {
            return {
                success: false,
                error: 'You have already clocked out today',
            };
        }

        // Update attendance record with check-out time
        const { data, error } = await supabase
            .from('attendances')
            .update({
                attendance_check_out: serverTime.toISOString(),
            })
            .eq('employee_id', employeeId)
            .eq('attendance_date', currentDate)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            attendance: data,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to clock out',
        };
    }
}

/**
 * Get attendance history for an employee
 */
export async function getAttendanceHistory(employeeId: string, limit: number = 10): Promise<Attendance[]> {
    try {
        const { data, error } = await supabase
            .from('attendances')
            .select('*')
            .eq('employee_id', employeeId)
            .order('attendance_date', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return data || [];
    } catch (err) {
        console.error('Error fetching attendance history:', err);
        return [];
    }
}

/**
 * Get attendance history for a specific month
 */
export async function getMonthlyAttendance(employeeId: string, year: number, month: number): Promise<Attendance[]> {
    try {
        // Calculate start and end dates for the month
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('attendances')
            .select('*')
            .eq('employee_id', employeeId)
            .gte('attendance_date', startDate)
            .lte('attendance_date', endDate)
            .order('attendance_date', { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    } catch (err) {
        console.error('Error fetching monthly attendance:', err);
        return [];
    }
}

/**
 * Get attendance statistics for an employee
 */
export interface AttendanceStats {
    workDays: number;
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    leaveDays: number;
    attendanceRate: number;
}

export async function getAttendanceStats(employeeId: string, year: number, month: number): Promise<AttendanceStats> {
    try {
        const attendance = await getMonthlyAttendance(employeeId, year, month);

        const presentDays = attendance.filter((a) => a.attendance_status === 'Present').length;
        const lateDays = attendance.filter((a) => a.attendance_status === 'Late').length;
        const leaveDays = attendance.filter((a) => a.attendance_status === 'Leave').length;
        const totalDays = attendance.length;

        // Calculate work days in the month (excluding weekends)
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        let workDays = 0;

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workDays++;
            }
        }

        const absentDays = workDays - totalDays;
        const attendanceRate = workDays > 0 ? Math.round((totalDays / workDays) * 100) : 0;

        return {
            workDays,
            totalDays,
            presentDays,
            lateDays,
            absentDays,
            leaveDays,
            attendanceRate,
        };
    } catch (err) {
        console.error('Error calculating attendance stats:', err);
        return {
            workDays: 0,
            totalDays: 0,
            presentDays: 0,
            lateDays: 0,
            absentDays: 0,
            leaveDays: 0,
            attendanceRate: 0,
        };
    }
}

