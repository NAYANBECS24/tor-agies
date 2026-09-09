import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const [timeRange, setTimeRange] = React.useState('24h');

  const trafficData = [
    { time: '00:00', traffic: 1200, threats: 45 },
    { time: '04:00', traffic: 800, threats: 32 },
    { time: '08:00', traffic: 2400, threats: 89 },
    { time: '12:00', traffic: 3200, threats: 124 },
    { time: '16:00', traffic: 2800, threats: 76 },
    { time: '20:00', traffic: 2100, threats: 54 },
    { time: '24:00', traffic: 1500, threats: 41 },
  ];

  const protocolData = [
    { name: 'HTTPS', value: 45, color: '#2196f3' },
    { name: 'HTTP', value: 25, color: '#4caf50' },
    { name: 'SSH', value: 15, color: '#ff9800' },
    { name: 'DNS', value: 10, color: '#9c27b0' },
    { name: 'Other', value: 5, color: '#607d8b' },
  ];

  const threatByType = [
    { type: 'Port Scan', count: 45, trend: '+12%' },
    { type: 'DDoS', count: 28, trend: '+8%' },
    { type: 'Malware', count: 22, trend: '-3%' },
    { type: 'Data Exfil', count: 15, trend: '+25%' },
    { type: 'Brute Force', count: 12, trend: '-5%' },
  ];

  const stats = {
    avgResponse: '2.3s',
    peakTraffic: '3.2K req/s',
    threatRate: '4.2%',
    successRate: '95.8%'
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Response</Typography>
              </Box>
              <Typography variant="h4">{stats.avgResponse}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingDownIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success" sx={{ ml: 0.5 }}>
                  -12% from last week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChartIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Peak Traffic</Typography>
              </Box>
              <Typography variant="h4">{stats.peakTraffic}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="warning" fontSize="small" />
                <Typography variant="caption" color="warning" sx={{ ml: 0.5 }}>
                  +8% from last week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChartIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Threat Rate</Typography>
              </Box>
              <Typography variant="h4">{stats.threatRate}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingDownIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success" sx={{ ml: 0.5 }}>
                  -3% from last week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Success Rate</Typography>
              </Box>
              <Typography variant="h4">{stats.successRate}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success" sx={{ ml: 0.5 }}>
                  +2% from last week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Traffic & Threats Over Time
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="traffic"
                  stroke="#2196f3"
                  name="Traffic (req/s)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="threats"
                  stroke="#f44336"
                  name="Threats"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Protocol Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={protocolData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {protocolData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Threat Analysis */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Threat Analysis by Type
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={threatByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {threatByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f44336' : '#ff9800'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Top Threat Sources
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { country: 'United States', count: 124, trend: '↑' },
                { country: 'China', count: 89, trend: '↑' },
                { country: 'Russia', count: 76, trend: '↓' },
                { country: 'Germany', count: 54, trend: '→' },
                { country: 'Brazil', count: 42, trend: '↑' },
              ].map((source, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    mb: 1,
                    bgcolor: index % 2 === 0 ? 'action.hover' : 'transparent',
                    borderRadius: 1
                  }}
                >
                  <Typography>{source.country}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontWeight: 'medium' }}>
                      {source.country === 'United States' ? '🇺🇸' : 
                       source.country === 'China' ? '🇨🇳' :
                       source.country === 'Russia' ? '🇷🇺' :
                       source.country === 'Germany' ? '🇩🇪' : '🇧🇷'}
                    </Typography>
                    <Typography sx={{ fontWeight: 'medium' }}>{source.count}</Typography>
                    <Chip 
                      label={source.trend}
                      size="small"
                      color={source.trend === '↑' ? 'error' : source.trend === '↓' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;