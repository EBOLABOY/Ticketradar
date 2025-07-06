import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Avatar,
  Chip,
  IconButton,

  useTheme,
  alpha
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Flight,
  Hotel,
  Restaurant,
  AttractionsOutlined,
  Clear,
  TravelExplore,
  AttachMoney,
  EmojiEmotions,
  AttachFile,
  Mic,
  MoreVert,
  ThumbUp,
  ThumbDown,
  ContentCopy,
  Share,
  Download
} from '@mui/icons-material';
import { aiApi, apiUtils } from '../services/backendApi';
import { useTranslation } from 'react-i18next';

// 添加CSS动画
const pulseAnimation = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

// 注入样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

const AITravelAssistant = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: t('aiAssistant.welcomeMessage'),
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const quickQuestions = [
    { text: t('aiAssistant.quickQuestions.japanItinerary'), icon: <TravelExplore /> },
    { text: t('aiAssistant.quickQuestions.hkTokyoFlights'), icon: <Flight /> },
    { text: t('aiAssistant.quickQuestions.tokyoHotels'), icon: <Hotel /> },
    { text: t('aiAssistant.quickQuestions.tokyoAttractions'), icon: <AttractionsOutlined /> },
    { text: t('aiAssistant.quickQuestions.japaneseCuisine'), icon: <Restaurant /> },
    { text: t('aiAssistant.quickQuestions.europeTrip'), icon: <AttachMoney /> }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // 调用AI API
      const response = await aiApi.sendTravelQuery(message, {
        previousMessages: messages.slice(-5) // 发送最近5条消息作为上下文
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.answer || t('aiAssistant.error'),
        timestamp: new Date(),
        suggestions: response.suggestions || []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorInfo = apiUtils.handleApiError(error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `${t('aiAssistant.error')}：${errorInfo.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: t('aiAssistant.welcomeMessage'),
        timestamp: new Date()
      }
    ]);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // 这里可以添加复制成功的提示
  };

  const handleLikeMessage = (messageId) => {
    // 实现点赞功能
    console.log('点赞消息:', messageId);
  };

  const handleDislikeMessage = (messageId) => {
    // 实现点踩功能
    console.log('点踩消息:', messageId);
  };

  const handleShareMessage = (content) => {
    // 实现分享功能
    if (navigator.share) {
      navigator.share({
        title: 'AI旅行助手建议',
        text: content
      });
    }
  };

  const handleExportChat = () => {
    // 导出聊天记录
    const chatContent = messages.map(msg => {
      const time = formatTime(msg.timestamp);
      const sender = msg.type === 'user' ? '用户' : 'AI助手';
      return `[${time}] ${sender}: ${msg.content}`;
    }).join('\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI旅行助手对话记录_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="600" gutterBottom>
            AI旅行助手
          </Typography>
          <Typography variant="body1" color="text.secondary">
            智能旅行规划，让您的出行更轻松
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportChat}
            disabled={messages.length <= 1}
          >
            导出对话
          </Button>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearChat}
          >
            清空对话
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 聊天区域 */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* 聊天头部 */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.dark',
                    width: 40,
                    height: 40,
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <SmartToy />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    AI旅行助手
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#4caf50',
                        animation: 'pulse 2s infinite'
                      }}
                    />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      在线 • 随时为您服务
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <IconButton
                sx={{ color: 'white' }}
                onClick={() => {/* 添加更多选项 */}}
              >
                <MoreVert />
              </IconButton>
            </Box>

            {/* 消息列表 */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                bgcolor: '#f5f5f5'
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      maxWidth: '70%',
                      flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                        width: 32,
                        height: 32
                      }}
                    >
                      {message.type === 'user' ? <Person /> : <SmartToy />}
                    </Avatar>
                    
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: message.type === 'user' ? 'primary.main' : 'white',
                        color: message.type === 'user' ? 'white' : 'text.primary',
                        borderRadius: message.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        boxShadow: message.type === 'user' ? 2 : 1,
                        position: 'relative',
                        '&:hover .message-actions': {
                          opacity: 1
                        }
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {message.content}
                      </Typography>
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <Box mt={2}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            相关建议：
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                            {message.suggestions.map((suggestion, index) => (
                              <Chip
                                key={index}
                                label={suggestion}
                                size="small"
                                onClick={() => handleQuickQuestion(suggestion)}
                                sx={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>

                        {message.type === 'ai' && (
                          <Box
                            className="message-actions"
                            sx={{
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              display: 'flex',
                              gap: 0.5
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleLikeMessage(message.id)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <ThumbUp fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDislikeMessage(message.id)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <ThumbDown fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyMessage(message.content)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleShareMessage(message.content)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <Share fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              ))}
              
              {loading && (
                <Box display="flex" justifyContent="flex-start" mb={2}>
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                      <SmartToy />
                    </Avatar>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: '20px 20px 20px 4px',
                        bgcolor: 'white',
                        boxShadow: 1
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box display="flex" gap={0.5}>
                          {[0, 1, 2].map((i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                animation: `pulse 1.4s infinite ease-in-out`,
                                animationDelay: `${i * 0.16}s`
                              }}
                            />
                          ))}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          AI正在思考中...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* 输入区域 */}
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
              <Box display="flex" gap={1} alignItems="flex-end">
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="输入您的旅行问题..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        paddingRight: '100px'
                      }
                    }}
                  />

                  {/* 输入框内的功能按钮 */}
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      display: 'flex',
                      gap: 0.5
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      disabled={loading}
                    >
                      <EmojiEmotions />
                    </IconButton>
                    <IconButton size="small" disabled={loading}>
                      <AttachFile />
                    </IconButton>
                    <IconButton size="small" disabled={loading}>
                      <Mic />
                    </IconButton>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || loading}
                  sx={{
                    minWidth: 56,
                    height: 56,
                    borderRadius: '50%',
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                >
                  <Send />
                </Button>
              </Box>

              {/* 快速回复建议 */}
              {!loading && inputMessage === '' && (
                <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                  {['我想去日本旅行', '推荐便宜的航班', '东京有什么好玩的', '帮我规划行程'].map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      size="small"
                      variant="outlined"
                      onClick={() => setInputMessage(suggestion)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'white'
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* 侧边栏 */}
        <Grid item xs={12} lg={4}>

          {/* 快速问题 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                快速提问
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                点击下方问题快速开始对话
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1}>
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    startIcon={question.icon}
                    onClick={() => handleQuickQuestion(question.text)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none'
                    }}
                  >
                    {question.text}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* 热门目的地 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                热门目的地
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                点击了解更多旅行信息
              </Typography>

              <Grid container spacing={1}>
                {[
                  { name: '日本', emoji: '🇯🇵', query: '推荐日本旅行攻略' },
                  { name: '韩国', emoji: '🇰🇷', query: '韩国首尔旅行指南' },
                  { name: '泰国', emoji: '🇹🇭', query: '泰国曼谷旅行建议' },
                  { name: '新加坡', emoji: '🇸🇬', query: '新加坡旅行攻略' },
                  { name: '马来西亚', emoji: '🇲🇾', query: '马来西亚旅行指南' },
                  { name: '台湾', emoji: '🇹🇼', query: '台湾环岛旅行攻略' }
                ].map((destination, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleQuickQuestion(destination.query)}
                    >
                      <Typography variant="h6" sx={{ mb: 0.5 }}>
                        {destination.emoji}
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {destination.name}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* 功能介绍 */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                我能帮您做什么？
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main'
                    }}
                  >
                    <TravelExplore />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600">
                      行程规划
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      定制个性化旅行路线
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: 'success.main'
                    }}
                  >
                    <Flight />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600">
                      航班查询
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      找到最优惠的机票
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: 'warning.main'
                    }}
                  >
                    <Hotel />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600">
                      酒店推荐
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      推荐性价比最高的住宿
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: 'info.main'
                    }}
                  >
                    <AttractionsOutlined />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="600">
                      景点攻略
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      发现当地热门景点
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AITravelAssistant;
