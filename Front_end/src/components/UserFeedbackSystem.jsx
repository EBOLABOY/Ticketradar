import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Rating,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fab,
  Slide,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  useTheme,
  alpha,
  Snackbar
} from '@mui/material';
import {
  Feedback,
  Close,
  Send,
  ThumbUp,
  ThumbDown,
  BugReport,
  Lightbulb,
  Star,
  TrendingUp
} from '@mui/icons-material';

const UserFeedbackSystem = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [features, setFeatures] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [showFab, setShowFab] = useState(false);

  const feedbackTypes = [
    { value: 'general', label: '一般反馈', icon: <Feedback />, color: 'primary' },
    { value: 'bug', label: '问题报告', icon: <BugReport />, color: 'error' },
    { value: 'feature', label: '功能建议', icon: <Lightbulb />, color: 'warning' },
    { value: 'performance', label: '性能问题', icon: <TrendingUp />, color: 'info' }
  ];

  const availableFeatures = [
    'AI对话界面',
    '旅行规划表单',
    '系统状态监控',
    '特性展示卡片',
    '交互动画效果',
    '语音输入功能',
    '键盘快捷键',
    '性能优化'
  ];

  useEffect(() => {
    // 延迟显示反馈按钮，避免打扰用户
    const timer = setTimeout(() => {
      setShowFab(true);
    }, 10000); // 10秒后显示

    return () => clearTimeout(timer);
  }, []);

  const handleFeatureChange = (feature) => {
    setFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSubmit = async () => {
    const feedbackData = {
      type: feedbackType,
      rating,
      feedback,
      email,
      features,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    try {
      // 这里可以发送到后端API
      console.log('用户反馈数据:', feedbackData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('提交反馈失败:', error);
    }
  };

  const resetForm = () => {
    setFeedbackType('general');
    setRating(5);
    setFeedback('');
    setEmail('');
    setFeatures([]);
  };

  const renderFeedbackForm = () => (
    <Box sx={{ minWidth: 400, maxWidth: 600 }}>
      {/* 反馈类型选择 */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
          反馈类型
        </FormLabel>
        <RadioGroup
          value={feedbackType}
          onChange={(e) => setFeedbackType(e.target.value)}
          row
        >
          {feedbackTypes.map((type) => (
            <FormControlLabel
              key={type.value}
              value={type.value}
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {type.icon}
                  {type.label}
                </Box>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>

      {/* 评分 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          整体评分
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Rating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
            icon={<Star fontSize="inherit" />}
            emptyIcon={<Star fontSize="inherit" />}
          />
          <Typography variant="body2" color="text.secondary">
            {rating}/5 星
          </Typography>
        </Box>
      </Box>

      {/* 功能评价 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          您使用了哪些功能？
        </Typography>
        <FormGroup row>
          {availableFeatures.map((feature) => (
            <FormControlLabel
              key={feature}
              control={
                <Checkbox
                  checked={features.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                />
              }
              label={feature}
            />
          ))}
        </FormGroup>
      </Box>

      {/* 详细反馈 */}
      <TextField
        fullWidth
        multiline
        rows={4}
        label="详细反馈"
        placeholder="请详细描述您的使用体验、遇到的问题或改进建议..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* 联系邮箱 */}
      <TextField
        fullWidth
        label="联系邮箱（可选）"
        placeholder="如需回复，请留下您的邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* 提交按钮 */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          variant="outlined"
          onClick={() => setOpen(false)}
        >
          取消
        </Button>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={handleSubmit}
          disabled={!feedback.trim()}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            }
          }}
        >
          提交反馈
        </Button>
      </Box>
    </Box>
  );

  const renderSuccessMessage = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2
        }}
      >
        <ThumbUp sx={{ fontSize: 40, color: 'white' }} />
      </Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        感谢您的反馈！
      </Typography>
      <Typography variant="body1" color="text.secondary">
        您的意见对我们非常重要，我们会认真考虑并持续改进。
      </Typography>
    </Box>
  );

  return (
    <>
      {/* 浮动反馈按钮 */}
      <Slide direction="left" in={showFab} mountOnEnter unmountOnExit>
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 32,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          aria-label="用户反馈"
        >
          <Feedback />
        </Fab>
      </Slide>

      {/* 反馈对话框 */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.9)})`,
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Feedback sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight={600}>
                用户反馈
              </Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            您的反馈将帮助我们改进产品体验
          </Typography>
        </DialogTitle>

        <DialogContent>
          {submitted ? renderSuccessMessage() : renderFeedbackForm()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserFeedbackSystem;
