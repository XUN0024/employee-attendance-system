'use client';

import { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // Password visibility toggles
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const validateForm = (): string | null => {
        if (!currentPassword) return 'Current password is required';
        if (!newPassword) return 'New password is required';
        if (newPassword.length < 6) return 'New password must be at least 6 characters';
        if (newPassword === currentPassword) return 'New password must be different from current password';
        if (!confirmPassword) return 'Please confirm your new password';
        if (newPassword !== confirmPassword) return 'New passwords do not match';
        return null;
    };

    const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
        if (!password) return { strength: '', color: '', width: '0%' };
        
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 10) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score <= 1) return { strength: 'Weak', color: 'bg-red-500', width: '20%' };
        if (score === 2) return { strength: 'Fair', color: 'bg-orange-500', width: '40%' };
        if (score === 3) return { strength: 'Good', color: 'bg-yellow-500', width: '60%' };
        if (score === 4) return { strength: 'Strong', color: 'bg-blue-500', width: '80%' };
        return { strength: 'Very Strong', color: 'bg-green-500', width: '100%' };
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
            const response = await fetch('/api/employee/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Password changed successfully! Please use your new password for future logins.',
                });
                
                // Clear form
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Failed to change password',
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

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Change Password</h1>
                    <p className="text-sm text-slate-500 mt-1">Update your account password</p>
                </div>

                {message && (
                    <div
                        className={`p-4 rounded-xl border flex items-start gap-3 ${
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
                            className={`text-sm font-semibold ${
                                message.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                            }`}
                        >
                            {message.text}
                        </p>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                <Lock className="inline h-4 w-4 mr-1" />
                                Current Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter your current password"
                                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-50"
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Enter your current password to verify your identity
                            </p>
                        </div>

                        <div className="border-t border-slate-200 pt-6">
                            {/* New Password */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <Lock className="inline h-4 w-4 mr-1" />
                                    New Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter your new password"
                                        className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-50"
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                
                                {/* Password Strength Meter */}
                                {newPassword && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-slate-500">Password strength:</span>
                                            <span className={`text-xs font-bold ${
                                                passwordStrength.strength === 'Weak' ? 'text-red-600' :
                                                passwordStrength.strength === 'Fair' ? 'text-orange-600' :
                                                passwordStrength.strength === 'Good' ? 'text-yellow-600' :
                                                passwordStrength.strength === 'Strong' ? 'text-blue-600' :
                                                'text-green-600'
                                            }`}>
                                                {passwordStrength.strength}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                style={{ width: passwordStrength.width }}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <p className="text-xs text-slate-500 mt-2">
                                    Must be at least 6 characters and different from current password
                                </p>
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <Lock className="inline h-4 w-4 mr-1" />
                                    Confirm New Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your new password"
                                        className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-50"
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                
                                {/* Match Indicator */}
                                {confirmPassword && (
                                    <p className={`text-xs mt-2 font-semibold ${
                                        newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Changing Password...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-5 w-5" />
                                        Change Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-bold mb-2">Password Requirements</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>Minimum 6 characters required</li>
                                <li>Must be different from your current password</li>
                                <li>Use a mix of uppercase, lowercase, numbers, and symbols for stronger security</li>
                                <li>Avoid using common words or personal information</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                            <p className="font-bold mb-1">Security Notice</p>
                            <p className="text-amber-700">
                                After changing your password, you will need to use the new password for all future logins.
                                Make sure to remember or securely store your new password.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
