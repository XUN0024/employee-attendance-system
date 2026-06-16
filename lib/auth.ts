import { supabase } from './supabase';
import type { Employee } from './types';
import bcrypt from 'bcryptjs';

export interface LoginCredentials {
    employeeId: string;
    password: string;
    role: 'employee' | 'admin';
}

export interface AuthResponse {
    success: boolean;
    employee?: Employee;
    error?: string;
}

export async function loginEmployee(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('employee_id', credentials.employeeId)
            .eq('role', credentials.role)
            .single();

        if (error || !data) {
            return {
                success: false,
                error: 'Invalid employee ID or role',
            };
        }

        // Check if account is active
        if (data.employee_status === 'inactive') {
            return {
                success: false,
                error: 'Account is deactivated. Please contact your administrator.',
            };
        }

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(credentials.password, data.employee_password);
        
        if (!isPasswordValid) {
            return {
                success: false,
                error: 'Invalid password',
            };
        }

        return {
            success: true,
            employee: data,
        };
    } catch (err) {
        return {
            success: false,
            error: 'Login failed. Please try again.',
        };
    }
}

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

export async function getEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('employee_id', employeeId)
            .single();

        if (error || !data) {
            return null;
        }

        return data;
    } catch (err) {
        return null;
    }
}
