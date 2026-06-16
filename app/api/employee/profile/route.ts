import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        // Get session token from cookie
        const token = request.cookies.get('session')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const sessionData = await verifySession(token);

        if (!sessionData) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch complete employee data from database
        const { data: employee, error } = await supabase
            .from('employees')
            .select('*')
            .eq('employee_id', sessionData.employeeId)
            .single();

        if (error || !employee) {
            return NextResponse.json(
                { success: false, error: 'Employee not found' },
                { status: 404 }
            );
        }

        // Fetch department name if applicable
        let departmentName = null;
        if (employee.department_id) {
            const { data: dept } = await supabase
                .from('departments')
                .select('department_name')
                .eq('department_id', employee.department_id)
                .single();

            if (dept) {
                departmentName = dept.department_name;
            }
        }

        return NextResponse.json({
            success: true,
            employee: {
                employee_id: employee.employee_id,
                employee_name: employee.employee_name,
                employee_email: employee.employee_email,
                role: employee.role,
                department_id: employee.department_id,
                department_name: departmentName,
                employee_date_register: employee.employee_date_register,
                employee_status: employee.employee_status,
            },
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
