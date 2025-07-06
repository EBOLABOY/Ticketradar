import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import {
  Language as LanguageIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const languages = [
  {
    code: 'zh',
    name: '中文'
  },
  {
    code: 'en',
    name: 'English'
  }
];

const LanguageSwitcher = ({ variant = 'icon' }) => {
  const { i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  if (variant === 'button') {
    return (
      <Box>
        <IconButton
          onClick={handleClick}
          sx={{
            color: isDarkMode ? '#e8eaed' : '#5f6368',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(138, 180, 248, 0.08)' : 'rgba(26, 115, 232, 0.08)',
              color: isDarkMode ? '#8ab4f8' : '#1a73e8'
            }
          }}
        >
          <LanguageIcon />
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {currentLanguage.name}
          </Typography>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              minWidth: 150,
              mt: 1
            }
          }}
        >
          {languages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={i18n.language === language.code}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {i18n.language === language.code && <CheckIcon />}
              </ListItemIcon>
              <ListItemText primary={language.name} />
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  return (
    <Box>
      <Tooltip title="切换语言 / Switch Language">
        <IconButton
          onClick={handleClick}
          sx={{
            color: isDarkMode ? '#e8eaed' : '#5f6368',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(138, 180, 248, 0.08)' : 'rgba(26, 115, 232, 0.08)',
              color: isDarkMode ? '#8ab4f8' : '#1a73e8'
            }
          }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 150,
            mt: 1
          }
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {i18n.language === language.code && <CheckIcon />}
            </ListItemIcon>
            <ListItemText primary={language.name} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher;
