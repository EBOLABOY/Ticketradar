import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Button
} from '@mui/material';
import {
  SwapVert,
  Clear,
  Search,
  TuneRounded,
  FlightTakeoff,
  FlightLand,
  Person
} from '@mui/icons-material';
import { MobileFormField, MobileDateTimePicker } from './MobileForm';
import { TouchButton } from '../TouchEnhanced';
import { useMobile, useMobileForm } from '../../hooks/useMobile';
import { createAppleGlass } from '../../utils/glassmorphism';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

/**
 * 移动端航班搜索表单
 */
const MobileSearchForm = ({
  onSearch,
  onFilterChange,
  initialValues = {},
  airports = [],
  loading = false,
  sx = {},
  ...props
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [tripType, setTripType] = useState('roundtrip');
  const { isMobile } = useMobile();
  const { isDarkMode, theme: themeMode } = useCustomTheme();

  // 使用移动端表单Hook
  const {
    values,
    getMobileFieldProps,
    setIsSubmitting
  } = useMobileForm({
    origin: '',
    destination: '',
    departureDate: null,
    returnDate: null,
    passengers: 1,
    class: 'economy',
    directOnly: false,
    maxPrice: 10000,
    preferredAirlines: [],
    ...initialValues
  });

  // 机场选项
  const airportOptions = airports.map(airport => ({
    label: `${airport.name} (${airport.code})`,
    value: airport.code,
    city: airport.city
  }));

  // 航空公司选项
  const airlineOptions = [
    { label: '中国国航', value: 'CA' },
    { label: '中国东航', value: 'MU' },
    { label: '中国南航', value: 'CZ' },
    { label: '海南航空', value: 'HU' },
    { label: '春秋航空', value: '9C' },
    { label: '吉祥航空', value: 'HO' }
  ];

  // 舱位等级选项
  const classOptions = [
    { label: '经济舱', value: 'economy' },
    { label: '超级经济舱', value: 'premium_economy' },
    { label: '商务舱', value: 'business' },
    { label: '头等舱', value: 'first' }
  ];

  // 交换出发地和目的地
  const handleSwapAirports = () => {
    const temp = values.origin;
    getMobileFieldProps('origin').onChange({ target: { value: values.destination } });
    getMobileFieldProps('destination').onChange({ target: { value: temp } });
  };

  // 处理搜索
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSearch?.(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理筛选器变化
  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  // 清除筛选器
  const handleClearFilters = () => {
    getMobileFieldProps('directOnly').onChange({ target: { value: false } });
    getMobileFieldProps('maxPrice').onChange({ target: { value: 10000 } });
    getMobileFieldProps('preferredAirlines').onChange({ target: { value: [] } });
  };

  // 创建玻璃效果样式
  const createGlassSearchForm = () => {
    const baseGlass = createAppleGlass('primary', themeMode);
    return {
      ...baseGlass,
      borderRadius: 4,
      overflow: 'hidden'
    };
  };

  return (
    <Box sx={{ position: 'relative', ...sx }} {...props}>
      {/* 主搜索表单 */}
      <Paper
        sx={{
          ...createGlassSearchForm(),
          m: 2,
          p: 0
        }}
        elevation={0}
      >
        <form onSubmit={handleSearch}>
          <Box sx={{ p: 3 }}>
            {/* 行程类型选择 */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {[
                  { value: 'oneway', label: '单程' },
                  { value: 'roundtrip', label: '往返' }
                ].map((type) => (
                  <Chip
                    key={type.value}
                    label={type.label}
                    variant={tripType === type.value ? 'filled' : 'outlined'}
                    color={tripType === type.value ? 'primary' : 'default'}
                    onClick={() => setTripType(type.value)}
                    sx={{
                      fontSize: isMobile ? '14px' : '12px',
                      height: isMobile ? 32 : 28
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* 出发地和目的地 */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <MobileFormField
                type="autocomplete"
                label="出发地"
                placeholder="选择出发城市或机场"
                options={airportOptions}
                startIcon={<FlightTakeoff />}
                clearable
                {...getMobileFieldProps('origin')}
              />
              
              <MobileFormField
                type="autocomplete"
                label="目的地"
                placeholder="选择到达城市或机场"
                options={airportOptions}
                startIcon={<FlightLand />}
                clearable
                {...getMobileFieldProps('destination')}
              />

              {/* 交换按钮 */}
              <IconButton
                onClick={handleSwapAirports}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <SwapVert />
              </IconButton>
            </Box>

            {/* 日期选择 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <MobileDateTimePicker
                  type="date"
                  label="出发日期"
                  {...getMobileFieldProps('departureDate')}
                />
              </Box>
              
              {tripType === 'roundtrip' && (
                <Box sx={{ flex: 1 }}>
                  <MobileDateTimePicker
                    type="date"
                    label="返程日期"
                    {...getMobileFieldProps('returnDate')}
                  />
                </Box>
              )}
            </Box>

            {/* 乘客和舱位 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <MobileFormField
                  type="select"
                  label="乘客数量"
                  options={Array.from({ length: 9 }, (_, i) => ({
                    value: i + 1,
                    label: `${i + 1}人`
                  }))}
                  startIcon={<Person />}
                  {...getMobileFieldProps('passengers')}
                />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <MobileFormField
                  type="select"
                  label="舱位等级"
                  options={classOptions}
                  {...getMobileFieldProps('class')}
                />
              </Box>
            </Box>

            {/* 搜索按钮 */}
            <TouchButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Search />}
              disabled={loading || !values.origin || !values.destination || !values.departureDate}
              sx={{
                minHeight: 48,
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: 3
              }}
            >
              {loading ? '搜索中...' : '搜索航班'}
            </TouchButton>
          </Box>
        </form>
      </Paper>

      {/* 筛选器按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <TouchButton
          variant="outlined"
          startIcon={<TuneRounded />}
          onClick={handleFilterToggle}
          sx={{
            borderRadius: 3,
            px: 3
          }}
        >
          高级筛选
        </TouchButton>
      </Box>

      {/* 高级筛选器 */}
      <Collapse in={showFilters} timeout={300}>
        <Paper
          sx={{
            ...createGlassSearchForm(),
            m: 2,
            mb: 0
          }}
          elevation={0}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                筛选条件
              </Typography>
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                sx={{ color: 'text.secondary' }}
              >
                清除
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* 直飞选项 */}
            <FormControlLabel
              control={
                <Switch
                  checked={values.directOnly}
                  onChange={(e) => getMobileFieldProps('directOnly').onChange({ target: { value: e.target.checked } })}
                />
              }
              label="仅显示直飞航班"
              sx={{ mb: 3 }}
            />

            {/* 价格范围 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                最高价格: ¥{values.maxPrice}
              </Typography>
              <Slider
                value={values.maxPrice}
                onChange={(e, value) => getMobileFieldProps('maxPrice').onChange({ target: { value } })}
                min={500}
                max={20000}
                step={100}
                marks={[
                  { value: 500, label: '¥500' },
                  { value: 5000, label: '¥5K' },
                  { value: 10000, label: '¥10K' },
                  { value: 20000, label: '¥20K' }
                ]}
                sx={{
                  '& .MuiSlider-thumb': {
                    width: isMobile ? 24 : 20,
                    height: isMobile ? 24 : 20
                  }
                }}
              />
            </Box>

            {/* 偏好航空公司 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                偏好航空公司
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {airlineOptions.map((airline) => (
                  <Chip
                    key={airline.value}
                    label={airline.label}
                    variant={values.preferredAirlines.includes(airline.value) ? 'filled' : 'outlined'}
                    color={values.preferredAirlines.includes(airline.value) ? 'primary' : 'default'}
                    onClick={() => {
                      const current = values.preferredAirlines;
                      const newValue = current.includes(airline.value)
                        ? current.filter(v => v !== airline.value)
                        : [...current, airline.value];
                      getMobileFieldProps('preferredAirlines').onChange({ target: { value: newValue } });
                    }}
                    sx={{
                      fontSize: isMobile ? '12px' : '11px',
                      height: isMobile ? 28 : 24
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default MobileSearchForm;
