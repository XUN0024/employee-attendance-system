import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
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
        const { employeeId, newStatus } = body;

        // Validate required fields
        if (!employeeId || !newStatus) {
            return NextResponse.json(
                { success: false, error: 'Employee ID and status are required' },
                { status: 400 }
            );
        }

        // Validate status value
        if (newStatus !== 'active' && newStatus !== 'inactive') {
            return NextResponse.json(
                { success: false, error: 'Status must be active or inactive' },
                { status: 400 }
            );
        }

        // Prevent admin from deactivating themselves
        if (employeeId === session.employeeId) {
            return NextResponse.json(
                { success: false, error: 'You cannot deactivate your own account' },
                { status: 400 }
            );
        }

        // Check if employee exists
        const { data: employee, error: fetchError } = await supabase
            .from('employees')
            .select('employee_id, employee_name, employee_status')
            .eq('employee_id', employeeId)
            .single();

        if (fetchError || !employee) {
            return NextResponse.json(
                { success: false, error: 'Employee not found' },
                { status: 404 }
            );
        }

        // Update employee status
        const { error: updateError } = await supabase
            .from('employees')
            .update({
                employee_status: newStatus,
            })
            .eq('employee_id', employeeId);

        if (updateError) {
            console.error('Status update error:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to update employee status' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Employee ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
            employee: {
                employeeId: employee.employee_id,
                employeeName: employee.employee_name,
                status: newStatus,
            },
        });
    } catch (error: any) {
        console.error('Toggle employee status error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
