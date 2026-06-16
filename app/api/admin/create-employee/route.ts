import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hashPassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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
        const { employeeId, employeeName, employeeEmail, password, role, departmentId } = body;

        // Validate required fields
        if (!employeeId || !employeeName || !employeeEmail || !password || !role) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate role
        if (role !== 'employee' && role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Invalid role. Must be employee or admin.' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if employee ID already exists
        const { data: existingEmployee, error: checkError } = await supabase
            .from('employees')
            .select('employee_id')
            .eq('employee_id', employeeId)
            .single();

        if (existingEmployee) {
            return NextResponse.json(
                { success: false, error: 'Employee ID already exists' },
                { status: 409 }
            );
        }

        // Check if email already exists
        const { data: existingEmail, error: emailCheckError } = await supabase
            .from('employees')
            .select('employee_email')
            .eq('employee_email', employeeEmail)
            .single();

        if (existingEmail) {
            return NextResponse.json(
                { success: false, error: 'Email address already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert employee record
        const { data: newEmployee, error: insertError } = await supabase
            .from('employees')
            .insert([
                {
                    employee_id: employeeId,
                    employee_name: employeeName,
                    employee_email: employeeEmail,
                    employee_password: hashedPassword,
                    role: role,
                    department_id: departmentId || null,
                    employee_status: 'active', // New employees are active by default
                    employee_date_register: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json(
                { success: false, error: `Database error: ${insertError.message}` },
                { status: 500 }
            );
        }

        // If role is admin, also create admin record
        if (role === 'admin') {
            const { error: adminError } = await supabase
                .from('admins')
                .insert([
                    {
                        employee_id: employeeId,
                    },
                ]);

            if (adminError) {
                console.error('Admin insert error:', adminError);
                // Note: Employee was created but admin record failed
                // In production, consider transaction rollback
            }
        }

        return NextResponse.json({
            success: true,
            employee: {
                employeeId: newEmployee.employee_id,
                employeeName: newEmployee.employee_name,
                employeeEmail: newEmployee.employee_email,
                role: newEmployee.role,
            },
        });
    } catch (error: any) {
        console.error('Create employee error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
