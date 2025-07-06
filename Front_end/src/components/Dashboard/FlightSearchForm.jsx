import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { getFormDialogPosition } from '../../utils/dialogPositioning';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  Switch,
  FormControlLabel,
  Autocomplete,
  CircularProgress,
  Collapse,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import {
  Add,
  Edit,
  Save,
  ExpandMore,
  ExpandLess,
  Email,
  Notifications,
  FlightTakeoff,
  DateRange,
  Settings
} from '@mui/icons-material';
import { createAppleGlass, createGlassButton } from '../../utils/glassmorphism';

/**
 * 航班搜索表单组件
 * 负责创建和编辑监控任务的表单界面
 */
const FlightSearchForm = React.memo(({
  open,
  mode, // 'create' | 'edit'
  taskForm,
  submitting,
  onClose,
  onSubmit,
  onFormChange,
  anchorEl // 新增：用于定位对话框的锚点元素
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isEditMode = mode === 'edit';
  const title = isEditMode ? '编辑监控任务' : t('dashboard.actions.createTask');
  const submitText = isEditMode ? '保存更改' : '创建任务';
  const submittingText = isEditMode ? '保存中...' : '创建中...';



  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      // 移除disableScrollLock和TransitionProps，让MUI使用默认的现代化处理方式
      PaperProps={{
        sx: {
          ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
          borderRadius: '16px',
          maxHeight: '90vh',
          maxWidth: anchorEl ? '600px' : '750px', // 固定宽度以便定位
          margin: anchorEl ? 0 : '16px', // 如果有锚点元素，不使用默认边距
          backdropFilter: 'blur(40px) saturate(200%)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          ...(anchorEl ? getFormDialogPosition(anchorEl) : {}), // 如果有锚点元素，使用自定义位置
        }
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(8px)',
          backgroundColor: isDark
            ? 'rgba(0, 0, 0, 0.4)'
            : 'rgba(255, 255, 255, 0.05)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 2, pt: 3, px: 4 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isEditMode ? (
              <Edit sx={{
                fontSize: 24,
                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }} />
            ) : (
              <Add sx={{
                fontSize: 24,
                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }} />
            )}
          </Box>
          <Box>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #ffffff, #e0e0e0)'
                  : 'linear-gradient(135deg, #1a1a1a, #333333)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.5px',
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                fontWeight: 500,
              }}
            >
              {isEditMode ? '修改监控任务设置' : '创建新的机票价格监控任务'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 2,
          px: 4,
          pb: 2,
          overflow: 'auto',
          maxHeight: 'calc(90vh - 200px)',
        }}
      >
        <Grid container spacing={3}>
          {/* 基本信息 */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="700"
                gutterBottom
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                  mb: 3,
                  letterSpacing: '0.5px',
                }}
              >
                基本信息
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="任务名称"
                    value={taskForm.name}
                    onChange={(e) => onFormChange('name', e.target.value)}
                    placeholder="例如：香港到东京监控"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                        borderRadius: '12px',
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: '2px solid #1976d2',
                          boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="价格阈值"
                    type="number"
                    value={taskForm.priceThreshold}
                    onChange={(e) => onFormChange('priceThreshold', Number(e.target.value))}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, fontWeight: 600 }}>¥</Typography>
                    }}
                    variant="outlined"
                    helperText="低于此价格时将发送提醒"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                        borderRadius: '12px',
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: '2px solid #1976d2',
                          boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                        fontWeight: 500,
                      },
                      '& .MuiFormHelperText-root': {
                        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* 航线信息 */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                mb: 2,
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
                <FlightTakeoff sx={{
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  fontSize: 24
                }} />
                <Typography
                  variant="h6"
                  fontWeight="700"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                    letterSpacing: '0.5px',
                  }}
                >
                  航线信息
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  {isEditMode ? (
                    <TextField
                      fullWidth
                      label="出发地"
                      value={taskForm.departureCity}
                      variant="outlined"
                      disabled
                      helperText="出发地创建后不可修改"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                          borderRadius: '12px',
                          '& fieldset': {
                            border: 'none',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                          fontWeight: 500,
                        },
                        '& .MuiFormHelperText-root': {
                          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                          fontWeight: 500,
                        },
                      }}
                    />
                  ) : (
                    <Autocomplete
                      options={[
                        { code: 'HKG', name: '香港', flag: '🇭🇰' },
                        { code: 'SZX', name: '深圳', flag: '🇨🇳' },
                        { code: 'CAN', name: '广州', flag: '🇨🇳' },
                        { code: 'MFM', name: '澳门', flag: '🇲🇴' },
                        { code: 'BJS', name: '北京', flag: '🇨🇳' },
                        { code: 'SHA', name: '上海', flag: '🇨🇳' },
                        { code: 'TSN', name: '天津', flag: '🇨🇳' },
                        { code: 'TYO', name: '东京', flag: '🇯🇵' },
                        { code: 'SEL', name: '首尔', flag: '🇰🇷' },
                        { code: 'TPE', name: '台北', flag: '🇹🇼' }
                      ]}
                      getOptionLabel={(option) => `${option.flag} ${option.name} (${option.code})`}
                      value={taskForm.departureCity ?
                        [
                          { code: 'HKG', name: '香港', flag: '🇭🇰' },
                          { code: 'SZX', name: '深圳', flag: '🇨🇳' },
                          { code: 'CAN', name: '广州', flag: '🇨🇳' },
                          { code: 'MFM', name: '澳门', flag: '🇲🇴' },
                          { code: 'BJS', name: '北京', flag: '🇨🇳' },
                          { code: 'SHA', name: '上海', flag: '🇨🇳' },
                          { code: 'TSN', name: '天津', flag: '🇨🇳' },
                          { code: 'TYO', name: '东京', flag: '🇯🇵' },
                          { code: 'SEL', name: '首尔', flag: '🇰🇷' },
                          { code: 'TPE', name: '台北', flag: '🇹🇼' }
                        ].find(option => option.code === taskForm.departureCity) || null : null}
                      onChange={(_, newValue) => {
                        onFormChange('departureCity', newValue?.code || '');
                      }}
                      freeSolo={false}
                      clearOnBlur={false}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="出发城市"
                          placeholder="选择出发城市"
                          variant="outlined"
                          helperText="请选择出发城市代码"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                              borderRadius: '12px',
                              '& fieldset': {
                                border: 'none',
                              },
                              '&:hover fieldset': {
                                border: 'none',
                              },
                              '&.Mui-focused fieldset': {
                                border: '2px solid #1976d2',
                                boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                              fontWeight: 500,
                            },
                            '& .MuiFormHelperText-root': {
                              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                              fontWeight: 500,
                            },
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          {...props}
                          sx={{
                            p: 2,
                            borderRadius: '8px',
                            m: 0.5,
                            '&:hover': {
                              ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: '8px',
                                ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                                minWidth: '48px',
                                textAlign: 'center',
                              }}
                            >
                              <Typography variant="caption" fontWeight="700" color="primary">
                                {option.code}
                              </Typography>
                            </Box>
                            <Box flex={1}>
                              <Typography variant="body1" fontWeight="600">
                                {option.flag} {option.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                城市代码: {option.code}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      PaperComponent={({ children, ...other }) => (
                        <Box
                          {...other}
                          sx={{
                            ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                            borderRadius: '12px',
                            mt: 1,
                            border: isDark
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          {children}
                        </Box>
                      )}
                    />
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={[
                      { code: 'HKG', name: '香港', flag: '🇭🇰' },
                      { code: 'SZX', name: '深圳', flag: '🇨🇳' },
                      { code: 'CAN', name: '广州', flag: '🇨🇳' },
                      { code: 'MFM', name: '澳门', flag: '🇲🇴' },
                      { code: 'BJS', name: '北京', flag: '🇨🇳' },
                      { code: 'SHA', name: '上海', flag: '🇨🇳' },
                      { code: 'TSN', name: '天津', flag: '🇨🇳' },
                      { code: 'TYO', name: '东京', flag: '🇯🇵' },
                      { code: 'SEL', name: '首尔', flag: '🇰🇷' },
                      { code: 'TPE', name: '台北', flag: '🇹🇼' }
                    ]}
                    getOptionLabel={(option) => `${option.flag} ${option.name} (${option.code})`}
                    value={taskForm.destinationCity ?
                      [
                        { code: 'HKG', name: '香港', flag: '🇭🇰' },
                        { code: 'SZX', name: '深圳', flag: '🇨🇳' },
                        { code: 'CAN', name: '广州', flag: '🇨🇳' },
                        { code: 'MFM', name: '澳门', flag: '🇲🇴' },
                        { code: 'BJS', name: '北京', flag: '🇨🇳' },
                        { code: 'SHA', name: '上海', flag: '🇨🇳' },
                        { code: 'TSN', name: '天津', flag: '🇨🇳' },
                        { code: 'TYO', name: '东京', flag: '🇯🇵' },
                        { code: 'SEL', name: '首尔', flag: '🇰🇷' },
                        { code: 'TPE', name: '台北', flag: '🇹🇼' }
                      ].find(option => option.code === taskForm.destinationCity) || null : null}
                    onChange={(_, newValue) => {
                      onFormChange('destinationCity', newValue?.code || '');
                    }}
                    freeSolo={false}
                    clearOnBlur={false}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="目的地城市"
                        placeholder="选择目的地城市（可选）"
                        variant="outlined"
                        helperText="留空表示监控所有目的地"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                            borderRadius: '12px',
                            '& fieldset': {
                              border: 'none',
                            },
                            '&:hover fieldset': {
                              border: 'none',
                            },
                            '&.Mui-focused fieldset': {
                              border: '2px solid #1976d2',
                              boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                            fontWeight: 500,
                          },
                          '& .MuiFormHelperText-root': {
                            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                            fontWeight: 500,
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          p: 2,
                          borderRadius: '8px',
                          m: 0.5,
                          '&:hover': {
                            ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                          }
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: '8px',
                              ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                              minWidth: '48px',
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="caption" fontWeight="700" color="primary">
                              {option.code}
                            </Typography>
                          </Box>
                          <Box flex={1}>
                            <Typography variant="body1" fontWeight="600">
                              {option.flag} {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              城市代码: {option.code}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    PaperComponent={({ children, ...other }) => (
                      <Box
                        {...other}
                        sx={{
                          ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                          borderRadius: '12px',
                          mt: 1,
                          border: isDark
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        {children}
                      </Box>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* 日期信息 */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                mb: 2,
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
                <DateRange sx={{
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  fontSize: 24
                }} />
                <Typography
                  variant="h6"
                  fontWeight="700"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                    letterSpacing: '0.5px',
                  }}
                >
                  日期信息
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="出发日期"
                    type="date"
                    value={taskForm.departDate}
                    onChange={(e) => onFormChange('departDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                        borderRadius: '12px',
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: '2px solid #1976d2',
                          boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="返程日期"
                    type="date"
                    value={taskForm.returnDate}
                    onChange={(e) => onFormChange('returnDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    helperText="留空表示单程"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                        borderRadius: '12px',
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: '2px solid #1976d2',
                          boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                        fontWeight: 500,
                      },
                      '& .MuiFormHelperText-root': {
                        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* 通知设置 */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                mb: 2,
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
                <Notifications sx={{
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  fontSize: 24
                }} />
                <Typography
                  variant="h6"
                  fontWeight="700"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                    letterSpacing: '0.5px',
                  }}
                >
                  通知设置
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel
                      component="legend"
                      sx={{
                        color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      选择通知方式
                    </FormLabel>
                    <RadioGroup
                      value={taskForm.notificationMethod || 'email'}
                      onChange={(e) => onFormChange('notificationMethod', e.target.value)}
                      sx={{ gap: 1 }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                          mb: 1,
                        }}
                      >
                        <FormControlLabel
                          value="email"
                          control={<Radio color="primary" />}
                          label={
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Email sx={{ color: 'primary.main', fontSize: 20 }} />
                              <Box>
                                <Typography variant="body1" fontWeight="600">
                                  邮箱通知
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  通过邮件发送价格提醒
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </Box>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                        }}
                      >
                        <FormControlLabel
                          value="pushplus"
                          control={<Radio color="primary" />}
                          label={
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Notifications sx={{ color: 'primary.main', fontSize: 20 }} />
                              <Box>
                                <Typography variant="body1" fontWeight="600">
                                  PushPlus推送
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  通过PushPlus发送即时推送
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </Box>
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* PushPlus Token输入框 */}
                {taskForm.notificationMethod === 'pushplus' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="PushPlus Token"
                      value={taskForm.pushplusToken || ''}
                      onChange={(e) => onFormChange('pushplusToken', e.target.value)}
                      placeholder="请输入您的PushPlus Token"
                      variant="outlined"
                      helperText="在PushPlus官网获取Token后填写"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                          borderRadius: '12px',
                          '& fieldset': {
                            border: 'none',
                          },
                          '&:hover fieldset': {
                            border: 'none',
                          },
                          '&.Mui-focused fieldset': {
                            border: '2px solid #1976d2',
                            boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                          fontWeight: 500,
                        },
                        '& .MuiFormHelperText-root': {
                          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                          fontWeight: 500,
                        },
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* 高级设置 */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                mb: 2,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ cursor: 'pointer' }}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Settings sx={{
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    fontSize: 24
                  }} />
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    高级设置
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                  {showAdvanced ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Collapse in={showAdvanced}>
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="黑名单城市"
                        value={taskForm.blacklistCities || ''}
                        onChange={(e) => onFormChange('blacklistCities', e.target.value)}
                        placeholder="例如：北京,上海"
                        variant="outlined"
                        helperText="用逗号分隔多个城市"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                            borderRadius: '12px',
                            '& fieldset': {
                              border: 'none',
                            },
                            '&:hover fieldset': {
                              border: 'none',
                            },
                            '&.Mui-focused fieldset': {
                              border: '2px solid #1976d2',
                              boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                            fontWeight: 500,
                          },
                          '& .MuiFormHelperText-root': {
                            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                            fontWeight: 500,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="黑名单国家"
                        value={taskForm.blacklistCountries || ''}
                        onChange={(e) => onFormChange('blacklistCountries', e.target.value)}
                        placeholder="例如：美国,英国"
                        variant="outlined"
                        helperText="用逗号分隔多个国家"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                            borderRadius: '12px',
                            '& fieldset': {
                              border: 'none',
                            },
                            '&:hover fieldset': {
                              border: 'none',
                            },
                            '&.Mui-focused fieldset': {
                              border: '2px solid #1976d2',
                              boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                            fontWeight: 500,
                          },
                          '& .MuiFormHelperText-root': {
                            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                            fontWeight: 500,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={taskForm.isActive}
                              onChange={(e) => onFormChange('isActive', e.target.checked)}
                              color="primary"
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#1976d2',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#1976d2',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                                fontWeight: 500,
                              }}
                            >
                              {isEditMode ? "任务状态：启用" : "创建后立即启动"}
                            </Typography>
                          }
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2, gap: 2 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            ...createGlassButton(isDark ? 'dark' : 'light'),
            borderRadius: '12px',
            px: 3,
            py: 1.5,
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark
                ? '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                : '0 6px 20px rgba(31, 38, 135, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          取消
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
            border: 'none',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0, #0d47a1)',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
            },
            '&:disabled': {
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            },
          }}
        >
          {submitting ? submittingText : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

FlightSearchForm.displayName = 'FlightSearchForm';

export default FlightSearchForm;