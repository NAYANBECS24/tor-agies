import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Button,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import {
  Radar as RadarIcon,
  Timeline as TimelineIcon,
  FilterAlt as FilterAltIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Insights as InsightsIcon,
  DataArray as DataArrayIcon,
  Psychology as PsychologyIcon,
  Notifications as NotificationsIcon,
  AutoGraph as AutoGraphIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

const PatternRecognition = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [anomalyThreshold, setAnomalyThreshold] = useState(75);
  const [patterns, setPatterns] = useState([]);
  const [detectedPatterns, setDetectedPatterns] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const colors = {
    primary: '#6c5ce7',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#d63031',
    info: '#0984e3',
    purple: '#a29bfe',
    pink: '#fd79a8',
  };

  // Generate mock pattern data
  const generatePatternData = () => {
    const patternTypes = [
      { id: 1, name: 'DDoS Attack Pattern', type: 'malicious', confidence: 94, severity: 'high', frequency: 'hourly', color: colors.error },
      { id: 2, name: 'Port Scanning Pattern', type: 'suspicious', confidence: 87, severity: 'medium', frequency: 'daily', color: colors.warning },
      { id: 3, name: 'Data Exfiltration', type: 'malicious', confidence: 92, severity: 'critical', frequency: 'weekly', color: colors.error },
      { id: 4, name: 'Normal Traffic Pattern', type: 'normal', confidence: 98, severity: 'low', frequency: 'continuous', color: colors.success },
      { id: 5, name: 'Brute Force Attempt', type: 'malicious', confidence: 89, severity: 'high', frequency: 'hourly', color: colors.error },
      { id: 6, name: 'Botnet Activity', type: 'malicious', confidence: 91, severity: 'critical', frequency: 'daily', color: colors.error },
      { id: 7, name: 'Encrypted Tunnel', type: 'suspicious', confidence: 76, severity: 'medium', frequency: 'weekly', color: colors.warning },
      { id: 8, name: 'TOR Exit Node Pattern', type: 'monitored', confidence: 82, severity: 'low', frequency: 'continuous', color: colors.info },
    ];

    const patternData = [];
    for (let i = 0; i < 30; i++) {
      patternData.push({
        hour: i,
        ddos: Math.random() * 100,
        scanning: Math.random() * 80,
        exfiltration: Math.random() * 60,
        normal: 100 - Math.random() * 30,
        botnet: Math.random() * 70,
      });
    }

    const detected = [
      { id: 1, pattern: 'DDoS Attack', time: '2024-01-15 14:30', confidence: 94, action: 'blocked', source: 'Multiple IPs' },
      { id: 2, pattern: 'Port Scanning', time: '2024-01-15 12:15', confidence: 87, action: 'monitored', source: '192.168.1.45' },
      { id: 3, pattern: 'Data Exfiltration', time: '2024-01-14 22:45', confidence: 92, action: 'blocked', source: '10.0.0.12' },
      { id: 4, pattern: 'Brute Force', time: '2024-01-14 18:20', confidence: 89, action: 'blocked', source: 'External' },
      { id: 5, pattern: 'Botnet C&C', time: '2024-01-14 09:15', confidence: 91, action: 'isolated', source: 'Malware IP' },
    ];

    setPatterns(patternTypes);
    setDetectedPatterns(detected);
  };

  useEffect(() => {
    generatePatternData();
  }, []);

  const startTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 200);
  };

  const patternRadarData = [
    { subject: 'DDoS', A: 94, fullMark: 100 },
    { subject: 'Scanning', A: 87, fullMark: 100 },
    { subject: 'Exfiltration', A: 92, fullMark: 100 },
    { subject: 'Brute Force', A: 89, fullMark: 100 },
    { subject: 'Botnet', A: 91, fullMark: 100 },
    { subject: 'Tunneling', A: 76, fullMark: 100 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              <RadarIcon sx={{ mr: 2, verticalAlign: 'middle', color: colors.primary }} />
              Pattern Recognition
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              AI-powered pattern detection and anomaly identification
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ color: 'white' }}
              >
                <MenuItem value="24h">Last 24 hours</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={generatePatternData}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={isTraining ? <AutoGraphIcon /> : <PsychologyIcon />}
              onClick={startTraining}
              disabled={isTraining}
              sx={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.purple})` }}
            >
              {isTraining ? 'Training...' : 'Train Model'}
            </Button>
          </Box>
        </Box>

        {/* Training Progress */}
        {isTraining && (
          <Paper sx={{ p: 2, mb: 3, background: 'rgba(19, 47, 76, 0.5)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <AutoGraphIcon sx={{ color: colors.primary }} />
              <Typography variant="subtitle1">Model Training in Progress</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={trainingProgress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.purple})`,
                }
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {trainingProgress.toFixed(1)}% - Learning from network patterns...
            </Typography>
          </Paper>
        )}

        {/* Controls */}
        <Paper sx={{ p: 2, mb: 3, background: 'rgba(19, 47, 76, 0.5)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Typography gutterBottom>Anomaly Threshold</Typography>
              <Slider
                value={anomalyThreshold}
                onChange={(e, val) => setAnomalyThreshold(val)}
                min={50}
                max={95}
                marks={[
                  { value: 50, label: 'Low' },
                  { value: 75, label: 'Medium' },
                  { value: 95, label: 'High' },
                ]}
                sx={{ color: colors.primary }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Current threshold: {anomalyThreshold}% confidence
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search patterns..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Real-time Detection"
                sx={{ color: 'text.primary' }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Pattern Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {patterns.map((pattern) => (
          <Grid item xs={12} sm={6} md={3} key={pattern.id}>
            <Card sx={{ 
              background: `linear-gradient(135deg, rgba(19, 47, 76, 0.8), ${pattern.color}10)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${pattern.color}30`,
              height: '100%',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.3s ease',
              }
            }}
            onClick={() => setSelectedPattern(pattern)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {pattern.type.toUpperCase()}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {pattern.name}
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: `${pattern.color}20`, 
                    color: pattern.color,
                    width: 40,
                    height: 40,
                  }}>
                    {pattern.severity === 'critical' ? <ErrorIcon /> : 
                     pattern.severity === 'high' ? <WarningIcon /> : <CheckCircleIcon />}
                  </Avatar>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Confidence Score
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={pattern.confidence} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: pattern.color,
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
                    {pattern.confidence}%
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Chip 
                    label={pattern.severity} 
                    size="small"
                    sx={{
                      background: pattern.severity === 'critical' ? colors.error : 
                                 pattern.severity === 'high' ? colors.warning : colors.success,
                      color: 'white',
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {pattern.frequency}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            background: 'rgba(19, 47, 76, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(66, 165, 245, 0.2)',
            height: '400px',
          }}>
            <CardHeader
              title="Pattern Detection Over Time"
              action={
                <Chip 
                  icon={<TrendingUpIcon />} 
                  label="30% increase" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              }
            />
            <CardContent sx={{ height: 'calc(100% - 70px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={Array.from({ length: 24 }, (_, i) => ({
                  hour: i,
                  ddos: Math.sin(i / 3) * 30 + 50 + Math.random() * 20,
                  scanning: Math.cos(i / 4) * 20 + 40 + Math.random() * 15,
                  exfiltration: Math.sin(i / 2) * 25 + 30 + Math.random() * 10,
                  normal: 100 - Math.abs(Math.sin(i / 5)) * 20,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Detection Rate %', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: 'rgba(10, 25, 41, 0.95)',
                      border: '1px solid rgba(66, 165, 245, 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ddos" 
                    stroke={colors.error} 
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    name="DDoS Patterns"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="scanning" 
                    stroke={colors.warning} 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name="Scanning Patterns"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="exfiltration" 
                    stroke={colors.pink} 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name="Exfiltration"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="normal" 
                    stroke={colors.success} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Normal Patterns"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'rgba(19, 47, 76, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(66, 165, 245, 0.2)',
            height: '400px',
          }}>
            <CardHeader title="Pattern Confidence Radar" />
            <CardContent sx={{ height: 'calc(100% - 70px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={patternRadarData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.3)" />
                  <PolarAngleAxis dataKey="subject" stroke="rgba(255, 255, 255, 0.7)" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.3)" />
                  <Radar
                    name="Detection Rate"
                    dataKey="A"
                    stroke={colors.primary}
                    fill={colors.primary}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <RechartsTooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detected Patterns Table */}
      <Card sx={{ 
        background: 'rgba(19, 47, 76, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(66, 165, 245, 0.2)',
      }}>
        <CardHeader 
          title="Recently Detected Patterns"
          action={
            <Button startIcon={<DownloadIcon />} size="small">
              Export Data
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pattern Type</TableCell>
                  <TableCell>Detection Time</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Action Taken</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detectedPatterns.map((detection) => (
                  <TableRow key={detection.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {detection.confidence > 90 ? 
                          <ErrorIcon sx={{ color: colors.error, mr: 1 }} /> : 
                          <WarningIcon sx={{ color: colors.warning, mr: 1 }} />
                        }
                        {detection.pattern}
                      </Box>
                    </TableCell>
                    <TableCell>{detection.time}</TableCell>
                    <TableCell>
                      <LinearProgress 
                        variant="determinate" 
                        value={detection.confidence} 
                        sx={{ 
                          width: 60,
                          height: 6,
                          borderRadius: 3,
                          background: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: detection.confidence > 90 ? colors.error : colors.warning,
                          }
                        }}
                      />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {detection.confidence}%
                      </Typography>
                    </TableCell>
                    <TableCell>{detection.source}</TableCell>
                    <TableCell>
                      <Chip 
                        label={detection.action} 
                        size="small"
                        sx={{
                          background: detection.action === 'blocked' ? colors.error : 
                                     detection.action === 'isolated' ? colors.warning : colors.success,
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        Analyze
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Selected Pattern Details Dialog */}
      {selectedPattern && (
        <Card sx={{ mt: 3, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Pattern Analysis: {selectedPattern.name}
            </Typography>
            <IconButton onClick={() => setSelectedPattern(null)}>
              <ErrorIcon />
            </IconButton>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Pattern Characteristics</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Type" secondary={selectedPattern.type} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Severity" secondary={selectedPattern.severity} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Frequency" secondary={selectedPattern.frequency} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Confidence Score" secondary={`${selectedPattern.confidence}%`} />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">Recommended Actions</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Isolate affected systems" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Notify security team" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InsightsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Analyze attack vectors" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DataArrayIcon />
                  </ListItemIcon>
                  <ListItemText primary="Update detection rules" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Card>
      )}
    </Box>
  );
};

export default PatternRecognition;