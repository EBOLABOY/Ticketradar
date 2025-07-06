import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入中文翻译文件
import zhCommon from './locales/zh/common.json';
import zhNav from './locales/zh/nav.json';
import zhTheme from './locales/zh/theme.json';
import zhHome from './locales/zh/home.json';
import zhSearch from './locales/zh/search.json';
import zhFlights from './locales/zh/flights.json';
import zhFlight from './locales/zh/flight.json';
import zhAuth from './locales/zh/auth.json';
import zhDashboard from './locales/zh/dashboard.json';
import zhMonitor from './locales/zh/monitor.json';
import zhFooter from './locales/zh/footer.json';
import zhPreferences from './locales/zh/preferences.json';
import zhAiAssistant from './locales/zh/aiAssistant.json';
import zhAdmin from './locales/zh/admin.json';
import zhSettings from './locales/zh/settings.json';

// 导入英文翻译文件
import enCommon from './locales/en/common.json';
import enNav from './locales/en/nav.json';
import enTheme from './locales/en/theme.json';
import enHome from './locales/en/home.json';
import enSearch from './locales/en/search.json';
import enFlights from './locales/en/flights.json';
import enFlight from './locales/en/flight.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enMonitor from './locales/en/monitor.json';
import enFooter from './locales/en/footer.json';
import enPreferences from './locales/en/preferences.json';
import enAiAssistant from './locales/en/aiAssistant.json';
import enAdmin from './locales/en/admin.json';
import enSettings from './locales/en/settings.json';

// 合并翻译资源
const zhTranslations = {
  common: zhCommon,
  nav: zhNav,
  theme: zhTheme,
  home: zhHome,
  search: zhSearch,
  flights: zhFlights,
  flight: zhFlight,
  auth: zhAuth,
  dashboard: zhDashboard,
  monitor: zhMonitor,
  footer: zhFooter,
  preferences: zhPreferences,
  aiAssistant: zhAiAssistant,
  admin: zhAdmin,
  settings: zhSettings
};

const enTranslations = {
  common: enCommon,
  nav: enNav,
  theme: enTheme,
  home: enHome,
  search: enSearch,
  flights: enFlights,
  flight: enFlight,
  auth: enAuth,
  dashboard: enDashboard,
  monitor: enMonitor,
  footer: enFooter,
  preferences: enPreferences,
  aiAssistant: enAiAssistant,
  admin: enAdmin,
  settings: enSettings
};

const resources = {
  en: {
    translation: enTranslations
  },
  zh: {
    translation: zhTranslations
  }
};

// 移除强制设置语言，让检测器自动工作
// localStorage.setItem('i18nextLng', 'zh');

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh', // 默认语言
    // 移除这一行，让检测器工作
    // lng: 'zh',
    debug: process.env.NODE_ENV === 'development',

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    }
  });

export default i18n;
