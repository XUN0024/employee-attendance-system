-- ==========================================
-- 创建服务器时间函数（防止客户端时间篡改）
-- ==========================================

-- 创建函数返回服务器当前时间
CREATE OR REPLACE FUNCTION get_server_time()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
STABLE
AS $$
  SELECT CURRENT_TIMESTAMP;
$$;

-- 给所有认证用户访问权限
GRANT EXECUTE ON FUNCTION get_server_time() TO anon, authenticated;
