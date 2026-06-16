'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserPlus, FileText, LogOut, ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';

const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/employees', label: 'All Employees', icon: Users },
    { href: '/admin/add-employee', label: 'Add Employee', icon: UserPlus },
    { href: '/admin/leave-approvals', label: 'Leave Approvals', icon: ClipboardCheck },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const pathname = usePathname();

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <aside
                className={`${
                    isExpanded ? 'w-64' : 'w-20'
                } transition-all duration-300 border-r border-slate-200 bg-white flex flex-col shadow-sm`}
            >
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        {isExpanded && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="text-sm font-bold text-white">F</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">FEIJIP</h2>
                                    <p className="text-xs text-slate-500">Admin Panel</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors ml-auto"
                        >
                            {isExpanded ? (
                                <ChevronLeft className="h-5 w-5 text-slate-600" />
                            ) : (
                                <ChevronRight className="h-5 w-5 text-slate-600" />
                            )}
                        </button>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 font-semibold'
                                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm'
                                } ${!isExpanded && 'justify-center'}`}
                            >
                                {isActive && isExpanded && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                                )}
                                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                {isExpanded && (
                                    <span className="text-sm">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={async () => {
                            await fetch('/api/auth/logout', { method: 'POST' });
                            localStorage.removeItem('employee');
                            window.location.href = '/login';
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all ${
                            !isExpanded && 'justify-center'
                        }`}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {isExpanded && <span className="text-sm font-medium">Log Out</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
        </div>
    );
}
