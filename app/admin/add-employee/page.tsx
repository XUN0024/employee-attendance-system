'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Loader2, CheckCircle2, AlertCircle, Mail, IdCard, User, Lock, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Department } from '@/lib/types';

export default function AddEmployeePage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form fields
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [employeeEmail, setEmployeeEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'employee' | 'admin'>('employee');
    const [departmentId, setDepartmentId] = useState('');

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .order('department_name', { ascending: true });

            if (error) throw error;
            setDepartments(data || []);
        } catch (err) {
            console.error('Error loading departments:', err);
        }
    };

    const validateForm = (): string | null => {
        if (!employeeId.trim()) return 'Employee ID is required';
        if (!employeeName.trim()) return 'Employee name is required';
        if (!employeeEmail.trim()) return 'Email is required';
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters';
        if (password !== confirmPassword) return 'Passwords do not match';
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(employeeEmail)) return 'Invalid email format';

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validate form
        const validationError = validateForm();
        if (validationError) {
            setMessage({ type: 'error', text: validationError });
            return;
        }

        setIsLoading(true);

        try {
            // Call API to create employee
            const response = await fetch('/api/admin/create-employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: employeeId.trim(),
                    employeeName: employeeName.trim(),
                    employeeEmail: employeeEmail.trim(),
                    password,
                    role,
                    departmentId: departmentId || null,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: `Employee account created successfully! Employee ID: ${employeeId}`,
                });

                // Reset form
                setEmployeeId('');
                setEmployeeName('');
                setEmployeeEmail('');
                setPassword('');
                setConfirmPassword('');
                setRole('employee');
                setDepartmentId('');
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Failed to create employee account',
                });
            }
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'An unexpected error occurred',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Add New Employee</h1>
                    <p className="text-sm text-slate-500 mt-1">Create a new employee account</p>
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-lg border flex items-start gap-3 ${
                            message.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-red-50 border-red-200'
                        }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <p
                            className={`text-sm font-medium ${
                                message.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                            }`}
                        >
                            {message.text}
                        </p>
                    </div>
                )}

                <div className="bg-white rounded-lg border border-zinc-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Employee ID */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <IdCard className="inline h-4 w-4 mr-1" />
                                    Employee ID *
                                </label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    placeholder="e.g., EMP001"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={isLoading}
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Unique identifier for the employee</p>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <User className="inline h-4 w-4 mr-1" />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={employeeName}
                                    onChange={(e) => setEmployeeName(e.target.value)}
                                    placeholder="e.g., John Doe"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Mail className="inline h-4 w-4 mr-1" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={employeeEmail}
                                    onChange={(e) => setEmployeeEmail(e.target.value)}
                                    placeholder="e.g., john.doe@feijip.com"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Building2 className="inline h-4 w-4 mr-1" />
                                    Department
                                </label>
                                <select
                                    value={departmentId}
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    <option value="">No Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.department_id} value={dept.department_id}>
                                            {dept.department_name} ({dept.department_code})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Optional department assignment</p>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Lock className="inline h-4 w-4 mr-1" />
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Lock className="inline h-4 w-4 mr-1" />
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Account Role *
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="employee"
                                        checked={role === 'employee'}
                                        onChange={(e) => setRole(e.target.value as 'employee')}
                                        disabled={isLoading}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">Employee</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={role === 'admin'}
                                        onChange={(e) => setRole(e.target.value as 'admin')}
                                        disabled={isLoading}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">Administrator</span>
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {role === 'admin' 
                                    ? 'Admin users have full access to all system features including employee management'
                                    : 'Regular employees can clock in/out, submit leave requests, and view their attendance history'
                                }
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4 border-t border-zinc-200">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-5 w-5" />
                                        Create Employee Account
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Important Notes</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>Employee ID must be unique and cannot be changed later</li>
                                <li>Password will be securely hashed using bcrypt</li>
                                <li>New employees can log in immediately using their credentials</li>
                                <li>Admin accounts have access to all administrative features</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
