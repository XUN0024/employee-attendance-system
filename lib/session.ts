import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { Employee } from './types';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'feijip-secret-key-change-in-production-2026'
);

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

export interface SessionPayload extends Record<string, any> {
    employeeId: string;
    role: 'employee' | 'admin';
    email: string;
    fullName: string;
}

export async function createSession(employee: Employee): Promise<string> {
    const payload: SessionPayload = {
        employeeId: employee.employee_id,
        role: employee.role,
        email: employee.employee_email,
        fullName: employee.employee_name,
    };

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(SECRET_KEY);

    return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
    try {
        const verified = await jwtVerify(token, SECRET_KEY);
        return verified.payload as SessionPayload;
    } catch (error) {
        return null;
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
        return null;
    }

    return await verifySession(token);
}

export async function setSessionCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION / 1000, // in seconds
        path: '/',
    });
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
