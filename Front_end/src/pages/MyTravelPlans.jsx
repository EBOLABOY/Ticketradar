import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Pagination,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Share,
  Visibility,
  MoreVert,
  LocationOn,
  CalendarToday,
  Person,
  Public,
  PublicOff
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyTravelPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/travel/api/plans?page=${page}&per_page=6`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPlans(response.data.data.plans);
        setTotalPages(Math.ceil(response.data.data.total / response.data.data.per_page));
      } else {
        setError(response.data.message || '获取计划失败');
      }
    } catch (error) {
      console.error('获取旅行计划失败:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/travel/api/plans/${selectedPlan.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPlans(plans.filter(plan => plan.id !== selectedPlan.id));
        setDeleteDialogOpen(false);
        setSelectedPlan(null);
      } else {
        setError(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除计划失败:', error);
      setError('删除失败，请稍后重试');
    }
  };

  const handleToggleShare = async (plan) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/travel/api/plans/${plan.id}/share`, {
        is_public: !plan.is_public
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // 更新计划状态
        setPlans(plans.map(p => 
          p.id === plan.id 
            ? { ...p, is_public: !plan.is_public }
            : p
        ));

        if (response.data.data?.share_url) {
          setShareUrl(response.data.data.share_url);
          setSelectedPlan(plan);
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

  const handleMenuClick = (event, plan) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPlan(plan);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedPlan(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('分享链接已复制到剪贴板');
    });
  };

  const renderPlanCard = (plan) => (
    <Grid item xs={12} sm={6} md={4} key={plan.id}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', flex: 1 }}>
              {plan.title}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, plan)}
            >
              <MoreVert />
            </IconButton>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {plan.destination}
              {plan.origin_city && ` (从${plan.origin_city}出发)`}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {plan.days}天
              {plan.depart_date && ` | ${formatDate(plan.depart_date)}`}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {plan.people_count}人
            </Typography>
          </Box>

          <Box display="flex" gap={1} mb={2}>
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
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            创建于 {formatDate(plan.created_at)}
          </Typography>
        </CardContent>

        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate(`/travel-plan-detail/${plan.id}`)}
          >
            查看详情
          </Button>
        </Box>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          正在加载您的旅行计划...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          我的旅行计划
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/ai-travel')}
          size="large"
        >
          创建新计划
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 计划列表 */}
      {plans.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              还没有旅行计划
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              创建您的第一个AI旅行计划，开始精彩的旅程吧！
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/ai-travel')}
            >
              创建旅行计划
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {plans.map(renderPlanCard)}
          </Grid>

          {/* 分页 */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* 操作菜单 */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/travel-plan-detail/${selectedPlan?.id}`);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          查看详情
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: 实现编辑功能
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          编辑计划
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleShare(selectedPlan);
          handleMenuClose();
        }}>
          <Share sx={{ mr: 1 }} />
          {selectedPlan?.is_public ? '取消分享' : '分享计划'}
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
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
            确定要删除计划 "{selectedPlan?.title}" 吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDeletePlan} color="error" variant="contained">
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
    </Container>
  );
};

export default MyTravelPlans;
