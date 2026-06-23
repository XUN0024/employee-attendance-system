'use client';

import { useState, useEffect } from 'react';
import { Clock, ArrowRight, CheckCircle2, Server } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <div className="bg-white rounded-lg shadow-lg p-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-800 mb-3">
                            FEIJIP Attendance Portal
                        </h1>
                        <p className="text-lg text-slate-600">
                            Welcome to FEIJIP Corporate Solutions
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-8 mb-8 text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Clock className="h-6 w-6 text-blue-600" />
                            <span className="text-sm font-medium text-slate-600">Server Time</span>
                        </div>
                        <div className="text-5xl font-bold text-slate-800 mb-2 font-mono">
                            {isMounted && currentTime ? formatTime(currentTime) : '--:--:--'}
                        </div>
                        <div className="text-lg text-slate-600">
                            {isMounted && currentTime ? formatDate(currentTime) : 'Loading...'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 rounded-lg p-4 flex items-start gap-3">
                            <Server className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-slate-800 text-sm mb-1">Server Timestamping</h3>
                                <p className="text-xs text-slate-600">All timestamps enforced server-side</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-slate-800 text-sm mb-1">Secure Access</h3>
                                <p className="text-xs text-slate-600">Encrypted authentication protocol</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-lg"
                    >
                        Access System
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>

                <p className="text-center text-xs text-slate-500 mt-6">
                    © 2026 FEIJIP Corporate Solutions. All rights reserved.
                </p>
            </div>
        </div>
    );
}
