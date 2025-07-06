/**
 * 价格格式化工具函数
 * 根据当前语言环境自动选择合适的货币符号和格式
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
 * 获取货币符号
 * @param {string} currency - 货币代码 (CNY, USD, EUR, JPY, KRW)
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
 * @param {string} currency - 货币代码，可选，默认根据当前语言自动选择
 * @param {boolean} showCurrency - 是否显示货币代码，默认false
 * @returns {object} 包含格式化信息的对象
 */
export const formatPrice = (price, currency = null, showCurrency = false) => {
  // 如果没有指定货币，根据当前语言自动选择
  const actualCurrency = currency || getCurrentCurrency();
  const symbol = getCurrencySymbol(actualCurrency);
  const language = getCurrentLanguage();
  
  // 确保price是数字
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return {
      formatted: 'N/A',
      symbol: symbol,
      currency: actualCurrency,
      amount: 0
    };
  }
  
  // 根据语言和货币格式化数字
  let formattedNumber;
  
  if (language === 'zh') {
    // 中文环境：使用中文数字格式
    if (actualCurrency === 'CNY') {
      // 人民币：保留2位小数，使用千分位分隔符
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
  
  return {
    formatted: `${symbol}${formattedNumber}`,
    formattedWithCurrency: showCurrency ? `${symbol}${formattedNumber} ${actualCurrency}` : `${symbol}${formattedNumber}`,
    symbol: symbol,
    currency: actualCurrency,
    amount: numPrice,
    numberOnly: formattedNumber
  };
};

/**
 * 从后端返回的价格对象中提取并格式化价格
 * @param {object} priceObj - 后端返回的价格对象 {formatted: "$764", amount: 764, currency: "USD"}
 * @param {boolean} showCurrency - 是否显示货币代码
 * @returns {object} 格式化后的价格信息
 */
export const formatBackendPrice = (priceObj, showCurrency = false) => {
  if (!priceObj) {
    return formatPrice(0, null, showCurrency);
  }
  
  // 如果后端已经提供了格式化的价格，优先使用
  if (priceObj.formatted) {
    const currency = priceObj.currency || getCurrentCurrency();
    const symbol = getCurrencySymbol(currency);
    
    return {
      formatted: priceObj.formatted,
      formattedWithCurrency: showCurrency ? `${priceObj.formatted} ${currency}` : priceObj.formatted,
      symbol: symbol,
      currency: currency,
      amount: priceObj.amount || 0,
      numberOnly: priceObj.amount ? priceObj.amount.toString() : '0'
    };
  }
  
  // 否则使用amount和currency重新格式化
  return formatPrice(
    priceObj.amount || 0, 
    priceObj.currency, 
    showCurrency
  );
};

/**
 * 比较两个价格（考虑货币转换）
 * @param {number} price1 - 价格1
 * @param {string} currency1 - 货币1
 * @param {number} price2 - 价格2  
 * @param {string} currency2 - 货币2
 * @returns {number} -1, 0, 1 表示价格1小于、等于、大于价格2
 */
export const comparePrices = (price1, currency1, price2, currency2) => {
  // 简单实现：如果货币不同，暂时无法比较
  if (currency1 !== currency2) {
    console.warn('不同货币的价格比较需要汇率转换，暂未实现');
    return 0;
  }
  
  if (price1 < price2) return -1;
  if (price1 > price2) return 1;
  return 0;
};

/**
 * 获取价格阈值的显示文本
 * @param {number} threshold - 价格阈值
 * @param {string} currency - 货币代码
 * @returns {string} 格式化的阈值文本
 */
export const formatPriceThreshold = (threshold, currency = null) => {
  const formatted = formatPrice(threshold, currency);
  const language = getCurrentLanguage();
  
  if (language === 'zh') {
    return `${formatted.formatted} 以下`;
  } else {
    return `Under ${formatted.formatted}`;
  }
};
