'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Loader2, Mail, Building2, Shield, User, Calendar, AlertCircle, Power, CheckCircle2, Edit, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AdminEmployeeDetails } from '@/lib/types';
import { AdminStatsSkeleton, TableSkeleton, Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

interface EditFormData {
    employee_name: string;
    employee_email: string;
    department_id: string | null;
    role: string;
    newPassword?: string;
}

export default function AllEmployeesPage() {
    const [employees, setEmployees] = useState<AdminEmployeeDetails[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<AdminEmployeeDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'employee' | 'admin'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<AdminEmployeeDetails | null>(null);
    const [editFormData, setEditFormData] = useState<EditFormData>({
        employee_name: '',
        employee_email: '',
        department_id: null,
        role: 'employee',
        newPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadEmployees();
    }, []);

    useEffect(() => {
        filterEmployees();
    }, [searchQuery, roleFilter, statusFilter, employees]);

    const loadEmployees = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('admin_employee_details')
                .select('*')
                .order('employee_date_register', { ascending: false });

            if (error) throw error;
            setEmployees(data || []);
        } catch (err) {
            console.error('Error loading employees:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filterEmployees = () => {
        let filtered = employees;

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(emp => emp.role === roleFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(emp => emp.employee_status === statusFilter);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(emp =>
                emp.employee_id.toLowerCase().includes(query) ||
                emp.employee_name.toLowerCase().includes(query) ||
                emp.employee_email.toLowerCase().includes(query) ||
                emp.department_name?.toLowerCase().includes(query)
            );
        }

        setFilteredEmployees(filtered);
    };

    const handleToggleStatus = async (employeeId: string, currentStatus: string) => {
        setProcessingId(employeeId);
        setMessage(null);

        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        try {
            const response = await fetch('/api/admin/toggle-employee-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId,
                    newStatus,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message || `Employee ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
                });
                loadEmployees(); // Reload the list
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Failed to update employee status',
                });
            }
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'An unexpected error occurred',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const openEditModal = (employee: AdminEmployeeDetails) => {
        setEditingEmployee(employee);
        setEditFormData({
            employee_name: employee.employee_name,
            employee_email: employee.employee_email,
            department_id: employee.department_id || null,
            role: employee.role,
            newPassword: '',
        });
        setShowPassword(false);
    };

    const closeEditModal = () => {
        setEditingEmployee(null);
        setEditFormData({
            employee_name: '',
            employee_email: '',
            department_id: null,
            role: 'employee',
            newPassword: '',
        });
        setShowPassword(false);
    };

    const handleUpdateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/update-employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: editingEmployee.employee_id,
                    ...editFormData,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Employee updated successfully',
                });
                loadEmployees();
                closeEditModal();
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Failed to update employee',
                });
            }
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'An unexpected error occurred',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === 'admin') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    <Shield className="h-3.5 w-3.5" />
                    Administrator
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <User className="h-3.5 w-3.5" />
                Employee
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        if (status === 'active') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                <Power className="h-3.5 w-3.5" />
                Inactive
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div>
                        <Skeleton className="h-9 w-64 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    
                    <AdminStatsSkeleton />
                    
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <Skeleton className="flex-1 h-12 rounded-xl" />
                            <Skeleton className="md:w-48 h-12 rounded-xl" />
                            <Skeleton className="md:w-48 h-12 rounded-xl" />
                        </div>
                        <Skeleton className="h-4 w-64" />
                    </div>
                    
                    <TableSkeleton rows={8} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">All Employees</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage and view employee accounts
                    </p>
                </div>

                {/* Success/Error Message */}
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Total Employees</h3>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900">{employees.length}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {employees.filter(e => e.employee_status === 'active').length} active
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Active</h3>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900">
                            {employees.filter(e => e.employee_status === 'active').length}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <Power className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Inactive</h3>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900">
                            {employees.filter(e => e.employee_status === 'inactive').length}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-zinc-200 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-600">Administrators</h3>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900">
                            {employees.filter(e => e.role === 'admin').length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by ID, name, email, or department..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div className="md:w-48">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'employee' | 'admin')}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="employee">Employees Only</option>
                                <option value="admin">Admins Only</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="md:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 text-sm text-slate-600">
                        Showing <span className="font-medium text-slate-900">{filteredEmployees.length}</span> of{' '}
                        <span className="font-medium text-slate-900">{employees.length}</span> employees
                    </div>
                </div>

                {/* Employee Table */}
                <div className="bg-white rounded-lg border border-zinc-200">
                    {filteredEmployees.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">
                                {searchQuery || roleFilter !== 'all' 
                                    ? 'No employees match your filters'
                                    : 'No employees found'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-slate-50">
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Employee ID
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Name
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Email
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Department
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Role
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Status
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Registered
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredEmployees.map((employee) => (
                                        <tr key={employee.employee_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4">
                                                <span className="text-sm font-medium text-slate-900">
                                                    {employee.employee_id}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {employee.employee_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail className="h-4 w-4" />
                                                    {employee.employee_email}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                {employee.department_name ? (
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-slate-400" />
                                                        <div>
                                                            <p className="text-sm text-slate-900">
                                                                {employee.department_name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {employee.department_code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">No department</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                {getRoleBadge(employee.role)}
                                            </td>
                                            <td className="py-4 px-4">
                                                {getStatusBadge(employee.employee_status)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(employee.employee_date_register)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(employee)}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(employee.employee_id, employee.employee_status)}
                                                        disabled={processingId === employee.employee_id}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                            employee.employee_status === 'active'
                                                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                                        }`}
                                                    >
                                                        {processingId === employee.employee_id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Power className="h-3.5 w-3.5" />
                                                        )}
                                                        {employee.employee_status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Info Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Employee Management</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>Use the "Add Employee" page to create new accounts</li>
                                <li>Click "Edit" to update employee information or reset password</li>
                                <li>Click "Deactivate" to prevent an employee from logging in</li>
                                <li>Click "Activate" to restore access for inactive employees</li>
                                <li>You cannot deactivate your own account</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Employee Modal */}
            {editingEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-zinc-200 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Edit Employee</h2>
                                <p className="text-sm text-slate-500 mt-1">Update employee information</p>
                            </div>
                            <button
                                onClick={closeEditModal}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateEmployee} className="p-6 space-y-6">
                            {/* Employee ID (read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    value={editingEmployee.employee_id}
                                    disabled
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-500 mt-1">Employee ID cannot be changed</p>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.employee_name}
                                    onChange={(e) => setEditFormData({ ...editFormData, employee_name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={editFormData.employee_email}
                                    onChange={(e) => setEditFormData({ ...editFormData, employee_email: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* New Password (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    New Password (Optional)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={editFormData.newPassword}
                                        onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                                        placeholder="Leave blank to keep current password"
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    If provided, password must be at least 6 characters
                                </p>
                            </div>

                            {/* Role (read-only for now) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.role === 'admin' ? 'Administrator' : 'Employee'}
                                    disabled
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-500 mt-1">Role cannot be changed after creation</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
