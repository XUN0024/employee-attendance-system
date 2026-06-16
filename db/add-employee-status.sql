-- ==========================================
-- Add employee_status field to employees table
-- ==========================================

-- Add status column with default 'active'
ALTER TABLE employees 
ADD COLUMN employee_status VARCHAR(20) DEFAULT 'active' 
CHECK (employee_status IN ('active', 'inactive'));

-- Update existing employees to 'active' status
UPDATE employees 
SET employee_status = 'active' 
WHERE employee_status IS NULL;

-- Create index for faster status queries
CREATE INDEX idx_employees_status ON employees(employee_status);

-- Update the admin_employee_details view to include status
DROP VIEW IF EXISTS admin_employee_details;

CREATE VIEW admin_employee_details AS
SELECT 
  e.employee_id, 
  e.employee_name, 
  e.employee_email,
  e.role, 
  e.employee_status,
  d.department_name,
  d.department_code,
  d.department_id,
  a.admin_id,
  e.employee_date_register
FROM employees e
LEFT JOIN admins a ON e.employee_id = a.employee_id
LEFT JOIN departments d ON e.department_id = d.department_id;

-- Verify the update
SELECT COUNT(*) as total_employees, employee_status 
FROM employees 
GROUP BY employee_status;

