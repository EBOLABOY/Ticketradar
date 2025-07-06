import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  CircularProgress,
  Box,
  Typography,
  useTheme,
  Chip,
  Stack,
  Alert,
  AlertTitle,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { ErrorDialog } from "../../helper";
import { Language as LanguageIcon } from "@mui/icons-material";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const NearByAirports = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false); // Added state for location error

  // 固定的机场列表，支持中英文
  const fixedAirports = useMemo(() => [
    {
      code: 'HKG',
      name_zh: '香港',
      name_en: 'Hong Kong (HKG)',
      route: 'HKG'
    },
    {
      code: 'SZX',
      name_zh: '深圳',
      name_en: 'Shenzhen Bao\'an International (SZX)',
      route: 'SZX'
    },
    {
      code: 'CAN',
      name_zh: '广州',
      name_en: 'Guangzhou (CAN)',
      route: 'CAN'
    },
    {
      code: 'MFM',
      name_zh: '澳门',
      name_en: 'Macau (MFM)',
      route: 'MFM'
    }
  ], []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        (error) => {
          setLocationError(true); // Set locationError to true if there's an error
          ErrorDialog(t('home.locationError'));
          setLoading(false);
        }
      );
    } else {
      setLocationError(true);
      ErrorDialog(t('home.geolocationNotSupported'));
      setLoading(false);
    }
  }, [t]); // 添加 t 作为依赖项

  const tileLayerUrl = useMemo(
    () =>
      theme.palette.mode === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    [theme.palette.mode]
  );

  // 处理机场芯片点击事件
  const handleAirportClick = useCallback((airport) => {
    // 跳转到价格监控页面，可以传递机场代码作为参数
    navigate('/monitor', {
      state: {
        selectedAirport: airport.code,
        airportName: airport.name_zh
      }
    });
  }, [navigate]);

  // 获取当前语言
  const currentLanguage = localStorage.getItem('i18nextLng') || 'zh';
  const isChineseLanguage = currentLanguage.startsWith('zh');

  const airportChips = useMemo(
    () =>
      fixedAirports.map((airport, index) => (
        <Chip
          key={airport.code} // 使用唯一的机场代码作为 key
          label={isChineseLanguage ? airport.name_zh : airport.name_en}
          icon={<LanguageIcon />}
          variant="filled"
          onClick={() => handleAirportClick(airport)}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
            transition: 'all 0.2s ease',
          }}
        />
      )),
    [fixedAirports, isChineseLanguage, handleAirportClick, theme]
  );

  if (locationError) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "250px",
          mt: 2,
          p: 2,
        }}
      >
        <Alert severity="error">
          <AlertTitle>{t('common.error')}</AlertTitle>
          {t('home.locationError')}
        </Alert>
      </Box>
    );
  }

  return (
    <Grid2 container sx={{ my: 8, width: "100%" }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: "200px",
            mt: 2,
            p: 2,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Stack width={"100%"}>
          <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
            {t('home.popularRoutes')}
          </Typography>
          <Box
            sx={{
              my: 2,
              gap: 1,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start",
            }}
          >
            {airportChips}
          </Box>
          <Box sx={{ width: "100%" }}>
            {position && !locationError && (
              <MapContainer
                center={position}
                zoom={1.5}
                style={{ height: "250px", width: "100%", marginTop: "20px" }}
              >
                <TileLayer
                  url={tileLayerUrl}
                  attribution="&copy; OpenStreetMap &copy; Carto"
                />
                <Marker position={position} icon={customIcon}>
                  <Popup>
                    📍 {t('home.yourCurrentLocation')} <br />
                    {t('home.latitude')}: {position[0]} <br />
                    {t('home.longitude')}: {position[1]}
                  </Popup>
                </Marker>
              </MapContainer>
            )}
          </Box>
        </Stack>
      )}
    </Grid2>
  );
};

export default NearByAirports;
