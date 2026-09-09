import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Slider,
} from '@mui/material';
import {
  Traffic as TrafficIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  NetworkCheck as NetworkCheckIcon,
  Speed as SpeedIcon,
  Public as PublicIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Mock data for the dashboard
const mockTrafficData = {
  totalRequests: 2456789,
  activeConnections: 1245,
  bandwidthUsage: '2.45 GB/s',
  packetLoss: '0.12%',
  responseTime: '45ms',
  threatsBlocked: 124,
  encryptedTraffic: '94.3%'
};

const mockProtocols = [
  { protocol: 'HTTP', percentage: 45, color: '#2196f3' },
  { protocol: 'HTTPS', percentage: 38, color: '#4caf50' },
  { protocol: 'DNS', percentage: 8, color: '#ff9800' },
  { protocol: 'FTP', percentage: 5, color: '#f44336' },
  { protocol: 'SSH', percentage: 3, color: '#9c27b0' },
  { protocol: 'Other', percentage: 1, color: '#607d8b' }
];

const mockTopCountries = [
  { country: 'United States', traffic: '1.2 GB', connections: 450 },
  { country: 'Germany', traffic: '890 MB', connections: 320 },
  { country: 'Japan', traffic: '750 MB', connections: 280 },
  { country: 'United Kingdom', traffic: '620 MB', connections: 240 },
  { country: 'Canada', traffic: '510 MB', connections: 190 }
];

const mockThreats = [
  { id: 1, type: 'DDoS Attack', severity: 'High', source: '45.67.89.123', time: '10:23:45' },
  { id: 2, type: 'SQL Injection', severity: 'Medium', source: '192.168.1.100', time: '11:45:22' },
  { id: 3, type: 'Port Scan', severity: 'Low', source: '78.90.123.45', time: '12:15:33' },
  { id: 4, type: 'Malware', severity: 'High', source: '203.45.67.89', time: '13:30:15' },
  { id: 5, type: 'Brute Force', severity: 'Medium', source: '91.23.45.67', time: '14:22:41' }
];

const TrafficAnalyzerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [trafficData, setTrafficData] = useState(mockTrafficData);
  const [timeRange, setTimeRange] = useState('1h');
  const [showThreats, setShowThreats] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [trafficHistory, setTrafficHistory] = useState([]);

  // Generate mock traffic history data
  useEffect(() => {
    const generateHistoryData = () => {
      const data = [];
      const now = new Date();
      for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          traffic: Math.floor(Math.random() * 100) + 50,
          connections: Math.floor(Math.random() * 200) + 100,
          threats: Math.floor(Math.random() * 10)
        });
      }
      setTrafficHistory(data);
    };

    generateHistoryData();
    const interval = setInterval(() => {
      if (isMonitoring) {
        generateHistoryData();
        // Simulate live data updates
        setTrafficData(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + Math.floor(Math.random() * 1000),
          activeConnections: Math.floor(Math.random() * 100) + 1200,
          bandwidthUsage: `${(Math.random() * 0.5 + 2.3).toFixed(2)} GB/s`
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Chart data configurations
  const trafficChartData = {
    labels: trafficHistory.map(d => d.time).filter((_, i) => i % 5 === 0),
    datasets: [
      {
        label: 'Traffic (MB/s)',
        data: trafficHistory.map(d => d.traffic).filter((_, i) => i % 5 === 0),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Active Connections',
        data: trafficHistory.map(d => d.connections).filter((_, i) => i % 5 === 0),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const protocolChartData = {
    labels: mockProtocols.map(p => p.protocol),
    datasets: [{
      data: mockProtocols.map(p => p.percentage),
      backgroundColor: mockProtocols.map(p => p.color),
      borderWidth: 1
    }]
  };

  const threatChartData = {
    labels: trafficHistory.map(d => d.time).filter((_, i) => i % 10 === 0),
    datasets: [{
      label: 'Threats Detected',
      data: trafficHistory.map(d => d.threats).filter((_, i) => i % 10 === 0),
      borderColor: '#f44336',
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#b0bec5'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#b0bec5'
        }
      }
    }
  };

  const handleExportData = () => {
    // In a real app, this would generate and download a CSV file
    alert('Export functionality would generate a CSV file with traffic data');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all traffic history?')) {
      setTrafficHistory([]);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#0a1929', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold', 
            color: '#ffffff',
            mb: 1
          }}>
            Traffic Analyzer Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#b0bec5' }}>
            Real-time network traffic monitoring and security analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={isMonitoring ? <PauseIcon /> : <PlayIcon />}
            onClick={() => setIsMonitoring(!isMonitoring)}
            sx={{ color: '#ffffff', borderColor: isMonitoring ? '#f44336' : '#4caf50' }}
          >
            {isMonitoring ? 'Pause Monitoring' : 'Start Monitoring'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
            sx={{ color: '#ffffff', borderColor: '#2196f3' }}
          >
            Export Data
          </Button>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            sx={{
              background: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
            }}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {/* Monitoring Status */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderLeft: `4px solid ${isMonitoring ? '#4caf50' : '#f44336'}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: isMonitoring ? '#4caf50' : '#f44336',
              animation: isMonitoring ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 }
              }
            }} />
            <Typography sx={{ color: '#ffffff' }}>
              {isMonitoring ? 'Live Monitoring Active' : 'Monitoring Paused'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#b0bec5' }}>
              Last Update: {new Date().toLocaleTimeString()}
            </Typography>
            <IconButton size="small" onClick={() => setIsMonitoring(!isMonitoring)}>
              {isMonitoring ? <StopIcon sx={{ color: '#f44336' }} /> : <PlayIcon sx={{ color: '#4caf50' }} />}
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          textColor="inherit"
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: '#2196f3',
                fontWeight: 'bold'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2196f3'
            }
          }}
        >
          <Tab label="Overview" icon={<TrafficIcon />} />
          <Tab label="Traffic Analysis" icon={<AnalyticsIcon />} />
          <Tab label="Security" icon={<SecurityIcon />} />
          <Tab label="Geo Map" icon={<PublicIcon />} />
          <Tab label="Reports" icon={<HistoryIcon />} />
        </Tabs>
      </Paper>

      {/* Time Range Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['1h', '6h', '24h', '7d', '30d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'contained' : 'outlined'}
              onClick={() => setTimeRange(range)}
              size="small"
              sx={{
                minWidth: 'auto',
                px: 2,
                ...(timeRange === range ? {
                  backgroundColor: '#2196f3',
                  '&:hover': { backgroundColor: '#1976d2' }
                } : {
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                })
              }}
            >
              {range}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton size="small" sx={{ color: '#ffffff' }}>
            <FilterIcon />
          </IconButton>
          <IconButton size="small" sx={{ color: '#ffffff' }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', border: '1px solid #2196f3' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrafficIcon sx={{ color: '#2196f3', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                    {trafficData.totalRequests.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                    Total Requests
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={85}
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #2196f3, #64b5f6)'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <NetworkCheckIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                    {trafficData.activeConnections}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                    Active Connections
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={72}
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #4caf50, #81c784)'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', border: '1px solid #ff9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SpeedIcon sx={{ color: '#ff9800', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                    {trafficData.bandwidthUsage}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                    Bandwidth Usage
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={65}
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #ff9800, #ffb74d)'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <ShieldIcon sx={{ color: '#f44336', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                    {trafficData.threatsBlocked}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                    Threats Blocked
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={90}
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(244, 67, 54, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #f44336, #ef5350)'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts Grid */}
      <Grid container spacing={3}>
        {/* Traffic History Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                Traffic History
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  icon={<VisibilityIcon />}
                  label="Show Details"
                  size="small"
                  sx={{ color: '#ffffff', backgroundColor: 'rgba(33, 150, 243, 0.2)' }}
                />
                <IconButton size="small" onClick={handleClearHistory}>
                  <HistoryIcon sx={{ color: '#ffffff' }} />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ height: 300 }}>
              <Line data={trafficChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Protocol Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 3 }}>
              Protocol Distribution
            </Typography>
            <Box sx={{ height: 250, mb: 2 }}>
              <Doughnut data={protocolChartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'right',
                    labels: {
                      color: '#ffffff',
                      padding: 20
                    }
                  }
                }
              }} />
            </Box>
            <List dense>
              {mockProtocols.map((protocol, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: protocol.color 
                    }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={protocol.protocol}
                    secondary={`${protocol.percentage}%`}
                    primaryTypographyProps={{ color: '#ffffff', variant: 'body2' }}
                    secondaryTypographyProps={{ color: '#b0bec5' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Threats Monitoring */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                Security Threats
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch 
                  checked={showThreats}
                  onChange={(e) => setShowThreats(e.target.checked)}
                  size="small"
                />
                <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                  Auto-block
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 200, mb: 3 }}>
              <Line data={threatChartData} options={chartOptions} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#ffffff' }}>Type</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>Severity</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>Source IP</TableCell>
                    <TableCell sx={{ color: '#ffffff' }}>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockThreats.map((threat) => (
                    <TableRow key={threat.id} hover>
                      <TableCell sx={{ color: '#ffffff' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon fontSize="small" sx={{ 
                            color: threat.severity === 'High' ? '#f44336' : 
                                   threat.severity === 'Medium' ? '#ff9800' : '#4caf50' 
                          }} />
                          {threat.type}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={threat.severity}
                          size="small"
                          sx={{
                            backgroundColor: threat.severity === 'High' ? 'rgba(244, 67, 54, 0.2)' :
                                            threat.severity === 'Medium' ? 'rgba(255, 152, 0, 0.2)' :
                                            'rgba(76, 175, 80, 0.2)',
                            color: threat.severity === 'High' ? '#f44336' :
                                   threat.severity === 'Medium' ? '#ff9800' : '#4caf50'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#b0bec5', fontFamily: 'monospace' }}>
                        {threat.source}
                      </TableCell>
                      <TableCell sx={{ color: '#b0bec5' }}>
                        {threat.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Countries */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                Top Countries by Traffic
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  sx={{ 
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.4)'
                    }
                  }}
                >
                  <MenuItem value="all">All Countries</MenuItem>
                  <MenuItem value="us">United States</MenuItem>
                  <MenuItem value="de">Germany</MenuItem>
                  <MenuItem value="jp">Japan</MenuItem>
                  <MenuItem value="uk">United Kingdom</MenuItem>
                  <MenuItem value="ca">Canada</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 200, mb: 3 }}>
              <Bar 
                data={{
                  labels: mockTopCountries.map(c => c.country),
                  datasets: [{
                    label: 'Traffic',
                    data: mockTopCountries.map(c => parseFloat(c.traffic)),
                    backgroundColor: 'rgba(33, 150, 243, 0.7)',
                    borderColor: '#2196f3',
                    borderWidth: 1
                  }]
                }}
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </Box>
            <List>
              {mockTopCountries.map((country, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <LocationIcon sx={{ color: '#2196f3' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={country.country}
                    secondary={`${country.traffic} • ${country.connections} connections`}
                    primaryTypographyProps={{ color: '#ffffff' }}
                    secondaryTypographyProps={{ color: '#b0bec5' }}
                  />
                  <Chip 
                    label={`#${index + 1}`}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(33, 150, 243, 0.2)',
                      color: '#2196f3'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Additional Metrics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 3 }}>
              Network Health
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom sx={{ color: '#ffffff', display: 'flex', justifyContent: 'space-between' }}>
                <span>Packet Loss</span>
                <span>{trafficData.packetLoss}</span>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(trafficData.packetLoss) * 10}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #4caf50, #81c784)'
                  }
                }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom sx={{ color: '#ffffff', display: 'flex', justifyContent: 'space-between' }}>
                <span>Response Time</span>
                <span>{trafficData.responseTime}</span>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={parseInt(trafficData.responseTime)}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #2196f3, #64b5f6)'
                  }
                }}
              />
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom sx={{ color: '#ffffff', display: 'flex', justifyContent: 'space-between' }}>
                <span>Encrypted Traffic</span>
                <span>{trafficData.encryptedTraffic}</span>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(trafficData.encryptedTraffic)}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #9c27b0, #ba68c8)'
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Device Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 3 }}>
              Device Distribution
            </Typography>
            <Box sx={{ height: 200, mb: 3 }}>
              <Pie 
                data={{
                  labels: ['Desktop', 'Mobile', 'Tablet', 'IoT', 'Server'],
                  datasets: [{
                    data: [45, 35, 10, 5, 5],
                    backgroundColor: [
                      '#2196f3',
                      '#4caf50',
                      '#ff9800',
                      '#9c27b0',
                      '#607d8b'
                    ]
                  }]
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'right',
                      labels: {
                        color: '#ffffff',
                        padding: 20
                      }
                    }
                  }
                }}
              />
            </Box>
            <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
              {trafficData.activeConnections} active devices connected
            </Alert>
          </Paper>
        </Grid>

        {/* Traffic Control */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 3 }}>
              Traffic Control
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom sx={{ color: '#ffffff' }}>
                Bandwidth Limit
              </Typography>
              <Slider 
                defaultValue={75}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                sx={{
                  color: '#2196f3',
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: '#2196f3'
                  }
                }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom sx={{ color: '#ffffff' }}>
                Connection Limit
              </Typography>
              <Slider 
                defaultValue={60}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                sx={{
                  color: '#4caf50',
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: '#4caf50'
                  }
                }}
              />
            </Box>
            <Button
              variant="contained"
              fullWidth
              startIcon={<LockIcon />}
              sx={{
                background: 'linear-gradient(135deg, #2196f3, #1976d2)',
              }}
            >
              Apply Limits
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrafficAnalyzerDashboard;