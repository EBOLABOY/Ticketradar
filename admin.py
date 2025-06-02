"""
管理员功能模块
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from functools import wraps
from models import db, User, InviteCode, MonitorTask, Notification, CityCode
from datetime import datetime, timedelta
import secrets
import string

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

def admin_required(f):
    """管理员权限装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('需要管理员权限', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/')
@login_required
@admin_required
def index():
    """管理员首页"""
    # 统计信息
    stats = {
        'total_users': User.query.count(),
        'active_users': User.query.filter_by(is_active=True).count(),
        'total_tasks': MonitorTask.query.count(),
        'active_tasks': MonitorTask.query.filter_by(is_active=True).count(),
        'total_invites': InviteCode.query.count(),
        'active_invites': InviteCode.query.filter_by(is_active=True).count(),
        'total_notifications': Notification.query.count(),
        'unread_notifications': Notification.query.filter_by(is_read=False).count()
    }
    
    # 最近注册的用户
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
    
    # 最近的监控任务
    recent_tasks = MonitorTask.query.order_by(MonitorTask.created_at.desc()).limit(5).all()
    
    return render_template('admin/index.html', 
                         stats=stats, 
                         recent_users=recent_users, 
                         recent_tasks=recent_tasks)

@admin_bp.route('/users')
@login_required
@admin_required
def users():
    """用户管理"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    # 搜索和筛选
    search = request.args.get('search', '').strip()
    status = request.args.get('status', 'all')
    
    query = User.query
    
    if search:
        query = query.filter(
            db.or_(
                User.username.contains(search),
                User.email.contains(search)
            )
        )
    
    if status == 'active':
        query = query.filter_by(is_active=True)
    elif status == 'inactive':
        query = query.filter_by(is_active=False)
    elif status == 'admin':
        query = query.filter_by(is_admin=True)
    
    users_pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('admin/users.html', 
                         users=users_pagination.items,
                         pagination=users_pagination,
                         search=search,
                         status=status)

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@login_required
@admin_required
def toggle_user_status(user_id):
    """切换用户状态"""
    user = User.query.get_or_404(user_id)
    
    if user.id == current_user.id:
        if request.is_json:
            return jsonify({'success': False, 'message': '不能禁用自己的账户'}), 400
        else:
            flash('不能禁用自己的账户', 'error')
            return redirect(url_for('admin.users'))
    
    try:
        user.is_active = not user.is_active
        db.session.commit()
        
        status_text = '启用' if user.is_active else '禁用'
        message = f'用户 {user.username} 已{status_text}'
        
        if request.is_json:
            return jsonify({'success': True, 'message': message, 'is_active': user.is_active})
        else:
            flash(message, 'success')
            return redirect(url_for('admin.users'))
            
    except Exception as e:
        db.session.rollback()
        error_msg = f'操作失败：{str(e)}'
        if request.is_json:
            return jsonify({'success': False, 'message': error_msg}), 500
        else:
            flash(error_msg, 'error')
            return redirect(url_for('admin.users'))

@admin_bp.route('/users/<int:user_id>/toggle-admin', methods=['POST'])
@login_required
@admin_required
def toggle_admin_status(user_id):
    """切换管理员状态"""
    user = User.query.get_or_404(user_id)
    
    if user.id == current_user.id:
        if request.is_json:
            return jsonify({'success': False, 'message': '不能修改自己的管理员权限'}), 400
        else:
            flash('不能修改自己的管理员权限', 'error')
            return redirect(url_for('admin.users'))
    
    try:
        user.is_admin = not user.is_admin
        db.session.commit()
        
        status_text = '设为管理员' if user.is_admin else '取消管理员'
        message = f'用户 {user.username} 已{status_text}'
        
        if request.is_json:
            return jsonify({'success': True, 'message': message, 'is_admin': user.is_admin})
        else:
            flash(message, 'success')
            return redirect(url_for('admin.users'))
            
    except Exception as e:
        db.session.rollback()
        error_msg = f'操作失败：{str(e)}'
        if request.is_json:
            return jsonify({'success': False, 'message': error_msg}), 500
        else:
            flash(error_msg, 'error')
            return redirect(url_for('admin.users'))

@admin_bp.route('/invite-codes')
@login_required
@admin_required
def invite_codes():
    """邀请码管理"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    # 筛选
    status = request.args.get('status', 'all')
    
    query = InviteCode.query
    
    if status == 'active':
        query = query.filter_by(is_active=True)
    elif status == 'used':
        query = query.filter(InviteCode.used_by.isnot(None))
    elif status == 'expired':
        query = query.filter(
            db.and_(
                InviteCode.expires_at.isnot(None),
                InviteCode.expires_at < datetime.utcnow()
            )
        )
    
    codes_pagination = query.order_by(InviteCode.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('admin/invite_codes.html', 
                         codes=codes_pagination.items,
                         pagination=codes_pagination,
                         status=status)

@admin_bp.route('/invite-codes/generate', methods=['GET', 'POST'])
@login_required
@admin_required
def generate_invite_codes():
    """生成邀请码"""
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        count = int(data.get('count', 1))
        max_uses = int(data.get('max_uses', 1))
        expires_days = data.get('expires_days', '')
        
        # 验证输入
        if count < 1 or count > 100:
            error_msg = '生成数量必须在1-100之间'
            if request.is_json:
                return jsonify({'success': False, 'message': error_msg}), 400
            else:
                flash(error_msg, 'error')
                return render_template('admin/generate_invite_codes.html')
        
        if max_uses < 1 or max_uses > 1000:
            error_msg = '最大使用次数必须在1-1000之间'
            if request.is_json:
                return jsonify({'success': False, 'message': error_msg}), 400
            else:
                flash(error_msg, 'error')
                return render_template('admin/generate_invite_codes.html')
        
        # 计算过期时间
        expires_at = None
        if expires_days:
            try:
                days = int(expires_days)
                if days > 0:
                    expires_at = datetime.utcnow() + timedelta(days=days)
            except ValueError:
                error_msg = '过期天数必须是正整数'
                if request.is_json:
                    return jsonify({'success': False, 'message': error_msg}), 400
                else:
                    flash(error_msg, 'error')
                    return render_template('admin/generate_invite_codes.html')
        
        try:
            # 生成邀请码
            generated_codes = []
            for _ in range(count):
                code = InviteCode(
                    code=InviteCode.generate_code(),
                    created_by=current_user.id,
                    expires_at=expires_at,
                    max_uses=max_uses
                )
                db.session.add(code)
                generated_codes.append(code.code)
            
            db.session.commit()
            
            message = f'成功生成 {count} 个邀请码'
            
            if request.is_json:
                return jsonify({
                    'success': True, 
                    'message': message,
                    'codes': generated_codes
                })
            else:
                flash(message, 'success')
                return redirect(url_for('admin.invite_codes'))
                
        except Exception as e:
            db.session.rollback()
            error_msg = f'生成失败：{str(e)}'
            if request.is_json:
                return jsonify({'success': False, 'message': error_msg}), 500
            else:
                flash(error_msg, 'error')
                return render_template('admin/generate_invite_codes.html')
    
    return render_template('admin/generate_invite_codes.html')

@admin_bp.route('/invite-codes/<int:code_id>/deactivate', methods=['POST'])
@login_required
@admin_required
def deactivate_invite_code(code_id):
    """停用邀请码"""
    code = InviteCode.query.get_or_404(code_id)
    
    try:
        code.is_active = False
        db.session.commit()
        
        message = f'邀请码 {code.code} 已停用'
        
        if request.is_json:
            return jsonify({'success': True, 'message': message})
        else:
            flash(message, 'success')
            return redirect(url_for('admin.invite_codes'))
            
    except Exception as e:
        db.session.rollback()
        error_msg = f'操作失败：{str(e)}'
        if request.is_json:
            return jsonify({'success': False, 'message': error_msg}), 500
        else:
            flash(error_msg, 'error')
            return redirect(url_for('admin.invite_codes'))

@admin_bp.route('/tasks')
@login_required
@admin_required
def tasks():
    """监控任务管理"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    # 搜索和筛选
    search = request.args.get('search', '').strip()
    status = request.args.get('status', 'all')
    user_id = request.args.get('user_id', type=int)
    
    query = MonitorTask.query
    
    if search:
        query = query.filter(
            db.or_(
                MonitorTask.name.contains(search),
                MonitorTask.departure_city.contains(search),
                MonitorTask.destination_city.contains(search)
            )
        )
    
    if status == 'active':
        query = query.filter_by(is_active=True)
    elif status == 'inactive':
        query = query.filter_by(is_active=False)
    
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    tasks_pagination = query.order_by(MonitorTask.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    # 获取用户列表用于筛选
    users = User.query.order_by(User.username).all()
    
    return render_template('admin/tasks.html', 
                         tasks=tasks_pagination.items,
                         pagination=tasks_pagination,
                         users=users,
                         search=search,
                         status=status,
                         selected_user_id=user_id)
