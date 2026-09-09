import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout Component
import Layout from './components/Layout/Layout';

// Existing Pages - USING EXACT FILENAMES FROM YOUR LIST
import HomePage from './pages/HomePage';
import CorrelationPage from './pages/CorrelationPage';
import EncryptionPage from './pages/EncryptionPage';
import AtwcPage from './pages/ATWC ENGINE';  // Note: This is the exact filename
import TrafficAnalyzerPage from './pages/TrafficAnalyzer';
import DataCollectionPage from './pages/DataCollectionPage';
import TorMetricsPage from './pages/TorMetricsPage';
import NodesPage from './pages/NodesPage';
import Traffic from './pages/Traffic';  // Changed from TrafficPage to Traffic
import Threats from './pages/Threats';  // Changed from ThreatsPage to Threats
import Analytics from './pages/Analytics';  // Changed from AnalyticsPage to Analytics
import Alerts from './pages/Alerts';  // Changed from AlertsPage to Alerts
import AlertDetail from './pages/AlertDetail';  // Changed from AlertDetailPage to AlertDetail
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';

// Add NetworkMap import
import NetworkMap from './pages/NetworkMap';
import PatternRecognition from './pages/PatternRecognition';
import AIPredictions from './pages/ai';

// NTRO PS-26151 — New Dark Web Intelligence Pages
import HiddenServiceScanner from './pages/HiddenServiceScanner';
import ActorIdentityGraph from './pages/ActorIdentityGraph';
import StylometryEngine from './pages/StylometryEngine';
import DossierExport from './pages/DossierExport';
import ThreatIntelMap from './pages/ThreatIntelMap';
import TimelineQueryEngine from './pages/TimelineQueryEngine';
import BehavioralProfiler from './pages/BehavioralProfiler';
import BlockchainTracer from './pages/BlockchainTracer';
import AutonomousCrawler from './pages/AutonomousCrawler';
import EvidenceChainBuilder from './pages/EvidenceChainBuilder';

// NTRO PS-26151 — Phase 3: New Investigation Platform Pages
import CaseManagement from './pages/CaseManagement';
import RealTimeMonitorPage from './pages/RealTimeMonitor';
import IntelligenceReport from './pages/IntelligenceReport';
import CorrelationMatrixPage from './pages/CorrelationMatrix';

// NTRO PS-26151 — State-Level Killer Feature: Project A.E.G.I.S. (3-Layer Unified De-Anonymization Engine)
import ProjectAegis from './pages/ProjectAegis';

// Simple placeholder component
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

function App() {
  const [isAuthenticated] = React.useState(true); // Set to false for login screen

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={createTheme({
        palette: {
          mode: 'dark',
          primary: { main: '#2196f3' },
          background: { default: '#0a1929' },
        },
      })}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <Router>
      <React.Suspense fallback={<div style={{ padding: '40px', color: 'white' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Note: Layout already has <Outlet /> in its content area */}
            
            {/* Default route - HomePage */}
            <Route index element={<HomePage />} />
            
            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Existing routes - MATCHING THE PATHS FROM LAYOUT */}
            <Route path="correlationPage" element={<CorrelationPage />} />
            <Route path="EncryptionPage" element={<EncryptionPage />} />
            <Route path="Atwcpage" element={<AtwcPage />} />
            <Route path="TrafficAnalyzer" element={<TrafficAnalyzerPage />} />
            <Route path="DataCollectionPage" element={<DataCollectionPage />} />
            <Route path="TorMetricsPage" element={<TorMetricsPage />} />
            <Route path="nodes" element={<NodesPage />} />
            <Route path="traffic" element={<Traffic />} />
            <Route path="threats" element={<Threats />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="alerts/:id" element={<AlertDetail />} />
            
            {/* NEW ROUTES - Must match Layout menu paths */}
            <Route path="realtime" element={<RealTimeMonitorPage />} />
            <Route path="NetworkMap" element={<NetworkMap />} />
            <Route path="pattern" element={<PatternRecognition />} />
            <Route path="ai" element={<AIPredictions />} />

            {/* NTRO PS-26151 — Phase 3: New Investigation Platform Routes */}
            <Route path="cases" element={<CaseManagement />} />
            <Route path="monitor" element={<RealTimeMonitorPage />} />
            <Route path="intel-report" element={<IntelligenceReport />} />
            <Route path="correlation-matrix" element={<CorrelationMatrixPage />} />
            <Route path="aegis" element={<ProjectAegis />} />

            {/* NTRO PS-26151 — Dark Web Intelligence Routes */}
            <Route path="scanner" element={<HiddenServiceScanner />} />
            <Route path="actor-graph" element={<ActorIdentityGraph />} />
            <Route path="stylometry" element={<StylometryEngine />} />
            <Route path="dossier" element={<DossierExport />} />
            <Route path="intel-map" element={<ThreatIntelMap />} />
            <Route path="timeline" element={<TimelineQueryEngine />} />
            <Route path="behavioral" element={<BehavioralProfiler />} />
            <Route path="blockchain" element={<BlockchainTracer />} />
            <Route path="crawler" element={<AutonomousCrawler />} />
            <Route path="evidence" element={<EvidenceChainBuilder />} />
            
            {/* Bottom menu routes */}
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="login" element={<Login />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;