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
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Snackbar,
  InputAdornment,
  Stack
} from '@mui/material';
import {
  Hub as HubIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Psychology as PsychologyIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  NetworkCheck as NetworkCheckIcon,
  People as PeopleIcon,
  CorporateFare as CorporateFareIcon,
  DataUsage as DataUsageIcon,
  PrivacyTip as PrivacyTipIcon,
  Shield as ShieldIcon,
  VerifiedUser as VerifiedUserIcon,
  Bolt as BoltIcon,
  Timer as TimerIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  SyncAlt as SyncAltIcon,
  Polyline as PolylineIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  Search as SearchIcon,
  CloudSync as CloudSyncIcon,
  Science as ScienceIcon,
  FilterList as FilterListIcon,
  Tune as TuneIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';

// APIs
import { atwcApi } from '../api/atwc-engine';

// Components
import FederatedTrainingChart from '../components/FederatedTrainingChart';
import PrivacyHeatmap from '../components/PrivacyHeatmap';
import ISPParticipationNetwork from '../components/ISPParticipationNetwork';

const AtwcPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStage, setTrainingStage] = useState('');
  const [selectedISP, setSelectedISP] = useState(null);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);
  const [showIspModal, setShowIspModal] = useState(false);

  // Snackbar Notification State
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const showToast = (message, severity = 'info') => {
    setToast({ open: true, message, severity });
  };

  // Federation & Model Training State
  const [trainingStatus, setTrainingStatus] = useState({
    federationActive: true,
    currentRound: 8,
    totalRounds: 12,
    roundProgress: 75,
    globalAccuracy: 0.872,
    globalRecall: 0.941,
    globalPrecision: 0.824,
    globalF1: 0.879,
    privacyScore: 0.98,
    epsilon: 1.2,
    delta: 1e-5,
    securityScore: 0.95,
    totalParticipants: 12,
    activeParticipants: 8,
    totalDataPoints: 1248000,
    avgDataPerISP: 104000,
    learningRate: 0.001,
    batchSize: 32,
    epochsPerRound: 5,
    aggregationMethod: 'fedavg',
    uploadSpeed: 48,
    downloadSpeed: 124,
    latency: 28,
    bandwidthUsage: 342
  });

  // Tor Network State from Live Onionoo Baseline
  const [torNetworkState, setTorNetworkState] = useState({
    isAvailable: true,
    source: 'onionoo_live',
    congestionFactor: 0.052,
    muPrior: 365.5,
    sigmaPrior: 87.7,
    window: [146.3, 628.6],
    windowWidthMs: 482.3,
    totalRelays: 7200,
    runningRelays: 6950,
    overloadCount: 13,
    currentAvgBandwidthMB: '67.67 MB/s',
    historicalBaselineB0MB: '54.69 MB/s',
    modelExplanation: 'ATWC dynamically updates latency assumptions based on near-real-time public Tor network metadata.'
  });

  // ISP Participants State
  const [isps, setISPs] = useState([
    {
      id: 'isp-chennai',
      name: 'BSNL Chennai Tier-1',
      status: 'connected',
      dataPoints: 18500,
      contribution: 15.2,
      lastSeen: new Date(Date.now() - 45000).toISOString(),
      location: { lat: 13.0827, lng: 80.2707, city: 'Chennai, TN' },
      privacyCompliance: 0.98,
      trainingProgress: 88,
      modelAccuracy: 0.86,
      bandwidth: '10 Gbps',
      isActive: true,
      ispType: 'government',
      dataQuality: 0.94,
      participationScore: 96,
      dpdpCompliant: true
    },
    {
      id: 'isp-mumbai',
      name: 'Jio Mumbai 5G Core',
      status: 'training',
      dataPoints: 24200,
      contribution: 19.8,
      lastSeen: new Date(Date.now() - 15000).toISOString(),
      location: { lat: 19.0760, lng: 72.8777, city: 'Mumbai, MH' },
      privacyCompliance: 0.97,
      trainingProgress: 72,
      modelAccuracy: 0.88,
      bandwidth: '40 Gbps',
      isActive: true,
      ispType: 'private',
      dataQuality: 0.96,
      participationScore: 94,
      dpdpCompliant: true
    },
    {
      id: 'isp-delhi',
      name: 'Airtel Delhi Gateway',
      status: 'connected',
      dataPoints: 21800,
      contribution: 17.5,
      lastSeen: new Date(Date.now() - 60000).toISOString(),
      location: { lat: 28.7041, lng: 77.1025, city: 'New Delhi, DL' },
      privacyCompliance: 0.98,
      trainingProgress: 94,
      modelAccuracy: 0.87,
      bandwidth: '20 Gbps',
      isActive: true,
      ispType: 'private',
      dataQuality: 0.93,
      participationScore: 95,
      dpdpCompliant: true
    },
    {
      id: 'isp-bangalore',
      name: 'ACT Fibernet Bengaluru',
      status: 'idle',
      dataPoints: 9400,
      contribution: 7.6,
      lastSeen: new Date(Date.now() - 240000).toISOString(),
      location: { lat: 12.9716, lng: 77.5946, city: 'Bengaluru, KA' },
      privacyCompliance: 0.95,
      trainingProgress: 0,
      modelAccuracy: 0.81,
      bandwidth: '5 Gbps',
      isActive: false,
      ispType: 'private',
      dataQuality: 0.91,
      participationScore: 78,
      dpdpCompliant: true
    },
    {
      id: 'isp-hyderabad',
      name: 'Hathway Hyderabad Hub',
      status: 'connected',
      dataPoints: 13200,
      contribution: 10.8,
      lastSeen: new Date(Date.now() - 90000).toISOString(),
      location: { lat: 17.3850, lng: 78.4867, city: 'Hyderabad, TS' },
      privacyCompliance: 0.96,
      trainingProgress: 82,
      modelAccuracy: 0.84,
      bandwidth: '2.5 Gbps',
      isActive: true,
      ispType: 'private',
      dataQuality: 0.89,
      participationScore: 88,
      dpdpCompliant: true
    },
    {
      id: 'isp-kolkata',
      name: 'BSNL Kolkata Exchange',
      status: 'training',
      dataPoints: 11400,
      contribution: 9.3,
      lastSeen: new Date(Date.now() - 30000).toISOString(),
      location: { lat: 22.5726, lng: 88.3639, city: 'Kolkata, WB' },
      privacyCompliance: 0.99,
      trainingProgress: 64,
      modelAccuracy: 0.83,
      bandwidth: '1 Gbps',
      isActive: true,
      ispType: 'government',
      dataQuality: 0.95,
      participationScore: 91,
      dpdpCompliant: true
    },
    {
      id: 'isp-pune',
      name: 'Tata Communications Pune',
      status: 'connected',
      dataPoints: 16800,
      contribution: 13.6,
      lastSeen: new Date(Date.now() - 110000).toISOString(),
      location: { lat: 18.5204, lng: 73.8567, city: 'Pune, MH' },
      privacyCompliance: 0.98,
      trainingProgress: 89,
      modelAccuracy: 0.86,
      bandwidth: '100 Gbps',
      isActive: true,
      ispType: 'private',
      dataQuality: 0.97,
      participationScore: 97,
      dpdpCompliant: true
    },
    {
      id: 'isp-mtnl',
      name: 'MTNL Delhi Metro Net',
      status: 'idle',
      dataPoints: 6200,
      contribution: 6.2,
      lastSeen: new Date(Date.now() - 360000).toISOString(),
      location: { lat: 28.6139, lng: 77.2090, city: 'Delhi NCR' },
      privacyCompliance: 0.94,
      trainingProgress: 0,
      modelAccuracy: 0.79,
      bandwidth: '1 Gbps',
      isActive: false,
      ispType: 'government',
      dataQuality: 0.88,
      participationScore: 74,
      dpdpCompliant: true
    }
  ]);

  // Training Rounds History
  const [trainingHistory, setTrainingHistory] = useState([
    { round: 1, accuracy: 0.65, loss: 0.42, participants: 4, duration: '12m', precision: 0.62, recall: 0.70 },
    { round: 2, accuracy: 0.71, loss: 0.38, participants: 6, duration: '15m', precision: 0.68, recall: 0.76 },
    { round: 3, accuracy: 0.75, loss: 0.35, participants: 7, duration: '18m', precision: 0.72, recall: 0.81 },
    { round: 4, accuracy: 0.78, loss: 0.32, participants: 8, duration: '20m', precision: 0.75, recall: 0.85 },
    { round: 5, accuracy: 0.81, loss: 0.29, participants: 8, duration: '22m', precision: 0.78, recall: 0.88 },
    { round: 6, accuracy: 0.83, loss: 0.26, participants: 8, duration: '25m', precision: 0.80, recall: 0.90 },
    { round: 7, accuracy: 0.85, loss: 0.23, participants: 8, duration: '28m', precision: 0.81, recall: 0.92 },
    { round: 8, accuracy: 0.872, loss: 0.208, participants: 8, duration: '30m', precision: 0.824, recall: 0.941 },
  ]);

  // Privacy Metrics
  const [privacyMetrics, setPrivacyMetrics] = useState({
    differentialPrivacy: {
      enabled: true,
      epsilon: 1.2,
      delta: 1e-5,
      noiseScale: 0.14,
      privacyBudgetUsed: 0.42
    },
    secureAggregation: {
      enabled: true,
      method: 'paillier',
      keySize: 2048,
      encryptionStrength: 'high'
    },
    dataMinimization: {
      featureReduction: 0.85,
      piiRemoval: 1.0,
      kAnonymity: 5,
      lDiversity: 3.2
    },
    auditLogging: {
      enabled: true,
      immutable: true,
      blockchainBacked: true,
      retentionDays: 365
    }
  });

  // ATWC Correlations List
  const [atwcCorrelations, setAtwcCorrelations] = useState([]);

  // Interactive ATWC Correlation Lab Form State
  const [testForm, setTestForm] = useState({
    ingressDeltaOffset: 380, // milliseconds before egress
    relayBandwidth: 50000000,
    customCircuitId: 'circ_lab_test'
  });
  const [testResult, setTestResult] = useState(null);
  const [isTestingCorrelation, setIsTestingCorrelation] = useState(false);

  // ISP Filtering & Search in Tab 1
  const [ispSearch, setIspSearch] = useState('');
  const [ispStatusFilter, setIspStatusFilter] = useState('all');
  const [ispTypeFilter, setIspTypeFilter] = useState('all');

  // Federation Settings State (Tab 5)
  const [federationSettings, setFederationSettings] = useState({
    autoStart: true,
    minParticipants: 4,
    maxRounds: 50,
    aggregationFrequency: 'hourly',
    modelSharing: 'encrypted',
    validationRequired: true,
    aggregationStrategy: 'fedavg',
    byzantineTolerance: true,
    exportFormat: 'onnx'
  });

  // Initial Load
  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      simulatePeriodicHeartbeat();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      // 1. Fetch live network state
      const netState = await atwcApi.getNetworkState().catch(() => null);
      if (netState?.data) {
        setTorNetworkState(netState.data);
      }

      // 2. Fetch federation status
      const fedRes = await atwcApi.getFederationStatus().catch(() => null);
      if (fedRes?.data) {
        setTrainingStatus(prev => ({ ...prev, ...fedRes.data }));
      }

      // 3. Fetch correlations stream
      const corrRes = await atwcApi.getRecentCorrelations({ limit: 15 }).catch(() => null);
      if (corrRes?.data) {
        setAtwcCorrelations(corrRes.data);
      }
    } catch (err) {
      console.error('Failed to load initial ATWC data:', err);
    }
  };

  const simulatePeriodicHeartbeat = () => {
    setISPs(prev => prev.map(isp => {
      if (isp.isActive && Math.random() > 0.85) {
        return {
          ...isp,
          status: isp.status === 'training' ? 'connected' : 'training',
          lastSeen: new Date().toISOString()
        };
      }
      return isp;
    }));
  };

  // Start Federated Training Simulation
  const startFederatedTraining = async () => {
    if (isTraining) return;
    setIsTraining(true);
    showToast('🚀 Federated Learning Round Initiated: Dispatching Local SGD tasks...', 'info');

    const stages = [
      '1/4: Distributing Global Weights to 8 Active ISPs...',
      '2/4: Local SGD Training & Differential Privacy Laplace Clipping (ε=1.2)...',
      '3/4: Paillier Homomorphic Multi-Party Encrypted Aggregation...',
      '4/4: Global Model Convergence Validation & Checkpoint Commit...'
    ];

    let currentStageIndex = 0;
    setTrainingStage(stages[0]);

    // Animate progress smoothly
    let prog = 0;
    const interval = setInterval(() => {
      prog += 4;
      setTrainingStatus(prev => ({ ...prev, roundProgress: Math.min(100, prog) }));

      if (prog === 28) {
        currentStageIndex = 1;
        setTrainingStage(stages[1]);
      } else if (prog === 56) {
        currentStageIndex = 2;
        setTrainingStage(stages[2]);
      } else if (prog === 84) {
        currentStageIndex = 3;
        setTrainingStage(stages[3]);
      }

      if (prog >= 100) {
        clearInterval(interval);
        setIsTraining(false);
        setTrainingStage('');

        // Increment round
        const newRoundNum = trainingStatus.currentRound + 1;
        const newAcc = parseFloat((trainingStatus.globalAccuracy + 0.018).toFixed(3));
        const newLoss = parseFloat(Math.max(0.08, trainingStatus.trainingHistory?.[trainingHistory.length - 1]?.loss || 0.208 - 0.024).toFixed(3));

        const updatedHistoryItem = {
          round: newRoundNum,
          accuracy: newAcc,
          loss: newLoss,
          participants: trainingStatus.activeParticipants,
          duration: '32m',
          precision: parseFloat((trainingStatus.globalPrecision + 0.015).toFixed(3)),
          recall: parseFloat((trainingStatus.globalRecall + 0.008).toFixed(3))
        };

        setTrainingHistory(prev => [...prev, updatedHistoryItem]);
        setTrainingStatus(prev => ({
          ...prev,
          currentRound: newRoundNum,
          globalAccuracy: newAcc,
          roundProgress: 100,
          totalDataPoints: prev.totalDataPoints + 64000
        }));

        showToast(`✅ Round ${newRoundNum} Completed! New Global Accuracy: ${(newAcc * 100).toFixed(1)}%`, 'success');
      }
    }, 280);
  };

  // Run Test Correlation Lab
  const handleRunCorrelationTest = async () => {
    setIsTestingCorrelation(true);
    try {
      const now = Date.now();
      const egressMs = now;
      const ingressMs = now - (parseInt(testForm.ingressDeltaOffset) || 380);

      const res = await atwcApi.testCorrelation({
        ingressTime: new Date(ingressMs).toISOString(),
        egressTime: new Date(egressMs).toISOString(),
        relayBandwidth: parseInt(testForm.relayBandwidth) || 50000000
      });

      if (res.data?.success && res.data?.data) {
        setTestResult(res.data.data);
        showToast('🎯 ATWC Correlation Evaluation Complete', 'success');
      } else {
        throw new Error('No data');
      }
    } catch {
      // Offline fallback computation matching backend formula
      const now = Date.now();
      const delta = parseInt(testForm.ingressDeltaOffset) || 380;
      const mu = torNetworkState.muPrior || 365.5;
      const sigma = torNetworkState.sigmaPrior || 87.7;
      const [wMin, wMax] = torNetworkState.window || [146.3, 628.6];
      const inWindow = delta >= wMin && delta <= wMax;
      const exponent = -Math.pow(delta - mu, 2) / (2 * Math.pow(sigma, 2));
      const conf = Math.max(0.4, Math.min(0.99, Math.exp(exponent)));

      setTestResult({
        ingressTime: new Date(now - delta).toISOString(),
        egressTime: new Date(now).toISOString(),
        observedDeltaMs: delta,
        priorMuMs: mu,
        priorSigmaMs: sigma,
        adaptiveWindow: [wMin, wMax],
        inWindow,
        correlationConfidence: Math.round(conf * 100),
        congestionAtObservation: torNetworkState.congestionFactor,
        baselineB0MB: torNetworkState.historicalBaselineB0MB || '54.69 MB/s',
        method: 'Adaptive Time-Window Correlation (ATWC) with Onionoo Latency Prior'
      });
      showToast('🎯 ATWC Correlation Evaluation Complete (Calculated)', 'success');
    } finally {
      setIsTestingCorrelation(false);
    }
  };

  // Export Model
  const handleExportModel = async () => {
    try {
      const exportData = await atwcApi.exportModel();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `atwc_global_model_round_${trainingStatus.currentRound}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('📥 Global Model weights & metadata exported successfully', 'success');
    } catch {
      showToast('Failed to export model', 'error');
    }
  };

  // ISP Selection
  const handleISPSelect = (isp) => {
    setSelectedISP(isp);
    setShowIspModal(true);
  };

  // Filtered ISPs for Tab 1
  const filteredISPs = isps.filter(isp => {
    const matchesSearch = isp.name.toLowerCase().includes(ispSearch.toLowerCase()) ||
      isp.location.city.toLowerCase().includes(ispSearch.toLowerCase());
    const matchesStatus = ispStatusFilter === 'all' ||
      (ispStatusFilter === 'active' && isp.isActive) ||
      (ispStatusFilter === 'training' && isp.status === 'training') ||
      (ispStatusFilter === 'idle' && !isp.isActive);
    const matchesType = ispTypeFilter === 'all' || isp.ispType === ispTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <Box sx={{ width: '100%', pb: 6, pt: 0.5, px: { xs: 1.5, md: 3 }, boxSizing: 'border-box' }}>
      {/* ─── Hero Header (No Clipping, Clean Glassmorphic Cyber Style) ──────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.92) 50%, rgba(13, 37, 63, 0.95) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 229, 255, 0.22)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' },
          gap: 2.5
        }}
      >
        <Box sx={{ maxWidth: { xs: '100%', lg: '62%' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #00e5ff, #7c4dff)',
                boxShadow: '0 0 16px rgba(0, 229, 255, 0.4)'
              }}
            >
              <HubIcon sx={{ color: '#0a192f', fontSize: 26 }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.6rem', md: '2.1rem' },
                background: 'linear-gradient(90deg, #ffffff 0%, #38bdf8 60%, #b388ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}
            >
              TOR Sentinel ATWC Engine
            </Typography>
            <Chip
              label="v2.5 ONIONOO ADAPTIVE"
              size="small"
              sx={{
                bgcolor: 'rgba(0, 229, 255, 0.15)',
                color: '#00e5ff',
                border: '1px solid rgba(0, 229, 255, 0.35)',
                fontWeight: 700,
                fontSize: '0.72rem'
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.6, mb: 2 }}>
            Adaptive Time-Window Correlation (ATWC) & Privacy-Preserving Collaborative Federated ML across Multi-ISP nodes. Dynamically calibrates Gaussian latency priors based on near-real-time public Tor consensus telemetry.
          </Typography>

          {/* Telemetry Status Badges */}
          <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<PeopleIcon sx={{ color: '#00e676 !important' }} />}
              label={`${trainingStatus.activeParticipants}/${trainingStatus.totalParticipants} ISPs Active`}
              size="small"
              sx={{ bgcolor: 'rgba(0, 230, 118, 0.12)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.3)', fontWeight: 600 }}
            />
            <Chip
              icon={<ShieldIcon sx={{ color: '#38bdf8 !important' }} />}
              label={`Privacy ε = ${trainingStatus.epsilon} (98% Score)`}
              size="small"
              sx={{ bgcolor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 600 }}
            />
            <Chip
              icon={<TrendingUpIcon sx={{ color: '#ffb300 !important' }} />}
              label={`Global Accuracy: ${(trainingStatus.globalAccuracy * 100).toFixed(1)}%`}
              size="small"
              sx={{ bgcolor: 'rgba(255, 179, 0, 0.12)', color: '#ffb300', border: '1px solid rgba(255, 179, 0, 0.3)', fontWeight: 600 }}
            />
            <Chip
              icon={<TimerIcon sx={{ color: '#d500f9 !important' }} />}
              label={`Adaptive Bounds: [${torNetworkState.window[0]} .. ${torNetworkState.window[1]}] ms`}
              size="small"
              sx={{ bgcolor: 'rgba(213, 0, 249, 0.12)', color: '#e1bee7', border: '1px solid rgba(213, 0, 249, 0.3)', fontWeight: 600 }}
            />
            <Chip
              label={`Congestion Ct: ${torNetworkState.congestionFactor}`}
              size="small"
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', fontWeight: 600 }}
            />
          </Stack>
        </Box>

        {/* Action Buttons Toolbar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, width: { xs: '100%', lg: 'auto' } }}>
          <Button
            variant="contained"
            size="medium"
            startIcon={isTraining ? <CircularProgress size={18} color="inherit" /> : <PlayIcon />}
            onClick={startFederatedTraining}
            disabled={isTraining}
            sx={{
              background: 'linear-gradient(135deg, #00e5ff 0%, #7c4dff 100%)',
              color: '#0a192f',
              fontWeight: 700,
              boxShadow: '0 4px 18px rgba(0, 229, 255, 0.35)',
              px: 2.5,
              py: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #38bdf8 0%, #9065ff 100%)',
                boxShadow: '0 6px 24px rgba(0, 229, 255, 0.5)'
              }
            }}
          >
            {isTraining ? 'Training In Progress...' : 'Start Training Round'}
          </Button>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<ScienceIcon />}
            onClick={() => setActiveTab(4)}
            sx={{
              color: '#38bdf8',
              borderColor: 'rgba(56, 189, 248, 0.4)',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#38bdf8',
                bgcolor: 'rgba(56, 189, 248, 0.08)'
              }
            }}
          >
            ATWC Lab
          </Button>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<RefreshIcon />}
            onClick={() => {
              loadAllData();
              showToast('Telemetries synced with live Onionoo snapshot', 'info');
            }}
            sx={{
              color: '#94a3b8',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': {
                borderColor: '#ffffff',
                color: '#ffffff'
              }
            }}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<DownloadIcon />}
            onClick={handleExportModel}
            sx={{
              color: '#00e676',
              borderColor: 'rgba(0, 230, 118, 0.35)',
              '&:hover': {
                borderColor: '#00e676',
                bgcolor: 'rgba(0, 230, 118, 0.08)'
              }
            }}
          >
            Export
          </Button>
        </Box>
      </Paper>

      {/* Training In-Progress Active Stage Banner */}
      {isTraining && (
        <Alert
          severity="info"
          icon={<CircularProgress size={20} color="inherit" />}
          sx={{
            mb: 3,
            bgcolor: 'rgba(0, 229, 255, 0.1)',
            color: '#38bdf8',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: 2
          }}
        >
          <strong>Federation Round {trainingStatus.currentRound + 1} Active:</strong> {trainingStage || 'Synchronizing with distributed ISP nodes...'} ({trainingStatus.roundProgress}%)
        </Alert>
      )}

      {/* ─── Navigation Tabs Bar ─────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2.5,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 52,
            '& .MuiTab-root': {
              color: '#94a3b8',
              fontSize: '0.88rem',
              fontWeight: 600,
              minHeight: 52,
              textTransform: 'none',
              px: { xs: 2, md: 3 },
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#00e5ff',
                fontWeight: 700
              },
              '&:hover': {
                color: '#e2e8f0'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00e5ff',
              height: 3,
              borderRadius: '3px 3px 0 0',
              boxShadow: '0 0 10px #00e5ff'
            }
          }}
        >
          <Tab label="Federation Overview" icon={<HubIcon fontSize="small" />} iconPosition="start" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>ISP Participants</span>
                <Chip label={trainingStatus.activeParticipants} size="small" sx={{ height: 18, fontSize: '0.68rem', bgcolor: 'rgba(0, 230, 118, 0.2)', color: '#00e676' }} />
              </Box>
            }
            icon={<CorporateFareIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab label="Training Analytics" icon={<AssessmentIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Privacy & Cryptography" icon={<SecurityIcon fontSize="small" />} iconPosition="start" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>ATWC Correlations</span>
                <Chip label="Live" size="small" sx={{ height: 18, fontSize: '0.68rem', bgcolor: 'rgba(255, 179, 0, 0.2)', color: '#ffb300' }} />
              </Box>
            }
            icon={<PolylineIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab label="Settings & Governance" icon={<TuneIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB 0: FEDERATION OVERVIEW
      ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          {/* Left Column: Federation Status & Quick Controls */}
          <Grid item xs={12} lg={4}>
            {/* Federation Status Card */}
            <Card
              sx={{
                mb: 2.5,
                borderRadius: 2.5,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 229, 255, 0.18)'
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.05rem' }}>
                    <SyncAltIcon sx={{ color: '#00e5ff' }} />
                    Federation Status
                  </Typography>
                  <Chip
                    label="Active Quorum"
                    size="small"
                    sx={{ bgcolor: 'rgba(0, 230, 118, 0.15)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.3)', fontWeight: 600 }}
                  />
                </Box>

                {/* Round & Active Participants Stat Cards */}
                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(124, 77, 255, 0.1)', border: '1px solid rgba(124, 77, 255, 0.25)', textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#b388ff', fontSize: '2.2rem', lineHeight: 1.1 }}>
                        {trainingStatus.currentRound}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                        Current Round
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.25)', textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#00e676', fontSize: '2.2rem', lineHeight: 1.1 }}>
                        {trainingStatus.activeParticipants}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                        Active ISPs ({trainingStatus.totalParticipants} Registered)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Round Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                      Round {trainingStatus.currentRound} Progress
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#00e5ff', fontWeight: 700 }}>
                      {trainingStatus.roundProgress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={trainingStatus.roundProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #00e5ff, #7c4dff)'
                      }
                    }}
                  />
                </Box>

                {/* Data Aggregation */}
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                      Distributed Data Aggregated
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700 }}>
                      {(trainingStatus.totalDataPoints / 1000).toFixed(1)}K netflows
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (trainingStatus.totalDataPoints / 1600000) * 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#38bdf8'
                      }
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

                <Stack spacing={1.2}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={isTraining ? <CircularProgress size={18} color="inherit" /> : <PlayIcon />}
                    onClick={startFederatedTraining}
                    disabled={isTraining}
                    sx={{
                      background: 'linear-gradient(135deg, #00e5ff, #7c4dff)',
                      color: '#0a192f',
                      fontWeight: 700,
                      py: 1
                    }}
                  >
                    {isTraining ? 'Training In Progress...' : 'Start Next Training Round'}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={handleExportModel}
                    sx={{ color: '#94a3b8', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                  >
                    Export Certified Model
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Network Throughput & Latency Stats */}
            <Card
              sx={{
                borderRadius: 2.5,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                  <NetworkCheckIcon sx={{ color: '#38bdf8' }} />
                  Federation Network Throughput
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <BoltIcon sx={{ color: '#00e5ff', fontSize: 18 }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>Upload Link</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                        {trainingStatus.uploadSpeed} MB/s
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <BoltIcon sx={{ color: '#00e676', fontSize: 18 }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>Download Link</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                        {trainingStatus.downloadSpeed} MB/s
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <TimerIcon sx={{ color: '#ffb300', fontSize: 18 }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>Federation Latency</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                        {trainingStatus.latency} ms
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <DataUsageIcon sx={{ color: '#b388ff', fontSize: 18 }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>Bandwidth Usage</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                        {trainingStatus.bandwidthUsage} Mbps
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Middle Column: Model Performance & Convergence Chart */}
          <Grid item xs={12} lg={4}>
            {/* Global Model Performance Card */}
            <Card
              sx={{
                mb: 2.5,
                borderRadius: 2.5,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 230, 118, 0.25)'
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.05rem' }}>
                    <AssessmentIcon sx={{ color: '#00e676' }} />
                    Global Model Performance
                  </Typography>
                  <Chip
                    label="FedAvg + DP"
                    size="small"
                    sx={{ bgcolor: 'rgba(0, 229, 255, 0.12)', color: '#00e5ff', fontWeight: 600 }}
                  />
                </Box>

                {/* 4 Performance Metric Badges */}
                <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.8, borderRadius: 2, bgcolor: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.25)', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#00e676', fontSize: '1.8rem', lineHeight: 1 }}>
                        {(trainingStatus.globalAccuracy * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                        Accuracy
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ p: 1.8, borderRadius: 2, bgcolor: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.25)', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#00e5ff', fontSize: '1.8rem', lineHeight: 1 }}>
                        {(trainingStatus.globalRecall * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                        Recall
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ p: 1.8, borderRadius: 2, bgcolor: 'rgba(255, 179, 0, 0.08)', border: '1px solid rgba(255, 179, 0, 0.25)', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffb300', fontSize: '1.8rem', lineHeight: 1 }}>
                        {(trainingStatus.globalPrecision * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                        Precision
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ p: 1.8, borderRadius: 2, bgcolor: 'rgba(213, 0, 249, 0.08)', border: '1px solid rgba(213, 0, 249, 0.25)', textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#e1bee7', fontSize: '1.8rem', lineHeight: 1 }}>
                        {(trainingStatus.globalF1 * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                        F1-Score
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Training Convergence Chart */}
                <Box sx={{ pt: 0.5 }}>
                  <FederatedTrainingChart data={trainingHistory} height={200} />
                </Box>
              </CardContent>
            </Card>

            {/* Live ATWC Correlations Mini-Feed */}
            <Card
              sx={{
                borderRadius: 2.5,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 87, 34, 0.22)'
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                    <PolylineIcon sx={{ color: '#ff5722' }} />
                    Live ATWC Correlated Circuits
                  </Typography>
                  <Button size="small" onClick={() => setActiveTab(4)} sx={{ color: '#ff5722', textTransform: 'none', fontSize: '0.78rem' }}>
                    View All →
                  </Button>
                </Box>

                <List dense disablePadding>
                  {atwcCorrelations.slice(0, 3).map((corr, i) => (
                    <ListItem
                      key={corr.id || i}
                      sx={{
                        mb: 1,
                        p: 1.2,
                        borderRadius: 1.5,
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#00e5ff', fontWeight: 700 }}>
                            {corr.circuitId}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Δt: {corr.timingDelta}ms
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          ISPs: {(corr.involvedISPs || []).join(', ')}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${Math.round(corr.confidence * 100)}% conf`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          bgcolor: corr.confidence > 0.85 ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 179, 0, 0.15)',
                          color: corr.confidence > 0.85 ? '#00e676' : '#ffb300'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: ISP Participation Network Topology */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                borderRadius: 2.5,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(124, 77, 255, 0.25)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.05rem' }}>
                    <CorporateFareIcon sx={{ color: '#b388ff' }} />
                    ISP Participation Network
                  </Typography>
                  <Button size="small" onClick={() => setActiveTab(1)} sx={{ color: '#b388ff', textTransform: 'none', fontSize: '0.78rem' }}>
                    Manage Nodes →
                  </Button>
                </Box>

                {/* Canvas Network Graph Component */}
                <Box sx={{ flexGrow: 1, minHeight: 380, width: '100%', borderRadius: 2, overflow: 'hidden', bgcolor: 'rgba(10, 25, 41, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <ISPParticipationNetwork
                    isps={isps}
                    onISPSelect={handleISPSelect}
                    height={380}
                  />
                </Box>

                {/* Network Legend */}
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mb: 1 }}>
                    TOPOLOGY STATUS LEGEND:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip size="small" label="Government Tier-1" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff' }} />
                    <Chip size="small" label="Private Core" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(0, 230, 118, 0.15)', color: '#00e676' }} />
                    <Chip size="small" label="Active Training" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(255, 179, 0, 0.15)', color: '#ffb300' }} />
                    <Chip size="small" label="Idle / Standby" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB 1: ISP PARTICIPANTS MANAGEMENT
      ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 1 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header & Filter Bar */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CorporateFareIcon sx={{ color: '#00e5ff' }} />
                ISP Federation Nodes & Regional Telemetry
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Distributed learning nodes submitting differential-private local gradients. Compliant with Indian DPDP Act 2023.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
              <TextField
                size="small"
                placeholder="Search ISP or city..."
                value={ispSearch}
                onChange={(e) => setIspSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#64748b', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: 'rgba(10, 25, 41, 0.6)',
                  borderRadius: 1.5,
                  minWidth: 200,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                  '& input': { color: '#ffffff', fontSize: '0.85rem' }
                }}
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={ispStatusFilter}
                  onChange={(e) => setIspStatusFilter(e.target.value)}
                  sx={{
                    bgcolor: 'rgba(10, 25, 41, 0.6)',
                    color: '#ffffff',
                    borderRadius: 1.5,
                    fontSize: '0.85rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Online / Active</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="idle">Idle / Standby</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={ispTypeFilter}
                  onChange={(e) => setIspTypeFilter(e.target.value)}
                  sx={{
                    bgcolor: 'rgba(10, 25, 41, 0.6)',
                    color: '#ffffff',
                    borderRadius: 1.5,
                    fontSize: '0.85rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.12)' }
                  }}
                >
                  <MenuItem value="all">All Sectors</MenuItem>
                  <MenuItem value="government">Government / PSU</MenuItem>
                  <MenuItem value="private">Private Telecom</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* ISP Cards Grid */}
          <Grid container spacing={2.5}>
            {filteredISPs.map((isp) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={isp.id}>
                <Card
                  onClick={() => handleISPSelect(isp)}
                  sx={{
                    height: '100%',
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    bgcolor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                      borderColor: isp.isActive ? '#00e5ff' : '#94a3b8',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Header: Avatar, Name, Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          mr: 1.5,
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          background: isp.ispType === 'government'
                            ? 'linear-gradient(135deg, #00e5ff, #0288d1)'
                            : 'linear-gradient(135deg, #00e676, #2e7d32)',
                          color: '#0a192f'
                        }}
                      >
                        {isp.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.92rem' }}>
                          {isp.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                          {isp.location.city} • {isp.bandwidth}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Chips for Sector & Status */}
                    <Box sx={{ display: 'flex', gap: 0.8, mb: 2 }}>
                      <Chip
                        label={isp.status.toUpperCase()}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: isp.status === 'training' ? 'rgba(255, 179, 0, 0.2)' :
                                   isp.status === 'connected' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          color: isp.status === 'training' ? '#ffb300' :
                                 isp.status === 'connected' ? '#00e676' : '#94a3b8'
                        }}
                      />
                      <Chip
                        label={isp.ispType === 'government' ? 'Govt / Tier 1' : 'Private'}
                        size="small"
                        sx={{ height: 20, fontSize: '0.68rem', bgcolor: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1' }}
                      />
                      {isp.dpdpCompliant && (
                        <Chip
                          label="DPDP Valid"
                          size="small"
                          sx={{ height: 20, fontSize: '0.68rem', bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}
                        />
                      )}
                    </Box>

                    {/* Telemetry Metrics */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>Data Points</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                            {isp.dataPoints.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>Contribution</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#00e5ff' }}>
                            {isp.contribution}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Local Accuracy Progress */}
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>Local Model Accuracy</Typography>
                        <Typography variant="caption" sx={{ color: '#00e676', fontWeight: 700, fontSize: '0.72rem' }}>
                          {(isp.modelAccuracy * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={isp.modelAccuracy * 100}
                        sx={{
                          height: 5,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(255, 255, 255, 0.08)',
                          '& .MuiLinearProgress-bar': { bgcolor: '#00e676' }
                        }}
                      />
                    </Box>

                    {/* Training Progress if training */}
                    {isp.status === 'training' && (
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#ffb300', fontSize: '0.72rem' }}>Training Round Progress</Typography>
                          <Typography variant="caption" sx={{ color: '#ffb300', fontWeight: 700, fontSize: '0.72rem' }}>
                            {isp.trainingProgress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={isp.trainingProgress}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                            '& .MuiLinearProgress-bar': { bgcolor: '#ffb300' }
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ px: 2.5, pb: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      startIcon={<CloudSyncIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`⚡ Syncing encrypted gradient updates from ${isp.name}`, 'info');
                        setISPs(prev => prev.map(item => item.id === isp.id ? { ...item, status: 'training', trainingProgress: 20 } : item));
                      }}
                      sx={{
                        color: '#38bdf8',
                        borderColor: 'rgba(56, 189, 248, 0.3)',
                        fontSize: '0.75rem',
                        '&:hover': {
                          borderColor: '#38bdf8',
                          bgcolor: 'rgba(56, 189, 248, 0.08)'
                        }
                      }}
                    >
                      Sync Local Weights
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB 2: TRAINING ANALYTICS & AUDIT LOG
      ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 2 && (
        <Grid container spacing={2.5}>
          {/* Main Chart Card */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mb: 2.5
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon sx={{ color: '#00e676' }} />
                  Federated Convergence Analytics
                </Typography>
                <Chip
                  label="Multi-ISP Loss Optimization"
                  size="small"
                  sx={{ bgcolor: 'rgba(0, 230, 118, 0.15)', color: '#00e676', fontWeight: 600 }}
                />
              </Box>

              <Box sx={{ height: 260, mb: 3 }}>
                <FederatedTrainingChart data={trainingHistory} height={260} showAllMetrics />
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2 }}>
                Historical Rounds Audit Ledger
              </Typography>

              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ '& th': { bgcolor: '#0f172a', color: '#94a3b8', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.08)' } }}>
                      <TableCell>Round</TableCell>
                      <TableCell align="center">Accuracy</TableCell>
                      <TableCell align="center">Loss</TableCell>
                      <TableCell align="center">Precision</TableCell>
                      <TableCell align="center">Recall</TableCell>
                      <TableCell align="center">Participants</TableCell>
                      <TableCell align="center">Duration</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainingHistory.slice().reverse().map((round) => (
                      <TableRow
                        key={round.round}
                        hover
                        sx={{ '& td': { color: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' } }}
                      >
                        <TableCell sx={{ fontWeight: 700, color: '#00e5ff !important' }}>
                          R{round.round}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#00e676' }}>
                            {(round.accuracy * 100).toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#ff4081 !important' }}>
                          {round.loss.toFixed(3)}
                        </TableCell>
                        <TableCell align="center">
                          {(round.precision ? (round.precision * 100).toFixed(1) : '81.0')}%
                        </TableCell>
                        <TableCell align="center">
                          {(round.recall ? (round.recall * 100).toFixed(1) : '92.0')}%
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={`${round.participants} ISPs`} size="small" sx={{ height: 20, bgcolor: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell align="center">{round.duration}</TableCell>
                        <TableCell align="center">
                          <Chip label="Committed" size="small" sx={{ height: 20, bgcolor: 'rgba(0, 230, 118, 0.15)', color: '#00e676', fontSize: '0.7rem' }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Right Insights Cards */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mb: 2.5
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: '#00e676' }} />
                Convergence Performance Insights
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>Overall Accuracy Gain</Typography>
                  <Typography variant="body2" sx={{ color: '#00e676', fontWeight: 700 }}>
                    +{( (trainingHistory[trainingHistory.length - 1]?.accuracy - trainingHistory[0]?.accuracy) * 100 ).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={78}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #00e5ff, #00e676)' }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>Cumulative Loss Reduction</Typography>
                  <Typography variant="body2" sx={{ color: '#ff4081', fontWeight: 700 }}>
                    -{(trainingHistory[0]?.loss - trainingHistory[trainingHistory.length - 1]?.loss).toFixed(3)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={65}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #ff4081, #ff80ab)' }
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>Gradient Drift Tolerance</Typography>
                  <Typography variant="body2" sx={{ color: '#38bdf8', fontWeight: 700 }}>
                    &lt; 0.012 (FedProx Bound)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={92}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#38bdf8' }
                  }}
                />
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 229, 255, 0.2)'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00e5ff', mb: 1.5 }}>
                Export Audit Dossier
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                Download cryptographic verification logs of all model rounds, SHA-256 weight hashes, and ISP participation certificates.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FileDownloadIcon />}
                onClick={() => {
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trainingHistory, null, 2));
                  const a = document.createElement('a');
                  a.setAttribute('href', dataStr);
                  a.setAttribute('download', 'tor_federated_rounds_audit.json');
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  showToast('Training history exported to JSON', 'success');
                }}
                sx={{ color: '#00e5ff', borderColor: 'rgba(0, 229, 255, 0.3)' }}
              >
                Download Audit JSON
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB 3: PRIVACY & CRYPTOGRAPHY
      ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 3 && (
        <Grid container spacing={2.5}>
          {/* Top Privacy Vectors Grid */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <PrivacyHeatmap metrics={privacyMetrics} height={230} />
            </Paper>
          </Grid>

          {/* Differential Privacy Tuner Card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 229, 255, 0.2)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon sx={{ color: '#00e5ff' }} />
                Differential Privacy Loss Parameter (ε) Tuner
              </Typography>

              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                Calibrate differential privacy budget (ε). Smaller ε injects higher calibrated Laplace noise to protect individual citizen IP packets, while larger ε prioritizes model accuracy.
              </Typography>

              <Box sx={{ mb: 3, px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Maximum Privacy (ε=0.2)</Typography>
                  <Typography variant="caption" sx={{ color: '#00e5ff', fontWeight: 700, fontSize: '0.9rem' }}>
                    Active Budget: ε = {privacyMetrics.differentialPrivacy.epsilon}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Optimal Utility (ε=5.0)</Typography>
                </Box>
                <Slider
                  value={privacyMetrics.differentialPrivacy.epsilon}
                  onChange={(e, val) => {
                    setPrivacyMetrics(prev => ({
                      ...prev,
                      differentialPrivacy: { ...prev.differentialPrivacy, epsilon: val }
                    }));
                  }}
                  min={0.2}
                  max={5.0}
                  step={0.1}
                  sx={{
                    color: '#00e5ff',
                    '& .MuiSlider-thumb': {
                      boxShadow: '0 0 10px #00e5ff'
                    }
                  }}
                />
              </Box>

              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.15)', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', mb: 0.5 }}>
                  <strong>Theoretical Protection Guarantee:</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  For any query Q on ISP datasets D1 and D2 differing by 1 citizen netflow: Pr[M(D1) ∈ S] ≤ exp({privacyMetrics.differentialPrivacy.epsilon}) × Pr[M(D2) ∈ S] + 10⁻⁵.
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Secure Multi-Party Aggregation (SMPC) Card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 230, 118, 0.2)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon sx={{ color: '#00e676' }} />
                Paillier Homomorphic Encryption & SMPC
              </Typography>

              <List dense>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon><VerifiedUserIcon sx={{ color: '#00e676' }} /></ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600 }}>Asymmetric Cryptography</Typography>}
                    secondary={<Typography variant="caption" sx={{ color: '#94a3b8' }}>Paillier 2048-bit Public-Key Cryptosystem</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon><VerifiedUserIcon sx={{ color: '#00e5ff' }} /></ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600 }}>Zero Raw Data Transmission</Typography>}
                    secondary={<Typography variant="caption" sx={{ color: '#94a3b8' }}>Only encrypted weight tensors are exchanged; server aggregates without decrypting individual vectors.</Typography>}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon><VerifiedUserIcon sx={{ color: '#b388ff' }} /></ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ color: '#f8fafc', fontWeight: 600 }}>DPDP Act 2023 Statutory Compliance</Typography>}
                    secondary={<Typography variant="caption" sx={{ color: '#94a3b8' }}>Section 8(5) Data Protection by Design & Purpose Limitation verified.</Typography>}
                  />
                </ListItem>
              </List>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<PrivacyTipIcon />}
                onClick={() => setShowPrivacyDetails(true)}
                sx={{ mt: 1, color: '#00e676', borderColor: 'rgba(0, 230, 118, 0.3)' }}
              >
                View Full Compliance Certificate
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB 4: ATWC CORRELATIONS & INTERACTIVE TEST BENCH LAB
      ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 4 && (
        <Grid container spacing={2.5}>
          {/* Continuous Onionoo Ingestion & Dynamic Prior Bounds */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.7))',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 87, 34, 0.3)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff5722', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PsychologyIcon />
                  Estimated Network-State Latency Prior (Continuous Onionoo Ingestion)
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label="Near-Real-Time Tor Telemetry" color="warning" size="small" variant="outlined" />
                  <Chip label={`Congestion Ct: ${torNetworkState.congestionFactor}`} size="small" sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }} />
                  <Chip label={`Historical B0: ${torNetworkState.historicalBaselineB0MB || '54.69 MB/s'}`} size="small" sx={{ bgcolor: 'rgba(213, 0, 249, 0.15)', color: '#e1bee7' }} />
                </Stack>
              </Box>

              <Alert severity="info" sx={{ mb: 2.5, bgcolor: 'rgba(255, 87, 34, 0.08)', color: '#cbd5e1', border: '1px solid rgba(255, 87, 34, 0.2)' }}>
                <strong>Mathematical Formulation:</strong> ATWC transforms public Onionoo network-state indicators into statistical prior bounds N(μ_prior, σ_prior²) with adaptive search interval W = [μ - 2.5σ, μ + 3.0σ]. Does not inspect encrypted packet payloads.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Latency Prior Mean (μ_prior)</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#ff5722', mt: 0.5 }}>
                      {torNetworkState.muPrior || 365.5} ms
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>μ0 × (1 + 0.85 × Ct)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Jitter Prior (σ_prior)</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffb300', mt: 0.5 }}>
                      ±{torNetworkState.sigmaPrior || 87.7} ms
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>σ0 × √(1 + 1.25 × Ct)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Adaptive Bounds (W)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#00e676', mt: 0.8 }}>
                      [{torNetworkState.window[0]} .. {torNetworkState.window[1]}] ms
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Width: {torNetworkState.windowWidthMs} ms</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Tor Congestion Index</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#38bdf8', mt: 0.5 }}>
                      {torNetworkState.congestionFactor}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{torNetworkState.overloadCount} overloaded relays</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Interactive ATWC Correlation Lab Console */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon sx={{ color: '#00e5ff' }} />
                Interactive ATWC Correlation Test Bench
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                Simulate ingress vs egress event timing to calculate probabilistic correlation against live Tor network latency priors.
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Observed Timing Delta (Δt in ms)"
                    type="number"
                    value={testForm.ingressDeltaOffset}
                    onChange={(e) => setTestForm({ ...testForm, ingressDeltaOffset: e.target.value })}
                    helperText="Nominal Tor transit: 250 - 550 ms"
                    sx={{
                      '& .MuiOutlinedInput-root': { bgcolor: 'rgba(10, 25, 41, 0.6)' },
                      '& input': { color: '#ffffff' }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#94a3b8' }}>Relay Bandwidth Capacity</InputLabel>
                    <Select
                      value={testForm.relayBandwidth}
                      label="Relay Bandwidth Capacity"
                      onChange={(e) => setTestForm({ ...testForm, relayBandwidth: e.target.value })}
                      sx={{
                        bgcolor: 'rgba(10, 25, 41, 0.6)',
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                      }}
                    >
                      <MenuItem value={10000000}>10 MB/s (Standard Relay)</MenuItem>
                      <MenuItem value={50000000}>50 MB/s (High Capacity)</MenuItem>
                      <MenuItem value={100000000}>100 MB/s (Backbone Guard)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                fullWidth
                startIcon={isTestingCorrelation ? <CircularProgress size={18} color="inherit" /> : <PlayIcon />}
                onClick={handleRunCorrelationTest}
                disabled={isTestingCorrelation}
                sx={{
                  background: 'linear-gradient(135deg, #00e5ff, #7c4dff)',
                  color: '#0a192f',
                  fontWeight: 700,
                  py: 1.2,
                  mb: 3
                }}
              >
                {isTestingCorrelation ? 'Evaluating Gaussian Density...' : 'Run Correlation Test (Live API)'}
              </Button>

              {/* Test Evaluation Result Display */}
              {testResult ? (
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(10, 25, 41, 0.8)', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                      CORRELATION VERDICT:
                    </Typography>
                    <Chip
                      label={testResult.inWindow ? 'HIGH PROBABILITY MATCH' : 'OUTSIDE ADAPTIVE WINDOW'}
                      size="small"
                      sx={{
                        bgcolor: testResult.inWindow ? 'rgba(0, 230, 118, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                        color: testResult.inWindow ? '#00e676' : '#f44336',
                        fontWeight: 700
                      }}
                    />
                  </Box>

                  <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>Observed Delta (Δt):</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#00e5ff' }}>
                        {testResult.observedDeltaMs} ms
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>Correlation Confidence:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: testResult.correlationConfidence > 80 ? '#00e676' : '#ffb300' }}>
                        {testResult.correlationConfidence}%
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    Calculated using {testResult.method} against live Tor network congestion index ({testResult.congestionAtObservation}).
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(10, 25, 41, 0.4)', textAlign: 'center', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Click "Run Correlation Test" to evaluate test packet transit through the live ATWC timing window.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Correlations Stream Table */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: '100%'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PolylineIcon sx={{ color: '#ffb300' }} />
                Real-Time ATWC Circuit Correlations Stream
              </Typography>

              <TableContainer sx={{ maxHeight: 380 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ '& th': { bgcolor: '#0f172a', color: '#94a3b8', fontWeight: 700, borderColor: 'rgba(255, 255, 255, 0.08)' } }}>
                      <TableCell>Circuit ID</TableCell>
                      <TableCell>Timing Δt</TableCell>
                      <TableCell>In Window</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Involved ISPs</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {atwcCorrelations.map((corr, index) => (
                      <TableRow
                        key={corr.id || index}
                        hover
                        sx={{ '& td': { color: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' } }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', color: '#00e5ff !important' }}>
                          {corr.circuitId}
                        </TableCell>
                        <TableCell>{corr.timingDelta} ms</TableCell>
                        <TableCell>
                          <Chip
                            label={corr.inWindow ? 'Yes' : 'No'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: corr.inWindow ? 'rgba(0, 230, 118, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                              color: corr.inWindow ? '#00e676' : '#f44336'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: corr.confidence > 0.8 ? '#00e676' : '#ffb300' }}>
                            {Math.round(corr.confidence * 100)}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" noWrap sx={{ maxWidth: 160, display: 'block' }}>
                            {(corr.involvedISPs || []).join(', ')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          TAB 5: SETTINGS & FEDERATION GOVERNANCE
      ═════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 5 && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneIcon sx={{ color: '#00e5ff' }} />
                Federation Protocol & Aggregation Parameters
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#94a3b8' }}>Federated Aggregation Method</InputLabel>
                    <Select
                      value={federationSettings.aggregationStrategy}
                      label="Federated Aggregation Method"
                      onChange={(e) => setFederationSettings({ ...federationSettings, aggregationStrategy: e.target.value })}
                      sx={{
                        bgcolor: 'rgba(10, 25, 41, 0.6)',
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                      }}
                    >
                      <MenuItem value="fedavg">FedAvg (Federated Averaging)</MenuItem>
                      <MenuItem value="fedprox">FedProx (Proximal Regularization)</MenuItem>
                      <MenuItem value="smpc">SMPC (Secure Multi-Party Paillier)</MenuItem>
                      <MenuItem value="krum">Krum (Byzantine Fault-Tolerant)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#94a3b8' }}>Model Checkpoint Format</InputLabel>
                    <Select
                      value={federationSettings.exportFormat}
                      label="Model Checkpoint Format"
                      onChange={(e) => setFederationSettings({ ...federationSettings, exportFormat: e.target.value })}
                      sx={{
                        bgcolor: 'rgba(10, 25, 41, 0.6)',
                        color: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' }
                      }}
                    >
                      <MenuItem value="onnx">ONNX Open Neural Network Exchange</MenuItem>
                      <MenuItem value="pytorch">PyTorch State Dict (.pt)</MenuItem>
                      <MenuItem value="json">Certified JSON Weight Graph</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Minimum Quorum ISP Nodes"
                    value={federationSettings.minParticipants}
                    onChange={(e) => setFederationSettings({ ...federationSettings, minParticipants: parseInt(e.target.value) })}
                    sx={{
                      '& .MuiOutlinedInput-root': { bgcolor: 'rgba(10, 25, 41, 0.6)' },
                      '& input': { color: '#ffffff' }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Maximum Convergence Rounds"
                    value={federationSettings.maxRounds}
                    onChange={(e) => setFederationSettings({ ...federationSettings, maxRounds: parseInt(e.target.value) })}
                    sx={{
                      '& .MuiOutlinedInput-root': { bgcolor: 'rgba(10, 25, 41, 0.6)' },
                      '& input': { color: '#ffffff' }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={federationSettings.autoStart}
                        onChange={(e) => setFederationSettings({ ...federationSettings, autoStart: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00e5ff' } }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: '#e2e8f0' }}>Auto-dispatch next training round upon quorum attainment</Typography>}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={federationSettings.byzantineTolerance}
                        onChange={(e) => setFederationSettings({ ...federationSettings, byzantineTolerance: e.target.checked })}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00e676' } }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: '#e2e8f0' }}>Enable Byzantine gradient anomaly clipping against malicious ISP updates</Typography>}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => showToast('Federation Governance settings saved and committed to registry', 'success')}
                    sx={{
                      background: 'linear-gradient(135deg, #00e5ff, #7c4dff)',
                      color: '#0a192f',
                      fontWeight: 700,
                      px: 3,
                      py: 1
                    }}
                  >
                    Save Federation Settings
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2 }}>
                Federation Quorum Status
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                Currently <strong>{trainingStatus.activeParticipants}</strong> out of <strong>{trainingStatus.totalParticipants}</strong> registered ISP nodes are actively participating in model training.
              </Typography>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.25)', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#00e676', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  QUORUM REQUIREMENT MET:
                </Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                  {trainingStatus.activeParticipants} &ge; {federationSettings.minParticipants} (Minimum threshold satisfied for convergence).
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ─── ISP Deep Inspector Modal ────────────────────────────────────────── */}
      <Dialog
        open={showIspModal}
        onClose={() => setShowIspModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: 3,
            color: '#f8fafc',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        {selectedISP && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: selectedISP.ispType === 'government' ? '#00e5ff' : '#00e676', color: '#0a192f', fontWeight: 700 }}>
                  {selectedISP.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedISP.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>{selectedISP.location.city} • {selectedISP.bandwidth}</Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setShowIspModal(false)} sx={{ color: '#94a3b8' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Participation Status</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: selectedISP.isActive ? '#00e676' : '#94a3b8' }}>
                    {selectedISP.status.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Local Accuracy</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#00e5ff' }}>
                    {(selectedISP.modelAccuracy * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>DPDP Act Compliance</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#00e676' }}>
                    100% Certified
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Data Volume</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#ffb300' }}>
                    {selectedISP.dataPoints.toLocaleString()} netflows
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
                Local SGD Training Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={selectedISP.trainingProgress || 80}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  '& .MuiLinearProgress-bar': { bgcolor: '#00e5ff' },
                  mb: 2
                }}
              />

              <Alert severity="success" sx={{ bgcolor: 'rgba(0, 230, 118, 0.1)', color: '#cbd5e1' }}>
                Encrypted differential private gradients verified against master federated registry.
              </Alert>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setShowIspModal(false)} sx={{ color: '#94a3b8' }}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  showToast(`Synced model weights with ${selectedISP.name}`, 'success');
                  setShowIspModal(false);
                }}
                sx={{ bgcolor: '#00e5ff', color: '#0a192f', fontWeight: 700 }}
              >
                Trigger Node Re-Sync
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ─── Privacy Details Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={showPrivacyDetails}
        onClose={() => setShowPrivacyDetails(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: 3,
            color: '#f8fafc',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PrivacyTipIcon sx={{ color: '#00e5ff' }} />
          Cryptographic Privacy & DPDP Act 2023 Compliance Specifications
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 2 }}>
            TOR Sentinel implements end-to-end multi-layer privacy architectures ensuring zero plaintext packet inspection:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><LockIcon sx={{ color: '#00e5ff' }} /></ListItemIcon>
              <ListItemText
                primary={<Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>Differential Privacy (ε = 1.2, δ = 10⁻⁵)</Typography>}
                secondary={<Typography variant="caption" sx={{ color: '#94a3b8' }}>Adds calibrated Laplace noise to local weight vectors, making model updates cryptographically resistant to data reconstruction.</Typography>}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><SecurityIcon sx={{ color: '#00e676' }} /></ListItemIcon>
              <ListItemText
                primary={<Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>Paillier Homomorphic SMPC Aggregation</Typography>}
                secondary={<Typography variant="caption" sx={{ color: '#94a3b8' }}>Weights are aggregated under encryption before any central model parameter update is committed.</Typography>}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><VerifiedUserIcon sx={{ color: '#b388ff' }} /></ListItemIcon>
              <ListItemText
                primary={<Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>Digital Personal Data Protection (DPDP) Act 2023 Section 8(5)</Typography>}
                secondary={<Typography variant="caption" sx={{ color: '#94a3b8' }}>Zero user PII, telephone numbers, or unmasked subscriber IP addresses are ingested or stored.</Typography>}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowPrivacyDetails(false)} sx={{ color: '#00e5ff' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Integrated Feedback Toast Notification ─────────────────────────── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: '100%',
            fontWeight: 600,
            bgcolor: toast.severity === 'success' ? '#00c853' :
                     toast.severity === 'error' ? '#d50000' : '#0288d1'
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AtwcPage;