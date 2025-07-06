import React, { useState, useMemo, useCallback } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { createAppleGlass, createGlassButton } from "../../utils/glassmorphism";

const PassengerSelector = ({ onSelectAdults, onSelectPassengers }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infantsSeat: 0,
    infantsLap: 0,
  });

  const passengerTypes = useMemo(
    () => [
      { label: "Adults", subLabel: "", type: "adults", enabled: true },
      {
        label: "Children",
        subLabel: "Aged 2–11",
        type: "children",
        enabled: true,
      },
      {
        label: "Infants",
        subLabel: "In seat",
        type: "infantsSeat",
        enabled: true,
      },
      {
        label: "Infants",
        subLabel: "On lap",
        type: "infantsLap",
        enabled: true,
      },
    ],
    []
  );

  const handleOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleChange = useCallback(
    (type, operation) => {
      setPassengers((prev) => {
        const newValue =
          operation === "increase"
            ? prev[type] + 1
            : Math.max(0, prev[type] - 1);

        if (newValue !== prev[type]) {
          const updatedPassengers = { ...prev, [type]: newValue };
          // 保持向后兼容性，同时支持新的回调
          if (type === "adults") onSelectAdults(updatedPassengers.adults);
          if (onSelectPassengers) onSelectPassengers(updatedPassengers);
          return updatedPassengers;
        }
        return prev;
      });
    },
    [onSelectAdults, onSelectPassengers]
  );

  const handleDone = useCallback(() => {
    onSelectAdults(passengers.adults);
    if (onSelectPassengers) onSelectPassengers(passengers);
    handleClose();
  }, [onSelectAdults, onSelectPassengers, passengers, handleClose]);

  // 获取玻璃效果样式
  const glassButtonStyle = createGlassButton(theme.palette.mode);
  const menuGlassStyle = createAppleGlass('secondary', theme.palette.mode);

  return (
    <>
      <Button
        sx={{
          ...glassButtonStyle,
          color: theme.palette.text.primary,
          px: 2,
          py: 1,
          minHeight: 40,
        }}
        startIcon={<PeopleIcon />}
        onClick={handleOpen}
      >
        {passengers.adults +
          passengers.children +
          passengers.infantsSeat +
          passengers.infantsLap}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          "& .MuiPaper-root": {
            ...menuGlassStyle,
            padding: "16px",
            minWidth: "300px",
          },
        }}
      >
        {passengerTypes.map((item) => (
          <MenuItem
            key={item.type}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              ...createAppleGlass('tertiary', theme.palette.mode),
              mb: 1,
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'light'
                  ? '0 4px 12px rgba(31, 38, 135, 0.2)'
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: item.enabled
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Typography>
              {item.subLabel && (
                <Typography variant="caption" color="text.secondary">
                  {item.subLabel}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => handleChange(item.type, "decrease")}
                sx={{
                  ...createAppleGlass('tertiary', theme.palette.mode),
                  borderRadius: "8px",
                  color: item.enabled
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                  '&:hover': {
                    transform: 'scale(1.1)',
                    color: theme.palette.error.main,
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                }}
                disabled={!item.enabled || passengers[item.type] === 0}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography
                sx={{
                  color: item.enabled
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                  fontWeight: 600,
                  minWidth: 24,
                  textAlign: 'center',
                  ...createAppleGlass('tertiary', theme.palette.mode),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                {passengers[item.type]}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleChange(item.type, "increase")}
                sx={{
                  ...createAppleGlass('tertiary', theme.palette.mode),
                  color: item.enabled
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                  borderRadius: "8px",
                  '&:hover': {
                    transform: 'scale(1.1)',
                    color: theme.palette.success.main,
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                }}
                disabled={!item.enabled}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </MenuItem>
        ))}

        <Box sx={{ display: "flex", justifyContent: "end", mt: 2, gap: 1 }}>
          <Button
            sx={{
              ...glassButtonStyle,
              color: theme.palette.text.secondary,
              textTransform: "capitalize",
              fontWeight: 500,
              px: 3,
              py: 1,
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            sx={{
              ...glassButtonStyle,
              background: theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(21, 101, 192, 0.9))'
                : 'linear-gradient(135deg, rgba(100, 181, 246, 0.9), rgba(66, 165, 245, 0.9))',
              color: 'white',
              textTransform: "capitalize",
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                transform: 'translateY(-1px) scale(1.02)',
                background: theme.palette.mode === 'light'
                  ? 'linear-gradient(135deg, rgba(33, 150, 243, 1), rgba(21, 101, 192, 1))'
                  : 'linear-gradient(135deg, rgba(100, 181, 246, 1), rgba(66, 165, 245, 1))',
              },
            }}
            onClick={handleDone}
          >
            Done
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default PassengerSelector;
