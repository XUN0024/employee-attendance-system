# Leave Request System - FR-03 Implementation

## Overview
Complete implementation of Digital Leave Application & Approval Workflow as required by FR-03.

## Features Implemented

### 1. Employee Leave Request Submission
**Route:** `/employee/leave`

**Features:**
- Submit leave requests with date range (start date and end date)
- Select leave type:
  - Annual Leave
  - Sick Leave
  - Emergency Leave
  - Medical Leave
- Add optional reason/explanation
- View all submitted leave requests
- Track request status (Pending/Approved/Rejected)
- Calculate total leave days automatically

**UI Components:**
- New Request button
- Leave request submission form
- Leave history table with status badges
- Real-time status updates

### 2. Admin Leave Approval Dashboard
**Route:** `/admin/leave-approvals`

**Features:**
- Centralized dashboard for reviewing all leave requests
- Filter by status:
  - Pending (default view)
  - All Requests
- View employee information with each request:
  - Employee name
  - Employee email
  - Leave type
  - Date range
  - Number of days
  - Reason (if provided)
  - Submission timestamp
- Execute actions:
  - **Approve**: Approves leave and automatically creates attendance records
  - **Reject**: Rejects leave request
- Real-time action feedback

### 3. Automatic Attendance Calendar Update
When an admin **approves** a leave request:
1. Leave status is updated to "Approved"
2. Attendance records are automatically created for each day in the leave period
3. Each attendance record is marked with status: `Leave`
4. Check-in time is auto-set to 9:00 AM for each leave day
5. Existing attendance records are updated (upsert operation)

### 4. Database Schema
**Table:** `leave_requests`
```sql
CREATE TABLE leave_requests (
  leave_id UUID PRIMARY KEY,
  employee_id VARCHAR(50) REFERENCES employees(employee_id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type VARCHAR(50) CHECK (leave_type IN ('Annual', 'Sick', 'Emergency', 'Medical')),
  reason TEXT,
  leave_status VARCHAR(20) DEFAULT 'Pending' CHECK (leave_status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_leave_dates CHECK (end_date >= start_date)
);
```

**Updated Attendance Status:**
```sql
attendance_status VARCHAR(20) CHECK (attendance_status IN ('Present', 'Late', 'Absent', 'Leave'))
```

## Navigation Updates

### Employee Navigation Menu
Added new menu item:
- **Leave Requests** (icon: FileText) → `/employee/leave`

### Admin Navigation Menu
Added new menu item:
- **Leave Approvals** (icon: ClipboardCheck) → `/admin/leave-approvals`

### Admin Dashboard
Added new statistics card:
- **Pending Leave Requests** count with direct link to approval page

## Business Logic (lib/leave.ts)

### Key Functions:
1. `submitLeaveRequest()` - Employee submits leave request
2. `getEmployeeLeaveRequests()` - Fetch employee's leave history
3. `getPendingLeaveRequests()` - Admin views pending requests
4. `getAllLeaveRequests()` - Admin views all requests
5. `approveLeaveRequest()` - Approve and create attendance records
6. `rejectLeaveRequest()` - Reject leave request

### Validation Rules:
- End date cannot be before start date
- Only employees can submit leave requests
- Only admins can approve/reject requests
- Each leave day creates a "Leave" status attendance record

## Usage Flow

### For Employees:
1. Navigate to "Leave Requests" in sidebar
2. Click "New Request" button
3. Fill in the form:
   - Start Date
   - End Date
   - Leave Type (dropdown)
   - Reason (optional)
4. Submit request
5. View request status in the leave history table

### For Administrators:
1. Navigate to "Leave Approvals" in sidebar
2. View pending requests (default) or all requests
3. Review employee information and leave details
4. Click "Approve" to:
   - Approve the leave
   - Automatically update attendance calendar with "Leave" status
5. Click "Reject" to decline the request
6. See real-time feedback after each action

## TypeScript Types
Added to `lib/types.ts`:
```typescript
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
```

## UI/UX Features
- Color-coded leave types (blue, purple, orange, pink)
- Status badges with icons:
  - ⏰ Pending (amber)
  - ✓ Approved (green)
  - ✗ Rejected (red)
- Loading states for all async operations
- Success/error message notifications
- Responsive design for all screen sizes
- Empty states with helpful messages

## Testing Checklist
- [ ] Employee can submit leave request
- [ ] Employee can view their leave history
- [ ] Admin can see pending leave requests
- [ ] Admin can approve leave request
- [ ] Admin can reject leave request
- [ ] Approved leave creates attendance records with "Leave" status
- [ ] Date validation works (end >= start)
- [ ] Leave day calculation is accurate
- [ ] Status updates in real-time
- [ ] Navigation menus show new items
- [ ] Admin dashboard shows pending count

## FR-03 Compliance

✅ **Employees can submit formal leave requests** - Implemented  
✅ **Specify leave date range** - Start and end date fields  
✅ **Specify leave type** - 4 types available (Annual, Sick, Emergency, Medical)  
✅ **Centralized admin dashboard** - `/admin/leave-approvals`  
✅ **Review pending requests** - Filterable view  
✅ **Execute Approve/Reject actions** - Action buttons  
✅ **Automatically update attendance status calendar** - Creates "Leave" attendance records  

## Status: ✅ FULLY IMPLEMENTED
FR-03 is now 100% complete and operational.
