import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { CssBaseline, responsiveFontSizes } from "@mui/material";
import { darkTheme, lightTheme } from "./theme";
import { useMemo, useEffect } from "react";
import AppRouter from "./router/AppRouter.jsx";
import { ToastContainer } from "react-toastify";
import { UserProvider } from "./contexts/UserContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import { SimpleNotificationProvider } from "./components/Notification/SimpleNotificationSystem";
import { initializeLocale, debugLocaleInfo } from "./utils/initializeLocale";

// 移动端优化相关导入
import { PWAInstallPrompt } from "./components/PWA";
import { OfflineIndicator } from "./components/PWA";
import { useMobile } from "./hooks/useMobile";
import { offlineCacheManager } from "./utils/pwaUtils";
import { MobilePerformancePanel } from "./components/Debug";

// 内部App组件，可以使用主题上下文
function AppContent() {
  const { isDarkMode } = useTheme();
  const { isMobile, performanceLevel } = useMobile();

  const theme = useMemo(
    () => responsiveFontSizes(isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  // 初始化移动端优化
  useEffect(() => {
    // 初始化离线缓存
    if (isMobile) {
      offlineCacheManager.init().catch(console.error);
    }

    // 设置视口元标签
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && isMobile) {
      viewport.setAttribute('content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }

    // 添加移动端CSS类
    if (isMobile) {
      document.body.classList.add('mobile-optimized');

      if (performanceLevel === 'low') {
        document.body.classList.add('mobile-low-performance');
      }
    }

    return () => {
      document.body.classList.remove('mobile-optimized', 'mobile-low-performance');
    };
  }, [isMobile, performanceLevel]);

  return (
    <div
      className="App"
      style={{
        backgroundColor: theme.palette.mainColors.default,
        minHeight: '100vh',
        transition: 'background-color 0.3s ease'
      }}
    >
      <MuiThemeProvider theme={theme}>
        <SimpleNotificationProvider>
          <UserProvider>
            <LoadingProvider>
              <LoadingSpinner />
              <AppRouter />
              <CssBaseline />

              {/* 移动端PWA功能 */}
              {isMobile && (
                <>
                  <PWAInstallPrompt
                    autoShow={true}
                    showDelay={5000}
                  />
                  <OfflineIndicator
                    position={{ vertical: 'top', horizontal: 'center' }}
                  />
                </>
              )}

              {/* 开发环境性能监控面板 */}
              {process.env.NODE_ENV === 'development' && isMobile && (
                <MobilePerformancePanel />
              )}

              <ToastContainer
                theme={isDarkMode ? 'dark' : 'light'}
                position={isMobile ? "bottom-center" : "top-right"}
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{
                  bottom: isMobile ? '90px' : 'auto', // 为底部导航留空间
                }}
              />
            </LoadingProvider>
          </UserProvider>
        </SimpleNotificationProvider>
      </MuiThemeProvider>
    </div>
  );
}

// 主App组件，提供主题上下文
function App() {
  // 初始化语言环境
  useEffect(() => {
    initializeLocale();
    if (process.env.NODE_ENV === 'development') {
      debugLocaleInfo();
    }
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
