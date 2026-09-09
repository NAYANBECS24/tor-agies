import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout Component
import Layout from './components/Layout/Layout';

// Auth Pages (standalone — no sidebar)
import Login from './pages/Login';
import Register from './pages/Register';

// App Pages (inside Layout)
import HomePage from './pages/HomePage';
import CorrelationPage from './pages/CorrelationPage';
import EncryptionPage from './pages/EncryptionPage';
import AtwcPage from './pages/ATWC ENGINE';
import TrafficAnalyzerPage from './pages/TrafficAnalyzer';
import DataCollectionPage from './pages/DataCollectionPage';
import TorMetricsPage from './pages/TorMetricsPage';
import NodesPage from './pages/NodesPage';
import Traffic from './pages/Traffic';
import Threats from './pages/Threats';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import AlertDetail from './pages/AlertDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import NetworkMap from './pages/NetworkMap';
import PatternRecognition from './pages/PatternRecognition';
import AIPredictions from './pages/ai';

// NTRO PS-26151 — Dark Web Intelligence Pages
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

// NTRO PS-26151 — Phase 3: Investigation Platform Pages
import CaseManagement from './pages/CaseManagement';
import RealTimeMonitorPage from './pages/RealTimeMonitor';
import IntelligenceReport from './pages/IntelligenceReport';
import CorrelationMatrixPage from './pages/CorrelationMatrix';

// NTRO PS-26151 — Project A.E.G.I.S.
import ProjectAegis from './pages/ProjectAegis';

// ─── Theme ────────────────────────────────────────────────────────────────────
const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2196f3' },
    secondary: { main: '#ff9800' },
    background: { default: '#0a1929', paper: '#132f4c' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function isLoggedIn() {
  return !!(localStorage.getItem('token') && localStorage.getItem('user'));
}

// ─── Guards ───────────────────────────────────────────────────────────────────

/**
 * ProtectedRoute — redirects to /login if not authenticated
 */
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * PublicOnlyRoute — redirects logged-in users away from /login to dashboard
 */
function PublicOnlyRoute({ children }) {
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  // Re-render on auth changes (login / logout)
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    // Poll every 300ms to react to localStorage changes in same tab
    const interval = setInterval(forceUpdate, 300);
    window.addEventListener('storage', forceUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', forceUpdate);
    };
  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Router>
        <Routes>

          {/* ── PUBLIC routes (fullscreen, no sidebar) ── */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* ── PROTECTED routes (inside Layout with sidebar) ── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Home / Dashboard */}
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Core analysis */}
            <Route path="correlationPage" element={<CorrelationPage />} />
            <Route path="EncryptionPage" element={<EncryptionPage />} />
            <Route path="Atwcpage" element={<AtwcPage />} />
            <Route path="TrafficAnalyzer" element={<TrafficAnalyzerPage />} />
            <Route path="DataCollectionPage" element={<DataCollectionPage />} />
            <Route path="TorMetricsPage" element={<TorMetricsPage />} />

            {/* Route Aliases to prevent 404 on varied path casings */}
            <Route path="correlation" element={<Navigate to="/correlationPage" replace />} />
            <Route path="encryption" element={<Navigate to="/EncryptionPage" replace />} />
            <Route path="atwc" element={<Navigate to="/Atwcpage" replace />} />
            <Route path="data-collection" element={<Navigate to="/DataCollectionPage" replace />} />
            <Route path="tor-metrics" element={<Navigate to="/TorMetricsPage" replace />} />

            {/* Monitoring */}
            <Route path="nodes" element={<NodesPage />} />
            <Route path="traffic" element={<Traffic />} />
            <Route path="threats" element={<Threats />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="alerts/:id" element={<AlertDetail />} />
            <Route path="realtime" element={<RealTimeMonitorPage />} />
            <Route path="monitor" element={<RealTimeMonitorPage />} />
            <Route path="NetworkMap" element={<NetworkMap />} />
            <Route path="pattern" element={<PatternRecognition />} />
            <Route path="ai" element={<AIPredictions />} />

            {/* Investigation Platform */}
            <Route path="cases" element={<CaseManagement />} />
            <Route path="intel-report" element={<IntelligenceReport />} />
            <Route path="correlation-matrix" element={<CorrelationMatrixPage />} />
            <Route path="aegis" element={<ProjectAegis />} />

            {/* Dark Web Intelligence */}
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

            {/* User */}
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Catch-all: redirect unknown top-level paths */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;