import React, { useState, useCallback, useMemo } from "react";
import { Box, useTheme } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTranslation } from 'react-i18next';
import dayjs from "dayjs";
import { createAppleGlass } from "../../../utils/glassmorphism";

const SelectDateComp = ({ onSelectDate, selectedOption }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [departureDate, setDepartureDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const isRoundTrip = selectedOption?.key === "roundTrip";

  const handleDepartureDateChange = useCallback(
    (newValue) => {
      setDepartureDate(newValue);
      if (newValue) {
        onSelectDate(dayjs(newValue).format("YYYY-MM-DD"), 'departure');
      }
    },
    [onSelectDate]
  );

  const handleReturnDateChange = useCallback(
    (newValue) => {
      setReturnDate(newValue);
      if (newValue) {
        onSelectDate(dayjs(newValue).format("YYYY-MM-DD"), 'return');
      }
    },
    [onSelectDate]
  );

  // 获取玻璃效果样式
  const inputGlassStyle = createAppleGlass('secondary', theme.palette.mode);

  const departureTextFieldProps = useMemo(
    () => ({
      fullWidth: true,
      variant: "outlined",
      placeholder: t('search.departure'),
      sx: {
        '& .MuiOutlinedInput-root': {
          ...inputGlassStyle,
          borderRadius: isRoundTrip ? "12px 0 0 12px" : "12px",
          border: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: theme.palette.mode === 'light'
              ? '0 6px 20px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
              : '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          },
          '&.Mui-focused': {
            transform: 'translateY(-1px)',
            boxShadow: theme.palette.mode === 'light'
              ? '0 0 0 3px rgba(66, 165, 245, 0.2), 0 6px 20px rgba(31, 38, 135, 0.3)'
              : '0 0 0 3px rgba(144, 202, 249, 0.2), 0 6px 20px rgba(0, 0, 0, 0.4)',
          },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
        '& input': {
          color: theme.palette.text.primary,
          fontSize: '1rem',
          fontWeight: 500,
        },
        '& input::placeholder': {
          color: theme.palette.text.secondary,
          opacity: 0.8,
        },
      },
    }),
    [theme, t, isRoundTrip, inputGlassStyle]
  );

  const returnTextFieldProps = useMemo(
    () => ({
      fullWidth: true,
      variant: "outlined",
      placeholder: t('search.return'),
      sx: {
        '& .MuiOutlinedInput-root': {
          ...inputGlassStyle,
          borderRadius: "0 12px 12px 0",
          border: 'none',
          borderLeft: theme.palette.mode === 'light'
            ? '1px solid rgba(255, 255, 255, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: theme.palette.mode === 'light'
              ? '0 6px 20px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
              : '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          },
          '&.Mui-focused': {
            transform: 'translateY(-1px)',
            boxShadow: theme.palette.mode === 'light'
              ? '0 0 0 3px rgba(66, 165, 245, 0.2), 0 6px 20px rgba(31, 38, 135, 0.3)'
              : '0 0 0 3px rgba(144, 202, 249, 0.2), 0 6px 20px rgba(0, 0, 0, 0.4)',
          },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
        '& input': {
          color: theme.palette.text.primary,
          fontSize: '1rem',
          fontWeight: 500,
        },
        '& input::placeholder': {
          color: theme.palette.text.secondary,
          opacity: 0.8,
        },
      },
    }),
    [theme, t, inputGlassStyle]
  );

  return (
    <Box
      sx={{
        display: "flex",
        ...createAppleGlass('primary', theme.palette.mode),
        borderRadius: "12px",
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'light'
            ? '0 8px 25px rgba(31, 38, 135, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
            : '0 8px 25px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        },
        '&:focus-within': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'light'
            ? '0 0 0 4px rgba(66, 165, 245, 0.2), 0 8px 25px rgba(31, 38, 135, 0.4)'
            : '0 0 0 4px rgba(144, 202, 249, 0.2), 0 8px 25px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={departureDate}
          onChange={handleDepartureDateChange}
          minDate={dayjs()}
          format="ddd, MMM DD"
          slotProps={{
            textField: departureTextFieldProps,
            popper: {
              sx: {
                '& .MuiPaper-root': {
                  ...createAppleGlass('secondary', theme.palette.mode),
                  mt: 1,
                },
              },
            },
          }}
        />
        {isRoundTrip && (
          <DatePicker
            value={returnDate}
            onChange={handleReturnDateChange}
            minDate={departureDate || dayjs()}
            format="ddd, MMM DD"
            slotProps={{
              textField: returnTextFieldProps,
              popper: {
                sx: {
                  '& .MuiPaper-root': {
                    ...createAppleGlass('secondary', theme.palette.mode),
                    mt: 1,
                  },
                },
              },
            }}
          />
        )}
      </LocalizationProvider>
    </Box>
  );
};

export default React.memo(SelectDateComp);
