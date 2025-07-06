-- 机票监控系统 Supabase 数据库表结构
-- 在 Supabase SQL 编辑器中执行此脚本

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- 用户状态
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- 个人信息
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    
    -- 通知设置
    notification_enabled BOOLEAN DEFAULT TRUE,
    email_notifications_enabled BOOLEAN DEFAULT FALSE,
    pushplus_token VARCHAR(255),
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 监控任务表
CREATE TABLE IF NOT EXISTS monitor_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 基本信息
    task_name VARCHAR(200) NOT NULL,
    departure_code VARCHAR(10) NOT NULL,
    destination_code VARCHAR(10) NOT NULL,
    depart_date DATE NOT NULL,
    return_date DATE,
    
    -- 航班偏好
    seat_class VARCHAR(20) DEFAULT 'economy',
    trip_type VARCHAR(20) DEFAULT 'round_trip',
    max_stops INTEGER DEFAULT 2,
    
    -- 状态
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 监控设置
    price_threshold DECIMAL(10,2) DEFAULT 1000.0,
    check_interval INTEGER DEFAULT 30,
    
    -- 通知设置
    notification_enabled BOOLEAN DEFAULT TRUE,
    email_notification BOOLEAN DEFAULT FALSE,
    pushplus_notification BOOLEAN DEFAULT TRUE,
    pushplus_token VARCHAR(255),
    
    -- 黑名单设置
    blacklist_cities TEXT,
    blacklist_countries TEXT,
    
    -- 筛选设置
    exclude_domestic BOOLEAN DEFAULT TRUE,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_check TIMESTAMPTZ,
    last_notification TIMESTAMPTZ,
    
    -- 统计信息
    total_checks INTEGER DEFAULT 0,
    total_notifications INTEGER DEFAULT 0
);

-- 旅行计划表
CREATE TABLE IF NOT EXISTS travel_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 基本信息
    title VARCHAR(200) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    origin_city VARCHAR(100),
    depart_date DATE,
    return_date DATE,
    days INTEGER,
    people_count INTEGER,
    
    -- 表单数据（JSON格式存储完整的表单输入）
    form_data JSONB,
    
    -- 生成的计划内容
    plan_content TEXT,
    plan_data JSONB,
    
    -- MCP数据源信息
    data_sources JSONB,
    
    -- 状态信息
    status VARCHAR(20) DEFAULT 'draft',
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(100) UNIQUE,
    
    -- AI使用统计
    ai_tokens_used INTEGER DEFAULT 0,
    generation_time DECIMAL(10,3) DEFAULT 0.0,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- 通知内容
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'info',

    -- 状态
    is_read BOOLEAN DEFAULT FALSE,

    -- 关联信息
    related_task_id UUID REFERENCES monitor_tasks(id) ON DELETE SET NULL,
    related_plan_id UUID REFERENCES travel_plans(id) ON DELETE SET NULL,

    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

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

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_monitor_tasks_user_id ON monitor_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_monitor_tasks_is_active ON monitor_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_monitor_tasks_departure ON monitor_tasks(departure_code);
CREATE INDEX IF NOT EXISTS idx_monitor_tasks_destination ON monitor_tasks(destination_code);
CREATE INDEX IF NOT EXISTS idx_monitor_tasks_depart_date ON monitor_tasks(depart_date);
CREATE INDEX IF NOT EXISTS idx_monitor_tasks_user_active ON monitor_tasks(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_status ON travel_plans(status);
CREATE INDEX IF NOT EXISTS idx_travel_plans_is_public ON travel_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_travel_plans_share_token ON travel_plans(share_token);
CREATE INDEX IF NOT EXISTS idx_travel_plans_created_at ON travel_plans(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_is_used ON password_reset_tokens(is_used);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建更新时间戳触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitor_tasks_updated_at BEFORE UPDATE ON monitor_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_plans_updated_at BEFORE UPDATE ON travel_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 用户表的 RLS 策略
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 监控任务表的 RLS 策略
CREATE POLICY "Users can view own monitor tasks" ON monitor_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monitor tasks" ON monitor_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitor tasks" ON monitor_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitor tasks" ON monitor_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- 旅行计划表的 RLS 策略
CREATE POLICY "Users can view own travel plans" ON travel_plans
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own travel plans" ON travel_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own travel plans" ON travel_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own travel plans" ON travel_plans
    FOR DELETE USING (auth.uid() = user_id);

-- 通知表的 RLS 策略
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 密码重置token表的 RLS 策略
CREATE POLICY "Users can view own password reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update password reset tokens" ON password_reset_tokens
    FOR UPDATE USING (true);

-- 创建一些有用的视图
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    COUNT(DISTINCT mt.id) as total_monitor_tasks,
    COUNT(DISTINCT tp.id) as total_travel_plans,
    COUNT(DISTINCT n.id) as total_notifications,
    COUNT(DISTINCT CASE WHEN n.is_read = false THEN n.id END) as unread_notifications
FROM users u
LEFT JOIN monitor_tasks mt ON u.id = mt.user_id
LEFT JOIN travel_plans tp ON u.id = tp.user_id
LEFT JOIN notifications n ON u.id = n.user_id
GROUP BY u.id, u.username, u.email;
