/**
 * 翻译文件动态加载工具
 * Translation file dynamic loading utilities
 */

// 可用的翻译模块列表
export const AVAILABLE_MODULES = [
  'common',
  'nav', 
  'theme',
  'home',
  'search',
  'flights',
  'flight',
  'auth',
  'dashboard',
  'monitor',
  'footer'
];

// 页面到翻译模块的映射
export const PAGE_MODULE_MAP = {
  '/': ['common', 'nav', 'theme', 'home', 'search', 'footer'],
  '/home': ['common', 'nav', 'theme', 'home', 'search', 'footer'],
  '/flights': ['common', 'nav', 'theme', 'flights', 'flight', 'search'],
  '/dashboard': ['common', 'nav', 'theme', 'dashboard'],
  '/monitor': ['common', 'nav', 'theme', 'monitor'],
  '/auth': ['common', 'nav', 'theme', 'auth'],
  '/login': ['common', 'nav', 'theme', 'auth'],
  '/register': ['common', 'nav', 'theme', 'auth']
};

/**
 * 动态加载特定页面需要的翻译模块
 * @param {string} pagePath - 页面路径
 * @param {string} language - 语言代码 ('zh' | 'en')
 * @returns {Promise<Object>} 翻译对象
 */
export async function loadPageTranslations(pagePath, language = 'zh') {
  const modules = PAGE_MODULE_MAP[pagePath] || ['common'];
  const translations = {};

  try {
    // 并行加载所有需要的模块
    const loadPromises = modules.map(async (module) => {
      try {
        const translation = await import(`../locales/${language}/${module}.json`);
        return { module, data: translation.default };
      } catch (error) {
        console.warn(`Failed to load translation module: ${language}/${module}`, error);
        return { module, data: {} };
      }
    });

    const results = await Promise.all(loadPromises);
    
    // 合并翻译数据
    results.forEach(({ module, data }) => {
      translations[module] = data;
    });

    return translations;
  } catch (error) {
    console.error('Error loading page translations:', error);
    return {};
  }
}

/**
 * 加载单个翻译模块
 * @param {string} module - 模块名称
 * @param {string} language - 语言代码
 * @returns {Promise<Object>} 翻译数据
 */
export async function loadTranslationModule(module, language = 'zh') {
  if (!AVAILABLE_MODULES.includes(module)) {
    console.warn(`Unknown translation module: ${module}`);
    return {};
  }

  try {
    const translation = await import(`../locales/${language}/${module}.json`);
    return translation.default;
  } catch (error) {
    console.error(`Failed to load translation module: ${language}/${module}`, error);
    return {};
  }
}

/**
 * 预加载所有翻译文件（用于生产环境优化）
 * @param {string} language - 语言代码
 * @returns {Promise<Object>} 完整的翻译对象
 */
export async function preloadAllTranslations(language = 'zh') {
  const translations = {};
  
  try {
    const loadPromises = AVAILABLE_MODULES.map(async (module) => {
      const data = await loadTranslationModule(module, language);
      return { module, data };
    });

    const results = await Promise.all(loadPromises);
    
    results.forEach(({ module, data }) => {
      translations[module] = data;
    });

    return translations;
  } catch (error) {
    console.error('Error preloading translations:', error);
    return {};
  }
}

/**
 * 获取页面需要的翻译模块列表
 * @param {string} pagePath - 页面路径
 * @returns {string[]} 模块名称数组
 */
export function getRequiredModules(pagePath) {
  return PAGE_MODULE_MAP[pagePath] || ['common'];
}
