/**
 * Ticketradar API配置
 * 根据部署环境自动配置API基础URL
 */

class ApiConfig {
    constructor() {
        this.baseUrl = this.detectBaseUrl();
        this.timeout = 30000; // 30秒超时
        this.retryCount = 3;   // 重试次数
    }

    /**
     * 自动检测API基础URL
     */
    detectBaseUrl() {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // 开发环境检测
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `${protocol}//${hostname}:${port || '38181'}`;
        }
        
        // 生产环境使用当前域名
        if (port && port !== '80' && port !== '443') {
            return `${protocol}//${hostname}:${port}`;
        }
        
        return `${protocol}//${hostname}`;
    }

    /**
     * 获取完整的API URL
     */
    getApiUrl(endpoint) {
        // 确保endpoint以/开头
        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }
        
        return this.baseUrl + endpoint;
    }

    /**
     * 发送API请求
     */
    async request(endpoint, options = {}) {
        const url = this.getApiUrl(endpoint);
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: this.timeout
        };

        const finalOptions = { ...defaultOptions, ...options };

        // 添加CORS头部
        if (finalOptions.headers) {
            finalOptions.headers['Access-Control-Allow-Origin'] = '*';
        }

        let lastError;
        
        // 重试机制
        for (let i = 0; i < this.retryCount; i++) {
            try {
                console.log(`🔄 API请求 (尝试 ${i + 1}/${this.retryCount}): ${url}`);
                
                const response = await fetch(url, finalOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log(`✅ API请求成功: ${url}`);
                return data;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ API请求失败 (尝试 ${i + 1}/${this.retryCount}): ${error.message}`);
                
                // 最后一次尝试失败时不等待
                if (i < this.retryCount - 1) {
                    await this.delay(1000 * (i + 1)); // 递增延迟
                }
            }
        }
        
        console.error(`❌ API请求最终失败: ${url}`, lastError);
        throw lastError;
    }

    /**
     * GET请求
     */
    async get(endpoint, params = {}) {
        let url = endpoint;
        
        // 添加查询参数
        if (Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(params);
            url += (url.includes('?') ? '&' : '?') + searchParams.toString();
        }
        
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST请求
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 检查API连接状态
     */
    async checkConnection() {
        try {
            await this.get('/api/flights');
            return true;
        } catch (error) {
            console.error('API连接检查失败:', error);
            return false;
        }
    }

    /**
     * 获取服务器信息
     */
    getServerInfo() {
        return {
            baseUrl: this.baseUrl,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            port: window.location.port,
            isLocalhost: ['localhost', '127.0.0.1'].includes(window.location.hostname),
            userAgent: navigator.userAgent
        };
    }
}

// 创建全局API配置实例
window.apiConfig = new ApiConfig();

// 导出常用的API方法
window.api = {
    // 获取航班数据
    getFlights: () => window.apiConfig.get('/api/flights'),
    
    // 获取指定城市航班数据
    getFlightsByCity: (cityCode) => window.apiConfig.get(`/api/flights/${cityCode}`),
    
    // 创建监控任务
    createTask: (taskData) => window.apiConfig.post('/create-task', taskData),
    
    // 编辑监控任务
    editTask: (taskId, taskData) => window.apiConfig.post(`/edit-task/${taskId}`, taskData),
    
    // 切换任务状态
    toggleTask: (taskId) => window.apiConfig.post(`/toggle-task/${taskId}`),
    
    // 删除任务
    deleteTask: (taskId) => window.apiConfig.post(`/delete-task/${taskId}`),
    
    // 检查连接
    checkConnection: () => window.apiConfig.checkConnection(),
    
    // 获取服务器信息
    getServerInfo: () => window.apiConfig.getServerInfo()
};

// 页面加载完成后检查API连接
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔧 API配置信息:', window.apiConfig.getServerInfo());
    
    const isConnected = await window.api.checkConnection();
    if (isConnected) {
        console.log('✅ API连接正常');
    } else {
        console.warn('⚠️ API连接异常，请检查服务器状态');
        
        // 显示连接错误提示
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>API连接异常</strong> 无法连接到服务器，请检查网络连接或联系管理员。
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // 插入到页面顶部
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        }
    }
});

// 全局错误处理
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && event.reason.message.includes('fetch')) {
        console.error('🚨 网络请求错误:', event.reason);
        event.preventDefault(); // 阻止默认的错误处理
    }
});
