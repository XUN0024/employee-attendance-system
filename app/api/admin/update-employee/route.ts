import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

export async function POST(request: NextRequest) {
    try {
        // Verify admin session
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { employeeId, employee_name, employee_email, newPassword } = body;

        // Validate required fields
        if (!employeeId || !employee_name || !employee_email) {
            return NextResponse.json(
                { success: false, error: 'Employee ID, name, and email are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(employee_email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // If password is provided, validate it
        if (newPassword && newPassword.trim().length > 0) {
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { success: false, error: 'New password must be at least 6 characters' },
                    { status: 400 }
                );
            }
        }

        // Check if employee exists
        const { data: existingEmployee, error: fetchError } = await supabase
            .from('employees')
            .select('employee_id, employee_email')
            .eq('employee_id', employeeId)
            .single();

        if (fetchError || !existingEmployee) {
            return NextResponse.json(
                { success: false, error: 'Employee not found' },
                { status: 404 }
            );
        }

        // Check if email is already taken by another employee
        if (employee_email !== existingEmployee.employee_email) {
            const { data: emailCheck } = await supabase
                .from('employees')
                .select('employee_id')
                .eq('employee_email', employee_email)
                .neq('employee_id', employeeId)
                .single();

            if (emailCheck) {
                return NextResponse.json(
                    { success: false, error: 'Email is already in use by another employee' },
                    { status: 409 }
                );
            }
        }

        // Prepare update data
        const updateData: any = {
            employee_name,
            employee_email,
        };

        // If new password provided, hash it and include in update
        if (newPassword && newPassword.trim().length > 0) {
            const hashedPassword = await hashPassword(newPassword);
            updateData.employee_password = hashedPassword;
        }

        // Update employee
        const { error: updateError } = await supabase
            .from('employees')
            .update(updateData)
            .eq('employee_id', employeeId);

        if (updateError) {
            console.error('Error updating employee:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to update employee' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: newPassword && newPassword.trim().length > 0
                ? 'Employee updated successfully. Password has been reset.'
                : 'Employee updated successfully',
        });
    } catch (error: any) {
        console.error('Error in update-employee API:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
