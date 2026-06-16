# Employee Attendance System

This project is an Employee Attendance System developed for FEIJIP Corporate Solutions. The system allows employees to log in, mark attendance, view personal attendance records, submit leave requests, and change their passwords. Administrators can manage employee accounts, approve or reject leave requests, reset passwords, and generate monthly attendance reports.

The system is built using Next.js and uses Supabase as the database backend.

## Main Features

- Employee and administrator login
- Role-based access control
- Employee clock-in and clock-out
- Server-side attendance timestamp recording
- Attendance status classification as Present or Late
- Duplicate clock-in and invalid clock-out prevention
- Employee attendance history
- Leave request submission
- Admin leave approval and rejection
- Employee account management
- Manual password reset by administrator
- Monthly attendance report generation

## Getting Started

First, install the project dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open the following URL in your browser:

```
http://localhost:3000
```

The system will run locally on port 3000.

## Development Notes

Make sure the required environment variables for Supabase are configured before running the system. The application requires a valid Supabase connection to handle user accounts, attendance records, leave requests, and report data.
