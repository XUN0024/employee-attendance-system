import React from 'react';

// Base Skeleton component
export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-slate-200 rounded ${className}`}
            aria-hidden="true"
        />
    );
}

// Card Skeleton
export function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
}

// Stat Card Skeleton
export function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-28" />
        </div>
    );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="p-6">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 mb-4 pb-3 border-b border-slate-200">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
                {/* Table Rows */}
                {[...Array(rows)].map((_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-5 gap-4 py-4 border-b border-slate-100">
                        {[...Array(5)].map((_, colIndex) => (
                            <Skeleton key={colIndex} className="h-4 w-full" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>

                {/* Table */}
                <TableSkeleton rows={5} />

                {/* CTA Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
        </div>
    );
}

// Form Skeleton
export function FormSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-5">
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>
                <div className="flex gap-3 pt-2">
                    <Skeleton className="h-12 w-32 rounded-xl" />
                    <Skeleton className="h-12 w-24 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

// List Skeleton
export function ListSkeleton({ items = 3 }: { items?: number }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="divide-y divide-slate-200">
                {[...Array(items)].map((_, i) => (
                    <div key={i} className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-6 w-20 rounded-lg" />
                                </div>
                                <Skeleton className="h-4 w-full max-w-md" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Profile Skeleton
export function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200">
                        <Skeleton className="w-20 h-20 rounded-2xl" />
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        ))}
                    </div>

                    {/* Notice */}
                    <div className="mt-8">
                        <Skeleton className="h-20 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Attendance Clock Skeleton
export function ClockSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    {/* Clock Display */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="text-center">
                            <Skeleton className="h-16 w-64 mb-2" />
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-6 w-32 rounded-lg" />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                    </div>

                    {/* Info */}
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

// Admin Stats Skeleton
export function AdminStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Leave Request Card Skeleton
export function LeaveCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-24 rounded-lg" />
                        <Skeleton className="h-6 w-20 rounded-lg" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-md" />
                    <Skeleton className="h-3 w-40" />
                </div>
                <div className="flex gap-2 ml-4">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
