-- 修复监控任务表的destination_code字段，允许为空
-- 这样用户可以监控从某个城市出发到任何目的地的航班

-- 修改destination_code字段，允许为NULL
ALTER TABLE monitor_tasks 
ALTER COLUMN destination_code DROP NOT NULL;

-- 添加注释说明
COMMENT ON COLUMN monitor_tasks.destination_code IS '目的地机场代码，为空时监控所有目的地';
COMMENT ON COLUMN monitor_tasks.departure_code IS '出发地机场代码，必填';

-- 更新现有的空字符串为NULL（如果有的话）
UPDATE monitor_tasks 
SET destination_code = NULL 
WHERE destination_code = '' OR destination_code = 'null';

-- 创建一个检查约束，确保departure_code不为空
ALTER TABLE monitor_tasks 
ADD CONSTRAINT check_departure_code_not_empty 
CHECK (departure_code IS NOT NULL AND departure_code != '');
