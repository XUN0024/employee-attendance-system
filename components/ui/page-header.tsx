import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    gradient?: boolean;
}

export function PageHeader({ title, subtitle, icon, action, gradient = true }: PageHeaderProps) {
    return (
        <div className={`rounded-2xl border border-blue-100 p-6 md:p-8 mb-6 ${
            gradient 
                ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50' 
                : 'bg-white'
        } shadow-sm`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-slate-600">{subtitle}</p>
                        )}
                    </div>
                </div>
                {action && <div>{action}</div>}
            </div>
        </div>
    );
}

export function StatCard({ 
    icon, 
    label, 
    value, 
    subtitle, 
    color = 'blue',
    trend,
}: { 
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle?: string;
    color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'slate';
    trend?: 'up' | 'down';
}) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-500',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            border: 'border-blue-200',
            accent: 'from-blue-50 to-blue-100/50'
        },
        emerald: {
            bg: 'bg-emerald-500',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            border: 'border-emerald-200',
            accent: 'from-emerald-50 to-emerald-100/50'
        },
        amber: {
            bg: 'bg-amber-500',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            border: 'border-amber-200',
            accent: 'from-amber-50 to-amber-100/50'
        },
        purple: {
            bg: 'bg-purple-500',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            border: 'border-purple-200',
            accent: 'from-purple-50 to-purple-100/50'
        },
        red: {
            bg: 'bg-red-500',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            border: 'border-red-200',
            accent: 'from-red-50 to-red-100/50'
        },
        slate: {
            bg: 'bg-slate-500',
            iconBg: 'bg-slate-100',
            iconColor: 'text-slate-600',
            border: 'border-slate-200',
            accent: 'from-slate-50 to-slate-100/50'
        }
    };

    const colors = colorClasses[color];

    return (
        <div className={`relative bg-white rounded-2xl border ${colors.border} p-6 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer`}>
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bg}`} />
            
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 ${colors.iconBg} rounded-xl shadow-sm`}>
                        <div className={colors.iconColor}>
                            {icon}
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                        {label}
                    </h3>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-3xl font-bold text-slate-900 mb-1">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-sm text-slate-500">{subtitle}</p>
                        )}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-semibold ${
                            trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                            {trend === 'up' ? '↑' : '↓'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
