import React, { useState, useEffect } from "react";
import {
  Chip,
  Container,
  Divider,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  Language as LanguageIcon,
  Payments as PaymentsIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t, i18n } = useTranslation();

  // State for selections
  const [language, setLanguage] = useState(i18n.language === 'zh' ? 'zh' : 'en');
  const [currency, setCurrency] = useState('CNY');
  const [locationCode, setLocationCode] = useState('CN');

  // Menu states
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [currencyAnchor, setCurrencyAnchor] = useState(null);
  const [locationAnchor, setLocationAnchor] = useState(null);

  // Auto-detect location based on browser/IP (simplified version)
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try to get user's timezone to guess location
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Asia/Shanghai') || timezone.includes('Asia/Beijing')) {
          setLocationCode('CN');
          setCurrency('CNY');
        } else if (timezone.includes('America/')) {
          setLocationCode('US');
          setCurrency('USD');
        } else if (timezone.includes('Europe/')) {
          setLocationCode('UK');
          setCurrency('USD');
        } else {
          // Default fallback
          setLocationCode('CN');
          setCurrency('CNY');
        }
      } catch (error) {
        console.log('Location detection failed, using default');
        setLocationCode('CN');
        setCurrency('CNY');
      }
    };

    detectLocation();
  }, []);

  // Language options
  const languageOptions = [
    { code: 'zh', label: '中文', value: 'Chinese' },
    { code: 'en', label: 'English', value: 'English' }
  ];

  // Currency options
  const currencyOptions = [
    { code: 'CNY', label: '人民币', symbol: '¥' },
    { code: 'USD', label: '美元', symbol: '$' }
  ];

  // Location options
  const locationOptions = [
    { code: 'CN', label: t('footer.locationChina'), value: '中国' },
    { code: 'US', label: t('footer.locationUS'), value: '美国' },
    { code: 'UK', label: t('footer.locationUK'), value: '英国' }
  ];

  // Handle language change
  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
    setLanguageAnchor(null);
  };

  // Handle currency change
  const handleCurrencyChange = (currencyCode) => {
    setCurrency(currencyCode);
    setCurrencyAnchor(null);
  };

  // Handle location change
  const handleLocationChange = (locationCode) => {
    setLocationCode(locationCode);
    // Auto-adjust currency based on location
    if (locationCode === 'CN') {
      setCurrency('CNY');
    } else {
      setCurrency('USD');
    }
    setLocationAnchor(null);
  };

  const getCurrentLanguageLabel = () => {
    const current = languageOptions.find(opt => opt.code === language);
    return current ? current.label : '中文';
  };

  const getCurrentCurrencyLabel = () => {
    const current = currencyOptions.find(opt => opt.code === currency);
    return current ? current.code : 'CNY';
  };

  const getCurrentLocationLabel = () => {
    const current = locationOptions.find(opt => opt.code === locationCode);
    return current ? current.label : t('footer.locationChina');
  };

  const footerData = [
    {
      label: `${t('footer.language')}: ${getCurrentLanguageLabel()}`,
      icon: <LanguageIcon />,
      onClick: (event) => setLanguageAnchor(event.currentTarget),
      type: 'language'
    },
    {
      label: `${t('footer.location')}: ${getCurrentLocationLabel()}`,
      icon: <LocationOnOutlinedIcon />,
      onClick: (event) => setLocationAnchor(event.currentTarget),
      type: 'location'
    },
    {
      label: `${t('footer.currency')}: ${getCurrentCurrencyLabel()}`,
      icon: <PaymentsIcon />,
      onClick: (event) => setCurrencyAnchor(event.currentTarget),
      type: 'currency'
    },
  ];

  return (
    <Container maxWidth="lg">
      <Grid2
        container
        sx={{
          py: 5,
          gap: 2,
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Grid2
          item="true"
          size={{ xs: 12, md: 12 }}
          sx={{
            gap: 2,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {footerData?.map((item, index) => (
            <Chip
              key={index}
              index={index}
              label={item?.label}
              icon={item.icon}
              variant="outlined"
              onClick={item.onClick}
              sx={{ cursor: 'pointer' }}
            />
          ))}

          {/* Language Menu */}
          <Menu
            anchorEl={languageAnchor}
            open={Boolean(languageAnchor)}
            onClose={() => setLanguageAnchor(null)}
          >
            {languageOptions.map((option) => (
              <MenuItem
                key={option.code}
                onClick={() => handleLanguageChange(option.code)}
              >
                <ListItemIcon>
                  {language === option.code && <CheckIcon />}
                </ListItemIcon>
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Menu>

          {/* Currency Menu */}
          <Menu
            anchorEl={currencyAnchor}
            open={Boolean(currencyAnchor)}
            onClose={() => setCurrencyAnchor(null)}
          >
            {currencyOptions.map((option) => (
              <MenuItem
                key={option.code}
                onClick={() => handleCurrencyChange(option.code)}
              >
                <ListItemIcon>
                  {currency === option.code && <CheckIcon />}
                </ListItemIcon>
                <ListItemText primary={`${option.code} - ${option.label}`} />
              </MenuItem>
            ))}
          </Menu>

          {/* Location Menu */}
          <Menu
            anchorEl={locationAnchor}
            open={Boolean(locationAnchor)}
            onClose={() => setLocationAnchor(null)}
          >
            {locationOptions.map((option) => (
              <MenuItem
                key={option.code}
                onClick={() => handleLocationChange(option.code)}
              >
                <ListItemIcon>
                  {locationCode === option.code && <CheckIcon />}
                </ListItemIcon>
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Menu>
        </Grid2>
        <Grid2 item="true" size={{ xs: 12, md: 12 }} sx={{ maxWidth: '800px', mx: 'auto', width: '100%' }}>
          <Box sx={{
            textAlign: "center",
            color: theme.palette.mainColors.secondaryText,
            fontSize: "14px",
            padding: '8px 0',
            "& p": {
              marginBottom: "1em",
            },
          }}>
            <Typography variant="body2" component="p">
              {t("footer.currentSettings")}{" "}
              <Link
                href="#"
                color={theme.palette.mainColors.mainBlue}
                sx={{ cursor: "pointer" }}
              >
                {t("footer.learnMore")}
              </Link>
            </Typography>
            <Typography variant="body2" component="p">
              {t("footer.priceDisclaimer_p1")}
            </Typography>
            <Typography variant="body2" component="p">
              {t("footer.priceDisclaimer_p2")}
            </Typography>
            <Typography variant="body2" component="p">
              {t("footer.priceDisclaimer_p3")}
            </Typography>
          </Box>
        </Grid2>

        <Grid2
          item="true"
          size={{ xs: 12, md: 12 }}
          sx={{
            py: 2,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
            whiteSpace: "nowrap",
            flexWrap: "wrap",
            color: theme.palette.mainColors.mainBlue,
          }}
        >
          {[
            t('footer.about'),
            t('footer.privacy'),
            t('footer.terms'),
            t('footer.joinUserStudies'),
            t('footer.feedback'),
            t('footer.helpCentre'),
          ].map((text, idx) => (
            <Link
              key={idx}
              href="#"
              color={theme.palette.mainColors.mainBlue}
              underline="hover"
            >
              {text}
            </Link>
          ))}
        </Grid2>
        <Grid2 item="true" size={12}>
          <Divider sx={{ my: 1, borderColor: theme.palette.text }} />
        </Grid2>

        <Grid2
          item="true"
          size={{ xs: 12, md: 12 }}
          sx={{
            py: 2,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
            whiteSpace: "nowrap",
            flexWrap: "wrap",
            color: theme.palette.mainColors.mainBlue,
          }}
        >
          {[t('footer.internationalSites'), t('footer.exploreFlights')].map((text, idx) => (
            <Link
              key={idx}
              href="#"
              color={theme.palette.mainColors.mainBlue}
              underline="hover"
            >
              {text}
            </Link>
          ))}
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default Footer;
