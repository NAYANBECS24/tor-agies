import React, { useState, useEffect, useRef } from 'react';
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
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AvatarGroup,
  Avatar,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Switch,
  FormControlLabel,
  Fade,
  Zoom,
  Grow,
  Slide,
  CircularProgress,
} from '@mui/material';
import {
  NetworkCheck,
  DeviceHub,
  Public,
  VpnKey,
  Security,
  Speed,
  Timeline,
  FilterList,
  Fullscreen,
  ZoomIn,
  ZoomOut,
  Refresh,
  Download,
  Settings,
  Warning,
  CheckCircle,
  Error,
  LocationOn,
  SwapVert,
  Hub,
  Router,
  Cloud,
  Wifi,
  Satellite,
  LocationSearching,
  Layers,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  Map as MapIcon,
  Bolt,
  SatelliteAlt,
  Radar,
  SignalCellularAlt,
  NetworkPing,
  NetworkLocked,
  SecurityUpdateGood,
  AutoGraph,
  Animation,
  PlayArrow,
  Pause,
  Speed as SpeedIcon,
} from '@mui/icons-material';
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
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

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

const NetworkMap = () => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState('geographic');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [connectionCount, setConnectionCount] = useState(18542);
  const [activeNodes, setActiveNodes] = useState(2450);
  const [threatLevel, setThreatLevel] = useState('Low');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedNode, setSelectedNode] = useState(null);
  const [pulseAnimations, setPulseAnimations] = useState([]);
  const [connectionLines, setConnectionLines] = useState([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastUpdateRef = useRef(null);

  // Real-time data updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Simulate real-time data changes
        setConnectionCount(prev => prev + Math.floor(Math.random() * 100) - 20);
        setActiveNodes(prev => {
          const change = Math.floor(Math.random() * 10) - 2;
          return Math.max(2300, Math.min(2500, prev + change));
        });
        setLastUpdate(new Date());
        
        // Add random pulse animations
        if (Math.random() > 0.7) {
          const newPulse = {
            id: Date.now(),
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            type: Math.random() > 0.3 ? 'connection' : 'alert',
          };
          setPulseAnimations(prev => [...prev.slice(-5), newPulse]);
          
          setTimeout(() => {
            setPulseAnimations(prev => prev.filter(p => p.id !== newPulse.id));
          }, 2000);
        }
        
        // Update connection lines
        if (Math.random() > 0.5) {
          const newLine = {
            id: Date.now(),
            fromX: Math.random() * 100,
            fromY: Math.random() * 100,
            toX: Math.random() * 100,
            toY: Math.random() * 100,
            active: true,
          };
          setConnectionLines(prev => [...prev.slice(-20), newLine]);
          
          setTimeout(() => {
            setConnectionLines(prev => prev.filter(l => l.id !== newLine.id));
          }, 1000);
        }
      }, 3000 / animationSpeed);

      return () => clearInterval(interval);
    }
  }, [isLive, animationSpeed]);

  // Animation frame for real-time connections
  useEffect(() => {
    const animate = () => {
      if (canvasRef.current && isLive) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw animated background grid
        drawGrid(ctx, canvas);
        
        // Draw animated connection lines
        connectionLines.forEach(line => {
          drawConnectionLine(ctx, line);
        });
        
        // Draw pulse animations
        pulseAnimations.forEach(pulse => {
          drawPulse(ctx, pulse);
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isLive) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLive, connectionLines, pulseAnimations]);

  const drawGrid = (ctx, canvas) => {
    const gridSize = 40;
    const time = Date.now() * 0.001;
    
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines with subtle animation
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(time + x * 0.01) * 2, 0);
      ctx.lineTo(x + Math.sin(time + x * 0.01) * 2, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines with subtle animation
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.cos(time + y * 0.01) * 2);
      ctx.lineTo(canvas.width, y + Math.cos(time + y * 0.01) * 2);
      ctx.stroke();
    }
  };

  const drawConnectionLine = (ctx, line) => {
    const progress = (Date.now() - line.id) / 1000;
    const alpha = Math.max(0, 1 - progress);
    
    ctx.beginPath();
    ctx.moveTo(line.fromX, line.fromY);
    ctx.lineTo(line.toX, line.toY);
    ctx.strokeStyle = `rgba(33, 150, 243, ${alpha * 0.5})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw moving dot along the line
    const dotProgress = progress % 1;
    const dotX = line.fromX + (line.toX - line.fromX) * dotProgress;
    const dotY = line.fromY + (line.toY - line.fromY) * dotProgress;
    
    ctx.beginPath();
    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(33, 150, 243, ${alpha})`;
    ctx.fill();
  };

  const drawPulse = (ctx, pulse) => {
    const progress = (Date.now() - pulse.id) / 2000;
    if (progress >= 1) return;
    
    const radius = progress * 50;
    const alpha = 1 - progress;
    const color = pulse.type === 'alert' ? '255, 87, 34' : '33, 150, 243';
    
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color}, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, 1)`;
    ctx.fill();
  };

  const nodes = [
    { id: 1, type: 'guard', country: 'US', status: 'active', connections: 42, name: 'GuardNode-01', ip: '192.168.1.10', location: 'New York', latency: 24, bandwidth: '1.2 Gbps' },
    { id: 2, type: 'relay', country: 'DE', status: 'active', connections: 35, name: 'RelayNode-05', ip: '192.168.1.11', location: 'Berlin', latency: 18, bandwidth: '980 Mbps' },
    { id: 3, type: 'exit', country: 'NL', status: 'active', connections: 28, name: 'ExitNode-03', ip: '192.168.1.12', location: 'Amsterdam', latency: 32, bandwidth: '2.1 Gbps' },
    { id: 4, type: 'bridge', country: 'SE', status: 'warning', connections: 15, name: 'Bridge-07', ip: '192.168.1.13', location: 'Stockholm', latency: 45, bandwidth: '650 Mbps' },
    { id: 5, type: 'guard', country: 'CA', status: 'active', connections: 38, name: 'GuardNode-02', ip: '192.168.1.14', location: 'Toronto', latency: 29, bandwidth: '1.5 Gbps' },
    { id: 6, type: 'relay', country: 'JP', status: 'error', connections: 8, name: 'RelayNode-12', ip: '192.168.1.15', location: 'Tokyo', latency: 120, bandwidth: '320 Mbps' },
    { id: 7, type: 'exit', country: 'SG', status: 'active', connections: 31, name: 'ExitNode-08', ip: '192.168.1.16', location: 'Singapore', latency: 68, bandwidth: '1.8 Gbps' },
    { id: 8, type: 'bridge', country: 'CH', status: 'active', connections: 22, name: 'Bridge-04', ip: '192.168.1.17', location: 'Zurich', latency: 22, bandwidth: '890 Mbps' },
  ];

  const stats = [
    { 
      label: 'Total Nodes', 
      value: activeNodes.toLocaleString(), 
      color: '#2196f3', 
      icon: <DeviceHub />,
      change: '+2.4%',
      trend: 'up'
    },
    { 
      label: 'Active Connections', 
      value: connectionCount.toLocaleString(), 
      color: '#4caf50', 
      icon: <Hub />,
      change: '+156',
      trend: 'up'
    },
    { 
      label: 'Countries', 
      value: '87', 
      color: '#9c27b0', 
      icon: <Public />,
      change: 'Active',
      trend: 'stable'
    },
    { 
      label: 'Threat Level', 
      value: threatLevel, 
      color: threatLevel === 'Low' ? '#4caf50' : threatLevel === 'Medium' ? '#ff9800' : '#f44336', 
      icon: <Security />,
      change: 'Monitoring',
      trend: 'stable'
    },
  ];

  const trafficData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    datasets: [
      {
        label: 'Incoming Traffic',
        data: [12500, 11000, 18500, 22000, 24500, 21000, 16500],
        borderColor: 'rgba(33, 150, 243, 0.8)',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Outgoing Traffic',
        data: [8500, 9200, 12500, 18500, 21000, 16500, 12500],
        borderColor: 'rgba(76, 175, 80, 0.8)',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ]
  };

  const nodeDistributionData = {
    labels: ['Guard Nodes', 'Relay Nodes', 'Exit Nodes', 'Bridges'],
    datasets: [
      {
        data: [850, 1200, 320, 80],
        backgroundColor: [
          'rgba(33, 150, 243, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(156, 39, 176, 0.8)',
        ],
        borderColor: [
          'rgba(33, 150, 243, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(156, 39, 176, 1)',
        ],
        borderWidth: 2,
      }
    ]
  };

  const getNodeColor = (type) => {
    switch(type) {
      case 'guard': return '#2196f3';
      case 'relay': return '#4caf50';
      case 'exit': return '#f44336';
      case 'bridge': return '#9c27b0';
      default: return '#607d8b';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'warning': return <Warning sx={{ color: '#ff9800' }} />;
      case 'error': return <Error sx={{ color: '#f44336' }} />;
      default: return <CheckCircle sx={{ color: '#4caf50' }} />;
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    // Add pulse animation on node click
    const newPulse = {
      id: Date.now(),
      x: 50,
      y: 50,
      type: 'alert',
    };
    setPulseAnimations(prev => [...prev, newPulse]);
    
    setTimeout(() => {
      setPulseAnimations(prev => prev.filter(p => p.id !== newPulse.id));
    }, 2000);
  };

  const handleRefresh = () => {
    // Simulate refresh with animations
    setIsLive(false);
    setTimeout(() => {
      setConnectionCount(18542 + Math.floor(Math.random() * 1000));
      setActiveNodes(2450 + Math.floor(Math.random() * 50));
      setLastUpdate(new Date());
      setIsLive(true);
    }, 500);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Live Status */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <NetworkCheck sx={{ fontSize: 40, color: '#2196f3' }} />
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  color: 'white',
                  background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Network Map Dashboard
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Real-time visualization of global Tor network infrastructure
                </Typography>
              </Box>
            </Box>
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
                '&:hover': { background: isLive ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)' }
              }}
            >
              {isLive ? <Pause sx={{ color: '#f44336' }} /> : <PlayArrow sx={{ color: '#4caf50' }} />}
            </IconButton>
          </Box>
        </Box>
      </Fade>

      {/* Real-time Stats */}
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
                          'linear-gradient(135deg, #4caf50, #81c784)' :
                          stat.trend === 'down' ? 
                          'linear-gradient(135deg, #f44336, #e57373)' :
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      Last updated: {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        ))}
      </Grid>

      {/* Main Dashboard Grid */}
      <Grid container spacing={3}>
        {/* Network Visualization with Canvas */}
        <Grid item xs={12} lg={8}>
          <Grow in timeout={800}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(10, 25, 41, 0.9))',
              mb: 3,
              border: '1px solid rgba(33, 150, 243, 0.3)',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SatelliteAlt sx={{ animation: 'spin 20s linear infinite' }} /> Global Network Map
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Speed: {animationSpeed}x
                    </Typography>
                    <Slider
                      value={animationSpeed}
                      onChange={(e, value) => setAnimationSpeed(value)}
                      min={0.5}
                      max={3}
                      step={0.5}
                      sx={{ width: 100, color: '#2196f3' }}
                    />
                    <IconButton onClick={handleRefresh} sx={{ animation: isLive ? 'spin 2s linear infinite' : 'none' }}>
                      <Refresh />
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Interactive Network Canvas */}
                <Box sx={{ 
                  position: 'relative',
                  background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.9), rgba(19, 47, 76, 0.9))',
                  borderRadius: 2,
                  border: '1px solid rgba(33, 150, 243, 0.2)',
                  overflow: 'hidden',
                  height: 400,
                }}>
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'transparent',
                    }}
                  />
                  
                  {/* Animated Nodes Overlay */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0,
                    pointerEvents: 'none',
                  }}>
                    {nodes.map((node, index) => {
                      const angle = (index / nodes.length) * 2 * Math.PI;
                      const x = 50 + 35 * Math.cos(angle);
                      const y = 50 + 35 * Math.sin(angle);
                      
                      return (
                        <Tooltip key={node.id} title={`${node.name} - ${node.location}`} arrow>
                          <Box
                            onClick={() => handleNodeClick(node)}
                            sx={{
                              position: 'absolute',
                              left: `${x}%`,
                              top: `${y}%`,
                              transform: 'translate(-50%, -50%)',
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: `radial-gradient(circle, ${getNodeColor(node.type)} 0%, ${getNodeColor(node.type)}80 100%)`,
                              cursor: 'pointer',
                              animation: `
                                float 3s ease-in-out infinite,
                                ${node.status === 'active' ? 'pulseGlow 2s infinite' : 'none'}
                              `,
                              boxShadow: `0 0 20px ${getNodeColor(node.type)}`,
                              border: '2px solid white',
                              transition: 'all 0.3s',
                              '&:hover': {
                                transform: 'translate(-50%, -50%) scale(1.5)',
                                boxShadow: `0 0 30px ${getNodeColor(node.type)}`,
                                zIndex: 10,
                              },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {getStatusIcon(node.status)}
                          </Box>
                        </Tooltip>
                      );
                    })}
                    
                    {/* Central Hub */}
                    <Box sx={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.8) 100%)',
                      animation: 'pulseHub 3s infinite',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(33, 150, 243, 0.5)',
                    }}>
                      <Hub sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                  </Box>
                </Box>
                
                {/* Live Activity Feed */}
                <Box sx={{ mt: 3, p: 2, background: 'rgba(0, 0, 0, 0.2)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    <SpeedIcon sx={{ fontSize: 14, mr: 1, animation: 'pulse 1s infinite' }} />
                    Live Activity Feed
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                    {[
                      { text: 'New connection from New York', time: '2s ago', color: '#4caf50' },
                      { text: 'Bandwidth spike detected', time: '5s ago', color: '#ff9800' },
                      { text: 'Node Tokyo restored', time: '12s ago', color: '#2196f3' },
                      { text: 'Security scan completed', time: '25s ago', color: '#9c27b0' },
                    ].map((activity, idx) => (
                      <Box 
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1,
                          borderRadius: 1,
                          background: 'rgba(255, 255, 255, 0.05)',
                          minWidth: 250,
                          animation: `slideIn ${3 + idx}s infinite`,
                        }}
                      >
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: activity.color }} />
                        <Typography variant="caption" sx={{ color: 'white' }}>{activity.text}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', ml: 'auto' }}>
                          {activity.time}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Right Panel - Controls & Analytics */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Live Traffic Chart */}
            <Zoom in timeout={600}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(10, 25, 41, 0.9))',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                backdropFilter: 'blur(10px)',
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon sx={{ animation: 'pulse 2s infinite' }} /> Live Traffic
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <Line 
                      data={trafficData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                          duration: 2000,
                          easing: 'easeInOutQuart'
                        },
                        plugins: {
                          legend: {
                            labels: {
                              color: 'rgba(255, 255, 255, 0.8)'
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                          },
                          y: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>

            {/* Node Distribution */}
            <Zoom in timeout={800}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(10, 25, 41, 0.9))',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                backdropFilter: 'blur(10px)',
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PieChartIcon sx={{ animation: 'spin 10s linear infinite' }} /> Node Distribution
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <Doughnut 
                      data={nodeDistributionData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                          animateRotate: true,
                          animateScale: true,
                          duration: 2000
                        },
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              color: 'rgba(255, 255, 255, 0.8)'
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Box>
        </Grid>
      </Grid>

      {/* Node Details Table */}
      <Fade in timeout={1000}>
        <Card sx={{ 
          mt: 3,
          background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(10, 25, 41, 0.9))',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Radar sx={{ animation: 'pulse 1.5s infinite' }} /> Active Nodes Monitoring
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Node</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Location</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Latency</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Bandwidth</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Status</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Health</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nodes.map((node) => (
                    <TableRow 
                      key={node.id} 
                      hover
                      onClick={() => handleNodeClick(node)}
                      sx={{ 
                        cursor: 'pointer',
                        animation: node.status === 'active' ? 'fadeInOut 3s infinite' : 'none',
                        '&:hover': {
                          background: 'rgba(33, 150, 243, 0.1)',
                        }
                      }}
                    >
                      <TableCell sx={{ color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            background: getNodeColor(node.type),
                            animation: 'pulse 2s infinite'
                          }} />
                          {node.name}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 14 }} />
                          {node.location}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${node.latency}ms`}
                          size="small"
                          sx={{
                            backgroundColor: node.latency < 50 ? 'rgba(76, 175, 80, 0.2)' : 
                                           node.latency < 100 ? 'rgba(255, 152, 0, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                            color: node.latency < 50 ? '#4caf50' : 
                                   node.latency < 100 ? '#ff9800' : '#f44336',
                            fontFamily: 'monospace',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontFamily: 'monospace' }}>
                        {node.bandwidth}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(node.status)}
                          <Typography variant="body2" sx={{ 
                            color: node.status === 'active' ? '#4caf50' : 
                                   node.status === 'warning' ? '#ff9800' : '#f44336'
                          }}>
                            {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <LinearProgress 
                          variant="determinate" 
                          value={node.status === 'active' ? 95 : node.status === 'warning' ? 65 : 30}
                          sx={{ 
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: node.status === 'active' ? 
                                'linear-gradient(90deg, #4caf50, #81c784)' :
                                node.status === 'warning' ? 
                                'linear-gradient(90deg, #ff9800, #ffb74d)' :
                                'linear-gradient(90deg, #f44336, #e57373)',
                              animation: 'progressPulse 2s infinite',
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Fade>

      {/* Global Animation Styles */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
          
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 10px var(--node-color); }
            50% { box-shadow: 0 0 25px var(--node-color); }
            100% { box-shadow: 0 0 10px var(--node-color); }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px currentColor; }
            50% { box-shadow: 0 0 15px currentColor; }
          }
          
          @keyframes float {
            0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
            50% { transform: translate(-50%, -50%) translateY(-10px); }
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
          
          @keyframes pulseHub {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.1); }
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
            50% { transform: translateY(-5px); }
          }
        `}
      </style>
    </Box>
  );
};

export default NetworkMap;