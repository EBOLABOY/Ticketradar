import { Container, Box } from "@mui/material";

import SearchBar from "../components/Home/SearchBar";
import NearByAirports from "../components/Home/NearByAirports";
import LandingPage from "../components/LandingPage";
import { useTheme as useCustomTheme } from "../contexts/ThemeContext";
import { BottomNavigation } from "../components/Mobile";
import { useMobile } from "../hooks/useMobile";

const Home = () => {
  const { isDarkMode } = useCustomTheme();
  const { isMobile, isSmallScreen } = useMobile();

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          // 移动端为底部导航预留空间
          pb: (isMobile || isSmallScreen) ? 10 : 0
        }}
      >
        {/* Hero区域 - 包含背景图片和标题 */}
        <Box
          sx={{
            position: "relative",
            mb: 3,
          }}
        >
          <LandingPage darkMode={isDarkMode} />
        </Box>

        {/* 搜索栏区域 - 正常文档流，确保不遮挡标题 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 4,
            px: { xs: 2, sm: 0 },
          }}
        >
          <SearchBar isDarkMode={isDarkMode} />
        </Box>

        {/* 底部内容区域 */}
        <Box>
          <NearByAirports />
        </Box>
      </Container>

      {/* 移动端底部导航 */}
      {(isMobile || isSmallScreen) && (
        <BottomNavigation
          showFab={true}
          fabAction={() => {
            // 可以导航到AI助手页面
            window.location.href = '/ai-travel';
          }}
        />
      )}
    </>
  );
};

export default Home;
