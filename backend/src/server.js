const express = require('express');
const darkwebRoutes = require('./routes/darkweb.routes');
const nextlevelRoutes = require('./routes/nextlevel.routes');
const casesRoutes = require('./routes/cases.routes');
const aegisRoutes = require('./routes/aegis.routes');
const torRoutes = require('./routes/tor.routes');
const socRoutes = require('./routes/soc.routes');
const onionooCollector = require('./services/onionooCollector');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const { connectDB } = require('./config/database');

// ── New real intelligence services (lazy-load to avoid circular deps) ──────────
let evidenceVaultService = null;
try { evidenceVaultService = require('./services/evidenceVaultService'); } catch (e) { logger.warn('[Boot] evidenceVaultService not loaded:', e.message); }

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Trust proxy for rate-limiting when behind React development proxy / reverse proxy
app.set('trust proxy', 1);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Rate limiting — configured to avoid proxy validation crashes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  validate: { xForwardedForHeader: false, default: true },
  message: 'Too many requests from this IP, please try again later.'
});

// Initialize SQLite database (synchronous, file-based, zero-config)
connectDB();
// Note: MongoDB and Redis removed — SQLite handles all persistence.

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Socket.IO events
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  
  socket.on('subscribe', (channel) => {
    socket.join(channel);
    logger.info(`Client ${socket.id} subscribed to ${channel}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Tor Sentinel API is working correctly!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      test: '/api/test',
      api: '/api'
    }
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'TOR-AEGIS API',
    version: '2.1.0',
    description: 'Dark Web Threat Actor De-Anonymization Platform — NTRO PS-26151',
    status: 'operational',
    modules: [
      'Hidden Service Scanner', 'Actor Identity Graph', 'Stylometry Engine (Real NLP)',
      'Evidence Vault (SHA-256)', 'CT Log Intelligence (crt.sh)',
      'PGP Key Analysis (keys.openpgp.org)', 'Infrastructure Intelligence',
      'Blockchain Graph Traversal', 'Behavioral Profiler', 'Audit Trail',
      'Case Management', 'AEGIS Attribution Engine'
    ],
    endpoints: {
      darkweb: '/api/darkweb',
      nextlevel: '/api/v2',
      cases: '/api/cases',
      aegis: '/api/aegis',
      tor: '/api/tor',
      soc: '/api/soc',
      // New real intelligence endpoints
      ctLogs: '/api/v2/ct-logs',
      pgp: '/api/v2/pgp',
      stylometry: '/api/v2/stylometry',
      evidenceVault: '/api/v2/evidence-vault',
      auditTrail: '/api/v2/audit-trail',
      infrastructure: '/api/v2/infrastructure',
      blockchainGraph: '/api/v2/blockchain/graph',
      dashboardKPIs: '/api/tor/dashboard-kpis'
    }
  });
});

// Dark Web Intelligence Routes (NTRO PS-26151 — Phase 1)
app.use('/api/darkweb', darkwebRoutes);

// Next-Level Intelligence Routes (NTRO PS-26151 — Phase 2)
// Blockchain, Behavioral, OSINT, Timeline, Evidence Chain
app.use('/api/v2', nextlevelRoutes);

// Case Management, Correlation Engine, NTRO Report Generator (NTRO PS-26151 — Phase 3)
app.use('/api/cases', casesRoutes);

// Project A.E.G.I.S. — Deep Unified Threat Attribution Engine (NTRO PS-26151 — Killer Phase)
// Layer 1: Ghost-Server JA3/Favicon · Layer 2: Crypto Time-Travel & PGP · Layer 3: Persona DNA & Chrono-Location
app.use('/api/aegis', aegisRoutes);

// Near-Real-Time Public Tor Network Intelligence & Onionoo Collector (NTRO PS-26151 + RFT 26/2026 SOC)
app.use('/api/tor', torRoutes);
app.use('/tor', torRoutes);
app.use('/api/nodes', (req, res, next) => {
  req.url = '/nodes' + req.url;
  torRoutes(req, res, next);
});

// Operational SOC Integration Layer (RFT 26/2026 Co-Managed SOC Standard)
// SIEM Ingestion, MITRE ATT&CK Detection Engineering, Threat Intel, Threat Hunting, Time Sync, Audit, Retention
app.use('/api/soc', socRoutes);
app.use('/soc', socRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    requestedUrl: req.originalUrl,
    availableEndpoints: ['/health', '/api/test', '/api']
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  let currentPort = Number(PORT);
  const MAX_PORT_RETRIES = 10;
  let retries = 0;

  const tryListen = (port) => {
    httpServer.listen(port, '0.0.0.0', () => {
      logger.info(`==========================================`);
      logger.info(`🚀 Tor Sentinel Backend Server Started`);
      logger.info(`📍 Port: ${port}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 URL: http://localhost:${port}`);
      logger.info(`🏥 Health: http://localhost:${port}/health`);
      logger.info(`🛠️  API Test: http://localhost:${port}/api/test`);
      logger.info(`🔌 WebSocket: ws://localhost:${port}`);
      logger.info(`==========================================`);

      // Console output for user
      console.log('\n✅ Backend Server Started Successfully!');
      console.log('==========================================');
      console.log(`📡 Local:    http://localhost:${port}`);
      console.log(`🌐 Network:  http://0.0.0.0:${port}`);
      console.log(`🏥 Health:   http://localhost:${port}/health`);
      console.log(`🛠️  API Test: http://localhost:${port}/api/test`);
      console.log(`🔌 WebSocket: ws://localhost:${port}`);
      console.log('==========================================');
      console.log('\n📋 Quick Test Commands:');
      console.log(`curl http://localhost:${port}/health`);
      console.log(`curl http://localhost:${port}/api/test`);
      console.log(`curl http://localhost:${port}/api/tor/overview`);
      console.log(`curl http://localhost:${port}/api/tor/onionoo/live`);

      // Launch near-real-time Onionoo public Tor network ingestion
      onionooCollector.startAutoCollection();

      // Log first audit entry
      if (evidenceVaultService) {
        try {
          evidenceVaultService.writeAuditLog({
            action: 'SERVER_START',
            objectType: 'server',
            objectId: 'aegis-backend',
            result: 'SUCCESS',
            details: { port, version: '2.1.0', modules: 'all' }
          });
        } catch { /* non-fatal */ }
      }

      console.log('\n📋 New Intelligence Endpoints:');
      console.log(`  GET  /api/tor/dashboard-kpis  — All dashboard KPIs (real DB)`);
      console.log(`  GET  /api/v2/ct-logs/query?domain=  — CT log lookup (crt.sh)`);
      console.log(`  GET  /api/v2/pgp/lookup/:fp  — PGP key (keys.openpgp.org)`);
      console.log(`  POST /api/v2/stylometry/compare  — Real NLP similarity`);
      console.log(`  GET  /api/v2/evidence-vault/stats  — Evidence vault`);
      console.log(`  POST /api/v2/blockchain/graph/build  — Wallet graph`);
      console.log(`  GET  /api/v2/audit-trail  — Full audit trail`);
    }); // end httpServer.listen callback
  }; // end tryListen

  // Handle server errors
  httpServer.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      retries++;
      if (retries > MAX_PORT_RETRIES) {
        logger.error(`Could not find a free port after ${MAX_PORT_RETRIES} retries. Exiting.`);
        process.exit(1);
      }
      logger.error(`Port ${currentPort} is already in use. Trying port ${currentPort + 1}...`);
      currentPort++;
      tryListen(currentPort);
    } else {
      logger.error(`Server error: ${error.message}`);
      process.exit(1);
    }
  });

  try {
    tryListen(currentPort);
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down server gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});