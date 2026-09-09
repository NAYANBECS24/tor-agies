import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  LinearProgress,
  Fade,
  Zoom,
  Grow,
  Slide,
  Button,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudDownload as CloudDownloadIcon,
  Analytics as AnalyticsIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Bolt as BoltIcon,
  NetworkCheck as NetworkIcon,
  ArrowUpward as ArrowUpwardIcon,
  TrendingUp as TrendingUpIcon,
  Insights as InsightsIcon,
  Timeline as TimelineChartIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, Filler);

const Traffic = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');
  const [showMaliciousOnly, setShowMaliciousOnly] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedTraffic, setSelectedTraffic] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [realTimeData, setRealTimeData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const lastUpdateRef = useRef(Date.now());
  const animationSpeed = 1;

  // Initial traffic data with more realistic entries
  const initialTrafficData = [
    { id: 1, timestamp: '2024-12-14 15:30:22', source: 'GuardNode-01', destination: '192.168.1.100:443', protocol: 'HTTPS', bytes: '2.4 MB', duration: '1.2s', threat: 'low', malicious: false, country: 'US', encryption: 'AES-256', bandwidth: '1.2 Gbps' },
    { id: 2, timestamp: '2024-12-14 15:29:45', source: 'ExitNode-01', destination: '10.0.0.5:80', protocol: 'HTTP', bytes: '1.8 MB', duration: '0.8s', threat: 'low', malicious: false, country: 'DE', encryption: 'TLS 1.3', bandwidth: '890 Mbps' },
    { id: 3, timestamp: '2024-12-14 15:28:12', source: 'SuspiciousNode-07', destination: '172.16.0.3:22', protocol: 'SSH', bytes: '150 KB', duration: '45s', threat: 'high', malicious: true, country: 'CN', encryption: 'Unknown', bandwidth: '45 Mbps' },
    { id: 4, timestamp: '2024-12-14 15:27:33', source: 'RelayNode-05', destination: '8.8.8.8:53', protocol: 'DNS', bytes: '48 KB', duration: '0.1s', threat: 'low', malicious: false, country: 'US', encryption: 'DNSSEC', bandwidth: '10 Gbps' },
    { id: 5, timestamp: '2024-12-14 15:26:55', source: 'ExitNode-02', destination: '203.0.113.5:443', protocol: 'HTTPS', bytes: '5.2 MB', duration: '2.3s', threat: 'medium', malicious: true, country: 'RU', encryption: 'AES-128', bandwidth: '650 Mbps' },
    { id: 6, timestamp: '2024-12-14 15:25:18', source: 'GuardNode-02', destination: '192.168.1.200:3389', protocol: 'RDP', bytes: '12 MB', duration: '30s', threat: 'critical', malicious: true, country: 'BR', encryption: 'RC4', bandwidth: '320 Mbps' },
    { id: 7, timestamp: '2024-12-14 15:24:42', source: 'BridgeNode-04', destination: '1.1.1.1:53', protocol: 'DNS', bytes: '32 KB', duration: '0.2s', threat: 'low', malicious: false, country: 'SE', encryption: 'DNSSEC', bandwidth: '980 Mbps' },
    { id: 8, timestamp: '2024-12-14 15:23:15', source: 'ExitNode-03', destination: '104.18.0.1:443', protocol: 'HTTPS', bytes: '3.7 MB', duration: '1.5s', threat: 'low', malicious: false, country: 'SG', encryption: 'AES-256', bandwidth: '2.1 Gbps' },
    { id: 9, timestamp: '2024-12-14 15:22:38', source: 'GuardNode-03', destination: '91.189.0.1:80', protocol: 'HTTP', bytes: '890 KB', duration: '0.7s', threat: 'medium', malicious: true, country: 'JP', encryption: 'None', bandwidth: '550 Mbps' },
    { id: 10, timestamp: '2024-12-14 15:21:22', source: 'RelayNode-02', destination: '8.8.4.4:53', protocol: 'DNS', bytes: '56 KB', duration: '0.1s', threat: 'low', malicious: false, country: 'UK', encryption: 'DNSSEC', bandwidth: '1.5 Gbps' },
  ];

  const [trafficData, setTrafficData] = useState(initialTrafficData);

  // Real-time data simulation
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        const now = new Date();
        const newEntry = {
          id: trafficData.length + 1,
          timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
          source: `Node-${Math.floor(Math.random() * 100)}`,
          destination: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}:${[80, 443, 22, 53][Math.floor(Math.random() * 4)]}`,
          protocol: ['HTTPS', 'HTTP', 'SSH', 'DNS'][Math.floor(Math.random() * 4)],
          bytes: `${(Math.random() * 10).toFixed(1)} MB`,
          duration: `${(Math.random() * 5).toFixed(1)}s`,
          threat: Math.random() > 0.8 ? 'high' : Math.random() > 0.6 ? 'medium' : 'low',
          malicious: Math.random() > 0.85,
          country: ['US', 'DE', 'JP', 'SG', 'UK', 'CA', 'AU', 'FR'][Math.floor(Math.random() * 8)],
          encryption: ['AES-256', 'TLS 1.3', 'DNSSEC', 'AES-128'][Math.floor(Math.random() * 4)],
          bandwidth: `${(Math.random() * 2).toFixed(1)} Gbps`,
        };

        setTrafficData(prev => [newEntry, ...prev.slice(0, 49)]); // Keep only last 50 entries
        setRefreshCount(prev => prev + 1);
        lastUpdateRef.current = Date.now();
      }, 3000 / animationSpeed);

      return () => clearInterval(interval);
    }
  }, [isLive, animationSpeed, trafficData.length]);

  // Real-time chart data
  useEffect(() => {
    const generateRealTimeData = () => {
      const now = Date.now();
      const newDataPoint = {
        time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        traffic: Math.floor(Math.random() * 100) + 50,
        threats: Math.floor(Math.random() * 10),
        bandwidth: Math.floor(Math.random() * 1000) + 500,
      };
      setRealTimeData(prev => [...prev.slice(-19), newDataPoint]); // Keep last 20 points
    };

    if (isLive) {
      const interval = setInterval(generateRealTimeData, 2000 / animationSpeed);
      return () => clearInterval(interval);
    }
  }, [isLive, animationSpeed]);

  // Traffic chart data
  const trafficChartData = {
    labels: realTimeData.map(d => d.time),
    datasets: [
      {
        label: 'Traffic Volume',
        data: realTimeData.map(d => d.traffic),
        borderColor: 'rgba(33, 150, 243, 0.8)',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(33, 150, 243, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Threats Detected',
        data: realTimeData.map(d => d.threats * 10),
        borderColor: 'rgba(244, 67, 54, 0.8)',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(244, 67, 54, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const protocolChartData = {
    labels: ['HTTPS', 'HTTP', 'DNS', 'SSH', 'Other'],
    datasets: [{
      label: 'Protocol Distribution',
      data: [42, 25, 18, 8, 7],
      backgroundColor: [
        'rgba(33, 150, 243, 0.8)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(255, 152, 0, 0.8)',
        'rgba(156, 39, 176, 0.8)',
        'rgba(96, 125, 139, 0.8)',
      ],
      borderColor: [
        'rgba(33, 150, 243, 1)',
        'rgba(76, 175, 80, 1)',
        'rgba(255, 152, 0, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(96, 125, 139, 1)',
      ],
      borderWidth: 2,
    }],
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getThreatColor = (threat) => {
    switch (threat) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const filteredData = trafficData.filter(item => {
    if (filter !== 'all' && item.protocol.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (showMaliciousOnly && !item.malicious) {
      return false;
    }
    if (searchTerm && !item.source.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.destination.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleRefresh = () => {
    setIsLive(false);
    setTimeout(() => {
      setRefreshCount(prev => prev + 1);
      setIsLive(true);
    }, 500);
  };

  const handleExportData = () => {
    // Simulate export with animation
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.style.transform = 'scale(1.2)';
      setTimeout(() => {
        exportBtn.style.transform = 'scale(1)';
      }, 300);
    }
    console.log('Exporting traffic data...');
  };

  const handleViewDetails = (traffic) => {
    setSelectedTraffic(traffic);
    setDialogOpen(true);
  };

  const handleAnalyze = (id) => {
    console.log(`Analyzing traffic pattern for ID: ${id}`);
  };

  // Calculate summary statistics
  const totalTraffic = trafficData.length;
  const maliciousCount = trafficData.filter(item => item.malicious).length;
  const criticalCount = trafficData.filter(item => item.threat === 'critical').length;
  const totalBytes = trafficData.reduce((sum, item) => {
    const bytes = parseFloat(item.bytes);
    const unit = item.bytes.split(' ')[1];
    if (unit === 'MB') return sum + bytes * 1024 * 1024;
    if (unit === 'KB') return sum + bytes * 1024;
    return sum + bytes;
  }, 0);

  const formatBytes = (bytes) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const stats = [
    { 
      label: 'Total Traffic', 
      value: totalTraffic.toLocaleString(), 
      color: '#2196f3', 
      icon: <SpeedIcon />,
      change: '+12%',
      trend: 'up'
    },
    { 
      label: 'Malicious', 
      value: maliciousCount.toString(), 
      color: '#f44336', 
      icon: <SecurityIcon />,
      change: maliciousCount > 0 ? `+${maliciousCount}` : '0',
      trend: maliciousCount > 0 ? 'up' : 'stable'
    },
    { 
      label: 'Critical Alerts', 
      value: criticalCount.toString(), 
      color: '#ff9800', 
      icon: <WarningIcon />,
      change: criticalCount > 0 ? `+${criticalCount}` : '0',
      trend: criticalCount > 0 ? 'up' : 'stable'
    },
    { 
      label: 'Data Volume', 
      value: formatBytes(totalBytes), 
      color: '#4caf50', 
      icon: <CloudDownloadIcon />,
      change: '+18%',
      trend: 'up'
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Animated Header */}
      <Fade in timeout={800}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          background: 'linear-gradient(90deg, rgba(19, 47, 76, 0.8), rgba(25, 118, 210, 0.4))',
          p: 3,
          borderRadius: 3,
          border: '1px solid rgba(33, 150, 243, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: 'white',
              background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}>
              <NetworkIcon sx={{ mr: 1, verticalAlign: 'middle', animation: 'pulse 2s infinite' }} />
              Tor Traffic Monitor
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Real-time monitoring of encrypted network traffic
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: isLive ? '#4caf50' : '#f44336',
                animation: isLive ? 'pulse 1.5s infinite' : 'none',
              }} />
              <Chip 
                label={isLive ? "LIVE" : "PAUSED"} 
                size="small"
                sx={{
                  backgroundColor: isLive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                  color: isLive ? '#4caf50' : '#f44336',
                  fontWeight: 'bold',
                  animation: isLive ? 'glow 2s infinite' : 'none',
                }}
              />
            </Box>
            <IconButton 
              onClick={() => setIsLive(!isLive)}
              sx={{ 
                background: isLive ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                '&:hover': { background: isLive ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)' },
                animation: isLive ? 'spin 2s linear infinite' : 'none',
              }}
            >
              {isLive ? <PauseIcon sx={{ color: '#f44336' }} /> : <PlayArrowIcon sx={{ color: '#4caf50' }} />}
            </IconButton>
          </Box>
        </Box>
      </Fade>

      {/* Animated Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Slide in timeout={500 + index * 100} direction="up">
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(10, 25, 41, 0.9))',
                border: `1px solid ${stat.color}40`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 30px ${stat.color}30`,
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${stat.color}30, ${stat.color}10)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'float 3s ease-in-out infinite',
                    }}>
                      {React.cloneElement(stat.icon, { 
                        sx: { 
                          color: stat.color, 
                          fontSize: 24,
                          animation: stat.trend === 'up' ? 'bounce 2s infinite' : 'none'
                        } 
                      })}
                    </Box>
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        background: stat.trend === 'up' ? 
                          stat.color === '#f44336' ? 
                            'linear-gradient(135deg, #f44336, #e57373)' :
                            'linear-gradient(135deg, #4caf50, #81c784)' :
                          'linear-gradient(135deg, #ff9800, #ffb74d)',
                        color: 'white',
                        fontWeight: 'bold',
                        animation: 'pulse 2s infinite',
                      }}
                    />
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold', 
                    mb: 0.5,
                    background: `linear-gradient(45deg, ${stat.color}, ${stat.color}80)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'monospace',
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        ))}
      </Grid>

      {/* Real-time Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Grow in timeout={800}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(10, 25, 41, 0.9))',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              backdropFilter: 'blur(10px)',
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineChartIcon sx={{ animation: 'pulse 2s infinite' }} /> Real-time Traffic Analytics
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line 
                    data={trafficChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart',
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 12 },
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        },
                        y: {
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} md={4}>
          <Zoom in timeout={1000}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(10, 25, 41, 0.9))',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              backdropFilter: 'blur(10px)',
              height: '100%',
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AnalyticsIcon sx={{ animation: 'spin 10s linear infinite' }} /> Protocol Distribution
                </Typography>
                <Box sx={{ height: 250 }}>
                  <Bar 
                    data={protocolChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart',
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        },
                        y: {
                          grid: { color: 'rgba(255, 255, 255, 0.1)' },
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {protocolChartData.labels.map((label, idx) => (
                    <Chip
                      key={label}
                      label={label}
                      size="small"
                      sx={{
                        backgroundColor: `${protocolChartData.datasets[0].backgroundColor[idx]}80`,
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Controls Section */}
      <Fade in timeout={1200}>
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2, 
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(10, 25, 41, 0.9))',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <TextField
            placeholder="Search traffic..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              width: 300,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
              sx: { color: 'white' }
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Protocol</InputLabel>
            <Select
              value={filter}
              label="Protocol"
              onChange={(e) => setFilter(e.target.value)}
              sx={{
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(33, 150, 243, 0.5)',
                },
              }}
            >
              <MenuItem value="all">All Protocols</MenuItem>
              <MenuItem value="https">HTTPS</MenuItem>
              <MenuItem value="http">HTTP</MenuItem>
              <MenuItem value="ssh">SSH</MenuItem>
              <MenuItem value="dns">DNS</MenuItem>
              <MenuItem value="rdp">RDP</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showMaliciousOnly}
                onChange={(e) => setShowMaliciousOnly(e.target.checked)}
                color="error"
                sx={{
                  '& .MuiSwitch-track': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              />
            }
            label="Show Malicious Only"
            sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
          />

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={handleRefresh} 
              sx={{ 
                background: 'rgba(33, 150, 243, 0.2)',
                '&:hover': { background: 'rgba(33, 150, 243, 0.3)' },
                animation: isLive ? 'spin 2s linear infinite' : 'none',
              }}
            >
              <RefreshIcon sx={{ color: '#2196f3' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export Data">
            <IconButton 
              id="export-btn"
              onClick={handleExportData} 
              sx={{ 
                background: 'rgba(76, 175, 80, 0.2)',
                '&:hover': { background: 'rgba(76, 175, 80, 0.3)' },
                transition: 'transform 0.3s',
              }}
            >
              <DownloadIcon sx={{ color: '#4caf50' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Advanced Filters">
            <IconButton sx={{ 
              background: 'rgba(255, 152, 0, 0.2)',
              '&:hover': { background: 'rgba(255, 152, 0, 0.3)' },
            }}>
              <FilterIcon sx={{ color: '#ff9800' }} />
            </IconButton>
          </Tooltip>
        </Paper>
      </Fade>

      {/* Traffic Table */}
      <Fade in timeout={1500}>
        <TableContainer component={Paper} sx={{ 
          background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(10, 25, 41, 0.9))',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(90deg, rgba(33, 150, 243, 0.3), rgba(25, 118, 210, 0.2))',
              }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Timestamp</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Source Node</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Destination</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Protocol</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Data Size</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Duration</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Threat Level</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow 
                    key={row.id} 
                    hover
                    sx={{ 
                      animation: isLive && index < 3 ? 'fadeInOut 3s infinite' : 'none',
                      '&:hover': {
                        background: 'rgba(33, 150, 243, 0.1)',
                      }
                    }}
                  >
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: 'monospace' }}>
                      {row.timestamp}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ 
                          width: 24, 
                          height: 24, 
                          bgcolor: getThreatColor(row.threat) === 'error' ? '#f44336' : 
                                   getThreatColor(row.threat) === 'warning' ? '#ff9800' : '#4caf50',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}>
                          {row.source.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ 
                          color: 'white', 
                          fontWeight: 'medium',
                          animation: row.malicious ? 'pulse 1s infinite' : 'none',
                        }}>
                          {row.source}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Country: ${row.country} | Encryption: ${row.encryption}`}>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                        }}>
                          {row.destination}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.protocol} 
                        size="small" 
                        sx={{ 
                          backgroundColor: row.protocol === 'HTTPS' ? 'rgba(33, 150, 243, 0.2)' :
                                        row.protocol === 'HTTP' ? 'rgba(76, 175, 80, 0.2)' :
                                        row.protocol === 'SSH' ? 'rgba(255, 152, 0, 0.2)' :
                                        'rgba(156, 39, 176, 0.2)',
                          color: row.protocol === 'HTTPS' ? '#2196f3' :
                                 row.protocol === 'HTTP' ? '#4caf50' :
                                 row.protocol === 'SSH' ? '#ff9800' : '#9c27b0',
                          fontWeight: 'bold',
                          animation: 'float 3s ease-in-out infinite',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'medium' }}>{row.bytes}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: 'white' }}>{row.duration}</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(row.duration) * 20}
                          sx={{ 
                            width: 50,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: parseFloat(row.duration) > 10 ? 
                                'linear-gradient(90deg, #f44336, #e57373)' :
                                'linear-gradient(90deg, #4caf50, #81c784)',
                              animation: 'progressPulse 2s infinite',
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.threat.toUpperCase()} 
                        color={getThreatColor(row.threat)}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          animation: row.threat === 'critical' ? 'pulse 0.5s infinite' : 'none',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {row.malicious ? (
                        <Chip
                          icon={<WarningIcon />}
                          label="Malicious"
                          color="error"
                          size="small"
                          sx={{
                            animation: 'pulse 1s infinite',
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Safe"
                          color="success"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(row)}
                            sx={{ 
                              background: 'rgba(33, 150, 243, 0.2)',
                              '&:hover': { background: 'rgba(33, 150, 243, 0.3)' },
                            }}
                          >
                            <VisibilityIcon fontSize="small" sx={{ color: '#2196f3' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Analyze Pattern">
                          <IconButton 
                            size="small" 
                            onClick={() => handleAnalyze(row.id)}
                            sx={{ 
                              background: 'rgba(156, 39, 176, 0.2)',
                              '&:hover': { background: 'rgba(156, 39, 176, 0.3)' },
                            }}
                          >
                            <TimelineIcon fontSize="small" sx={{ color: '#9c27b0' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              '& .MuiTablePagination-selectIcon': {
                color: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          />
        </TableContainer>
      </Fade>

      {/* Live Activity Feed */}
      <Fade in timeout={1800}>
        <Paper sx={{ 
          p: 2, 
          mt: 3, 
          background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(10, 25, 41, 0.9))',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BoltIcon sx={{ color: '#ff9800', animation: 'pulse 1s infinite' }} /> Live Activity Feed
          </Typography>
          <Box sx={{ display: 'flex', overflow: 'hidden', gap: 2 }}>
            {[
              { text: 'New HTTPS connection from New York', time: '2s ago', color: '#4caf50', icon: <ArrowUpwardIcon /> },
              { text: 'Suspicious SSH activity detected', time: '5s ago', color: '#f44336', icon: <WarningIcon /> },
              { text: 'Bandwidth spike: 2.1 Gbps', time: '12s ago', color: '#2196f3', icon: <TrendingUpIcon /> },
              { text: 'Malware signature matched', time: '25s ago', color: '#ff9800', icon: <SecurityIcon /> },
              { text: 'Node restoration complete', time: '38s ago', color: '#9c27b0', icon: <CheckCircleIcon /> },
            ].map((activity, idx) => (
              <Box 
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.05)',
                  minWidth: 300,
                  animation: `slideIn ${5 + idx * 2}s infinite linear`,
                }}
              >
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: activity.color,
                  animation: 'pulse 2s infinite',
                }} />
                {activity.icon}
                <Typography variant="body2" sx={{ color: 'white', flex: 1 }}>{activity.text}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace' }}>
                  {activity.time}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Fade>

      {/* Traffic Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(90deg, #2196f3, #4dabf5)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <InsightsIcon /> Traffic Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedTraffic && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Connection Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Source Node</Typography>
                    <Typography variant="body1">{selectedTraffic.source}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Destination</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedTraffic.destination}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Protocol</Typography>
                    <Chip label={selectedTraffic.protocol} color="primary" size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Threat Level</Typography>
                    <Chip 
                      label={selectedTraffic.threat.toUpperCase()} 
                      color={getThreatColor(selectedTraffic.threat)}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Security Analysis</Typography>
                <Paper sx={{ p: 2, background: selectedTraffic.malicious ? '#fff3e0' : '#e8f5e9' }}>
                  {selectedTraffic.malicious ? (
                    <Alert severity="warning" icon={<WarningIcon />}>
                      Malicious activity detected - This connection exhibits suspicious patterns
                    </Alert>
                  ) : (
                    <Alert severity="success" icon={<CheckCircleIcon />}>
                      Secure connection - No threats detected
                    </Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained" color="primary">View Full Analysis</Button>
        </DialogActions>
      </Dialog>

      {/* Global Animation Styles */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px currentColor; }
            50% { box-shadow: 0 0 15px currentColor; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes slideIn {
            0% { transform: translateX(100%); opacity: 0; }
            10%, 90% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(-100%); opacity: 0; }
          }
          
          @keyframes progressPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes fadeInOut {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
        `}
      </style>
    </Box>
  );
};

export default Traffic;