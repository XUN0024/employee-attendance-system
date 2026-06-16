-- ==========================================
-- 1. 创建部门表 (Departments) - 【新增】
-- ==========================================
CREATE TABLE departments (
  department_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department_name VARCHAR(100) UNIQUE NOT NULL,
  department_code VARCHAR(20) UNIQUE NOT NULL, -- 例如: 'HR', 'IT', 'SALES'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. 创建员工表 (Employee) - 【已修改】
-- ==========================================
CREATE TABLE employees (
  employee_id VARCHAR(50) PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  employee_email VARCHAR(255) UNIQUE NOT NULL,
  employee_password TEXT NOT NULL, 
  role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'admin')),
  
  -- 新增：关联到部门表的外键
  department_id UUID REFERENCES departments(department_id) ON DELETE SET NULL, 
  
  employee_date_register TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. 创建管理员表 (Admin)
-- ==========================================
CREATE TABLE admins (
  admin_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL UNIQUE REFERENCES employees(employee_id) ON DELETE CASCADE,
  admin_date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. 创建考勤表 (Attendance)
-- ==========================================

CREATE TABLE attendances (
  attendance_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL 
    REFERENCES employees(employee_id) ON DELETE CASCADE,

  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  attendance_check_in TIMESTAMP WITH TIME ZONE NOT NULL,
  attendance_check_out TIMESTAMP WITH TIME ZONE,

  attendance_status VARCHAR(20)
    DEFAULT 'Present'
    CHECK (attendance_status IN ('Present', 'Late', 'Absent', 'Leave')),

  CONSTRAINT unique_daily_attendance
    UNIQUE(employee_id, attendance_date)
);

-- ==========================================
-- 5. 初始化一些基础部门数据 (方便你测试)
-- ==========================================
INSERT INTO departments (department_name, department_code) VALUES 
('Human Resources', 'HR'),               -- 报告中明确提到的 HR 部门
('Customer Support', 'CS'),              -- 报告中提到的核心业务
('Data Processing', 'DP'),               -- 报告中提到的核心业务
('IT Infrastructure', 'IT');             -- 管理那 200 台内网电脑的 IT 部门

-- -- ==========================================
-- 6. 创建一个包含部门信息的增强版视图 (View)
-- ==========================================
CREATE VIEW admin_employee_details AS
SELECT 
  e.employee_id, 
  e.employee_name, 
  e.employee_email,
  e.role, 
  d.department_name,
  d.department_code,
  a.admin_id,
  e.employee_date_register
FROM employees e
LEFT JOIN admins a ON e.employee_id = a.employee_id
LEFT JOIN departments d ON e.department_id = d.department_id;

-- ==========================================
-- 4. 创建请假审批表 (Leave Requests) - 【全新加入】
-- ==========================================
CREATE TABLE leave_requests (
  leave_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 完美关联你的 VARCHAR(50) 工号主键
  employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE, 
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('Annual', 'Sick', 'Emergency', 'Medical')),
  reason TEXT,
  leave_status VARCHAR(20) DEFAULT 'Pending' CHECK (leave_status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- 业务规则约束：结束日期不能早于开始日期
  CONSTRAINT check_leave_dates CHECK (end_date >= start_date)
);

-- =
=========================================
-- 7. 初始化管理员账户 (用于测试登录)
-- ==========================================
-- 插入一个初始管理员员工
INSERT INTO employees (employee_id, employee_name, employee_email, employee_password, role, department_id) 
VALUES (
  'ADMIN001', 
  'System Administrator', 
  'admin@feijip.com', 
  'admin123',  -- 注意：生产环境请使用加密密码
  'admin',
  (SELECT department_id FROM departments WHERE department_code = 'IT' LIMIT 1)
);

-- 将该员工添加到管理员表
INSERT INTO admins (employee_id) 
VALUES ('ADMIN001');


-- ==========================================
-- 🔧 OPTIONAL: Fix for existing databases
-- ==========================================
-- If you already have a leave_requests table without proper defaults,
-- run this section separately to add the default UUID generator

-- Add default UUID generator to leave_id if missing
DO $$ 
BEGIN
    -- Check if leave_id column exists and needs a default
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'leave_requests' 
        AND column_name = 'leave_id'
        AND column_default IS NULL
    ) THEN
        ALTER TABLE leave_requests 
        ALTER COLUMN leave_id SET DEFAULT gen_random_uuid();
        
        RAISE NOTICE 'Added default UUID generator to leave_id column';
    ELSE
        RAISE NOTICE 'leave_id already has a default value or table does not exist';
    END IF;
END $$;

-- Verify the table structure
-- Uncomment to check:
-- SELECT 
--     column_name,
--     column_default,
--     is_nullable,
--     data_type
-- FROM information_schema.columns
-- WHERE table_name = 'leave_requests'
-- ORDER BY ordinal_position;
