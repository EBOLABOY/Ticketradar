/**
 * 语言环境设置工具
 * 确保在中文环境下使用中文和人民币
 */

/**
 * 获取当前语言环境
 * @returns {string} 'zh' 或 'en'
 */
export const getCurrentLanguage = () => {
  const currentLanguage = localStorage.getItem('i18nextLng') || 'zh';
  return currentLanguage.startsWith('zh') ? 'zh' : 'en';
};

/**
 * 获取当前货币设置
 * @returns {string} 'CNY' 或 'USD'
 */
export const getCurrentCurrency = () => {
  const language = getCurrentLanguage();
  return language === 'zh' ? 'CNY' : 'USD';
};

/**
 * 获取当前地区设置
 * @returns {string} 'CN' 或 'US'
 */
export const getCurrentRegion = () => {
  const language = getCurrentLanguage();
  return language === 'zh' ? 'CN' : 'US';
};

/**
 * 获取当前语言环境的完整设置
 * @returns {object} 包含语言、货币、地区的设置对象
 */
export const getLocaleSettings = () => {
  const language = getCurrentLanguage();
  
  if (language === 'zh') {
    return {
      language: 'zh',
      currency: 'CNY',
      region: 'CN',
      locale: 'zh-CN'
    };
  } else {
    return {
      language: 'en',
      currency: 'USD', 
      region: 'US',
      locale: 'en-US'
    };
  }
};

/**
 * 获取货币符号
 * @param {string} currency - 货币代码
 * @returns {string} 货币符号
 */
export const getCurrencySymbol = (currency) => {
  const symbols = {
    'CNY': '¥',
    'USD': '$',
    'EUR': '€',
    'JPY': '¥',
    'KRW': '₩',
    'GBP': '£'
  };
  return symbols[currency] || currency;
};

/**
 * 格式化价格显示
 * @param {number|string} price - 价格数值
 * @param {string} currency - 货币代码，可选
 * @returns {string} 格式化后的价格字符串
 */
export const formatPrice = (price, currency = null) => {
  const actualCurrency = currency || getCurrentCurrency();
  const symbol = getCurrencySymbol(actualCurrency);
  const language = getCurrentLanguage();
  
  // 确保price是数字
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return 'N/A';
  }
  
  // 根据语言和货币格式化数字
  let formattedNumber;
  
  if (language === 'zh') {
    // 中文环境：使用中文数字格式
    if (actualCurrency === 'CNY') {
      // 人民币：不显示小数点
      formattedNumber = numPrice.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    } else {
      // 其他货币在中文环境下的显示
      formattedNumber = numPrice.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  } else {
    // 英文环境：使用英文数字格式
    formattedNumber = numPrice.toLocaleString('en-US', {
      minimumFractionDigits: actualCurrency === 'USD' ? 2 : 0,
      maximumFractionDigits: actualCurrency === 'USD' ? 2 : 0
    });
  }
  
  return `${symbol}${formattedNumber}`;
};

/**
 * 设置语言环境
 * @param {string} language - 语言代码 ('zh' 或 'en')
 */
export const setLanguage = (language) => {
  localStorage.setItem('i18nextLng', language);
  // 触发页面刷新以应用新的语言设置
  window.location.reload();
};

/**
 * 检查当前是否为中文环境
 * @returns {boolean} 是否为中文环境
 */
export const isChineseLocale = () => {
  return getCurrentLanguage() === 'zh';
};

/**
 * 获取API请求的默认参数
 * @returns {object} 包含语言和货币的API参数
 */
export const getApiDefaults = () => {
  const settings = getLocaleSettings();
  return {
    language: settings.language,
    currency: settings.currency,
    locale: settings.locale,
    region: settings.region
  };
};

/**
 * 日志输出当前语言环境设置（用于调试）
 */
export const logCurrentSettings = () => {
  const settings = getLocaleSettings();
  console.log('🌍 当前语言环境设置:', {
    语言: settings.language,
    货币: settings.currency,
    地区: settings.region,
    本地化: settings.locale,
    是否中文环境: isChineseLocale()
  });
};
