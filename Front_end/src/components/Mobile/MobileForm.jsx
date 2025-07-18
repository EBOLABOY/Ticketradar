import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
  Autocomplete,
  Select,
  MenuItem,
  Paper,
  Typography,
  Divider,
  Collapse
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Clear,
  ExpandMore,
  ExpandLess,
  CalendarToday,
  AccessTime
} from '@mui/icons-material';
// 暂时注释掉日期选择器相关导入
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useMobile } from '../../hooks/useMobile';
import { TouchButton } from '../TouchEnhanced';
import { createAppleGlass } from '../../utils/glassmorphism';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

/**
 * 移动端优化的表单字段组件
 */
const MobileFormField = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  multiline = false,
  rows = 4,
  startIcon,
  endIcon,
  clearable = false,
  options = [],
  sx = {},
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { isMobile } = useMobile();
  const { isDarkMode } = useCustomTheme();

  const handleClear = () => {
    onChange({ target: { value: '' } });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 基础字段样式
  const getFieldStyles = () => ({
    '& .MuiInputBase-root': {
      minHeight: isMobile ? 48 : 40,
      borderRadius: 2,
      fontSize: isMobile ? '16px' : '14px', // 防止iOS缩放
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      '&:hover': {
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      },
      '&.Mui-focused': {
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
      }
    },
    '& .MuiInputLabel-root': {
      fontSize: isMobile ? '14px' : '12px',
      fontWeight: 500
    },
    '& .MuiFormHelperText-root': {
      fontSize: isMobile ? '12px' : '11px',
      marginTop: 1
    },
    ...sx
  });

  // 渲染不同类型的字段
  const renderField = () => {
    switch (type) {
      case 'password':
        return (
          <TextField
            type={showPassword ? 'text' : 'password'}
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            helperText={helperText}
            required={required}
            disabled={disabled}
            fullWidth
            InputProps={{
              startAdornment: startIcon && (
                <InputAdornment position="start">{startIcon}</InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    size={isMobile ? 'medium' : 'small'}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={getFieldStyles()}
            {...props}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth error={error} sx={getFieldStyles()}>
            <FormLabel sx={{ mb: 1, fontSize: isMobile ? '14px' : '12px' }}>
              {label} {required && '*'}
            </FormLabel>
            <Select
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              displayEmpty
              sx={{
                minHeight: isMobile ? 48 : 40,
                '& .MuiSelect-select': {
                  fontSize: isMobile ? '16px' : '14px'
                }
              }}
              {...props}
            >
              {placeholder && (
                <MenuItem value="" disabled>
                  <em>{placeholder}</em>
                </MenuItem>
              )}
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {helperText && (
              <FormHelperText>{helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case 'autocomplete':
        return (
          <Autocomplete
            options={options}
            value={value}
            onChange={(event, newValue) => {
              onChange({ target: { value: newValue } });
            }}
            onBlur={onBlur}
            disabled={disabled}
            getOptionLabel={(option) => option.label || option}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                error={error}
                helperText={helperText}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: startIcon && (
                    <InputAdornment position="start">{startIcon}</InputAdornment>
                  )
                }}
                sx={getFieldStyles()}
              />
            )}
            {...props}
          />
        );

      default:
        return (
          <TextField
            type={type}
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            helperText={helperText}
            required={required}
            disabled={disabled}
            multiline={multiline}
            rows={multiline ? rows : undefined}
            fullWidth
            InputProps={{
              startAdornment: startIcon && (
                <InputAdornment position="start">{startIcon}</InputAdornment>
              ),
              endAdornment: (clearable && value) ? (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClear}
                    edge="end"
                    size={isMobile ? 'medium' : 'small'}
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ) : endIcon ? (
                <InputAdornment position="end">{endIcon}</InputAdornment>
              ) : null
            }}
            sx={getFieldStyles()}
            {...props}
          />
        );
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {renderField()}
    </Box>
  );
};

/**
 * 移动端日期时间选择器
 * 暂时使用简化的文本输入实现
 */
const MobileDateTimePicker = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  type = 'date', // 'date', 'time', 'datetime'
  sx = {},
  ...props
}) => {
  const { isMobile } = useMobile();

  const getInputType = () => {
    switch (type) {
      case 'date': return 'date';
      case 'time': return 'time';
      case 'datetime': return 'datetime-local';
      default: return 'date';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'time': return <AccessTime />;
      default: return <CalendarToday />;
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        type={getInputType()}
        label={label}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {getIcon()}
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiInputBase-root': {
            minHeight: isMobile ? 48 : 40,
            fontSize: isMobile ? '16px' : '14px'
          },
          ...sx
        }}
        {...props}
      />
    </Box>
  );
};

/**
 * 移动端表单容器
 */
const MobileFormContainer = ({
  title,
  subtitle,
  children,
  onSubmit,
  submitText = '提交',
  submitDisabled = false,
  submitLoading = false,
  showDividers = true,
  collapsible = false,
  defaultExpanded = true,
  sx = {},
  ...props
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { isMobile } = useMobile();
  const { isDarkMode, theme: themeMode } = useCustomTheme();

  const createGlassForm = () => {
    const baseGlass = createAppleGlass('secondary', themeMode);
    return {
      ...baseGlass,
      borderRadius: 3,
      overflow: 'hidden'
    };
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper
      sx={{
        ...createGlassForm(),
        m: isMobile ? 2 : 3,
        ...sx
      }}
      elevation={0}
      {...props}
    >
      {/* 表单头部 */}
      {(title || subtitle) && (
        <Box
          sx={{
            p: 3,
            pb: showDividers ? 2 : 3,
            cursor: collapsible ? 'pointer' : 'default'
          }}
          onClick={collapsible ? handleToggle : undefined}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              {title && (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: subtitle ? 0.5 : 0,
                    color: isDarkMode ? '#e8eaed' : '#202124'
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: isDarkMode ? '#9aa0a6' : '#5f6368'
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            {collapsible && (
              <IconButton size="small">
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      {showDividers && (title || subtitle) && (
        <Divider sx={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }} />
      )}

      {/* 表单内容 */}
      <Collapse in={expanded} timeout={300}>
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            p: 3,
            pt: (title || subtitle) && showDividers ? 3 : 2
          }}
        >
          {children}
          
          {/* 提交按钮 */}
          {onSubmit && (
            <Box sx={{ mt: 3, pt: 2 }}>
              <TouchButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitDisabled}
                loading={submitLoading}
                sx={{
                  minHeight: isMobile ? 48 : 40,
                  fontSize: isMobile ? '16px' : '14px',
                  fontWeight: 600
                }}
              >
                {submitText}
              </TouchButton>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export { MobileFormField, MobileDateTimePicker, MobileFormContainer };
export default MobileFormField;
