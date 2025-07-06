import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Share,
  Favorite,
  FavoriteBorder,
  MoreVert,
  Print,
  LocationOn,
  CalendarToday,
  Person,
  Visibility,
  Public,
  PublicOff
} from '@mui/icons-material';
import axios from 'axios';
import MarkdownRenderer from '../components/Common/MarkdownRenderer';

const TravelPlanDetail = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [favorited, setFavorited] = useState(false);

  const fetchPlanDetail = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/travel/api/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPlan(response.data.data);
        // TODO: 检查是否已收藏
      } else {
        setError(response.data.message || '获取计划失败');
      }
    } catch (error) {
      console.error('获取计划详情失败:', error);
      if (error.response?.status === 404) {
        setError('计划不存在或已被删除');
      } else {
        setError('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchPlanDetail();
  }, [fetchPlanDetail]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/travel/api/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        navigate('/my-travel-plans');
      } else {
        setError(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除计划失败:', error);
      setError('删除失败，请稍后重试');
    }
    setDeleteDialogOpen(false);
  };

  const handleToggleShare = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/travel/api/plans/${planId}/share`, {
        is_public: !plan.is_public
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPlan(prev => ({ ...prev, is_public: !prev.is_public }));
        
        if (response.data.data?.share_url) {
          setShareUrl(response.data.data.share_url);
          setShareDialogOpen(true);
        }
      } else {
        setError(response.data.message || '操作失败');
      }
    } catch (error) {
      console.error('切换分享状态失败:', error);
      setError('操作失败，请稍后重试');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/travel/api/plans/${planId}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setFavorited(response.data.data.is_favorited);
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error);
    }
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

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('分享链接已复制到剪贴板');
    });
  };

  const handlePrint = () => {
    window.print();
  };

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
        <Button variant="contained" onClick={() => navigate('/my-travel-plans')}>
          返回我的计划
        </Button>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          计划不存在
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* 顶部操作栏 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/my-travel-plans')}
          variant="outlined"
        >
          返回列表
        </Button>

        <Box display="flex" gap={1}>
          <Tooltip title="打印">
            <IconButton onClick={handlePrint}>
              <Print />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={favorited ? "取消收藏" : "收藏"}>
            <IconButton onClick={handleToggleFavorite}>
              {favorited ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>

          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* 计划头部信息 */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {plan.title}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <LocationOn sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>目的地</Typography>
                  <Typography variant="h6">{plan.destination}</Typography>
                </Box>
              </Box>
            </Grid>

            {plan.origin_city && (
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <LocationOn sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>出发地</Typography>
                    <Typography variant="h6">{plan.origin_city}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <CalendarToday sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>旅行天数</Typography>
                  <Typography variant="h6">{plan.days}天</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>人数</Typography>
                  <Typography variant="h6">{plan.people_count}人</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {(plan.depart_date || plan.return_date) && (
            <Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {plan.depart_date && `出发：${formatDate(plan.depart_date)}`}
                {plan.depart_date && plan.return_date && ' | '}
                {plan.return_date && `返程：${formatDate(plan.return_date)}`}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 状态信息 */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              icon={plan.is_public ? <Public /> : <PublicOff />}
              label={plan.is_public ? '已分享' : '私有'}
              color={plan.is_public ? 'success' : 'default'}
              size="small"
            />
            <Chip
              icon={<Visibility />}
              label={`${plan.view_count || 0} 浏览`}
              size="small"
              variant="outlined"
            />
            {plan.data_sources && (
              <>
                <Chip 
                  label={`小红书: ${plan.data_sources.xiaohongshu ? '已使用' : '未使用'}`}
                  color={plan.data_sources.xiaohongshu ? 'success' : 'default'}
                  size="small"
                />
                <Chip 
                  label={`高德地图: ${plan.data_sources.amap ? '已使用' : '未使用'}`}
                  color={plan.data_sources.amap ? 'success' : 'default'}
                  size="small"
                />
                <Chip 
                  label={`和风天气: ${plan.data_sources.weather ? '已使用' : '未使用'}`}
                  color={plan.data_sources.weather ? 'success' : 'default'}
                  size="small"
                />
              </>
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            创建于 {formatDate(plan.created_at)}
          </Typography>
        </Box>
      </Paper>

      {/* 计划内容 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            📋 详细行程安排
          </Typography>
          
          {typeof plan.plan_content === 'string' ? (
            <MarkdownRenderer
              content={plan.plan_content}
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
                {JSON.stringify(plan.plan_content, null, 2)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 操作菜单 */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          // TODO: 实现编辑功能
          setMenuAnchor(null);
        }}>
          <Edit sx={{ mr: 1 }} />
          编辑计划
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleShare();
          setMenuAnchor(null);
        }}>
          <Share sx={{ mr: 1 }} />
          {plan.is_public ? '取消分享' : '分享计划'}
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setDeleteDialogOpen(true);
            setMenuAnchor(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          删除计划
        </MenuItem>
      </Menu>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除计划 "{plan.title}" 吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 分享对话框 */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>分享旅行计划</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            您的旅行计划已生成分享链接，任何人都可以通过此链接查看您的计划：
          </Typography>
          <TextField
            fullWidth
            value={shareUrl}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>关闭</Button>
          <Button onClick={copyShareUrl} variant="contained">
            复制链接
          </Button>
        </DialogActions>
      </Dialog>

      {/* 打印样式 */}
      <style jsx>{`
        @media print {
          .MuiContainer-root {
            max-width: none !important;
            padding: 0 !important;
          }
          
          .MuiButton-root,
          .MuiIconButton-root,
          .MuiFab-root {
            display: none !important;
          }
          
          .MuiCard-root {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default TravelPlanDetail;
