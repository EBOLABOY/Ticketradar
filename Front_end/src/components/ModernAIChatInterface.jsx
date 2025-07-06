import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Fade,
  useTheme,
  alpha,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Send,
  Mic,
  MicOff,
  SmartToy,
  Person,
  ContentCopy,
  ThumbUp
} from '@mui/icons-material';
import { aiApi, apiUtils } from '../services/backendApi';
import MarkdownRenderer from './Common/MarkdownRenderer';



const ModernAIChatInterface = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 智能建议按钮
  const quickSuggestions = [
    { text: '推荐日本旅行攻略', icon: '🇯🇵' },
    { text: '制定3天2夜行程', icon: '📅' },
    { text: '推荐当地美食', icon: '🍜' },
    { text: '查询天气信息', icon: '🌤️' },
    { text: '预算规划建议', icon: '💰' },
    { text: '交通出行方案', icon: '🚗' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 添加欢迎消息
    const timer = setTimeout(() => {
      if (messages.length === 0) {
        addMessage('ai', '👋 您好！我是您的AI旅行规划助手。我可以帮您制定个性化的旅行计划，推荐景点美食，查询天气交通等信息。请告诉我您想去哪里旅行？');
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (sender, content, typing = false) => {
    const newMessage = {
      id: Date.now(),
      sender,
      content,
      timestamp: new Date(),
      typing
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const typewriterEffect = (text, messageId) => {
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: text.slice(0, index + 1) }
            : msg
        )
      );
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, typing: false }
              : msg
          )
        );
      }
    }, 30);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await aiApi.sendAITravelChat(userMessage, {
        previous_messages: messages.slice(-5) // 发送最近5条消息作为上下文
      });

      if (response.success) {
        const aiResponse = response.data.response || response.data.plan || '抱歉，我暂时无法处理您的请求。';
        const messageId = Date.now();
        addMessage('ai', '', true);
        setTimeout(() => {
          typewriterEffect(aiResponse, messageId);
        }, 500);
      } else {
        addMessage('ai', '抱歉，服务暂时不可用，请稍后再试。');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorInfo = apiUtils.handleApiError(error);
      addMessage('ai', `抱歉，${errorInfo.message || '网络连接出现问题，请检查网络后重试。'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.text);
    inputRef.current?.focus();
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别功能');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('语音识别失败，请重试');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderMessage = (message) => {
    const isAI = message.sender === 'ai';
    const isUser = message.sender === 'user';

    return (
      <Fade in={true} timeout={500} key={message.id}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            mb: 2,
            alignItems: 'flex-start'
          }}
        >
          {isAI && (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white'
              }}
            >
              <SmartToy />
            </Avatar>
          )}
          
          <Paper
            elevation={2}
            sx={{
              maxWidth: '70%',
              p: 2,
              borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: isUser 
                ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
              color: isUser ? 'white' : theme.palette.text.primary,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              position: 'relative',
              '&:hover .message-actions': {
                opacity: 1
              }
            }}
          >
            {/* 关键修改：区分AI和用户的消息渲染方式 */}
            {isAI ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <Typography
                variant="body1"
                sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}
              >
                {message.content}
              </Typography>
            )}
            {message.typing && (
              <Box component="span" sx={{ ml: 1 }}>
                <CircularProgress size={12} />
              </Box>
            )}

            {isAI && !message.typing && (
              <Box
                className="message-actions"
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  display: 'flex',
                  gap: 0.5
                }}
              >
                <Tooltip title="复制">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(message.content)}
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: 1,
                      '&:hover': { backgroundColor: theme.palette.action.hover }
                    }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="点赞">
                  <IconButton
                    size="small"
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: 1,
                      '&:hover': { backgroundColor: theme.palette.action.hover }
                    }}
                  >
                    <ThumbUp fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Paper>

          {isUser && (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                ml: 2,
                backgroundColor: theme.palette.grey[400]
              }}
            >
              <Person />
            </Avatar>
          )}
        </Box>
      </Fade>
    );
  };

  return (
    <Paper
      elevation={8}
      sx={{
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.9)})`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      {/* 聊天头部 */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white'
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ backgroundColor: alpha('#ffffff', 0.2) }}>
            <SmartToy />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="600">
              AI 旅行助手
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isTyping ? '正在输入...' : '在线'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 智能建议区域 */}
      {messages.length <= 1 && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            💡 快速开始：
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {quickSuggestions.slice(0, 3).map((suggestion, index) => (
              <Chip
                key={index}
                label={`${suggestion.icon} ${suggestion.text}`}
                variant="outlined"
                size="small"
                clickable
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  borderRadius: 3,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* 消息区域 */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.grey[300], 0.3)
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.grey[500], 0.5),
            borderRadius: '3px'
          }
        }}
      >
        {messages.map(renderMessage)}
        {isLoading && (
          <Box display="flex" justifyContent="flex-start" alignItems="center" mb={2}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }}
            >
              <SmartToy />
            </Avatar>
            <Paper
              sx={{
                p: 2,
                borderRadius: '20px 20px 20px 4px',
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  AI正在思考...
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* 输入区域 */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box display="flex" alignItems="flex-end" gap={1}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的旅行问题..."
            variant="outlined"
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main
                }
              }
            }}
          />
          
          <Tooltip title={isListening ? '停止录音' : '语音输入'}>
            <IconButton
              onClick={handleVoiceInput}
              disabled={isLoading}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: isListening ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.1),
                color: isListening ? 'white' : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: isListening ? theme.palette.error.dark : alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              {isListening ? <MicOff /> : <Mic />}
            </IconButton>
          </Tooltip>

          <Tooltip title="发送消息">
            <IconButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark
                },
                '&:disabled': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3)
                }
              }}
            >
              <Send />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default ModernAIChatInterface;
