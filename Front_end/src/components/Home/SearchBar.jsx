import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  useTheme,
  TextField,
  Chip,
  Collapse,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  SyncAlt as SyncAltIcon,
  TrendingFlat as TrendingFlatIcon,
  MultipleStop as MultipleStopIcon,
  ExpandLess as ExpandLessIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import PassengerSelector from "./PassengerSelector";
import { flightApi } from "../../services/backendApi";
import SearchInput from "./SearchInput";
import { useNavigate } from "react-router-dom";
import { ErrorDialog } from "../../helper";
import { getLocaleSettings, logCurrentSettings } from "../../utils/localeSettings";
import { createAppleGlass, createGlassButton } from "../../utils/glassmorphism";
import { useLoading } from "../../hooks/useLoading";
import { useAsyncSearch } from "../../hooks/useAsyncSearch";

const SearchBar = ({ isDarkMode }) => {
  const { t } = useTranslation();
  const { startLoading, stopLoading } = useLoading();
  const {
    isSearching: isAsyncSearching,
    progress: searchProgress,
    statusMessage,
    error: searchError,
    result: searchResult,
    startAsyncSearch,
    cancelSearch,
    resetSearch
  } = useAsyncSearch();

  const menuOptions = useMemo(
    () => [
      { label: t('search.oneWay'), key: "oneWay", icon: <TrendingFlatIcon /> },
      { label: t('search.roundTrip'), key: "roundTrip", icon: <SyncAltIcon /> },
      { label: t('search.multiCity'), key: "multiCity", icon: <MultipleStopIcon /> },
    ],
    [t]
  );

  const classOptions = useMemo(
    () => [
      { label: t('search.economy'), key: "economy" },
      { label: t('search.business'), key: "business" }
    ],
    [t]
  );

  const preferenceExamples = useMemo(
    () => [
      { label: t('preferences.cheapest'), value: t('preferences.cheapestText') },
      { label: t('preferences.direct'), value: t('preferences.directText') },
      { label: t('preferences.morning'), value: t('preferences.morningText') },
      { label: t('preferences.comfort'), value: t('preferences.comfortText') },
      { label: t('preferences.flexible'), value: t('preferences.flexibleText') },
    ],
    [t]
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const [classEl, setClassEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState(menuOptions[0]);
  const [selectedClass, setSelectedClass] = useState(classOptions[0]);
  const [searchAirports, setSearchAirports] = useState({
    whereTo: [],
    whereFrom: [],
  });
  const [selectFlight, setSelectFlight] = useState({
    originSky: [],
    destinationSky: [],
    cabinClass: "economy",
    oneDate: null,
    returnDate: null,
    passenger: {
      adults: 1,
      children: 0,
      infantsSeat: 0,
      infantsLap: 0,
    },
  });
  const [openAutocomplete, setOpenAutocomplete] = useState(null);
  const [userPreferences, setUserPreferences] = useState("");
  const [showPreferences, setShowPreferences] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();

  const handleMenuOpen = useCallback((event, type) => {
    type === "trip"
      ? setAnchorEl(event.currentTarget)
      : setClassEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback((option, type) => {
    if (type === "trip") {
      setSelectedOption(option);
    } else if (type === "class") {
      setSelectedClass(option);
      setSelectFlight((prevState) => ({
        ...prevState,
        cabinClass: option.key,
      }));
    }
    type === "trip" ? setAnchorEl(null) : setClassEl(null);
  }, []);

  const handleSelectFlight = useCallback((params, type) => {
    setSelectFlight((prevState) => {
      const newState = { ...prevState };
      if (type === "whereFrom") {
        newState.originSky = [...newState.originSky, params];
      } else if (type === "whereTo") {
        newState.destinationSky = [...newState.destinationSky, params];
      }
      return newState;
    });
  }, []);

  const handleWhereChange = useCallback(async (e, where) => {
    const value = e.target.value;
    if (typeof value === "string") {
      const normalizedValue = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      if (normalizedValue.length >= 1) {
        setOpenAutocomplete(where);
        try {
          // 获取当前语言设置
          const localeSettings = getLocaleSettings();

          // 调用后端机场搜索API
          const response = await flightApi.searchAirports(normalizedValue, localeSettings.language);
          const airports = response?.data?.airports || [];

          console.log('机场搜索响应:', response);
          console.log('机场列表:', airports);

          // 后端已经返回了前端期望的格式，直接使用
          setSearchAirports((prev) => ({
            ...prev,
            [where]: airports,
          }));
        } catch (error) {
          console.error('机场搜索错误:', error);

          // 处理认证错误
          if (error.response?.status === 401 || error.response?.status === 403) {
            ErrorDialog(t('auth.loginRequired'));
            navigate('/login');
            return;
          }

          ErrorDialog(error.message || t('common.error'));
        }
      } else {
        setOpenAutocomplete(null);
        setSearchAirports((prev) => ({
          ...prev,
          isMenuOpen: false,
        }));
      }
    }
  }, [t, navigate]);

  const handleSelectAdults = useCallback((adults) => {
    setSelectFlight((prevState) => ({
      ...prevState,
      passenger: { ...prevState.passenger, adults: adults },
    }));
  }, []);

  const handleSelectPassengers = useCallback((passengers) => {
    setSelectFlight((prevState) => ({
      ...prevState,
      passenger: passengers,
    }));
  }, []);

  const handleSelectDate = useCallback((date, type = 'departure') => {
    setSelectFlight((prevState) => ({
      ...prevState,
      [type === 'departure' ? 'oneDate' : 'returnDate']: date,
    }));
  }, []);

  const handlePreferenceSelect = useCallback((preference) => {
    setUserPreferences(preference.value);
  }, []);

  const handlePreferenceChange = useCallback((event) => {
    setUserPreferences(event.target.value);
  }, []);

  const isFormValid = useCallback(() => {
    const originCode = selectFlight.originSky[0]?.skyId || selectFlight.originSky[0]?.code;
    const destinationCode = selectFlight.destinationSky[0]?.skyId || selectFlight.destinationSky[0]?.code;
    const isRoundTrip = selectedOption.key === "roundTrip";

    return (
      selectFlight.originSky.length > 0 &&
      selectFlight.destinationSky.length > 0 &&
      selectFlight.oneDate !== null &&
      (!isRoundTrip || selectFlight.returnDate !== null) && // 往返航班需要返程日期
      selectFlight.passenger.adults > 0 &&
      originCode !== destinationCode  // 确保出发地和目的地不同
    );
  }, [selectFlight, selectedOption]);

  const fetchData = useCallback(async () => {
    if (!isFormValid()) {
      // 检查具体的验证失败原因
      const originCode = selectFlight.originSky[0]?.skyId || selectFlight.originSky[0]?.code;
      const destinationCode = selectFlight.destinationSky[0]?.skyId || selectFlight.destinationSky[0]?.code;

      if (originCode === destinationCode && originCode) {
        ErrorDialog(t('common.validation.sameAirports'));
      } else {
        ErrorDialog(t('search.noResults'));
      }
      return;
    }

    // 重置之前的异步搜索状态
    resetSearch();

    try {
      // 检查用户是否已登录
      const token = localStorage.getItem('authToken');
      if (!token) {
        ErrorDialog(t('auth.loginRequired'));
        stopLoading();
        navigate('/login');
        return;
      }

      // 获取当前语言和货币设置
      const localeSettings = getLocaleSettings();

      // 输出当前语言环境设置用于调试
      logCurrentSettings();

      // 转换参数格式以匹配后端API
      const searchParams = {
        departure_code: selectFlight.originSky[0]?.skyId || selectFlight.originSky[0]?.code,
        destination_code: selectFlight.destinationSky[0]?.skyId || selectFlight.destinationSky[0]?.code,
        depart_date: selectFlight.oneDate,
        return_date: selectedOption.key === "roundTrip" ? selectFlight.returnDate : null,
        adults: selectFlight.passenger.adults,
        children: selectFlight.passenger.children || 0,
        infants_in_seat: selectFlight.passenger.infantsSeat || 0,
        infants_on_lap: selectFlight.passenger.infantsLap || 0,
        seat_class: selectedClass.key.toUpperCase(),
        language: localeSettings.language,
        currency: localeSettings.currency,
        user_preferences: userPreferences.trim() // 添加用户偏好
      };

      console.log('🔍 搜索参数:', searchParams);
      console.log('🌍 语言环境:', localeSettings);

      // 启动流程动画
      const loadingSteps = [
        t('loadingSteps.step1', '正在搜索航班...'),
        t('loadingSteps.step2', '正在获取隐藏航班...'),
        t('loadingSteps.step3', 'AI正在分析...'),
        t('loadingSteps.step4', '正在整理...')
      ];
      startLoading(loadingSteps);

      // 使用异步AI增强搜索
      const asyncResult = await startAsyncSearch(searchParams);

      if (asyncResult.success) {
        // 导航到搜索结果页面，传递异步搜索的状态
        navigate("/flights", {
          state: {
            isAsyncSearch: true,
            taskId: asyncResult.taskId,
            searchParams: searchParams
          }
        });

        // 不要在导航后立即停止流程动画，让FlightsList页面来管理
        // stopLoading();
      } else {
        stopLoading();
        ErrorDialog(asyncResult.error || t('search.noResults'));
      }
    } catch (error) {
      stopLoading();
      // 处理认证错误
      if (error.response?.status === 401) {
        ErrorDialog(t('auth.sessionExpired'));
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        ErrorDialog(error.response?.data?.message || error.message || t('search.noResults'));
      }
    }
  }, [navigate, selectFlight, isFormValid, t, selectedClass.key, selectedOption.key, userPreferences, startLoading, stopLoading, startAsyncSearch, resetSearch]);

  // 获取优化的玻璃效果样式 - 使用更透明的效果与背景融合
  const glassStyle = createAppleGlass('secondary', theme.palette.mode, {
    // 自定义更透明的背景
    background: theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.4)' // 降低不透明度
      : 'rgba(16, 16, 16, 0.4)',
    // 增强模糊效果
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    // 更柔和的边框
    border: theme.palette.mode === 'light'
      ? '0.5px solid rgba(255, 255, 255, 0.3)'
      : '0.5px solid rgba(255, 255, 255, 0.15)',
    // 优化阴影效果
    boxShadow: theme.palette.mode === 'light'
      ? '0 8px 32px rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
      : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  });
  
  const glassButtonStyle = createGlassButton(theme.palette.mode);

  return (
    <Grid2
      size={12}
      item="true"
      sx={{
        padding: { xs: "20px", sm: "28px 36px" },
        position: "relative",
        width: "100%",
        // 应用优化的玻璃效果
        ...glassStyle,
        borderRadius: "20px", // 更圆润的边角
        // 移动端适配
        ...(theme.breakpoints.down('sm') && {
          padding: "16px 20px",
          borderRadius: "16px",
          // 移动端使用稍微不透明的背景确保可读性
          background: theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.6)'
            : 'rgba(16, 16, 16, 0.6)',
        }),
        // 悬停效果
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'light'
            ? '0 12px 40px rgba(31, 38, 135, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.7)'
            : '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        // 聚焦光晕效果
        '&:focus-within': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'light'
            ? '0 0 0 4px rgba(66, 165, 245, 0.15), 0 16px 48px rgba(31, 38, 135, 0.3)'
            : '0 0 0 4px rgba(144, 202, 249, 0.15), 0 16px 48px rgba(0, 0, 0, 0.5)',
        },
        // 确保在背景图片上有足够的对比度
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: -1,
        },
      }}
    >
      {/* HEADER */}
      <Grid2
        container
        spacing={{ xs: 1, sm: 2 }}
        alignItems="center"
        justifyContent="flex-start"
        my={1}
        wrap="wrap" // 允许换行
      >
        <Grid2 item="true" xs={12} sm={6} md="auto">
          <Button
            fullWidth
            onClick={(e) => handleMenuOpen(e, "trip")}
            endIcon={<ExpandMoreIcon />}
            sx={{
              ...glassButtonStyle,
              textTransform: "capitalize",
              display: "flex",
              alignItems: "center",
              justifyContent: 'space-between',
              gap: 1,
              color: theme.palette.text.primary,
              px: 2,
              py: 1,
              minHeight: 40,
            }}
          >
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {selectedOption.icon} {selectedOption.label}
            </Box>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            sx={{
              '& .MuiPaper-root': {
                ...createAppleGlass('secondary', theme.palette.mode),
                mt: 1,
                minWidth: 200,
              }
            }}
          >
            {menuOptions.map((option, index) => (
              <MenuItem
                key={index}
                onClick={() => handleMenuClose(option, "trip")}
                disabled={option.key === "multiCity"} // 暂时只禁用多城市，保留单程和往返
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{
                    color:
                      option.key !== "multiCity"
                        ? theme.palette.mainColors.text
                        : theme.palette.mainColors.secondaryText,
                    fontSize: ".9rem",
                  }}
                >
                  {option.icon}
                  {option.label}
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Grid2>
        <Grid2 item="true" xs={6} sm={3} md="auto">
          <PassengerSelector
            onSelectAdults={handleSelectAdults}
            onSelectPassengers={handleSelectPassengers}
          />
        </Grid2>
        <Grid2 item="true" xs={6} sm={3} md="auto">
          <Button
            fullWidth
            onClick={(e) => handleMenuOpen(e, "class")}
            endIcon={<ExpandMoreIcon />}
            sx={{
              ...glassButtonStyle,
              color: theme.palette.text.primary,
              textTransform: "capitalize",
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              minHeight: 40,
            }}
          >
            <Box
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedClass.label}
            </Box>
          </Button>
          <Menu
            anchorEl={classEl}
            open={Boolean(classEl)}
            onClose={() => setClassEl(null)}
            sx={{
              '& .MuiPaper-root': {
                ...createAppleGlass('secondary', theme.palette.mode),
                mt: 1,
                minWidth: 200,
              }
            }}
          >
            {classOptions.map((option, index) => (
              <MenuItem
                key={index}
                onClick={() => handleMenuClose(option, "class")}
                sx={{
                  color: theme.palette.mainColors.text,
                  fontSize: ".9rem",
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Grid2>
      </Grid2>

      {/* INPUTS */}
      <SearchInput
        openAutocomplete={openAutocomplete}
        searchAirports={searchAirports}
        handleWhereChange={handleWhereChange}
        onSelectFlight={handleSelectFlight}
        onSelectDate={handleSelectDate}
        onCloseAutocomplete={() => setOpenAutocomplete(null)}
        selectedOption={selectedOption}
      />

      {/* AI偏好设置 */}
      <Box mt={2}>
        <Button
          onClick={() => setShowPreferences(!showPreferences)}
          startIcon={<AutoAwesomeIcon />}
          endIcon={showPreferences ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            ...glassButtonStyle,
            color: theme.palette.text.primary,
            textTransform: "none",
            fontSize: "0.9rem",
            fontWeight: 500,
            px: 2,
            py: 1,
          }}
        >
          {t('preferences.aiAssistant')}
        </Button>

        <Collapse in={showPreferences}>
          <Box mt={2} p={3} sx={{
            ...createAppleGlass('tertiary', theme.palette.mode),
            // AI偏好模态框特殊效果
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: theme.palette.mode === 'light'
                ? '0 6px 20px rgba(31, 38, 135, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                : '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            },
          }}>
            <Typography variant="body2" color="textSecondary" mb={1}>
              {t('preferences.description')}
            </Typography>

            {/* 快速选择示例 */}
            <Box mb={2}>
              <Typography variant="caption" color="textSecondary" mb={1} display="block">
                {t('preferences.quickSelect')}:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {preferenceExamples.map((example, index) => (
                  <Chip
                    key={index}
                    label={example.label}
                    size="small"
                    onClick={() => handlePreferenceSelect(example)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* 自定义输入 */}
            <TextField
              fullWidth
              multiline
              rows={2}
              value={userPreferences}
              onChange={handlePreferenceChange}
              placeholder={t('preferences.placeholder')}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <PsychologyIcon
                    sx={{
                      color: theme.palette.text.secondary,
                      mr: 1,
                      fontSize: "1.2rem"
                    }}
                  />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  ...createAppleGlass('secondary', theme.palette.mode),
                  border: 'none',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-focused': {
                    boxShadow: theme.palette.mode === 'light'
                      ? '0 0 0 3px rgba(66, 165, 245, 0.2), 0 4px 16px rgba(31, 38, 135, 0.25)'
                      : '0 0 0 3px rgba(144, 202, 249, 0.2), 0 4px 16px rgba(0, 0, 0, 0.4)',
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: 'none',
                },
              }}
            />

            {userPreferences && (
              <Typography variant="caption" color="primary" mt={1} display="block">
                ✨ {t('preferences.aiWillConsider')}
              </Typography>
            )}
          </Box>
        </Collapse>
      </Box>

      <Box display={"flex"} justifyContent={"center"} mt={4}>
        <Button
          onClick={() => fetchData()}
          variant="contained"
          sx={{
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, rgba(66, 165, 245, 0.95), rgba(33, 150, 243, 0.95))'
              : 'linear-gradient(135deg, rgba(144, 202, 249, 0.95), rgba(100, 181, 246, 0.95))',
            color: 'white',
            borderRadius: "28px",
            textTransform: "capitalize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 5,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            minWidth: 180,
            minHeight: 56,
            // 玻璃效果边框
            border: theme.palette.mode === 'light'
              ? '1px solid rgba(255, 255, 255, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            // 内部光晕
            boxShadow: theme.palette.mode === 'light'
              ? '0 8px 32px rgba(66, 165, 245, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
              : '0 8px 32px rgba(144, 202, 249, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            // Apple风格按钮特效
            '&:hover': {
              transform: 'translateY(-3px)',
              background: theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(66, 165, 245, 1), rgba(33, 150, 243, 1))'
                : 'linear-gradient(135deg, rgba(144, 202, 249, 1), rgba(100, 181, 246, 1))',
              boxShadow: theme.palette.mode === 'light'
                ? '0 12px 40px rgba(66, 165, 245, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.7)'
                : '0 12px 40px rgba(144, 202, 249, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            },
            '&:active': {
              transform: 'translateY(-1px)',
            },
            // 过渡动画
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          startIcon={
            userPreferences.trim() ? (
              <AutoAwesomeIcon />
            ) : (
              <SearchIcon />
            )
          }
        >
          {userPreferences.trim()
              ? t('preferences.aiSearch')
              : t('home.explore')
          }
        </Button>
      </Box>
    </Grid2>
  );
};

export default SearchBar;
