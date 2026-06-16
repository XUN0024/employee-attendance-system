import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hashPassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        // Verify user session
        const session = await getSession();
        
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return NextResponse.json(
                { success: false, error: 'New password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if new password is same as current
        if (currentPassword === newPassword) {
            return NextResponse.json(
                { success: false, error: 'New password must be different from current password' },
                { status: 400 }
            );
        }

        // Fetch current employee record with password
        const { data: employee, error: fetchError } = await supabase
            .from('employees')
            .select('employee_id, employee_password')
            .eq('employee_id', session.employeeId)
            .single();

        if (fetchError || !employee) {
            return NextResponse.json(
                { success: false, error: 'Employee record not found' },
                { status: 404 }
            );
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.employee_password);
        
        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'Current password is incorrect' },
                { status: 401 }
            );
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update password in database
        const { error: updateError } = await supabase
            .from('employees')
            .update({
                employee_password: hashedNewPassword,
            })
            .eq('employee_id', session.employeeId);

        if (updateError) {
            console.error('Password update error:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to update password' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
