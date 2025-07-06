"""
直接替换certifi证书文件来解决SSL问题
"""
import os
import shutil
from pathlib import Path
from loguru import logger

def find_certifi_cert_path():
    """查找certifi证书文件路径"""
    try:
        import certifi
        cert_path = certifi.where()
        logger.info(f"📍 找到certifi证书路径: {cert_path}")
        return cert_path
    except ImportError:
        logger.error("❌ certifi库未安装")
        return None
    except Exception as e:
        logger.error(f"❌ 查找certifi证书路径失败: {e}")
        return None

def backup_original_cert(cert_path):
    """备份原始证书文件"""
    try:
        backup_path = cert_path + ".backup"
        if not os.path.exists(backup_path):
            shutil.copy2(cert_path, backup_path)
            logger.info(f"💾 已备份原始证书: {backup_path}")
        else:
            logger.info(f"💾 备份文件已存在: {backup_path}")
        return True
    except Exception as e:
        logger.error(f"❌ 备份证书失败: {e}")
        return False

def replace_certifi_cert():
    """用Mozilla证书包替换certifi证书"""
    try:
        # 查找certifi证书路径
        certifi_path = find_certifi_cert_path()
        if not certifi_path:
            return False
        
        # 查找Mozilla证书包
        mozilla_cert = Path(__file__).parent / "ssl_certs" / "cacert.pem"
        if not mozilla_cert.exists():
            logger.error(f"❌ Mozilla证书包不存在: {mozilla_cert}")
            return False
        
        logger.info(f"🔄 准备替换证书文件...")
        logger.info(f"   源文件: {mozilla_cert}")
        logger.info(f"   目标文件: {certifi_path}")
        
        # 备份原始证书
        if not backup_original_cert(certifi_path):
            return False
        
        # 替换证书文件
        shutil.copy2(str(mozilla_cert), certifi_path)
        
        # 验证替换结果
        if os.path.exists(certifi_path):
            file_size = os.path.getsize(certifi_path)
            logger.info(f"✅ 证书文件替换成功")
            logger.info(f"   新文件大小: {file_size:,} bytes")
            return True
        else:
            logger.error("❌ 证书文件替换后不存在")
            return False
            
    except Exception as e:
        logger.error(f"❌ 替换certifi证书失败: {e}")
        return False

def test_certifi_cert():
    """测试certifi证书"""
    try:
        logger.info("🧪 测试certifi证书...")
        
        import certifi
        import requests
        
        # 使用certifi证书进行HTTPS请求
        cert_path = certifi.where()
        logger.info(f"📍 当前certifi证书路径: {cert_path}")
        
        # 测试HTTPS连接
        response = requests.get('https://httpbin.org/get', verify=cert_path, timeout=10)
        if response.status_code == 200:
            logger.info("✅ certifi证书测试成功")
            return True
        else:
            logger.warning(f"⚠️ certifi证书测试返回状态码: {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"❌ certifi证书测试失败: {e}")
        return False

def restore_original_cert():
    """恢复原始证书文件"""
    try:
        certifi_path = find_certifi_cert_path()
        if not certifi_path:
            return False
        
        backup_path = certifi_path + ".backup"
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, certifi_path)
            logger.info(f"🔄 已恢复原始证书: {certifi_path}")
            return True
        else:
            logger.warning("⚠️ 备份文件不存在，无法恢复")
            return False
            
    except Exception as e:
        logger.error(f"❌ 恢复原始证书失败: {e}")
        return False

def main():
    """主函数"""
    logger.info("🚀 开始修复certifi证书...")
    
    # 检查Mozilla证书包是否存在
    mozilla_cert = Path(__file__).parent / "ssl_certs" / "cacert.pem"
    if not mozilla_cert.exists():
        logger.error(f"❌ Mozilla证书包不存在: {mozilla_cert}")
        logger.info("💡 请先运行 setup_mozilla_certs.py 下载证书包")
        return
    
    # 替换certifi证书
    if replace_certifi_cert():
        # 测试新证书
        if test_certifi_cert():
            logger.info("🎯 certifi证书修复完成！")
            logger.info("💡 现在可以测试Google Flights搜索功能")
        else:
            logger.warning("⚠️ 证书替换成功但测试失败")
            logger.info("🔄 是否需要恢复原始证书？(输入 'restore' 恢复)")
    else:
        logger.error("❌ certifi证书修复失败")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "restore":
        logger.info("🔄 恢复原始certifi证书...")
        restore_original_cert()
    else:
        main()
