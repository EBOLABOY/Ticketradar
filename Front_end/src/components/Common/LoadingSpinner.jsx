import React from 'react';
import { useLoading } from '../../hooks/useLoading';
import { useTheme } from '@mui/material/styles';
import {
  Modal,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { createAppleGlass } from '../../utils/glassmorphism';
import { useTranslation } from 'react-i18next';

const LoadingSpinner = () => {
  const { isLoading, steps, currentStepIndex, elapsedTime } = useLoading();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useTranslation();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (!isLoading) return null;

  return (
    <Modal
      open={isLoading}
      aria-labelledby="loading-spinner-title"
      aria-describedby="loading-spinner-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <Box
        sx={{
          ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
          borderRadius: '16px',
          p: 4,
          width: '90%',
          maxWidth: '450px',
          textAlign: 'center',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>
          {t('common.loadingTitle', '正在为您寻找最佳航班...')}
        </Typography>
        <List sx={{ my: 2 }}>
          {steps.map((step, index) => (
            <ListItem key={index} disablePadding>
              <ListItemIcon sx={{ minWidth: '40px' }}>
                {index < currentStepIndex ? (
                  <CheckCircle color="success" />
                ) : index === currentStepIndex ? (
                  <CircularProgress size={24} />
                ) : (
                  <RadioButtonUnchecked color="disabled" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={step}
                primaryTypographyProps={{
                  fontWeight: index === currentStepIndex ? '600' : 'normal',
                  color: index < currentStepIndex ? 'text.secondary' : 'text.primary',
                }}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('common.elapsedTime', '耗时')}: {formatTime(elapsedTime)}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

export default LoadingSpinner;