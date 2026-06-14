import { supabase } from './supabase';
import type { LeaveRequest } from './types';

export interface SubmitLeaveResponse {
    success: boolean;
    leaveRequest?: LeaveRequest;
    error?: string;
}

export interface LeaveRequestsResponse {
    success: boolean;
    requests?: LeaveRequest[];
    error?: string;
}

export interface ApproveRejectResponse {
    success: boolean;
    error?: string;
}

/**
 * Submit a new leave request
 */
export async function submitLeaveRequest(
    employeeId: string,
    startDate: string,
    endDate: string,
    leaveType: 'Annual' | 'Sick' | 'Emergency' | 'Medical',
    reason: string
): Promise<SubmitLeaveResponse> {
    try {
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end < start) {
            return {
                success: false,
                error: 'End date cannot be before start date',
            };
        }

        // Insert leave request
        const { data, error } = await supabase
            .from('leave_requests')
            .insert([
                {
                    employee_id: employeeId,
                    start_date: startDate,
                    end_date: endDate,
                    leave_type: leaveType,
                    reason: reason || null,
                    leave_status: 'Pending',
                },
            ])
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            leaveRequest: data,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to submit leave request',
        };
    }
}

/**
 * Get leave requests for an employee
 */
export async function getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequestsResponse> {
    try {
        const { data, error } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('employee_id', employeeId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            requests: data || [],
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to fetch leave requests',
        };
    }
}

/**
 * Get all pending leave requests (for admin)
 */
export async function getPendingLeaveRequests(): Promise<LeaveRequestsResponse> {
    try {
        const { data, error } = await supabase
            .from('leave_requests')
            .select(`
                *,
                employees (
                    employee_name,
                    employee_email,
                    department_id
                )
            `)
            .eq('leave_status', 'Pending')
            .order('created_at', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            requests: data || [],
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to fetch pending requests',
        };
    }
}

/**
 * Get all leave requests (for admin)
 */
export async function getAllLeaveRequests(): Promise<LeaveRequestsResponse> {
    try {
        const { data, error } = await supabase
            .from('leave_requests')
            .select(`
                *,
                employees (
                    employee_name,
                    employee_email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
            requests: data || [],
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to fetch leave requests',
        };
    }
}

/**
 * Approve a leave request and update attendance
 */
export async function approveLeaveRequest(leaveId: string): Promise<ApproveRejectResponse> {
    try {
        // Get leave request details
        const { data: leaveRequest, error: fetchError } = await supabase
            .from('leave_requests')
            .select('*')
            .eq('leave_id', leaveId)
            .single();

        if (fetchError || !leaveRequest) {
            throw new Error('Leave request not found');
        }

        // Update leave status to Approved
        const { error: updateError } = await supabase
            .from('leave_requests')
            .update({ leave_status: 'Approved' })
            .eq('leave_id', leaveId);

        if (updateError) {
            throw new Error(updateError.message);
        }

        // Create attendance records for each day in the leave period
        const startDate = new Date(leaveRequest.start_date);
        const endDate = new Date(leaveRequest.end_date);
        const attendanceRecords = [];

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            attendanceRecords.push({
                employee_id: leaveRequest.employee_id,
                attendance_date: d.toISOString().split('T')[0],
                attendance_check_in: new Date(d.setHours(9, 0, 0, 0)).toISOString(),
                attendance_status: 'Leave',
            });
        }

        // Insert attendance records (ignore conflicts for existing dates)
        if (attendanceRecords.length > 0) {
            await supabase
                .from('attendances')
                .upsert(attendanceRecords, {
                    onConflict: 'employee_id,attendance_date',
                    ignoreDuplicates: false,
                });
        }

        return {
            success: true,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to approve leave request',
        };
    }
}

/**
 * Reject a leave request
 */
export async function rejectLeaveRequest(leaveId: string): Promise<ApproveRejectResponse> {
    try {
        const { error } = await supabase
            .from('leave_requests')
            .update({ leave_status: 'Rejected' })
            .eq('leave_id', leaveId);

        if (error) {
            throw new Error(error.message);
        }

        return {
            success: true,
        };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || 'Failed to reject leave request',
        };
    }
}
