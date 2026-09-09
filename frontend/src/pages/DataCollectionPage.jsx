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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Slider,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  CloudDownload as CloudDownloadIcon,
  DataArray as DataArrayIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { dataCollectionApi } from '../api/tor';

const DataCollectionPage = () => {
  const [collectionStatus, setCollectionStatus] = useState({
    active: false,
    totalData: 1245000,
    rate: 1200,
    startTime: new Date(Date.now() - 3600000).toISOString(),
    memoryUsage: '2.4GB',
    diskUsage: '45GB'
  });
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [collectionSources, setCollectionSources] = useState([
    { id: 'source-1', name: 'Tor Network Metrics', status: 'active', rate: '450/sec', type: 'metrics' },
    { id: 'source-2', name: 'Node Status Updates', status: 'active', rate: '320/sec', type: 'nodes' },
    { id: 'source-3', name: 'Traffic Logs', status: 'active', rate: '280/sec', type: 'traffic' },
    { id: 'source-4', name: 'Threat Intelligence', status: 'paused', rate: '150/sec', type: 'threats' },
    { id: 'source-5', name: 'System Performance', status: 'active', rate: '80/sec', type: 'system' },
  ]);
  const [collectedData, setCollectedData] = useState([
    { id: 'data-1', type: 'traffic', size: '2.4MB', timestamp: new Date().toISOString(), source: 'ExitNode03' },
    { id: 'data-2', type: 'metrics', size: '1.8MB', timestamp: new Date(Date.now() - 5000).toISOString(), source: 'GuardNode01' },
    { id: 'data-3', type: 'nodes', size: '890KB', timestamp: new Date(Date.now() - 10000).toISOString(), source: 'RelayNode42' },
    { id: 'data-4', type: 'threats', size: '450KB', timestamp: new Date(Date.now() - 15000).toISOString(), source: 'ThreatIntel' },
    { id: 'data-5', type: 'system', size: '120KB', timestamp: new Date(Date.now() - 20000).toISOString(), source: 'SystemMonitor' },
  ]);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const response = await dataCollectionApi.getStatus();
      setCollectionStatus(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Error loading collection status:', error);
    }
  };

  const updateStats = () => {
    if (collectionStatus.active) {
      setCollectionStatus(prev => ({
        ...prev,
        totalData: prev.totalData + Math.floor(prev.rate / 12),
        rate: prev.rate + (Math.random() > 0.5 ? 10 : -10)
      }));
    }
  };

  const handleStartCollection = async () => {
    setIsStarting(true);
    try {
      await dataCollectionApi.startCollection();
      setCollectionStatus(prev => ({ ...prev, active: true, startTime: new Date().toISOString() }));
    } catch (error) {
      console.error('Error starting collection:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopCollection = async () => {
    setIsStopping(true);
    try {
      await dataCollectionApi.stopCollection();
      setCollectionStatus(prev => ({ ...prev, active: false }));
    } catch (error) {
      console.error('Error stopping collection:', error);
    } finally {
      setIsStopping(false);
    }
  };

  const handleToggleSource = (sourceId) => {
    setCollectionSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, status: source.status === 'active' ? 'paused' : 'active' }
        : source
    ));
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(collectedData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `collected_data_${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getUptime = () => {
    if (!collectionStatus.startTime) return '0s';
    const uptime = Date.now() - new Date(collectionStatus.startTime).getTime();
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold', 
            background: 'linear-gradient(45deg, #607d8b, #78909c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Data Collection Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time data gathering and aggregation from multiple sources
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export Collected Data">
            <IconButton onClick={handleExportData}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStatus}
          >
            Refresh
          </Button>
          {collectionStatus.active ? (
            <Button
              variant="contained"
              color="error"
              startIcon={isStopping ? <CircularProgress size={20} /> : <StopIcon />}
              onClick={handleStopCollection}
              disabled={isStopping}
              sx={{
                background: 'linear-gradient(135deg, #f44336, #e57373)',
                boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
              }}
            >
              {isStopping ? 'Stopping...' : 'Stop Collection'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={isStarting ? <CircularProgress size={20} /> : <PlayIcon />}
              onClick={handleStartCollection}
              disabled={isStarting}
              sx={{
                background: 'linear-gradient(135deg, #4caf50, #81c784)',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
            >
              {isStarting ? 'Starting...' : 'Start Collection'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(96, 125, 139, 0.1), rgba(96, 125, 139, 0.05))',
            border: `1px solid ${collectionStatus.active ? '#4caf50' : '#f44336'}40`,
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <StorageIcon sx={{ 
                  color: collectionStatus.active ? '#4caf50' : '#f44336', 
                  fontSize: 32 
                }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {(collectionStatus.totalData / 1000000).toFixed(1)}M
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Data
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ 
                color: collectionStatus.active ? '#4caf50' : '#f44336',
                fontWeight: 'bold'
              }}>
                {collectionStatus.active ? 'ACTIVE' : 'INACTIVE'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05))',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <SpeedIcon sx={{ color: '#2196f3', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {collectionStatus.rate}/s
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Collection Rate
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(collectionStatus.rate / 2000 * 100, 100)}
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #2196f3, #4dabf5)'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05))',
            border: '1px solid rgba(255, 152, 0, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TimelineIcon sx={{ color: '#ff9800', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {getUptime()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uptime
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Since: {new Date(collectionStatus.startTime).toLocaleTimeString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(156, 39, 176, 0.05))',
            border: '1px solid rgba(156, 39, 176, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CloudDownloadIcon sx={{ color: '#9c27b0', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {collectionSources.filter(s => s.status === 'active').length}/5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Sources
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Sources & Controls */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Collection Sources
              </Typography>
              <Button size="small" startIcon={<SettingsIcon />}>
                Configure
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Source Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Collection Rate</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collectionSources.map((source) => (
                    <TableRow key={source.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DataArrayIcon fontSize="small" color="action" />
                          <Typography sx={{ fontWeight: 'medium' }}>
                            {source.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={source.type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={source.status}
                          size="small"
                          sx={{
                            background: source.status === 'active' ? 
                              'linear-gradient(135deg, #4caf50, #81c784)' :
                              'linear-gradient(135deg, #ff9800, #ffb74d)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 'medium' }}>
                          {source.rate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title={source.status === 'active' ? 'Pause Source' : 'Activate Source'}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleToggleSource(source.id)}
                              color={source.status === 'active' ? 'warning' : 'success'}
                            >
                              {source.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Source Settings">
                            <IconButton size="small">
                              <SettingsIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Recent Collected Data */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Recently Collected Data
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collectedData.map((data) => (
                    <TableRow key={data.id} hover>
                      <TableCell>
                        <Chip 
                          label={data.type}
                          size="small"
                          sx={{
                            background: data.type === 'traffic' ? 
                              'linear-gradient(135deg, #2196f3, #4dabf5)' :
                              data.type === 'metrics' ? 
                              'linear-gradient(135deg, #4caf50, #81c784)' :
                              data.type === 'nodes' ? 
                              'linear-gradient(135deg, #ff9800, #ffb74d)' :
                              'linear-gradient(135deg, #9c27b0, #ba68c8)',
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography>{data.size}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{data.source}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(data.timestamp).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<CheckCircleIcon />}
                          label="Processed"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column - Controls & Settings */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Collection Controls
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Collection Rate Limit</Typography>
              <Slider
                value={2000}
                min={100}
                max={5000}
                step={100}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}/sec`}
                sx={{ color: '#607d8b' }}
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Buffer Size</InputLabel>
              <Select value="1GB" label="Buffer Size">
                <MenuItem value="256MB">256 MB</MenuItem>
                <MenuItem value="512MB">512 MB</MenuItem>
                <MenuItem value="1GB">1 GB</MenuItem>
                <MenuItem value="2GB">2 GB</MenuItem>
                <MenuItem value="4GB">4 GB</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-start on boot"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Compress collected data"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Retain historical data"
              sx={{ display: 'block' }}
            />

            <Divider sx={{ my: 3 }} />

            <Button
              variant="outlined"
              fullWidth
              startIcon={<DownloadIcon />}
              onClick={handleExportData}
              sx={{ mb: 2 }}
            >
              Export All Data
            </Button>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<UploadIcon />}
            >
              Import Configuration
            </Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              System Resources
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Memory Usage</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {collectionStatus.memoryUsage}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={45}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #2196f3, #4dabf5)'
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Disk Usage</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {collectionStatus.diskUsage}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={65}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #4caf50, #81c784)'
                  }
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">CPU Usage</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  28%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={28}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #ff9800, #ffb74d)'
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataCollectionPage;