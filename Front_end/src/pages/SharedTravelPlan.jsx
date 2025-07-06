import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Person,
  Visibility,
  Share,
  Print,
  WhatsApp,
  Twitter,
  Facebook,
  Link as LinkIcon
} from '@mui/icons-material';
import axios from 'axios';
import MarkdownRenderer from '../components/Common/MarkdownRenderer';

const SharedTravelPlan = () => {
  const { shareToken } = useParams();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSharedPlan = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/travel/api/shared/${shareToken}`);

      if (response.data.success) {
        setPlanData(response.data.data);
        // 设置页面标题
        document.title = `${response.data.data.title} - 旅行计划分享`;
      } else {
        setError(response.data.message || '获取计划失败');
      }
    } catch (error) {
      console.error('获取分享计划失败:', error);
      if (error.response?.status === 404) {
        setError('分享链接无效或已过期');
      } else {
        setError('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    fetchSharedPlan();
  }, [fetchSharedPlan]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = planData?.title || '精彩旅行计划';
    const text = `查看这个精彩的旅行计划：${title}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('链接已复制到剪贴板');
        });
        break;
      default:
        break;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderPlanHeader = () => (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {planData.title}
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="打印计划">
              <IconButton onClick={handlePrint} sx={{ color: 'white' }}>
                <Print />
              </IconButton>
            </Tooltip>
            <Tooltip title="分享计划">
              <IconButton onClick={() => handleShare('copy')} sx={{ color: 'white' }}>
                <Share />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <LocationOn sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>目的地</Typography>
                <Typography variant="h6">{planData.destination}</Typography>
              </Box>
            </Box>
          </Grid>

          {planData.origin_city && (
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <LocationOn sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>出发地</Typography>
                  <Typography variant="h6">{planData.origin_city}</Typography>
                </Box>
              </Box>
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <CalendarToday sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>旅行天数</Typography>
                <Typography variant="h6">{planData.days}天</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <Person sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>人数</Typography>
                <Typography variant="h6">{planData.people_count}人</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {(planData.depart_date || planData.return_date) && (
          <Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {planData.depart_date && `出发：${formatDate(planData.depart_date)}`}
              {planData.depart_date && planData.return_date && ' | '}
              {planData.return_date && `返程：${formatDate(planData.return_date)}`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderDataSources = () => (
    <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
      <Typography variant="subtitle2" gutterBottom>
        数据来源
      </Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        <Chip 
          label={`小红书: ${planData.data_sources?.xiaohongshu ? '已使用' : '未使用'}`}
          color={planData.data_sources?.xiaohongshu ? 'success' : 'default'}
          size="small"
        />
        <Chip 
          label={`高德地图: ${planData.data_sources?.amap ? '已使用' : '未使用'}`}
          color={planData.data_sources?.amap ? 'success' : 'default'}
          size="small"
        />
        <Chip 
          label={`和风天气: ${planData.data_sources?.weather ? '已使用' : '未使用'}`}
          color={planData.data_sources?.weather ? 'success' : 'default'}
          size="small"
        />
      </Box>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography variant="body2" color="text.secondary">
          创建时间：{formatDate(planData.created_at)}
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center">
            <Visibility sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {planData.view_count || 0} 次浏览
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            作者：{planData.author}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  const renderPlanContent = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          📋 详细行程安排
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {typeof planData.plan_content === 'string' ? (
          <MarkdownRenderer
            content={planData.plan_content}
            sx={{
              '& h1, & h2, & h3': {
                color: 'primary.main'
              }
            }}
          />
        ) : (
          <Box
            sx={{
              '& pre': {
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: 0
              }
            }}
          >
            <Typography component="pre" variant="body1">
              {JSON.stringify(planData.plan_content, null, 2)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderSocialShare = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📤 分享这个计划
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<WhatsApp />}
            onClick={() => handleShare('whatsapp')}
            sx={{ color: '#25D366', borderColor: '#25D366' }}
          >
            WhatsApp
          </Button>
          <Button
            variant="outlined"
            startIcon={<Twitter />}
            onClick={() => handleShare('twitter')}
            sx={{ color: '#1DA1F2', borderColor: '#1DA1F2' }}
          >
            Twitter
          </Button>
          <Button
            variant="outlined"
            startIcon={<Facebook />}
            onClick={() => handleShare('facebook')}
            sx={{ color: '#4267B2', borderColor: '#4267B2' }}
          >
            Facebook
          </Button>
          <Button
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={() => handleShare('copy')}
          >
            复制链接
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          正在加载旅行计划...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.href = '/'}>
          返回首页
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {renderPlanHeader()}
        {renderDataSources()}
        {renderPlanContent()}
        {renderSocialShare()}
      </Container>

      {/* 打印样式 */}
      <style jsx>{`
        @media print {
          .MuiContainer-root {
            max-width: none !important;
            padding: 0 !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .MuiCard-root {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          
          .MuiButton-root,
          .MuiFab-root {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default SharedTravelPlan;
