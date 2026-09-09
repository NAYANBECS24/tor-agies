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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  AutoGraph as AutoGraphIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Insights as InsightsIcon,
  Lightbulb as LightbulbIcon,
  Calculate as CalculateIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import {
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Scatter,
} from 'recharts';

const AIPredictions = () => {
  const [timeHorizon, setTimeHorizon] = useState('24h');
  const [selectedModel, setSelectedModel] = useState('lstm');
  const [predictions, setPredictions] = useState([]);
  const [modelMetrics, setModelMetrics] = useState({});
  const [isPredicting, setIsPredicting] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(85);
  const [showForecastDialog, setShowForecastDialog] = useState(false);

  const colors = {
    primary: '#fd79a8',
    secondary: '#e84393',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#d63031',
    info: '#0984e3',
    purple: '#a29bfe',
    teal: '#00cec9',
  };

  const models = [
    { id: 'lstm', name: 'LSTM Neural Network', accuracy: 94.2, trainingTime: '2.5h', color: colors.primary },
    { id: 'transformer', name: 'Transformer Model', accuracy: 96.8, trainingTime: '4h', color: colors.secondary },
    { id: 'randomforest', name: 'Random Forest', accuracy: 89.5, trainingTime: '1h', color: colors.success },
    { id: 'xgboost', name: 'XGBoost', accuracy: 91.3, trainingTime: '45m', color: colors.info },
    { id: 'prophet', name: 'Facebook Prophet', accuracy: 87.6, trainingTime: '30m', color: colors.warning },
    { id: 'hybrid', name: 'Hybrid Ensemble', accuracy: 97.5, trainingTime: '6h', color: colors.purple },
  ];

  // Generate mock prediction data
  const generatePredictions = () => {
    const now = new Date();
    const preds = [];
    
    for (let i = 0; i < 12; i++) {
      const time = new Date(now.getTime() + (i * 2 * 60 * 60 * 1000));
      const actual = Math.random() * 100 + 50;
      const predicted = actual + (Math.random() * 20 - 10);
      const confidence = 85 + Math.random() * 15;
      
      preds.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actual: Math.round(actual),
        predicted: Math.round(predicted),
        confidence: Math.round(confidence),
        anomaly: confidence < 75 ? 'high' : confidence < 85 ? 'medium' : 'low',
      });
    }
    
    setPredictions(preds);
    
    // Update model metrics
    const avgAccuracy = preds.reduce((acc, p) => acc + (100 - Math.abs(p.actual - p.predicted) / p.actual * 100), 0) / preds.length;
    const avgConfidence = preds.reduce((acc, p) => acc + p.confidence, 0) / preds.length;
    
    setModelMetrics({
      accuracy: avgAccuracy,
      confidence: avgConfidence,
      mae: (preds.reduce((acc, p) => acc + Math.abs(p.actual - p.predicted), 0) / preds.length).toFixed(1),
      rmse: Math.sqrt(preds.reduce((acc, p) => acc + Math.pow(p.actual - p.predicted, 2), 0) / preds.length).toFixed(1),
    });
  };

  useEffect(() => {
    generatePredictions();
    const interval = setInterval(() => {
      if (isPredicting) {
        generatePredictions();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPredicting]);

  const startPrediction = () => {
    setIsPredicting(true);
    generatePredictions();
  };

  const stopPrediction = () => {
    setIsPredicting(false);
  };

  const predictedThreats = [
    { id: 1, type: 'DDoS Attack', probability: 92, timeframe: '1-2 hours', impact: 'High', recommendedAction: 'Increase bandwidth', status: 'pending' },
    { id: 2, type: 'Data Breach Attempt', probability: 78, timeframe: '6-8 hours', impact: 'Critical', recommendedAction: 'Enhance encryption', status: 'monitoring' },
    { id: 3, type: 'Malware Spread', probability: 85, timeframe: '3-4 hours', impact: 'High', recommendedAction: 'Update AV signatures', status: 'pending' },
    { id: 4, type: 'Insider Threat', probability: 65, timeframe: '12-24 hours', impact: 'Medium', recommendedAction: 'Review access logs', status: 'investigating' },
    { id: 5, type: 'Phishing Campaign', probability: 88, timeframe: '2-3 hours', impact: 'Medium', recommendedAction: 'User awareness training', status: 'monitoring' },
  ];

  const performanceMetrics = [
    { label: 'Model Accuracy', value: `${modelMetrics.accuracy?.toFixed(1) || '0'}%`, icon: <CheckCircleIcon />, color: colors.success },
    { label: 'Avg Confidence', value: `${modelMetrics.confidence?.toFixed(1) || '0'}%`, icon: <PsychologyIcon />, color: colors.primary },
    { label: 'Mean Absolute Error', value: modelMetrics.mae || '0', icon: <CalculateIcon />, color: colors.warning },
    { label: 'RMSE', value: modelMetrics.rmse || '0', icon: <ShowChartIcon />, color: colors.info },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              <PsychologyIcon sx={{ mr: 2, verticalAlign: 'middle', color: colors.primary }} />
              AI Predictions
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Machine learning forecasts and threat predictions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                sx={{ color: 'white' }}
              >
                {models.map(model => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title={isPredicting ? 'Stop predictions' : 'Start predictions'}>
              <IconButton 
                onClick={isPredicting ? stopPrediction : startPrediction}
                sx={{ 
                  background: isPredicting ? `linear-gradient(135deg, ${colors.error}, #ff6b6b)` : `linear-gradient(135deg, ${colors.success}, #66bb6a)`,
                  color: 'white',
                  '&:hover': {
                    background: isPredicting ? `linear-gradient(135deg, #d32f2f, ${colors.error})` : `linear-gradient(135deg, #388e3c, ${colors.success})`,
                  }
                }}
              >
                {isPredicting ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              Export Predictions
            </Button>
          </Box>
        </Box>

        {/* Alert Banner */}
        <Alert 
          severity="info" 
          icon={<LightbulbIcon />}
          sx={{ 
            mb: 3,
            background: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
          }}
        >
          AI Model is currently {isPredicting ? 'actively predicting' : 'paused'}. {models.find(m => m.id === selectedModel)?.accuracy}% accuracy.
        </Alert>

        {/* Controls */}
        <Paper sx={{ p: 2, mb: 3, background: 'rgba(19, 47, 76, 0.5)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Typography gutterBottom>Prediction Confidence Threshold</Typography>
              <Slider
                value={confidenceLevel}
                onChange={(e, val) => setConfidenceLevel(val)}
                min={60}
                max={95}
                marks={[
                  { value: 60, label: '60%' },
                  { value: 75, label: '75%' },
                  { value: 95, label: '95%' },
                ]}
                sx={{ color: colors.primary }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Only show predictions above {confidenceLevel}% confidence
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Prediction Horizon</InputLabel>
                <Select
                  value={timeHorizon}
                  label="Prediction Horizon"
                  onChange={(e) => setTimeHorizon(e.target.value)}
                >
                  <MenuItem value="1h">Next 1 hour</MenuItem>
                  <MenuItem value="6h">Next 6 hours</MenuItem>
                  <MenuItem value="24h">Next 24 hours</MenuItem>
                  <MenuItem value="7d">Next 7 days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={<Switch checked={isPredicting} onChange={() => setIsPredicting(!isPredicting)} />}
                label="Real-time Predictions"
                sx={{ color: 'text.primary' }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {performanceMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(19, 47, 76, 0.8), rgba(255, 255, 255, 0.05))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(66, 165, 245, 0.2)',
              height: '100%',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" variant="body2" gutterBottom>
                      {metric.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: metric.color }}>
                      {metric.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: `${metric.color}20`, 
                    color: metric.color,
                    width: 48,
                    height: 48,
                  }}>
                    {metric.icon}
                  </Avatar>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={parseFloat(metric.value) || 0} 
                  sx={{ 
                    mt: 2,
                    height: 4,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${metric.color}, ${metric.color}80)`,
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Prediction Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            background: 'rgba(19, 47, 76, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(66, 165, 245, 0.2)',
            height: '400px',
          }}>
            <CardHeader
              title="Traffic Forecast vs Actual"
              action={
                <Chip 
                  icon={<AutoGraphIcon />} 
                  label={`${models.find(m => m.id === selectedModel)?.name}`} 
                  size="small" 
                  color="primary" 
                />
              }
            />
            <CardContent sx={{ height: 'calc(100% - 70px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.7)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: 'rgba(10, 25, 41, 0.95)',
                      border: '1px solid rgba(66, 165, 245, 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    fill={colors.success}
                    fillOpacity={0.1}
                    stroke={colors.success}
                    strokeWidth={2}
                    name="Actual Traffic"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke={colors.primary}
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Predicted Traffic"
                  />
                  <Scatter 
                    data={predictions.filter(p => p.anomaly === 'high')}
                    dataKey="predicted"
                    fill={colors.error}
                    name="High Anomaly"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            background: 'rgba(19, 47, 76, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(66, 165, 245, 0.2)',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <CardHeader title="Model Comparison" />
            <CardContent sx={{ flex: 1, overflow: 'auto' }}>
              <List>
                {models.map((model) => (
                  <ListItem
                    key={model.id}
                    button
                    selected={selectedModel === model.id}
                    onClick={() => setSelectedModel(model.id)}
                    sx={{
                      mb: 1,
                      borderRadius: '8px',
                      background: selectedModel === model.id ? `${model.color}20` : 'transparent',
                      border: `1px solid ${selectedModel === model.id ? model.color : 'transparent'}`,
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ 
                        bgcolor: `${model.color}20`, 
                        color: model.color,
                        width: 32,
                        height: 32,
                      }}>
                        <AutoGraphIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={model.name}
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption">
                            {model.accuracy}% accuracy
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {model.trainingTime}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Predicted Threats Table */}
      <Card sx={{ 
        background: 'rgba(19, 47, 76, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(66, 165, 245, 0.2)',
        mb: 3,
      }}>
        <CardHeader 
          title="Predicted Security Threats"
          action={
            <Button 
              startIcon={<InsightsIcon />} 
              size="small"
              onClick={() => setShowForecastDialog(true)}
            >
              Generate Forecast
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Threat Type</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Timeframe</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Recommended Action</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {predictedThreats.map((threat) => (
                  <TableRow key={threat.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WarningIcon 
                          sx={{ 
                            mr: 1, 
                            color: threat.probability > 85 ? colors.error : 
                                   threat.probability > 70 ? colors.warning : colors.success 
                          }} 
                        />
                        {threat.type}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={threat.probability} 
                          sx={{ 
                            width: 60,
                            height: 6,
                            borderRadius: 3,
                            background: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: threat.probability > 85 ? colors.error : 
                                         threat.probability > 70 ? colors.warning : colors.success,
                            }
                          }}
                        />
                        <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                          {threat.probability}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{threat.timeframe}</TableCell>
                    <TableCell>
                      <Chip 
                        label={threat.impact} 
                        size="small"
                        sx={{
                          background: threat.impact === 'Critical' ? colors.error : 
                                     threat.impact === 'High' ? colors.warning : colors.success,
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>{threat.recommendedAction}</TableCell>
                    <TableCell>
                      <Chip 
                        label={threat.status} 
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: threat.status === 'pending' ? colors.warning : 
                                     threat.status === 'monitoring' ? colors.info : colors.success,
                          color: threat.status === 'pending' ? colors.warning : 
                                 threat.status === 'monitoring' ? colors.info : colors.success,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                        Details
                      </Button>
                      <Button size="small" variant="contained">
                        Mitigate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Forecast Generation Dialog */}
      <Dialog open={showForecastDialog} onClose={() => setShowForecastDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PsychologyIcon sx={{ color: colors.primary }} />
            <Typography variant="h6">Generate Advanced Forecast</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Forecast Type</InputLabel>
                <Select label="Forecast Type" defaultValue="threats">
                  <MenuItem value="threats">Threat Predictions</MenuItem>
                  <MenuItem value="traffic">Traffic Forecast</MenuItem>
                  <MenuItem value="anomalies">Anomaly Detection</MenuItem>
                  <MenuItem value="capacity">Capacity Planning</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Time Horizon</InputLabel>
                <Select label="Time Horizon" defaultValue="7d">
                  <MenuItem value="24h">24 Hours</MenuItem>
                  <MenuItem value="7d">7 Days</MenuItem>
                  <MenuItem value="30d">30 Days</MenuItem>
                  <MenuItem value="90d">90 Days</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Include historical data"
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Model Parameters
              </Typography>
              <TextField
                fullWidth
                label="Confidence Interval"
                defaultValue="95"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Training Epochs"
                defaultValue="100"
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Real-time updates"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForecastDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<AutoGraphIcon />}
            sx={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          >
            Generate Forecast
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIPredictions;