-- ==========================================
-- 更新管理员密码为 bcrypt 加密版本
-- ==========================================
-- 原密码: admin123
-- 运行此 SQL 来更新现有管理员的密码为加密版本

UPDATE employees 
SET employee_password = '$2b$10$jJaFcNaSuTNjBmMCtjMTZeJJLj.eif9e5XKlQGvDWTQSD4XY3I9du'
WHERE employee_id = 'ADMIN001';

-- 验证更新
SELECT employee_id, employee_name, employee_email, role 
FROM employees 
WHERE employee_id = 'ADMIN001';
