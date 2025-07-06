import { Container, Box } from "@mui/material";

import SearchBar from "../components/Home/SearchBar";
import NearByAirports from "../components/Home/NearByAirports";
import LandingPage from "../components/LandingPage";
import { useTheme as useCustomTheme } from "../contexts/ThemeContext";

const Home = () => {
  const { isDarkMode } = useCustomTheme();

  return (
    <Container maxWidth="lg">
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
  );
};

export default Home;
