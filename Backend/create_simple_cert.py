"""
创建一个简化的证书文件，避免路径和编码问题
"""
import os
import shutil
from pathlib import Path
from loguru import logger

def create_simple_cert_path():
    """在C盘创建一个简单的证书路径"""
    try:
        # 使用C盘的简单路径，避免中文字符
        cert_dir = Path("C:/ssl_certs")
        cert_dir.mkdir(exist_ok=True)
        
        # 复制Mozilla证书包到简单路径
        source_cert = Path(__file__).parent / "ssl_certs" / "cacert.pem"
        target_cert = cert_dir / "cacert.pem"
        
        if source_cert.exists():
            shutil.copy2(str(source_cert), str(target_cert))
            logger.info(f"✅ 证书已复制到简单路径: {target_cert}")
            return str(target_cert)
        else:
            logger.error(f"❌ 源证书文件不存在: {source_cert}")
            return None
            
    except Exception as e:
        logger.error(f"❌ 创建简单证书路径失败: {e}")
        return None

def update_certifi_with_simple_path(simple_cert_path):
    """用简单路径的证书替换certifi证书"""
    try:
        import certifi
        certifi_path = certifi.where()
        
        # 备份原始证书
        backup_path = certifi_path + ".backup2"
        if not os.path.exists(backup_path):
            shutil.copy2(certifi_path, backup_path)
            logger.info(f"💾 已备份certifi证书: {backup_path}")
        
        # 复制简单路径的证书到certifi位置
        shutil.copy2(simple_cert_path, certifi_path)
        logger.info(f"✅ 已更新certifi证书: {certifi_path}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 更新certifi证书失败: {e}")
        return False

def set_environment_variables(cert_path):
    """设置环境变量指向简单路径的证书"""
    try:
        # 使用简单的英文路径
        env_vars = {
            'CURL_CA_BUNDLE': cert_path,
            'REQUESTS_CA_BUNDLE': cert_path,
            'SSL_CERT_FILE': cert_path,
            'SSL_CERT_DIR': os.path.dirname(cert_path),
            'PYTHONHTTPSVERIFY': '1',
            'SSL_VERIFY': 'true'
        }
        
        for key, value in env_vars.items():
            os.environ[key] = value
            logger.info(f"   设置 {key} = {value}")
        
        # 尝试设置系统级环境变量
        try:
            import subprocess
            subprocess.run(['setx', 'CURL_CA_BUNDLE', cert_path], shell=True, capture_output=True)
            subprocess.run(['setx', 'REQUESTS_CA_BUNDLE', cert_path], shell=True, capture_output=True)
            logger.info("✅ 已设置系统级环境变量")
        except:
            logger.debug("设置系统级环境变量失败，但进程级变量已设置")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 设置环境变量失败: {e}")
        return False

def test_simple_cert(cert_path):
    """测试简单路径的证书"""
    try:
        logger.info("🧪 测试简单路径证书...")
        
        import requests
        
        # 直接指定证书文件进行测试
        response = requests.get('https://httpbin.org/get', verify=cert_path, timeout=10)
        if response.status_code == 200:
            logger.info("✅ 简单路径证书测试成功")
            return True
        else:
            logger.warning(f"⚠️ 证书测试返回状态码: {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"❌ 简单路径证书测试失败: {e}")
        return False

def main():
    """主函数"""
    logger.info("🚀 创建简化证书路径...")
    
    # 1. 创建简单路径的证书
    simple_cert_path = create_simple_cert_path()
    if not simple_cert_path:
        logger.error("❌ 无法创建简单证书路径")
        return
    
    # 2. 设置环境变量
    if not set_environment_variables(simple_cert_path):
        logger.error("❌ 无法设置环境变量")
        return
    
    # 3. 更新certifi证书
    if not update_certifi_with_simple_path(simple_cert_path):
        logger.error("❌ 无法更新certifi证书")
        return
    
    # 4. 测试证书
    if test_simple_cert(simple_cert_path):
        logger.info("🎯 简化证书路径创建完成！")
        logger.info(f"📁 证书路径: {simple_cert_path}")
        logger.info("💡 现在可以测试Google Flights搜索功能")
    else:
        logger.warning("⚠️ 证书创建成功但测试失败")

if __name__ == "__main__":
    main()
