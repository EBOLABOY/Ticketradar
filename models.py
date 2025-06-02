"""
数据库模型定义
"""
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import secrets
import string

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """用户模型"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    # 用户设置
    pushplus_token = db.Column(db.String(255))
    notification_enabled = db.Column(db.Boolean, default=True)

    # 关联监控任务
    monitor_tasks = db.relationship('MonitorTask', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        """设置密码"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active,
            'notification_enabled': self.notification_enabled
        }

class InviteCode(db.Model):
    """邀请码模型"""
    __tablename__ = 'invite_codes'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(32), unique=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    used_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    used_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    max_uses = db.Column(db.Integer, default=1)
    current_uses = db.Column(db.Integer, default=0)

    # 关联用户
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_invite_codes')
    user = db.relationship('User', foreign_keys=[used_by], backref='used_invite_codes')

    @staticmethod
    def generate_code(length=16):
        """生成邀请码"""
        characters = string.ascii_letters + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))

    def is_valid(self):
        """检查邀请码是否有效"""
        if not self.is_active:
            return False
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return False
        if self.current_uses >= self.max_uses:
            return False
        return True

    def use_code(self, user_id):
        """使用邀请码"""
        if not self.is_valid():
            return False

        self.used_by = user_id
        self.used_at = datetime.utcnow()
        self.current_uses += 1

        if self.current_uses >= self.max_uses:
            self.is_active = False

        return True

class MonitorTask(db.Model):
    """监控任务模型"""
    __tablename__ = 'monitor_tasks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # 任务基本信息
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)

    # 行程信息
    departure_city = db.Column(db.String(50), nullable=False)  # 出发城市名称
    departure_code = db.Column(db.String(10), nullable=False)  # 出发城市代码
    destination_city = db.Column(db.String(50))  # 目的地城市（可选，为空则监控所有）
    destination_code = db.Column(db.String(10))  # 目的地代码

    # 日期信息
    depart_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date)  # 返程日期（单程可为空）
    trip_type = db.Column(db.String(10), default='round_trip')  # 'one_way' 或 'round_trip'

    # 监控设置
    price_threshold = db.Column(db.Float, default=1000.0)
    check_interval = db.Column(db.Integer, default=30)  # 检查间隔（分钟）

    # 通知设置
    notification_enabled = db.Column(db.Boolean, default=True)
    email_notification = db.Column(db.Boolean, default=False)
    pushplus_notification = db.Column(db.Boolean, default=True)
    pushplus_token = db.Column(db.String(255))  # 用户的PushPlus令牌

    # 时间戳
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_check = db.Column(db.DateTime)
    last_notification = db.Column(db.DateTime)

    # 统计信息
    total_checks = db.Column(db.Integer, default=0)
    total_notifications = db.Column(db.Integer, default=0)

    # 关联通知记录
    notifications = db.relationship('Notification', backref='task', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'is_active': self.is_active,
            'departure_city': self.departure_city,
            'departure_code': self.departure_code,
            'destination_city': self.destination_city,
            'destination_code': self.destination_code,
            'depart_date': self.depart_date.isoformat() if self.depart_date else None,
            'return_date': self.return_date.isoformat() if self.return_date else None,
            'trip_type': self.trip_type,
            'price_threshold': self.price_threshold,
            'check_interval': self.check_interval,
            'notification_enabled': self.notification_enabled,
            'email_notification': self.email_notification,
            'pushplus_notification': self.pushplus_notification,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_check': self.last_check.isoformat() if self.last_check else None,
            'last_notification': self.last_notification.isoformat() if self.last_notification else None,
            'total_checks': self.total_checks,
            'total_notifications': self.total_notifications
        }

class Notification(db.Model):
    """通知记录模型"""
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('monitor_tasks.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # 通知内容
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    notification_type = db.Column(db.String(20), default='price_alert')  # 'price_alert', 'system', 'error'

    # 航班信息
    destination = db.Column(db.String(100))
    price = db.Column(db.Float)
    currency = db.Column(db.String(10), default='CNY')

    # 发送状态
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    pushplus_sent = db.Column(db.Boolean, default=False)
    email_sent = db.Column(db.Boolean, default=False)

    # 关联用户
    user = db.relationship('User', backref='notifications')

    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'task_id': self.task_id,
            'title': self.title,
            'content': self.content,
            'notification_type': self.notification_type,
            'destination': self.destination,
            'price': self.price,
            'currency': self.currency,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'is_read': self.is_read,
            'pushplus_sent': self.pushplus_sent,
            'email_sent': self.email_sent
        }

class CityCode(db.Model):
    """城市代码映射表"""
    __tablename__ = 'city_codes'

    id = db.Column(db.Integer, primary_key=True)
    city_name = db.Column(db.String(100), nullable=False)
    city_code = db.Column(db.String(10), nullable=False)
    country = db.Column(db.String(100))
    is_departure = db.Column(db.Boolean, default=False)  # 是否可作为出发地
    is_destination = db.Column(db.Boolean, default=True)  # 是否可作为目的地
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'city_name': self.city_name,
            'city_code': self.city_code,
            'country': self.country,
            'is_departure': self.is_departure,
            'is_destination': self.is_destination,
            'is_active': self.is_active
        }
