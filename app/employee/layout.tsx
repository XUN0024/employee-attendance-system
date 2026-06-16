'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, CheckSquare, CalendarDays, Key, LogOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const menuItems = [
    { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/employee/profile', label: 'My Profile', icon: User },
    { href: '/employee/mark', label: 'Mark Attendance', icon: CheckSquare },
    { href: '/employee/leave', label: 'Leave Requests', icon: FileText },
    { href: '/employee/current-month', label: 'Attendance', icon: CalendarDays },
    { href: '/employee/change-password', label: 'Change Password', icon: Key },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const pathname = usePathname();

    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50">
            <aside
                className={`${
                    isExpanded ? 'w-64' : 'w-20'
                } transition-all duration-300 border-r border-zinc-200 bg-white flex flex-col`}
            >
                <div className="p-6 border-b border-zinc-200">
                    <div className="flex items-center justify-between">
                        {isExpanded && (
                            <h2 className="text-lg font-semibold text-slate-900">FEIJIP</h2>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors ml-auto"
                        >
                            {isExpanded ? (
                                <ChevronLeft className="h-5 w-5 text-slate-600" />
                            ) : (
                                <ChevronRight className="h-5 w-5 text-slate-600" />
                            )}
                        </button>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:bg-zinc-100 hover:text-slate-900'
                                } ${!isExpanded && 'justify-center'}`}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {isExpanded && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-200">
                    <button
                        onClick={async () => {
                            await fetch('/api/auth/logout', { method: 'POST' });
                            localStorage.removeItem('employee');
                            window.location.href = '/login';
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-zinc-100 hover:text-slate-900 transition-colors ${
                            !isExpanded && 'justify-center'
                        }`}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {isExpanded && <span className="text-sm font-medium">Log Out</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}
