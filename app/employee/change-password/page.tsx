'use client';

import { useState } from 'react';
import { Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validation
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
            return;
        }

        if (currentPassword === newPassword) {
            setMessage({ type: 'error', text: 'New password must be different from current password' });
            return;
        }

        setIsLoading(true);

        try {
            const storedEmployee = localStorage.getItem('employee');
            if (!storedEmployee) {
                throw new Error('Please log in again');
            }

            const employee = JSON.parse(storedEmployee);

            // Get current password hash from database
            const { data: empData, error: fetchError } = await supabase
                .from('employees')
                .select('employee_password')
                .eq('employee_id', employee.employee_id)
                .single();

            if (fetchError || !empData) {
                throw new Error('Failed to verify current password');
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, empData.employee_password);

            if (!isCurrentPasswordValid) {
                setMessage({ type: 'error', text: 'Current password is incorrect' });
                setIsLoading(false);
                return;
            }

            // Hash new password
            const newHashedPassword = await hashPassword(newPassword);

            // Update password
            const { error: updateError } = await supabase
                .from('employees')
                .update({ employee_password: newHashedPassword })
                .eq('employee_id', employee.employee_id);

            if (updateError) {
                throw new Error(updateError.message);
            }

            setMessage({
                type: 'success',
                text: 'Password changed successfully! Please use your new password for future logins.',
            });

            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to change password' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Change Password</h1>
                    <p className="text-sm text-slate-500 mt-1">Update your account password</p>
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-lg border flex items-start gap-3 ${
                            message.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                        }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
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
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                Current Password *
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter your current password"
                                className="block w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                New Password *
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your new password (min. 6 characters)"
                                className="block w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm New Password *
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your new password"
                                className="block w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                                <strong>Password Requirements:</strong>
                            </p>
                            <ul className="text-xs text-amber-700 mt-2 space-y-1 ml-4 list-disc">
                                <li>At least 6 characters long</li>
                                <li>Must be different from your current password</li>
                                <li>Use a strong, unique password</li>
                            </ul>
                        </div>

                        <div className="pt-4 border-t border-zinc-200">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Changing Password...
                                    </>
                                ) : (
                                    <>
                                        <Key className="h-5 w-5" />
                                        Change Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
