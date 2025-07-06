-- 添加密码重置token表
-- 在 Supabase SQL 编辑器中执行此脚本

-- 密码重置token表
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token信息
    token VARCHAR(255) UNIQUE NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    
    -- 状态
    is_used BOOLEAN DEFAULT FALSE,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_is_used ON password_reset_tokens(is_used);

-- 启用行级安全策略 (RLS)
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 密码重置token表的 RLS 策略
CREATE POLICY "Users can view own password reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update password reset tokens" ON password_reset_tokens
    FOR UPDATE USING (true);

-- 创建清理过期token的函数
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() OR is_used = true;
END;
$$ LANGUAGE plpgsql;

-- 创建定时清理任务（可选，需要pg_cron扩展）
-- SELECT cron.schedule('cleanup-expired-tokens', '0 2 * * *', 'SELECT cleanup_expired_password_reset_tokens();');
