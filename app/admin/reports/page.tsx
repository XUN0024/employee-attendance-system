'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Loader2, AlertCircle, CheckCircle2, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Department {
    department_id: string;
    department_name: string;
    department_code: string;
}

interface AttendanceRecord {
    employee_id: string;
    employee_name: string;
    department_name: string | null;
    work_days: number;
    total_days: number;
    present_days: number;
    late_days: number;
    leave_days: number;
    absent_days: number;
    attendance_rate: number;
}

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState<AttendanceRecord[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .order('department_name', { ascending: true });

            if (error) throw error;
            setDepartments(data || []);
        } catch (err) {
            console.error('Error loading departments:', err);
        }
    };

    const generateReport = async () => {
        setIsGenerating(true);
        setMessage(null);

        try {
            // Validate that selected date is not in the future
            if (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)) {
                setMessage({
                    type: 'error',
                    text: 'Cannot generate report for future dates. Please select a past or current month.',
                });
                setIsGenerating(false);
                return;
            }

            // Calculate date range
            const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
            const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

            // Fetch all employees (only employee role, exclude admins)
            let employeesQuery = supabase
                .from('admin_employee_details')
                .select('employee_id, employee_name, department_name, employee_status')
                .eq('employee_status', 'active')
                .eq('role', 'employee');

            if (selectedDepartment !== 'all') {
                employeesQuery = employeesQuery.eq('department_id', selectedDepartment);
            }

            const { data: employees, error: empError } = await employeesQuery;

            if (empError) throw empError;

            if (!employees || employees.length === 0) {
                setMessage({
                    type: 'error',
                    text: 'No employees found for the selected criteria',
                });
                setReportData([]);
                return;
            }

            // Fetch attendance for each employee
            const reportRecords: AttendanceRecord[] = [];

            for (const employee of employees) {
                const { data: attendance, error: attError } = await supabase
                    .from('attendances')
                    .select('*')
                    .eq('employee_id', employee.employee_id)
                    .gte('attendance_date', startDate)
                    .lte('attendance_date', endDate);

                if (attError) {
                    console.error('Error fetching attendance:', attError);
                    continue;
                }

                const presentDays = attendance?.filter(a => a.attendance_status === 'Present').length || 0;
                const lateDays = attendance?.filter(a => a.attendance_status === 'Late').length || 0;
                const leaveDays = attendance?.filter(a => a.attendance_status === 'Leave').length || 0;
                const totalDays = attendance?.length || 0;

                // Calculate work days in month (excluding weekends)
                const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
                const monthEnd = new Date(selectedYear, selectedMonth, 0);
                let workDays = 0;

                for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
                    const dayOfWeek = d.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        workDays++;
                    }
                }

                const absentDays = Math.max(0, workDays - totalDays);
                const attendanceRate = workDays > 0 ? Math.round((totalDays / workDays) * 100) : 0;

                reportRecords.push({
                    employee_id: employee.employee_id,
                    employee_name: employee.employee_name,
                    department_name: employee.department_name || 'No Department',
                    work_days: workDays,
                    total_days: totalDays,
                    present_days: presentDays,
                    late_days: lateDays,
                    leave_days: leaveDays,
                    absent_days: absentDays,
                    attendance_rate: attendanceRate,
                });
            }

            setReportData(reportRecords);
            setMessage({
                type: 'success',
                text: `Report generated successfully with ${reportRecords.length} employee records`,
            });
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'Failed to generate report',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text('Monthly Attendance Report', 14, 20);

        // Report Info
        doc.setFontSize(10);
        doc.text(`Month: ${getMonthName(selectedMonth)} ${selectedYear}`, 14, 30);
        doc.text(`Department: ${selectedDepartment === 'all' ? 'All Departments' : departments.find(d => d.department_id === selectedDepartment)?.department_name || 'Unknown'}`, 14, 36);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);
        doc.text(`Total Employees: ${reportData.length}`, 14, 48);

        // Table
        autoTable(doc, {
            startY: 55,
            head: [['Employee ID', 'Name', 'Department', 'Work Days', 'Attendance Days', 'Present', 'Late', 'Leave', 'Absent', 'Rate %']],
            body: reportData.map(record => [
                record.employee_id,
                record.employee_name,
                record.department_name,
                record.work_days.toString(),
                record.total_days.toString(),
                record.present_days.toString(),
                record.late_days.toString(),
                record.leave_days.toString(),
                record.absent_days.toString(),
                record.attendance_rate.toString() + '%',
            ]),
            styles: { fontSize: 7 },
            headStyles: { fillColor: [59, 130, 246] },
        });

        // Save
        const fileName = `attendance_report_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.pdf`;
        doc.save(fileName);
    };

    const exportToCSV = () => {
        const headers = ['Employee ID', 'Name', 'Department', 'Work Days', 'Attendance Days', 'Present', 'Late', 'Leave', 'Absent', 'Attendance Rate'];
        const rows = reportData.map(record => [
            record.employee_id,
            record.employee_name,
            record.department_name,
            record.work_days,
            record.total_days,
            record.present_days,
            record.late_days,
            record.leave_days,
            record.absent_days,
            record.attendance_rate + '%',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getMonthName = (month: number) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month - 1];
    };

    // Generate available years (from 2024 to current year)
    const getAvailableYears = () => {
        const startYear = 2024;
        const years = [];
        for (let year = startYear; year <= currentYear; year++) {
            years.push(year);
        }
        return years;
    };

    // Generate available months based on selected year
    const getAvailableMonths = () => {
        if (selectedYear === currentYear) {
            // For current year, only show months up to current month
            return Array.from({ length: currentMonth }, (_, i) => i + 1);
        } else {
            // For past years, show all 12 months
            return Array.from({ length: 12 }, (_, i) => i + 1);
        }
    };

    // Adjust selected month when year changes
    const handleYearChange = (year: number) => {
        setSelectedYear(year);
        // If switching to current year and selected month is in the future, reset to current month
        if (year === currentYear && selectedMonth > currentMonth) {
            setSelectedMonth(currentMonth);
        }
    };

    const getTotalStats = () => {
        const totalPresent = reportData.reduce((sum, r) => sum + r.present_days, 0);
        const totalLate = reportData.reduce((sum, r) => sum + r.late_days, 0);
        const totalLeave = reportData.reduce((sum, r) => sum + r.leave_days, 0);
        const totalAbsent = reportData.reduce((sum, r) => sum + r.absent_days, 0);
        const avgRate = reportData.length > 0 
            ? Math.round(reportData.reduce((sum, r) => sum + r.attendance_rate, 0) / reportData.length)
            : 0;

        return { totalPresent, totalLate, totalLeave, totalAbsent, avgRate };
    };

    const stats = getTotalStats();

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Monthly Attendance Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Generate and export attendance summaries for payroll checking
                    </p>
                </div>

                {/* Message */}
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

                {/* Report Configuration */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Report Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Year */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Year
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => handleYearChange(Number(e.target.value))}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {getAvailableYears().map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Month */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Month
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {getAvailableMonths().map(month => (
                                    <option key={month} value={month}>{getMonthName(month)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Department
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept.department_id} value={dept.department_id}>
                                        {dept.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Generate Button */}
                        <div className="flex items-end">
                            <button
                                onClick={generateReport}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-5 w-5" />
                                        Generate Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Summary */}
                {reportData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-white rounded-lg border border-zinc-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <h3 className="text-sm font-medium text-slate-600">Total Employees</h3>
                            </div>
                            <p className="text-3xl font-semibold text-slate-900">{reportData.length}</p>
                        </div>

                        <div className="bg-white rounded-lg border border-zinc-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <h3 className="text-sm font-medium text-slate-600">Total Present</h3>
                            </div>
                            <p className="text-3xl font-semibold text-slate-900">{stats.totalPresent}</p>
                        </div>

                        <div className="bg-white rounded-lg border border-zinc-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <h3 className="text-sm font-medium text-slate-600">Total Late</h3>
                            </div>
                            <p className="text-3xl font-semibold text-slate-900">{stats.totalLate}</p>
                        </div>

                        <div className="bg-white rounded-lg border border-zinc-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <h3 className="text-sm font-medium text-slate-600">Total Leave</h3>
                            </div>
                            <p className="text-3xl font-semibold text-slate-900">{stats.totalLeave}</p>
                        </div>

                        <div className="bg-white rounded-lg border border-zinc-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                <h3 className="text-sm font-medium text-slate-600">Avg. Rate</h3>
                            </div>
                            <p className="text-3xl font-semibold text-slate-900">{stats.avgRate}%</p>
                        </div>
                    </div>
                )}

                {/* Report Data Table */}
                {reportData.length > 0 && (
                    <div className="bg-white rounded-lg border border-zinc-200">
                        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Attendance Summary - {getMonthName(selectedMonth)} {selectedYear}
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={exportToCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    Export PDF
                                </button>
                            </div>
                        </div>

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
                                            Department
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Work Days
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Att. Days
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Present
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Late
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Leave
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Absent
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                                            Rate
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {reportData.map((record) => (
                                        <tr key={record.employee_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4 text-sm font-medium text-slate-900">
                                                {record.employee_id}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-900">
                                                {record.employee_name}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-600">
                                                {record.department_name}
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm font-medium text-slate-700">
                                                {record.work_days}
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm font-medium text-slate-900">
                                                {record.total_days}
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm text-green-700">
                                                {record.present_days}
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm text-amber-700">
                                                {record.late_days}
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm text-blue-700">
                                                {record.leave_days}
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm text-red-700">
                                                {record.absent_days}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                                        record.attendance_rate >= 90
                                                            ? 'bg-green-50 text-green-700'
                                                            : record.attendance_rate >= 75
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : record.attendance_rate >= 60
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : 'bg-red-50 text-red-700'
                                                    }`}
                                                >
                                                    {record.attendance_rate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Info Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Report Information</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>Reports include only active employees (excludes administrators)</li>
                                <li>Only past and current months are available for reporting</li>
                                <li>Absent days calculated based on workdays (excluding weekends)</li>
                                <li>Attendance rate = (Total attendance days / Workdays) × 100</li>
                                <li>Export to PDF for official records or CSV for spreadsheet analysis</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
