/**
 * 初始化语言环境设置
 * 确保应用启动时使用中文作为默认语言
 */

/**
 * 初始化语言环境
 * 如果localStorage中没有语言设置，则根据浏览器语言设置，默认为中文
 */
export const initializeLocale = () => {
  const currentLanguage = localStorage.getItem('i18nextLng');

  // 只有在用户从未设置过语言时，才进行初始化
  if (!currentLanguage) {
    const browserLanguage = navigator.language || navigator.userLanguage;
    if (browserLanguage.startsWith('en')) {
      localStorage.setItem('i18nextLng', 'en');
      console.log('🌍 根据浏览器偏好，已设置默认语言为英文');
    } else {
      // 默认设置为中文
      localStorage.setItem('i18nextLng', 'zh');
      console.log('🌍 已设置默认语言为中文');
    }
  } else {
    console.log('🌍 当前语言设置:', currentLanguage);
  }
};

/**
 * 强制设置为中文环境
 */
export const forceChineseLocale = () => {
  localStorage.setItem('i18nextLng', 'zh');
  console.log('🌍 已强制设置语言为中文');
  // 刷新页面以应用新的语言设置
  window.location.reload();
};

/**
 * 检查并修复语言设置
 * 确保语言设置是有效的
 */
export const validateAndFixLocale = () => {
  const currentLanguage = localStorage.getItem('i18nextLng');
  
  // 支持的语言列表
  const supportedLanguages = ['zh', 'zh-CN', 'en', 'en-US'];
  
  if (!currentLanguage || !supportedLanguages.some(lang => currentLanguage.startsWith(lang.split('-')[0]))) {
    console.warn('⚠️ 检测到无效的语言设置:', currentLanguage);
    localStorage.setItem('i18nextLng', 'zh');
    console.log('✅ 已修复语言设置为中文');
    return true; // 表示进行了修复
  }
  
  return false; // 表示没有进行修复
};

/**
 * 获取浏览器首选语言并设置
 */
export const setLanguageFromBrowser = () => {
  const browserLanguage = navigator.language || navigator.userLanguage;
  console.log('🌐 浏览器语言:', browserLanguage);
  
  if (browserLanguage.startsWith('zh')) {
    localStorage.setItem('i18nextLng', 'zh');
    console.log('✅ 根据浏览器设置，已设置为中文');
  } else {
    localStorage.setItem('i18nextLng', 'en');
    console.log('✅ 根据浏览器设置，已设置为英文');
  }
};

/**
 * 调试语言环境信息
 */
export const debugLocaleInfo = () => {
  console.log('🔍 语言环境调试信息:');
  console.log('  localStorage中的语言:', localStorage.getItem('i18nextLng'));
  console.log('  浏览器语言:', navigator.language);
  console.log('  浏览器语言列表:', navigator.languages);
  console.log('  用户语言:', navigator.userLanguage);
  console.log('  系统语言:', Intl.DateTimeFormat().resolvedOptions().locale);
};
