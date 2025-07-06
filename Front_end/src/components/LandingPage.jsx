import { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import FlightLightHero from "../assets/images/flights_light_hero.svg";
import FlightDarkHero from "../assets/images/flights_dark_hero.svg";


const LandingPage = ({ darkMode }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // 获取玻璃效果样式

  const textStyle = useMemo(
    () => ({
      position: "absolute",
      top: "70%",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: { xs: "36px", md: "56px" },
      lineHeight: "64px",
      zIndex: 1,
      color: theme.palette.mainColors.text,
      textAlign: 'center',
      fontWeight: 400,
      letterSpacing: '-0.02em',
      // 移除所有玻璃效果，只保留文字阴影增强可读性
      textShadow: darkMode
        ? '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'
        : '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
      // 简单的悬停效果
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateX(-50%) translateY(-2px)',
        textShadow: darkMode
          ? '0 6px 16px rgba(0,0,0,0.9), 0 3px 6px rgba(0,0,0,0.7)'
          : '0 6px 16px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.3)',
      }
    }),
    [theme.palette.mainColors.text, darkMode]
  );

  const imageSrc = useMemo(
    () => (darkMode ? FlightDarkHero : FlightLightHero),
    [darkMode]
  );

  return (
    <Box
      sx={{
        textAlign: "center",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img
        src={imageSrc}
        alt="Google Flights"
        style={{
          maxWidth: "100%",
          height: "auto",
          transition: "opacity 0.3s ease",
          display: "block"
        }}
      />
      <Typography
        data-test="landing-text"
        variant="subtitle1"
        sx={textStyle}
      >
        {t('home.title')}
      </Typography>
    </Box>
  );
};

export default LandingPage;
