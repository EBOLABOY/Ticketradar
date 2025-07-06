"""
FastAPI数据库配置
"""
from typing import AsyncGenerator
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from loguru import logger

# 导入配置
from fastapi_app.config import settings

# 数据库配置
DATABASE_URL = settings.DATABASE_URL

if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    url = make_url(DATABASE_URL)
    # set() 方法会智能地处理驱动程序部分
    url = url.set(drivername="postgresql+asyncpg")
    DATABASE_URL = str(url)
elif DATABASE_URL and DATABASE_URL.startswith("sqlite:///"):
    # 同样的方法也适用于其他方言，但这里保持原样以确保兼容性
    DATABASE_URL = DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///", 1)

# 创建异步引擎
async_engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # 设置为True可以看到SQL语句
    future=True
)

# 创建异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 创建基础模型类
Base = declarative_base()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    获取异步数据库会话
    
    这是FastAPI的依赖注入函数，用于在路由中获取数据库会话
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"数据库会话异常: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_async_db():
    """
    初始化异步数据库

    注意：当前项目使用Supabase作为数据库，不需要创建SQLAlchemy表
    此函数保留用于兼容性，但实际上不执行任何操作
    """
    try:
        # 项目使用Supabase，数据库表通过SQL脚本创建
        # 参见: Backend/migrations/supabase_schema.sql
        logger.info("使用Supabase数据库，跳过SQLAlchemy表创建")
    except Exception as e:
        logger.error(f"数据库初始化失败: {e}")


class DatabaseManager:
    """数据库管理器"""
    
    def __init__(self):
        self.engine = async_engine
        self.session_factory = AsyncSessionLocal
    
    async def create_tables(self):
        """创建所有表

        注意：当前项目使用Supabase作为数据库，不需要创建SQLAlchemy表
        此方法保留用于兼容性，但实际上不执行任何操作
        """
        try:
            # 项目使用Supabase，数据库表通过SQL脚本创建
            # 参见: Backend/migrations/supabase_schema.sql
            logger.info("使用Supabase数据库，跳过SQLAlchemy表创建")
        except Exception as e:
            logger.error(f"数据库表创建失败: {e}")
    
    async def drop_tables(self):
        """删除所有表"""
        try:
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
            logger.info("数据库表删除成功")
        except Exception as e:
            logger.error(f"数据库表删除失败: {e}")
    
    async def get_session(self) -> AsyncSession:
        """获取数据库会话"""
        return AsyncSessionLocal()
    
    async def close(self):
        """关闭数据库连接"""
        await self.engine.dispose()
        logger.info("数据库连接已关闭")


# 创建全局数据库管理器实例
db_manager = DatabaseManager()


# 数据库健康检查
async def check_database_health() -> bool:
    """检查数据库连接健康状态"""
    try:
        async with AsyncSessionLocal() as session:
            # 执行简单查询测试连接
            result = await session.execute("SELECT 1")
            result.fetchone()
            logger.debug("数据库连接健康检查通过")
            return True
    except Exception as e:
        logger.error(f"数据库连接健康检查失败: {e}")
        return False


# 数据库事务装饰器
class DatabaseTransaction:
    """数据库事务上下文管理器"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def __aenter__(self):
        return self.session
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):  # noqa: F841
        if exc_type is not None:
            await self.session.rollback()
            logger.error(f"事务回滚: {exc_type.__name__}: {exc_val}")
        else:
            await self.session.commit()
            logger.debug("事务提交成功")


# 数据库配置信息
class DatabaseConfig:
    """数据库配置类"""
    
    DATABASE_URL = DATABASE_URL
    ECHO_SQL = False  # 是否打印SQL语句
    POOL_SIZE = 5  # 连接池大小
    MAX_OVERFLOW = 10  # 最大溢出连接数
    POOL_TIMEOUT = 30  # 连接超时时间
    POOL_RECYCLE = 3600  # 连接回收时间
    
    @classmethod
    def get_engine_kwargs(cls) -> dict:
        """获取引擎配置参数"""
        return {
            "echo": cls.ECHO_SQL,
            "pool_size": cls.POOL_SIZE,
            "max_overflow": cls.MAX_OVERFLOW,
            "pool_timeout": cls.POOL_TIMEOUT,
            "pool_recycle": cls.POOL_RECYCLE,
        }


# 数据库迁移工具
class DatabaseMigration:
    """数据库迁移工具"""
    
    @staticmethod
    async def migrate_database():
        """数据库迁移功能"""
        # 这里可以实现数据迁移逻辑
        # 目前我们继续使用同步模型
        logger.info("数据库迁移功能待实现")
    
    @staticmethod
    async def backup_database():
        """备份数据库"""
        # 实现数据库备份逻辑
        logger.info("数据库备份功能待实现")
    
    @staticmethod
    async def restore_database():
        """恢复数据库"""
        # 实现数据库恢复逻辑
        logger.info("数据库恢复功能待实现")
