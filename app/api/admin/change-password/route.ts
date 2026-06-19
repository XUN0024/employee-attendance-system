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
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { success: false, error: 'New password must be at least 6 characters' },
                { status: 400 }
            );
        }

        const { data: admin, error: fetchError } = await supabase
            .from('employees')
            .select('employee_id, employee_password')
            .eq('employee_id', session.employeeId)
            .single();

        if (fetchError || !admin) {
            return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, admin.employee_password);
        if (!passwordMatch) {
            return NextResponse.json(
                { success: false, error: 'Current password is incorrect' },
                { status: 401 }
            );
        }

        const hashedPassword = await hashPassword(newPassword);

        const { error: updateError } = await supabase
            .from('employees')
            .update({ employee_password: hashedPassword })
            .eq('employee_id', session.employeeId);

        if (updateError) {
            return NextResponse.json(
                { success: false, error: 'Failed to update password' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
