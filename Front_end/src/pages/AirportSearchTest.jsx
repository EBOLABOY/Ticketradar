import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { flightApi } from '../services/backendApi';

/**
 * 机场搜索测试页面
 * 用于测试机场搜索API是否正常工作
 */
const AirportSearchTest = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query || query.length < 2) {
      setError('请输入至少2个字符');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      console.log('开始搜索:', query);
      const response = await flightApi.searchAirports(query, 'zh');
      console.log('搜索响应:', response);

      if (response.success && response.data && response.data.airports) {
        setResults(response.data.airports);
        console.log('搜索结果:', response.data.airports);
      } else {
        setError('搜索失败或无结果');
        console.error('搜索失败:', response);
      }
    } catch (err) {
      console.error('搜索错误:', err);
      setError('搜索出错: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        机场搜索测试
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="搜索机场"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入城市名或机场代码，如：北京、PEK"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? '搜索中...' : '搜索'}
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      {results.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            搜索结果 ({results.length} 个)
          </Typography>
          <List>
            {results.map((airport, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={`${airport.name} (${airport.code})`}
                  secondary={`${airport.city}, ${airport.country}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          测试说明
        </Typography>
        <Typography variant="body2" color="text.secondary">
          1. 输入城市名（如：北京、上海）或机场代码（如：PEK、PVG）
          <br />
          2. 点击搜索按钮
          <br />
          3. 查看搜索结果和控制台日志
          <br />
          4. 如果有错误，请检查后端服务是否正常运行
        </Typography>
      </Box>
    </Container>
  );
};

export default AirportSearchTest;
