import { NextRequest, NextResponse } from 'next/server';
import { loginEmployee } from '@/lib/auth';
import { createSession, setSessionCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { employeeId, password, role } = body;

        if (!employeeId || !password || !role) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await loginEmployee({ employeeId, password, role });

        if (!result.success || !result.employee) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 401 }
            );
        }

        // Create secure session token
        const token = await createSession(result.employee);
        
        // Set httpOnly cookie
        const response = NextResponse.json({
            success: true,
            employee: {
                employeeId: result.employee.employee_id,
                fullName: result.employee.employee_name,
                email: result.employee.employee_email,
                role: result.employee.role,
                departmentId: result.employee.department_id,
            },
        });

        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 60 * 60, // 8 hours
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
