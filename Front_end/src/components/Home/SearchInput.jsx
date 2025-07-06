import {
  TextField,
  IconButton,
  Autocomplete,
  Stack,
  useTheme,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  SwapHoriz as SwapHorizIcon,
  TripOrigin as TripOriginIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
} from "@mui/icons-material";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import SelectDateComp from "./DateComp/SelectDateComp";
import { createAppleGlass } from "../../utils/glassmorphism";

const InputAutoComp = React.memo(
  ({
    type,
    openAutocomplete,
    searchAirports,
    handleWhereChange,
    onSelectFlight,
    onCloseAutocomplete,
  }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const options = useMemo(
      () => searchAirports?.[type] || [],
      [searchAirports, type]
    );

    const handleInputChange = useCallback(
      (event) => handleWhereChange(event, type),
      [handleWhereChange, type]
    );

    const handleSelect = useCallback(
      (event, value) => {
        onSelectFlight(value, type);
        onCloseAutocomplete();
      },
      [onSelectFlight, onCloseAutocomplete, type]
    );

    // 获取玻璃效果样式
    const inputGlassStyle = createAppleGlass('secondary', theme.palette.mode);

    return (
      <Autocomplete
        open={openAutocomplete === type}
        options={options}
        getOptionLabel={(option) => {
          // 处理后端返回的机场数据格式
          if (option.name && option.code) {
            return `${option.name} (${option.code}) - ${option.city}, ${option.country}`;
          }
          // 兼容旧格式
          return option.presentation?.suggestionTitle || "";
        }}
        renderOption={(props, option) => (
          <li {...props} style={{
            ...createAppleGlass('tertiary', theme.palette.mode),
            margin: '2px 4px',
            borderRadius: '8px',
            padding: '8px 12px',
          }}>
            <div>
              <div style={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {option.name} ({option.code})
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: theme.palette.text.secondary,
                marginTop: '2px'
              }}>
                {option.city}, {option.country}
              </div>
            </div>
          </li>
        )}
        onInputChange={handleInputChange}
        onChange={handleSelect}
        sx={{
          width: "100%",
          '& .MuiPaper-root': {
            ...createAppleGlass('secondary', theme.palette.mode),
            mt: 1,
            maxHeight: 300,
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            variant="outlined"
            placeholder={type === "whereFrom" ? t('search.from') : t('search.to')}
            InputProps={{
              ...params.InputProps,
              startAdornment:
                type === "whereFrom" ? (
                  <TripOriginIcon
                    sx={{
                      mr: 1,
                      color: theme.palette.text.secondary,
                      fontSize: "1rem",
                    }}
                  />
                ) : (
                  <LocationOnOutlinedIcon
                    sx={{
                      mr: 1,
                      color: theme.palette.text.secondary,
                    }}
                  />
                ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                ...inputGlassStyle,
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
            }}
          />
        )}
      />
    );
  }
);

const SearchInput = ({
  openAutocomplete,
  searchAirports,
  handleWhereChange,
  onSelectFlight,
  onSelectDate,
  onCloseAutocomplete,
  selectedOption,
}) => {
  const theme = useTheme();
  return (
    <Grid2 container spacing={{ xs: 1, sm: 2 }} alignItems="stretch" justifyContent="center">
      <Grid2 item="true" xs={12} md={7}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2 }}
          alignItems="center"
          justifyContent="space-between"
          width={"100%"}
        >
          <InputAutoComp
            type="whereFrom"
            openAutocomplete={openAutocomplete}
            searchAirports={searchAirports}
            handleWhereChange={handleWhereChange}
            onSelectFlight={onSelectFlight}
            onCloseAutocomplete={onCloseAutocomplete}
          />
          <IconButton
            sx={{
              ...createAppleGlass('tertiary', theme.palette.mode),
              color: theme.palette.text.secondary,
              padding: "8px",
              borderRadius: '50%',
              transform: { xs: 'rotate(90deg)', sm: 'none' },
              '&:hover': {
                transform: { xs: 'rotate(270deg) scale(1.1)', sm: 'rotate(180deg) scale(1.1)' },
                color: theme.palette.primary.main,
                boxShadow: theme.palette.mode === 'light'
                  ? '0 4px 12px rgba(31, 38, 135, 0.3)'
                  : '0 4px 12px rgba(0, 0, 0, 0.4)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
          >
            <SwapHorizIcon />
          </IconButton>
          <InputAutoComp
            type="whereTo"
            openAutocomplete={openAutocomplete}
            searchAirports={searchAirports}
            handleWhereChange={handleWhereChange}
            onSelectFlight={onSelectFlight}
            onCloseAutocomplete={onCloseAutocomplete}
          />
        </Stack>
      </Grid2>
      <Grid2 item="true" xs={12} md={5}>
        <SelectDateComp onSelectDate={onSelectDate} selectedOption={selectedOption} />
      </Grid2>
    </Grid2>
  );
};

export default SearchInput;
