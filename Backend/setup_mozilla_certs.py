"""
下载并配置Mozilla证书包来解决SSL验证问题
"""
import os
import sys
import requests
import shutil
from pathlib import Path
from loguru import logger

def download_mozilla_cacert():
    """下载Mozilla的证书包"""
    try:
        # 创建证书目录
        cert_dir = Path(__file__).parent / "ssl_certs"
        cert_dir.mkdir(exist_ok=True)
        
        # Mozilla证书包URL
        cacert_url = "https://curl.se/ca/cacert.pem"
        cert_file = cert_dir / "cacert.pem"
        
        logger.info("📥 正在下载Mozilla证书包...")
        logger.info(f"   URL: {cacert_url}")
        logger.info(f"   保存到: {cert_file}")
        
        # 下载证书包（暂时禁用SSL验证来下载证书）
        response = requests.get(cacert_url, verify=False, timeout=30)
        response.raise_for_status()
        
        # 保存证书文件
        with open(cert_file, 'wb') as f:
            f.write(response.content)
        
        # 验证文件大小（证书包通常很大）
        file_size = cert_file.stat().st_size
        if file_size < 100000:  # 小于100KB可能有问题
            raise Exception(f"证书文件太小: {file_size} bytes")
        
        logger.info(f"✅ Mozilla证书包下载成功")
        logger.info(f"   文件大小: {file_size:,} bytes")
        logger.info(f"   文件路径: {cert_file.absolute()}")
        
        return str(cert_file.absolute())
        
    except Exception as e:
        logger.error(f"❌ 下载Mozilla证书包失败: {e}")
        return None

def backup_existing_certs():
    """备份现有的证书配置"""
    try:
        logger.info("💾 正在备份现有证书配置...")
        
        backup_info = {}
        cert_env_vars = ['CURL_CA_BUNDLE', 'REQUESTS_CA_BUNDLE', 'SSL_CERT_FILE', 'SSL_CERT_DIR']
        
        for var in cert_env_vars:
            value = os.environ.get(var)
            if value:
                backup_info[var] = value
                logger.info(f"   备份 {var}: {value}")
        
        if backup_info:
            backup_file = Path(__file__).parent / "ssl_certs" / "backup_env.txt"
            with open(backup_file, 'w') as f:
                for key, value in backup_info.items():
                    f.write(f"{key}={value}\n")
            logger.info(f"✅ 证书配置已备份到: {backup_file}")
        else:
            logger.info("   没有找到现有的证书配置")
        
        return backup_info
        
    except Exception as e:
        logger.error(f"❌ 备份证书配置失败: {e}")
        return {}

def configure_mozilla_certs(cert_file_path):
    """配置Mozilla证书包"""
    try:
        logger.info("🔧 正在配置Mozilla证书包...")
        
        # 设置环境变量
        ssl_env_vars = {
            'CURL_CA_BUNDLE': cert_file_path,
            'REQUESTS_CA_BUNDLE': cert_file_path,
            'SSL_CERT_FILE': cert_file_path,
            'SSL_CERT_DIR': os.path.dirname(cert_file_path),
            'PYTHONHTTPSVERIFY': '1',
            'SSL_VERIFY': 'true'
        }
        
        for key, value in ssl_env_vars.items():
            os.environ[key] = value
            logger.info(f"   设置 {key} = {value}")
        
        logger.info("✅ Mozilla证书包配置完成")
        return True
        
    except Exception as e:
        logger.error(f"❌ 配置Mozilla证书包失败: {e}")
        return False

def test_ssl_with_mozilla_certs():
    """测试使用Mozilla证书包的SSL连接"""
    try:
        logger.info("🧪 正在测试SSL连接...")
        
        # 测试多个HTTPS站点
        test_urls = [
            "https://httpbin.org/get",
            "https://www.google.com",
            "https://api.github.com"
        ]
        
        success_count = 0
        for url in test_urls:
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    logger.info(f"   ✅ {url} - 连接成功")
                    success_count += 1
                else:
                    logger.warning(f"   ⚠️ {url} - 状态码: {response.status_code}")
            except Exception as e:
                logger.error(f"   ❌ {url} - 连接失败: {e}")
        
        if success_count > 0:
            logger.info(f"✅ SSL测试完成: {success_count}/{len(test_urls)} 个站点连接成功")
            return True
        else:
            logger.error("❌ 所有SSL测试都失败了")
            return False
            
    except Exception as e:
        logger.error(f"❌ SSL测试失败: {e}")
        return False

def update_ai_flight_service():
    """更新ai_flight_service.py以使用新的证书配置"""
    try:
        logger.info("🔄 正在更新ai_flight_service.py...")
        
        service_file = Path(__file__).parent / "fastapi_app" / "services" / "ai_flight_service.py"
        cert_file = Path(__file__).parent / "ssl_certs" / "cacert.pem"
        
        if not service_file.exists():
            logger.warning("ai_flight_service.py文件不存在，跳过更新")
            return True
        
        # 读取文件内容
        with open(service_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 查找SSL配置部分并替换
        cert_path_abs = str(cert_file.absolute()).replace('\\', '\\\\')
        
        ssl_config = f'''    # 使用Mozilla证书包
    mozilla_cert_path = r"{cert_path_abs}"
    if os.path.exists(mozilla_cert_path):
        os.environ['CURL_CA_BUNDLE'] = mozilla_cert_path
        os.environ['REQUESTS_CA_BUNDLE'] = mozilla_cert_path
        os.environ['SSL_CERT_FILE'] = mozilla_cert_path
        os.environ['SSL_CERT_DIR'] = os.path.dirname(mozilla_cert_path)
        print(f"✅ 使用Mozilla证书包: {{mozilla_cert_path}}")
    else:
        print(f"⚠️ Mozilla证书包不存在: {{mozilla_cert_path}}")'''
        
        # 替换完全禁用SSL验证的部分
        if "# 完全禁用SSL验证" in content:
            # 找到并替换SSL配置部分
            lines = content.split('\n')
            new_lines = []
            skip_lines = False
            
            for line in lines:
                if "# 完全禁用SSL验证" in line:
                    new_lines.append(ssl_config)
                    skip_lines = True
                elif skip_lines and line.strip() and not line.startswith('    '):
                    skip_lines = False
                    new_lines.append(line)
                elif not skip_lines:
                    new_lines.append(line)
            
            # 写回文件
            with open(service_file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
            
            logger.info("✅ ai_flight_service.py已更新")
        else:
            logger.info("ai_flight_service.py不需要更新")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 更新ai_flight_service.py失败: {e}")
        return False

def main():
    """主函数"""
    logger.info("🚀 开始设置Mozilla证书包...")
    
    # 1. 备份现有配置
    backup_existing_certs()
    
    # 2. 下载Mozilla证书包
    cert_file_path = download_mozilla_cacert()
    if not cert_file_path:
        logger.error("❌ 无法下载Mozilla证书包")
        sys.exit(1)
    
    # 3. 配置证书包
    if not configure_mozilla_certs(cert_file_path):
        logger.error("❌ 无法配置Mozilla证书包")
        sys.exit(1)
    
    # 4. 测试SSL连接
    if not test_ssl_with_mozilla_certs():
        logger.warning("⚠️ SSL测试失败，但证书包已配置")
    
    # 5. 更新服务文件
    update_ai_flight_service()
    
    logger.info("🎯 Mozilla证书包设置完成！")
    logger.info(f"📁 证书文件: {cert_file_path}")
    logger.info("💡 请重启应用程序以使配置生效")

if __name__ == "__main__":
    main()
