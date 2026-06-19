'use client';

import { useState } from 'react';
import { User, Shield, Lock, IdCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Role = 'employee' | 'admin';

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState<Role>('employee');
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId,
                    password,
                    role,
                }),
            });

            const result = await response.json();

            if (result.success && result.employee) {
                // Store minimal employee info in localStorage for client-side use
                localStorage.setItem('employee', JSON.stringify(result.employee));
                
                // Redirect based on role (middleware will enforce)
                if (result.employee.role === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/employee/dashboard');
                }
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                            <span className="text-2xl font-bold text-white">F</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            FEIJIP Attendance Portal
                        </h1>
                        <p className="text-sm text-slate-500">Sign in to your account</p>
                    </div>

                    <div className="flex bg-blue-50 rounded-xl p-1.5 mb-6 border border-blue-100">
                        <button
                            type="button"
                            onClick={() => setRole('employee')}
                            disabled={isLoading}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${role === 'employee'
                                    ? 'bg-white text-blue-600 shadow-md'
                                    : 'text-slate-600 hover:text-slate-900'
                                } disabled:opacity-50`}
                        >
                            <User size={18} />
                            Employee
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('admin')}
                            disabled={isLoading}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${role === 'admin'
                                    ? 'bg-white text-blue-600 shadow-md'
                                    : 'text-slate-600 hover:text-slate-900'
                                } disabled:opacity-50`}
                        >
                            <Shield size={18} />
                            Administrator
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="employeeId"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Employee ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IdCard className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="employeeId"
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    placeholder="Enter your employee ID"
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>Sign In</>
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <Link
                            href="/"
                            className="text-slate-600 hover:text-slate-800 hover:underline text-sm"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-500 mt-6">
                    © 2026 FEIJIP . All rights reserved.
                </p>
            </div>
        </div>
    );
}
