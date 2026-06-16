'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Building2, Calendar, Loader2 } from 'lucide-react';
import type { Employee } from '@/lib/types';

export default function EmployeeProfilePage() {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [departmentName, setDepartmentName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadEmployeeProfile();
    }, []);

    const loadEmployeeProfile = async () => {
        setIsLoading(true);
        try {
            // Fetch employee data from API
            const response = await fetch('/api/employee/profile');
            const result = await response.json();

            if (result.success && result.employee) {
                setEmployee(result.employee);
                if (result.employee.department_name) {
                    setDepartmentName(result.employee.department_name);
                }
            } else {
                console.error('Failed to load profile:', result.error);
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-slate-600">Please log in to view your profile</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">My Profile</h1>
                    <p className="text-sm text-slate-500 mt-1">View your account information</p>
                </div>

                <div className="bg-white rounded-lg border border-zinc-200 p-8">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-200">
                        <div className="p-4 bg-blue-100 rounded-full">
                            <User className="h-12 w-12 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900">{employee.employee_name}</h2>
                            <p className="text-sm text-slate-500">{employee.employee_id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <User className="inline h-4 w-4 mr-1" />
                                Employee ID
                            </label>
                            <div className="px-4 py-3 bg-slate-50 border border-zinc-200 rounded-lg text-slate-900">
                                {employee.employee_id}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">This is your unique identifier</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <User className="inline h-4 w-4 mr-1" />
                                Full Name
                            </label>
                            <div className="px-4 py-3 bg-slate-50 border border-zinc-200 rounded-lg text-slate-900">
                                {employee.employee_name}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Mail className="inline h-4 w-4 mr-1" />
                                Email Address
                            </label>
                            <div className="px-4 py-3 bg-slate-50 border border-zinc-200 rounded-lg text-slate-900">
                                {employee.employee_email}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Shield className="inline h-4 w-4 mr-1" />
                                Role
                            </label>
                            <div className="px-4 py-3 bg-slate-50 border border-zinc-200 rounded-lg">
                                <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                        employee.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                    }`}
                                >
                                    {employee.role === 'admin' ? 'Administrator' : 'Employee'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Building2 className="inline h-4 w-4 mr-1" />
                                Department
                            </label>
                            <div className="px-4 py-3 bg-slate-50 border border-zinc-200 rounded-lg text-slate-900">
                                {departmentName || 'Not assigned'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Registration Date
                            </label>
                            <div className="px-4 py-3 bg-slate-50 border border-zinc-200 rounded-lg text-slate-900">
                                {employee.employee_date_register
                                    ? new Date(employee.employee_date_register).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                      })
                                    : 'Not available'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                            <strong>Note:</strong> Only administrators can modify employee information. If you need to update your
                            details, please contact your HR department or system administrator.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
