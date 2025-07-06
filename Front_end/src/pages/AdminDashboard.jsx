import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Dashboard,
  People,
  Settings,
  Analytics,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Warning,
  TrendingUp,
  Flight,
  Notifications,
  Security,
  Refresh,
  Download,
  Search,
  FilterList,
  Add,
  MonitorHeart,
  Speed,
  Storage,
  Memory,
  CloudQueue
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { adminApi, apiUtils } from '../services/backendApi';

const AdminDashboard = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 1250,
    activeUsers: 890,
    totalTasks: 3420,
    activeTasks: 2180,
    totalFlights: 15680,
    systemHealth: 98.5,
    cpuUsage: 45.2,
    memoryUsage: 67.8,
    diskUsage: 34.5,
    networkTraffic: 125.6
  });

  const [userGrowthData] = useState([
    { month: '1月', users: 850, active: 620 },
    { month: '2月', users: 920, active: 680 },
    { month: '3月', users: 1050, active: 780 },
    { month: '4月', users: 1180, active: 850 },
    { month: '5月', users: 1220, active: 890 },
    { month: '6月', users: 1250, active: 890 }
  ]);

  const [taskDistribution] = useState([
    { name: '活跃任务', value: 2180, color: '#4caf50' },
    { name: '暂停任务', value: 890, color: '#ff9800' },
    { name: '已完成', value: 350, color: '#2196f3' }
  ]);

  const [systemPerformance] = useState([
    { time: '00:00', cpu: 35, memory: 60, network: 80 },
    { time: '04:00', cpu: 28, memory: 55, network: 65 },
    { time: '08:00', cpu: 45, memory: 70, network: 120 },
    { time: '12:00', cpu: 52, memory: 75, network: 140 },
    { time: '16:00', cpu: 48, memory: 68, network: 125 },
    { time: '20:00', cpu: 42, memory: 65, network: 110 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 模拟用户数据
  const [mockUsers] = useState([
    {
      id: 1,
      username: 'user001',
      email: 'user001@example.com',
      status: 'active',
      createdAt: '2024-01-15',
      lastLogin: '2024-06-14',
      monitorTasks: 3,
      isAdmin: false
    },
    {
      id: 2,
      username: 'user002',
      email: 'user002@example.com',
      status: 'inactive',
      createdAt: '2024-02-20',
      lastLogin: '2024-06-10',
      monitorTasks: 1,
      isAdmin: false
    },
    {
      id: 3,
      username: 'admin',
      email: 'admin@example.com',
      status: 'active',
      createdAt: '2024-01-01',
      lastLogin: '2024-06-14',
      monitorTasks: 0,
      isAdmin: true
    }
  ]);

  useEffect(() => {
    setUsers(mockUsers);
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      // const stats = await adminApi.getSystemStats();
      // setSystemStats(stats);
    } catch (error) {
      console.error('Failed to load system stats:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleUserMenuOpen = (event, user) => {
    setUserMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleEditUser = () => {
    setEditDialogOpen(true);
    handleUserMenuClose();
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        // await adminApi.deleteUser(selectedUser.id);
        setUsers(users.filter(u => u.id !== selectedUser.id));
        handleUserMenuClose();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleUserStatus = async () => {
    if (selectedUser) {
      try {
        const newStatus = selectedUser.status === 'active' ? 'inactive' : 'active';
        // await adminApi.updateUserStatus(selectedUser.id, newStatus);
        setUsers(users.map(u => 
          u.id === selectedUser.id 
            ? { ...u, status: newStatus }
            : u
        ));
        handleUserMenuClose();
      } catch (error) {
        console.error('Failed to update user status:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '活跃';
      case 'inactive': return '非活跃';
      case 'blocked': return '已封禁';
      default: return status;
    }
  };

  // 过滤用户列表
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="600">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: `${color}.main`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="600" gutterBottom>
            管理员后台
          </Typography>
          <Typography variant="body1" color="text.secondary">
            系统管理和用户管理
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Settings />}
          sx={{
            background: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1557b0 0%, #2e7d32 100%)',
            }
          }}
        >
          系统设置
        </Button>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="总用户数"
            value={systemStats.totalUsers.toLocaleString()}
            icon={<People />}
            color="primary"
            subtitle={`活跃用户: ${systemStats.activeUsers}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="监控任务"
            value={systemStats.totalTasks.toLocaleString()}
            icon={<Flight />}
            color="success"
            subtitle={`活跃任务: ${systemStats.activeTasks}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="CPU使用率"
            value={`${systemStats.cpuUsage}%`}
            icon={<Speed />}
            color={systemStats.cpuUsage > 80 ? "error" : systemStats.cpuUsage > 60 ? "warning" : "success"}
            subtitle="处理器负载"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="内存使用率"
            value={`${systemStats.memoryUsage}%`}
            icon={<Memory />}
            color={systemStats.memoryUsage > 80 ? "error" : systemStats.memoryUsage > 60 ? "warning" : "success"}
            subtitle="内存占用"
          />
        </Grid>
      </Grid>

      {/* 第二行统计卡片 */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="磁盘使用率"
            value={`${systemStats.diskUsage}%`}
            icon={<Storage />}
            color="info"
            subtitle="存储空间"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="网络流量"
            value={`${systemStats.networkTraffic} MB/s`}
            icon={<CloudQueue />}
            color="secondary"
            subtitle="实时流量"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="系统健康度"
            value={`${systemStats.systemHealth}%`}
            icon={<MonitorHeart />}
            color="success"
            subtitle="运行状态良好"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  快速操作
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  fullWidth
                >
                  刷新数据
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  fullWidth
                >
                  导出报告
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 主要内容区域 */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab icon={<Dashboard />} label="概览" />
            <Tab icon={<People />} label="用户管理" />
            <Tab icon={<Analytics />} label="数据分析" />
            <Tab icon={<Settings />} label="系统设置" />
          </Tabs>
        </Box>

        <CardContent>
          {/* 概览标签页 */}
          {currentTab === 0 && (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                系统概览
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      最近活动
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <CheckCircle color="success" fontSize="small" />
                        <Typography variant="body2">
                          新用户注册: user123@example.com
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          2分钟前
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <TrendingUp color="primary" fontSize="small" />
                        <Typography variant="body2">
                          价格监控任务创建: HKG → NRT
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          5分钟前
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Notifications color="warning" fontSize="small" />
                        <Typography variant="body2">
                          低价提醒发送: 15个用户
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          10分钟前
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      系统状态
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">API响应时间</Typography>
                        <Chip label="120ms" color="success" size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">数据库连接</Typography>
                        <Chip label="正常" color="success" size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">监控服务</Typography>
                        <Chip label="运行中" color="success" size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">通知服务</Typography>
                        <Chip label="正常" color="success" size="small" />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* 用户管理标签页 */}
          {currentTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="600">
                  用户管理
                </Typography>
                <Button variant="contained" startIcon={<Add />}>
                  添加用户
                </Button>
              </Box>

              {/* 搜索和过滤 */}
              <Box display="flex" gap={2} mb={3}>
                <TextField
                  placeholder="搜索用户名或邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ flex: 1 }}
                />
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>状态筛选</InputLabel>
                  <Select
                    value={filterStatus}
                    label="状态筛选"
                    onChange={(e) => setFilterStatus(e.target.value)}
                    startAdornment={<FilterList sx={{ mr: 1 }} />}
                  >
                    <MenuItem value="all">全部</MenuItem>
                    <MenuItem value="active">活跃</MenuItem>
                    <MenuItem value="inactive">非活跃</MenuItem>
                    <MenuItem value="blocked">已封禁</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>用户名</TableCell>
                      <TableCell>邮箱</TableCell>
                      <TableCell>状态</TableCell>
                      <TableCell>角色</TableCell>
                      <TableCell>监控任务</TableCell>
                      <TableCell>注册时间</TableCell>
                      <TableCell>最后登录</TableCell>
                      <TableCell align="center">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(user.status)}
                            color={getStatusColor(user.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isAdmin ? '管理员' : '普通用户'}
                            color={user.isAdmin ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.monitorTasks}</TableCell>
                        <TableCell>{user.createdAt}</TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={(e) => handleUserMenuOpen(e, user)}
                            size="small"
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 数据分析标签页 */}
          {currentTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="600">
                  数据分析
                </Typography>
                <Box display="flex" gap={1}>
                  <Button variant="outlined" size="small" startIcon={<Refresh />}>
                    刷新
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<Download />}>
                    导出
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* 用户增长趋势 */}
                <Grid item xs={12} lg={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        用户增长趋势
                      </Typography>
                      <Box sx={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="users"
                              stackId="1"
                              stroke={theme.palette.primary.main}
                              fill={alpha(theme.palette.primary.main, 0.3)}
                              name="总用户"
                            />
                            <Area
                              type="monotone"
                              dataKey="active"
                              stackId="2"
                              stroke={theme.palette.success.main}
                              fill={alpha(theme.palette.success.main, 0.3)}
                              name="活跃用户"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 任务分布 */}
                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        任务分布
                      </Typography>
                      <Box sx={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={taskDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {taskDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* 系统性能监控 */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        系统性能监控
                      </Typography>
                      <Box sx={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={systemPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="cpu"
                              stroke={theme.palette.error.main}
                              strokeWidth={2}
                              name="CPU使用率(%)"
                            />
                            <Line
                              type="monotone"
                              dataKey="memory"
                              stroke={theme.palette.warning.main}
                              strokeWidth={2}
                              name="内存使用率(%)"
                            />
                            <Line
                              type="monotone"
                              dataKey="network"
                              stroke={theme.palette.info.main}
                              strokeWidth={2}
                              name="网络流量(MB/s)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* 系统设置标签页 */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                系统设置
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      通知设置
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="邮件通知"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="短信通知"
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="推送通知"
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      系统参数
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <TextField
                        label="监控间隔(分钟)"
                        type="number"
                        defaultValue={5}
                        size="small"
                      />
                      <TextField
                        label="最大监控任务数"
                        type="number"
                        defaultValue={10}
                        size="small"
                      />
                      <TextField
                        label="价格阈值(元)"
                        type="number"
                        defaultValue={2000}
                        size="small"
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 用户操作菜单 */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={handleEditUser}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          编辑用户
        </MenuItem>
        <MenuItem onClick={handleToggleUserStatus}>
          {selectedUser?.status === 'active' ? (
            <>
              <Block fontSize="small" sx={{ mr: 1 }} />
              禁用用户
            </>
          ) : (
            <>
              <CheckCircle fontSize="small" sx={{ mr: 1 }} />
              启用用户
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          删除用户
        </MenuItem>
      </Menu>

      {/* 编辑用户对话框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>编辑用户</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="用户名"
              defaultValue={selectedUser?.username}
              fullWidth
            />
            <TextField
              label="邮箱"
              defaultValue={selectedUser?.email}
              fullWidth
            />
            <FormControlLabel
              control={<Switch defaultChecked={selectedUser?.isAdmin} />}
              label="管理员权限"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => setEditDialogOpen(false)}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
