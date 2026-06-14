export interface Department {
    department_id: string;
    department_name: string;
    department_code: string;
    created_at: string;
}

export interface Employee {
    employee_id: string;
    employee_name: string;
    employee_email: string;
    employee_password: string;
    role: 'employee' | 'admin';
    department_id: string | null;
    employee_date_register: string;
}

export interface Admin {
    admin_id: string;
    employee_id: string;
    admin_date_added: string;
}

export interface Attendance {
    attendance_id: string;
    employee_id: string;
    attendance_date: string;
    attendance_check_in: string;
    attendance_check_out: string | null;
    attendance_status: 'Present' | 'Late' | 'Absent' | 'Leave';
}

export interface LeaveRequest {
    leave_id: string;
    employee_id: string;
    start_date: string;
    end_date: string;
    leave_type: 'Annual' | 'Sick' | 'Emergency' | 'Medical';
    reason: string | null;
    leave_status: 'Pending' | 'Approved' | 'Rejected';
    created_at: string;
}

export interface AdminEmployeeDetails {
    employee_id: string;
    employee_name: string;
    employee_email: string;
    role: 'employee' | 'admin';
    employee_status: 'active' | 'inactive';
    department_name: string | null;
    department_code: string | null;
    department_id: string | null;
    admin_id: string | null;
    employee_date_register: string;
}
