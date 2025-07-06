/**
 * 航班信息本地化工具
 * 用于将英文的航班信息转换为中文
 */

import { getCurrentLanguage } from './priceFormatter';

/**
 * 航空公司名称映射表
 */
const AIRLINE_NAME_MAP = {
  // 中国航空公司
  'Air China': '中国国际航空',
  'China Eastern Airlines': '中国东方航空',
  'China Southern Airlines': '中国南方航空',
  'Hainan Airlines': '海南航空',
  'Shanghai Airlines': '上海航空',
  'Shenzhen Airlines': '深圳航空',
  'Xiamen Airlines': '厦门航空',
  'Sichuan Airlines': '四川航空',
  'China Express Airlines': '华夏航空',
  'Spring Airlines': '春秋航空',
  'Juneyao Airlines': '吉祥航空',

  // 国际航空公司
  'American Airlines': '美国航空',
  'Delta Air Lines': '达美航空',
  'United Airlines': '美国联合航空',
  'British Airways': '英国航空',
  'Lufthansa': '汉莎航空',
  'Air France': '法国航空',
  'KLM Royal Dutch Airlines': '荷兰皇家航空',
  'Singapore Airlines': '新加坡航空',
  'Cathay Pacific': '国泰航空',
  'Japan Airlines': '日本航空',
  'ANA All Nippon Airways': '全日空',
  'Korean Air': '大韩航空',
  'Thai Airways': '泰国航空',
  'Emirates': '阿联酋航空',
  'Qatar Airways': '卡塔尔航空',
  'Turkish Airlines': '土耳其航空',
  'Aeroflot': '俄罗斯航空',

  // 处理Unknown情况和你截图中的具体问题
  'Unknown': '未知航空公司',
  'UNKNOWN': '未知航空公司',
  'unknown': '未知航空公司',
  '': '未知航空公司',
  null: '未知航空公司',
  undefined: '未知航空公司',

  // 根据你的截图，添加更多可能的英文航空公司名称
  'Aegean Airlines': '爱琴海航空',
  'Olympic Air': '奥林匹克航空',
  'Ryanair': '瑞安航空',
  'EasyJet': '易捷航空',
  'Wizz Air': '威兹航空',
  'Vueling': '伏林航空',
  'TAP Air Portugal': '葡萄牙航空',
  'Iberia': '伊比利亚航空',
  'Alitalia': '意大利航空',
  'Swiss International Air Lines': '瑞士国际航空',
  'Austrian Airlines': '奥地利航空',
  'SAS Scandinavian Airlines': '北欧航空',
  'Finnair': '芬兰航空',
  'Air Baltic': '波罗的海航空',
  'LOT Polish Airlines': '波兰航空',
  'Czech Airlines': '捷克航空',
  'Air Serbia': '塞尔维亚航空',
  'Croatia Airlines': '克罗地亚航空'
};

/**
 * 机场名称映射表（主要机场的中文名称）
 */
const AIRPORT_NAME_MAP = {
  // 中国机场
  'PEK': '北京首都国际机场',
  'PKX': '北京大兴国际机场',
  'PVG': '上海浦东国际机场',
  'SHA': '上海虹桥国际机场',
  'CAN': '广州白云国际机场',
  'SZX': '深圳宝安国际机场',
  'CTU': '成都天府国际机场',
  'XIY': '西安咸阳国际机场',
  'HGH': '杭州萧山国际机场',
  'NKG': '南京禄口国际机场',
  'HKG': '香港国际机场',
  'TPE': '台北桃园国际机场',
  
  // 国际主要机场
  'LHR': '伦敦希思罗机场',
  'CDG': '巴黎戴高乐机场',
  'FRA': '法兰克福机场',
  'AMS': '阿姆斯特丹史基浦机场',
  'JFK': '纽约肯尼迪国际机场',
  'LAX': '洛杉矶国际机场',
  'SFO': '旧金山国际机场',
  'ORD': '芝加哥奥黑尔国际机场',
  'ATH': '雅典国际机场',
  'NRT': '东京成田国际机场',
  'ICN': '首尔仁川国际机场',
  'SIN': '新加坡樟宜机场',
  'BKK': '曼谷素万那普机场',
  'DXB': '迪拜国际机场'
};

/**
 * 航班状态和描述的本地化映射
 */
const FLIGHT_TERMS_MAP = {
  // 中转信息
  'Non-stop': '直飞',
  'Direct': '直飞',
  '1 stop': '1次中转',
  '2 stops': '2次中转',
  '3 stops': '3次中转',
  
  // 舱位等级
  'Economy': '经济舱',
  'Premium Economy': '超级经济舱',
  'Business': '商务舱',
  'First': '头等舱',
  
  // 航班信息
  'Below average legroom': '腿部空间较小',
  'Average legroom': '标准腿部空间',
  'Above average legroom': '腿部空间较大',
  'Emissions estimate': '碳排放估算',
  'Avg emissions': '平均碳排放',
  
  // 时间相关
  'Departure': '出发',
  'Arrival': '到达',
  'Duration': '飞行时长',
  'Layover': '中转',
  
  // 其他
  'Unknown': '未知',
  'UNKNOWN': '未知'
};

/**
 * 本地化航空公司名称
 * @param {string} airlineName - 英文航空公司名称
 * @returns {string} 本地化后的航空公司名称
 */
export const localizeAirlineName = (airlineName) => {
  if (!airlineName) return '未知航空公司';

  const language = getCurrentLanguage();
  if (language !== 'zh') return airlineName;

  // 如果已经是中文，直接返回
  if (/[\u4e00-\u9fff]/.test(airlineName)) {
    return airlineName;
  }

  // 检查是否是航空公司代码（通常是2-3个字母）
  if (airlineName.length <= 3 && /^[A-Z0-9]+$/.test(airlineName)) {
    // 航空公司代码映射
    const codeMap = {
      'CA': '中国国际航空',
      'MU': '中国东方航空',
      'CZ': '中国南方航空',
      'HU': '海南航空',
      'NX': '澳门航空',
      'KE': '大韩航空',
      'AA': '美国航空',
      'DL': '达美航空',
      'UA': '美国联合航空',
      'BA': '英国航空',
      'LH': '汉莎航空'
    };

    if (codeMap[airlineName]) {
      return codeMap[airlineName];
    }
  }

  // 直接匹配英文名称
  if (AIRLINE_NAME_MAP[airlineName]) {
    return AIRLINE_NAME_MAP[airlineName];
  }

  // 模糊匹配（处理部分匹配的情况）
  for (const [englishName, chineseName] of Object.entries(AIRLINE_NAME_MAP)) {
    if (airlineName.toLowerCase().includes(englishName.toLowerCase()) ||
        englishName.toLowerCase().includes(airlineName.toLowerCase())) {
      return chineseName;
    }
  }

  return airlineName;
};

/**
 * 本地化机场名称
 * @param {string} airportCode - 机场代码
 * @param {string} airportName - 机场英文名称（可选）
 * @returns {string} 本地化后的机场名称
 */
export const localizeAirportName = (airportCode, airportName = '') => {
  const language = getCurrentLanguage();
  if (language !== 'zh') return airportName || airportCode;

  // 优先使用映射表中的中文名称
  if (AIRPORT_NAME_MAP[airportCode]) {
    return AIRPORT_NAME_MAP[airportCode];
  }

  // 如果没有映射，返回原名称或代码
  return airportName || airportCode;
};

/**
 * 获取完整的机场显示名称（优先显示完整名称而不是代码）
 * @param {object} airport - 机场对象 {name, displayCode, city}
 * @returns {string} 完整的机场显示名称
 */
export const getFullAirportName = (airport) => {
  if (!airport) return 'N/A';

  const language = getCurrentLanguage();
  const code = airport.displayCode || airport.code || '';
  const name = airport.name || '';
  const city = airport.city || '';

  if (language === 'zh') {
    // 中文环境：优先显示中文机场名称
    if (AIRPORT_NAME_MAP[code]) {
      return AIRPORT_NAME_MAP[code];
    }

    // 如果有完整名称，显示名称+代码
    if (name && name !== code) {
      return `${name} (${code})`;
    }

    // 如果有城市名称，显示城市+代码
    if (city && city !== code) {
      return `${city} (${code})`;
    }

    // 最后显示代码
    return code || 'N/A';
  } else {
    // 英文环境：显示英文名称
    if (name && name !== code) {
      return `${name} (${code})`;
    }

    if (city && city !== code) {
      return `${city} (${code})`;
    }

    return code || 'N/A';
  }
};

/**
 * 获取简短的机场显示名称（用于空间有限的地方）
 * @param {object} airport - 机场对象 {name, displayCode, city}
 * @returns {string} 简短的机场显示名称
 */
export const getShortAirportName = (airport) => {
  if (!airport) return 'N/A';

  const language = getCurrentLanguage();
  const code = airport.displayCode || airport.code || '';
  const city = airport.city || '';

  if (language === 'zh') {
    // 中文环境：优先显示中文机场名称（不带代码）
    if (AIRPORT_NAME_MAP[code]) {
      return AIRPORT_NAME_MAP[code];
    }

    // 如果有城市名称，显示城市
    if (city && city !== code) {
      return city;
    }

    // 最后显示代码
    return code || 'N/A';
  } else {
    // 英文环境：显示城市或代码
    if (city && city !== code) {
      return city;
    }

    return code || 'N/A';
  }
};

/**
 * 本地化航班术语
 * @param {string} term - 英文术语
 * @returns {string} 本地化后的术语
 */
export const localizeFlightTerm = (term) => {
  if (!term) return '';
  
  const language = getCurrentLanguage();
  if (language !== 'zh') return term;
  
  // 直接匹配
  if (FLIGHT_TERMS_MAP[term]) {
    return FLIGHT_TERMS_MAP[term];
  }
  
  // 模糊匹配
  for (const [englishTerm, chineseTerm] of Object.entries(FLIGHT_TERMS_MAP)) {
    if (term.toLowerCase().includes(englishTerm.toLowerCase())) {
      return chineseTerm;
    }
  }
  
  return term;
};

/**
 * 本地化中转次数显示
 * @param {number} stops - 中转次数
 * @returns {string} 本地化后的中转信息
 */
export const localizeStops = (stops) => {
  const language = getCurrentLanguage();
  
  if (language === 'zh') {
    if (stops === 0) return '直飞';
    if (stops === 1) return '1次中转';
    return `${stops}次中转`;
  } else {
    if (stops === 0) return 'Non-stop';
    if (stops === 1) return '1 stop';
    return `${stops} stops`;
  }
};

/**
 * 本地化航班对象
 * @param {object} flight - 航班对象
 * @returns {object} 本地化后的航班对象
 */
export const localizeFlight = (flight) => {
  if (!flight) return flight;
  
  const language = getCurrentLanguage();
  if (language !== 'zh') return flight;
  
  const localizedFlight = { ...flight };
  
  // 本地化航班段信息
  if (localizedFlight.legs && Array.isArray(localizedFlight.legs)) {
    localizedFlight.legs = localizedFlight.legs.map(leg => ({
      ...leg,
      // 航空公司信息 - 后端已经本地化，直接使用
      carriers: leg.carriers,
      
      // 机场信息 - 后端已经本地化，直接使用
      origin: leg.origin,
      destination: leg.destination
    }));
  }
  
  return localizedFlight;
};

/**
 * 批量本地化航班列表
 * @param {array} flights - 航班列表
 * @returns {array} 本地化后的航班列表
 */
export const localizeFlights = (flights) => {
  if (!flights || !Array.isArray(flights)) return flights;
  
  return flights.map(flight => localizeFlight(flight));
};
