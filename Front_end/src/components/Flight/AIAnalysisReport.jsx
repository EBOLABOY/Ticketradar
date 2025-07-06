import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  FlightTakeoff as FlightIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const AIAnalysisReport = ({ searchResult }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { ai_analysis_report: analysisReport, ai_processing } = searchResult || {};
  const processingInfo = ai_processing?.processing_info;



  useEffect(() => {
    if (!analysisReport) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // 直接设置为完成状态，不需要解析JSON或分割内容
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing analysis report:', err);
      setError(t('aiAnalysis.errors.processingFailed'));
      setIsLoading(false);
    }
  }, [analysisReport, t]);



  const renderContent = () => {
    if (isLoading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (!analysisReport) {
      return <Alert severity="info">{t('aiAnalysis.errors.noData')}</Alert>;
    }

    // 直接渲染完整的AI分析报告，不使用标签页
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            table: ({ children }) => (
              <Box sx={{ overflowX: 'auto', mb: 2 }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.875rem'
                }}>
                  {children}
                </table>
              </Box>
            ),
            thead: ({ children }) => (
              <thead style={{ backgroundColor: theme.palette.grey[100] }}>
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th style={{
                padding: '8px 12px',
                border: `1px solid ${theme.palette.divider}`,
                textAlign: 'left',
                fontWeight: 'bold',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontSize: '0.75rem'
              }}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td style={{
                padding: '8px 12px',
                border: `1px solid ${theme.palette.divider}`,
                fontSize: '0.75rem',
                lineHeight: '1.2'
              }}>
                {children}
              </td>
            ),
            tr: ({ children }) => (
              <tr style={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                {children}
              </tr>
            )
          }}
        >
          {analysisReport}
        </ReactMarkdown>
      </Box>
    );
  };

  return (
    <Paper elevation={2} sx={{ mb: 3 }}>
      {/* 标题栏 */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 2,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <PsychologyIcon sx={{ mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div">{t('flights.aiAnalysisTitle')}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>{t('flights.aiAnalysisSubtitle')}</Typography>
        </Box>
        {processingInfo && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={<FlightIcon />}
              label={t('flights.flightsCount', { count: Object.values(processingInfo.source_counts || {}).reduce((a, b) => a + b, 0) })}
              size="small"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'inherit' }}
            />
            {processingInfo.user_preferences && (
              <Chip
                label={t('common.personalized')}
                size="small"
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'inherit' }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* 内容区域 */}
      <Box>
        {renderContent()}
      </Box>
    </Paper>
  );
};

export default AIAnalysisReport;
