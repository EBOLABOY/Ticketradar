import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { CssBaseline, responsiveFontSizes } from "@mui/material";
import { darkTheme, lightTheme } from "./theme";
import { useMemo, useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { ToastContainer } from "react-toastify";
import { UserProvider } from "./contexts/UserContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import { SimpleNotificationProvider } from "./components/Notification/SimpleNotificationSystem";
import { initializeLocale, debugLocaleInfo } from "./utils/initializeLocale";

// 内部App组件，可以使用主题上下文
function AppContent() {
  const { isDarkMode } = useTheme();

  const theme = useMemo(
    () => responsiveFontSizes(isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

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
              <ToastContainer
              theme={isDarkMode ? 'dark' : 'light'}
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
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
