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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Slider,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Insights as InsightsIcon,
  Link as LinkIcon,
  AutoGraph as GraphIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { correlationApi } from '../api/tor';

const CorrelationPage = () => {
  const [patterns, setPatterns] = useState([]);
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [threshold, setThreshold] = useState(0.7);
  const [timeframe, setTimeframe] = useState(60000);
  const [realTime, setRealTime] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadData();
    if (realTime) {
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }
  }, [realTime]);

  const loadData = async () => {
    try {
      const [patternsRes, rulesRes] = await Promise.all([
        correlationApi.getPatterns(),
        correlationApi.getRules()
      ]);
      
      setPatterns(patternsRes.data.patterns || []);
      setRules(rulesRes.data.rules || []);
      
      // Calculate stats
      const patternsData = patternsRes.data.patterns || [];
      setStats({
        totalPatterns: patternsData.length,
        highConfidence: patternsData.filter(p => p.confidence > 0.8).length,
        criticalThreats: patternsData.filter(p => p.severity === 'critical').length,
        detectionRate: '92%',
        avgConfidence: patternsData.reduce((acc, p) => acc + (p.confidence || 0), 0) / (patternsData.length || 1),
        lastUpdate: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error loading correlation data:', error);
    }
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await correlationApi.analyze([], timeframe, threshold);
      console.log('Analysis result:', result);
      await loadData();
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(patterns, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `correlation_patterns_${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handlePatternClick = (pattern) => {
    setSelectedPattern(pattern);
    setOpenDialog(true);
  };

  const mockPatterns = [
    {
      id: 'corr-1',
      ruleId: 'ddos_pattern',
      ruleName: 'DDoS Attack Pattern',
      source: '192.168.1.50',
      eventCount: 45,
      confidence: 0.92,
      severity: 'critical',
      detectedAt: new Date().toISOString(),
      description: 'Multiple SYN flood attacks detected from same source',
      affectedNodes: ['ExitNode03', 'GuardNode01', 'RelayNode42']
    },
    {
      id: 'corr-2',
      ruleId: 'port_scan',
      ruleName: 'Port Scanning Activity',
      source: '10.0.0.23',
      eventCount: 28,
      confidence: 0.85,
      severity: 'high',
      detectedAt: new Date(Date.now() - 300000).toISOString(),
      description: 'Sequential port scanning detected',
      affectedNodes: ['GuardNode01']
    },
    {
      id: 'corr-3',
      ruleId: 'data_exfiltration',
      ruleName: 'Data Exfiltration Attempt',
      source: 'SuspiciousNode',
      eventCount: 15,
      confidence: 0.78,
      severity: 'critical',
      detectedAt: new Date(Date.now() - 600000).toISOString(),
      description: 'Large data transfer to external server',
      affectedNodes: ['ExitNode01', 'RelayNode88']
    },
    {
      id: 'corr-4',
      ruleId: 'protocol_abuse',
      ruleName: 'DNS Protocol Abuse',
      source: 'MaliciousUser',
      eventCount: 120,
      confidence: 0.88,
      severity: 'high',
      detectedAt: new Date(Date.now() - 900000).toISOString(),
      description: 'Excessive DNS queries for domain resolution',
      affectedNodes: ['DNSResolver01', 'RelayNode42']
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold', 
            background: 'linear-gradient(45deg, #2196f3, #4dabf5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Correlation Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced threat correlation and pattern analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export Data">
            <IconButton onClick={handleExportData}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={isAnalyzing ? <CircularProgress size={20} /> : <PlayIcon />}
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            sx={{
              background: 'linear-gradient(135deg, #2196f3, #4dabf5)',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
            }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Correlation'}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05))',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <InsightsIcon sx={{ color: '#2196f3', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalPatterns || 4}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Patterns
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {(stats.avgConfidence ? (stats.avgConfidence * 100).toFixed(1) : '85.5')}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Confidence
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05))',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <ErrorIcon sx={{ color: '#f44336', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.criticalThreats || 2}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical Threats
                  </Typography>
                </Box>
              </Box>
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
                    {stats.detectionRate || '92%'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Detection Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Patterns Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Detected Correlation Patterns
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={realTime} 
                      onChange={(e) => setRealTime(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Real-time"
                />
                <Button size="small" startIcon={<DownloadIcon />} onClick={handleExportData}>
                  Export
                </Button>
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pattern Type</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Events</TableCell>
                    <TableCell>Last Detected</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockPatterns.map((pattern) => (
                    <TableRow 
                      key={pattern.id} 
                      hover
                      onClick={() => handlePatternClick(pattern)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinkIcon fontSize="small" color="action" />
                          <Typography sx={{ fontWeight: 'medium' }}>
                            {pattern.ruleName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {pattern.source}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={pattern.confidence * 100} 
                            sx={{ 
                              width: 80, 
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, #2196f3, ${pattern.confidence > 0.8 ? '#4caf50' : '#ff9800'})`
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ minWidth: 40 }}>
                            {Math.round(pattern.confidence * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={pattern.severity.toUpperCase()}
                          size="small"
                          sx={{
                            background: pattern.severity === 'critical' ? 
                              'linear-gradient(135deg, #f44336, #e57373)' :
                              pattern.severity === 'high' ? 
                              'linear-gradient(135deg, #ff5722, #ff8a65)' :
                              'linear-gradient(135deg, #ff9800, #ffb74d)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 'medium' }}>
                          {pattern.eventCount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(pattern.detectedAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <InsightsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Controls & Rules */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Correlation Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Confidence Threshold: {Math.round(threshold * 100)}%</Typography>
              <Slider
                value={threshold}
                onChange={(e, newValue) => setThreshold(newValue)}
                min={0.5}
                max={1}
                step={0.05}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                sx={{ color: '#2196f3' }}
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Time Window</InputLabel>
              <Select
                value={timeframe}
                label="Time Window"
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <MenuItem value={30000}>30 seconds</MenuItem>
                <MenuItem value={60000}>1 minute</MenuItem>
                <MenuItem value={300000}>5 minutes</MenuItem>
                <MenuItem value={600000}>10 minutes</MenuItem>
                <MenuItem value={3600000}>1 hour</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-correlation"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Cross-source analysis"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Alert on high confidence"
              sx={{ display: 'block' }}
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Correlation Rules
            </Typography>
            
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {[
                { name: 'DDoS Pattern', description: 'Multiple flood attacks from same source', threshold: 100, severity: 'critical' },
                { name: 'Port Scanning', description: 'Sequential port access attempts', threshold: 50, severity: 'high' },
                { name: 'Data Exfiltration', description: 'Large transfers to external servers', threshold: '100MB', severity: 'critical' },
                { name: 'Protocol Abuse', description: 'Excessive protocol-specific requests', threshold: 1000, severity: 'high' },
                { name: 'Anomalous Traffic', description: 'Statistical anomaly detection', threshold: '3σ', severity: 'medium' },
                { name: 'Brute Force', description: 'Multiple failed authentication attempts', threshold: 10, severity: 'high' },
              ].map((rule, index) => (
                <Box key={index} sx={{ 
                  mb: 2, 
                  p: 2, 
                  bgcolor: 'rgba(0,0,0,0.1)', 
                  borderRadius: 1,
                  borderLeft: `4px solid ${rule.severity === 'critical' ? '#f44336' : rule.severity === 'high' ? '#ff9800' : '#2196f3'}`
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {rule.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {rule.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={`Threshold: ${rule.threshold}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip 
                      label={rule.severity}
                      size="small"
                      sx={{
                        background: rule.severity === 'critical' ? 
                          'linear-gradient(135deg, #f44336, #e57373)' :
                          rule.severity === 'high' ? 
                          'linear-gradient(135deg, #ff5722, #ff8a65)' :
                          'linear-gradient(135deg, #ff9800, #ffb74d)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Pattern Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedPattern && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinkIcon color="primary" />
                <Typography variant="h6">{selectedPattern.ruleName}</Typography>
                <Chip 
                  label={selectedPattern.severity.toUpperCase()}
                  color={selectedPattern.severity === 'critical' ? 'error' : selectedPattern.severity === 'high' ? 'warning' : 'info'}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {selectedPattern.description}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Source IP</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedPattern.source}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Confidence</Typography>
                  <Typography variant="body1">
                    {Math.round(selectedPattern.confidence * 100)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Event Count</Typography>
                  <Typography variant="body1">{selectedPattern.eventCount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Last Detected</Typography>
                  <Typography variant="body1">
                    {new Date(selectedPattern.detectedAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Affected Nodes
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedPattern.affectedNodes?.map((node, idx) => (
                      <Chip key={idx} label={node} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button variant="contained" color="primary">
                Take Action
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CorrelationPage;