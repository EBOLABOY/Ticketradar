"""
用户认证相关功能
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User, InviteCode
from datetime import datetime, timedelta
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def is_valid_email(email):
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_username(username):
    """验证用户名格式"""
    # 用户名只能包含字母、数字、下划线，长度3-20
    pattern = r'^[a-zA-Z0-9_]{3,20}$'
    return re.match(pattern, username) is not None

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """用户注册"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        invite_code = data.get('invite_code', '').strip()
        
        # 验证输入
        errors = []
        
        if not username:
            errors.append('用户名不能为空')
        elif not is_valid_username(username):
            errors.append('用户名只能包含字母、数字、下划线，长度3-20位')
        elif User.query.filter_by(username=username).first():
            errors.append('用户名已存在')
        
        if not email:
            errors.append('邮箱不能为空')
        elif not is_valid_email(email):
            errors.append('邮箱格式不正确')
        elif User.query.filter_by(email=email).first():
            errors.append('邮箱已被注册')
        
        if not password:
            errors.append('密码不能为空')
        elif len(password) < 6:
            errors.append('密码长度至少6位')
        
        if password != confirm_password:
            errors.append('两次输入的密码不一致')
        
        if not invite_code:
            errors.append('邀请码不能为空')
        else:
            # 验证邀请码
            code_obj = InviteCode.query.filter_by(code=invite_code).first()
            if not code_obj:
                errors.append('邀请码不存在')
            elif not code_obj.is_valid():
                errors.append('邀请码已失效或已被使用')
        
        if errors:
            if request.is_json:
                return jsonify({'success': False, 'errors': errors}), 400
            else:
                for error in errors:
                    flash(error, 'error')
                return render_template('auth/register.html')
        
        try:
            # 创建用户
            user = User(
                username=username,
                email=email
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.flush()  # 获取用户ID
            
            # 使用邀请码
            code_obj.use_code(user.id)
            
            db.session.commit()
            
            # 自动登录
            login_user(user)
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            if request.is_json:
                return jsonify({
                    'success': True, 
                    'message': '注册成功',
                    'redirect': url_for('dashboard.index')
                })
            else:
                flash('注册成功，欢迎使用Ticketradar！', 'success')
                return redirect(url_for('dashboard.index'))
                
        except Exception as e:
            db.session.rollback()
            error_msg = f'注册失败：{str(e)}'
            if request.is_json:
                return jsonify({'success': False, 'errors': [error_msg]}), 500
            else:
                flash(error_msg, 'error')
                return render_template('auth/register.html')
    
    return render_template('auth/register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """用户登录"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        username_or_email = data.get('username_or_email', '').strip()
        password = data.get('password', '')
        remember_me = data.get('remember_me', False)
        
        # 验证输入
        if not username_or_email:
            error_msg = '请输入用户名或邮箱'
            if request.is_json:
                return jsonify({'success': False, 'errors': [error_msg]}), 400
            else:
                flash(error_msg, 'error')
                return render_template('auth/login.html')
        
        if not password:
            error_msg = '请输入密码'
            if request.is_json:
                return jsonify({'success': False, 'errors': [error_msg]}), 400
            else:
                flash(error_msg, 'error')
                return render_template('auth/login.html')
        
        # 查找用户（支持用户名或邮箱登录）
        user = None
        if '@' in username_or_email:
            user = User.query.filter_by(email=username_or_email.lower()).first()
        else:
            user = User.query.filter_by(username=username_or_email).first()
        
        # 验证用户和密码
        if not user or not user.check_password(password):
            error_msg = '用户名/邮箱或密码错误'
            if request.is_json:
                return jsonify({'success': False, 'errors': [error_msg]}), 400
            else:
                flash(error_msg, 'error')
                return render_template('auth/login.html')
        
        if not user.is_active:
            error_msg = '账户已被禁用，请联系管理员'
            if request.is_json:
                return jsonify({'success': False, 'errors': [error_msg]}), 400
            else:
                flash(error_msg, 'error')
                return render_template('auth/login.html')
        
        # 登录用户
        login_user(user, remember=remember_me)
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # 获取重定向目标
        next_page = request.args.get('next')
        if not next_page or not next_page.startswith('/'):
            next_page = url_for('dashboard.index')
        
        if request.is_json:
            return jsonify({
                'success': True, 
                'message': '登录成功',
                'redirect': next_page
            })
        else:
            flash(f'欢迎回来，{user.username}！', 'success')
            return redirect(next_page)
    
    return render_template('auth/login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    """用户登出"""
    username = current_user.username
    logout_user()
    flash(f'再见，{username}！', 'info')
    return redirect(url_for('index'))

@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """用户资料"""
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        email = data.get('email', '').strip().lower()
        pushplus_token = data.get('pushplus_token', '').strip()
        notification_enabled = data.get('notification_enabled', False)
        
        # 验证邮箱
        if email != current_user.email:
            if not is_valid_email(email):
                error_msg = '邮箱格式不正确'
                if request.is_json:
                    return jsonify({'success': False, 'errors': [error_msg]}), 400
                else:
                    flash(error_msg, 'error')
                    return render_template('auth/profile.html')
            
            # 检查邮箱是否已被使用
            existing_user = User.query.filter_by(email=email).first()
            if existing_user and existing_user.id != current_user.id:
                error_msg = '邮箱已被其他用户使用'
                if request.is_json:
                    return jsonify({'success': False, 'errors': [error_msg]}), 400
                else:
                    flash(error_msg, 'error')
                    return render_template('auth/profile.html')
        
        try:
            # 更新用户信息
            current_user.email = email
            current_user.pushplus_token = pushplus_token
            current_user.notification_enabled = bool(notification_enabled)
            
            db.session.commit()
            
            if request.is_json:
                return jsonify({'success': True, 'message': '资料更新成功'})
            else:
                flash('资料更新成功', 'success')
                return redirect(url_for('auth.profile'))
                
        except Exception as e:
            db.session.rollback()
            error_msg = f'更新失败：{str(e)}'
            if request.is_json:
                return jsonify({'success': False, 'errors': [error_msg]}), 500
            else:
                flash(error_msg, 'error')
                return render_template('auth/profile.html')
    
    return render_template('auth/profile.html')

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """修改密码"""
    data = request.get_json() if request.is_json else request.form
    
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    confirm_password = data.get('confirm_password', '')
    
    # 验证输入
    errors = []
    
    if not current_password:
        errors.append('请输入当前密码')
    elif not current_user.check_password(current_password):
        errors.append('当前密码错误')
    
    if not new_password:
        errors.append('请输入新密码')
    elif len(new_password) < 6:
        errors.append('新密码长度至少6位')
    
    if new_password != confirm_password:
        errors.append('两次输入的新密码不一致')
    
    if errors:
        if request.is_json:
            return jsonify({'success': False, 'errors': errors}), 400
        else:
            for error in errors:
                flash(error, 'error')
            return redirect(url_for('auth.profile'))
    
    try:
        # 更新密码
        current_user.set_password(new_password)
        db.session.commit()
        
        if request.is_json:
            return jsonify({'success': True, 'message': '密码修改成功'})
        else:
            flash('密码修改成功', 'success')
            return redirect(url_for('auth.profile'))
            
    except Exception as e:
        db.session.rollback()
        error_msg = f'密码修改失败：{str(e)}'
        if request.is_json:
            return jsonify({'success': False, 'errors': [error_msg]}), 500
        else:
            flash(error_msg, 'error')
            return redirect(url_for('auth.profile'))
