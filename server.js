const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Store active connections and traffic data
const connections = new Map();
const trafficHistory = [];
const threatsLog = [];

// Generate realistic traffic data
function generateTrafficData() {
  const now = new Date();
  const protocols = ['HTTP', 'HTTPS', 'DNS', 'FTP', 'SSH', 'SMTP'];
  const countries = ['United States', 'Germany', 'Japan', 'United Kingdom', 'Canada', 'France', 'Australia', 'China', 'India', 'Brazil'];
  const deviceTypes = ['Desktop', 'Mobile', 'Tablet', 'IoT', 'Server'];
  const threatTypes = ['DDoS Attack', 'SQL Injection', 'Port Scan', 'Malware', 'Brute Force', 'Phishing', 'XSS Attack', 'MITM Attack'];
  
  const totalRequests = Math.floor(Math.random() * 5000) + 10000;
  const activeConnections = Math.floor(Math.random() * 500) + 1000;
  const bandwidth = (Math.random() * 1.5 + 1.5).toFixed(2);
  
  // Generate protocol distribution
  const protocolData = protocols.map(protocol => ({
    protocol,
    percentage: Math.floor(Math.random() * 30) + 10,
    color: getProtocolColor(protocol)
  }));
  
  // Normalize percentages
  const totalPercent = protocolData.reduce((sum, p) => sum + p.percentage, 0);
  protocolData.forEach(p => p.percentage = Math.round((p.percentage / totalPercent) * 100));
  
  // Generate top countries
  const topCountries = countries.slice(0, 5).map(country => ({
    country,
    traffic: `${(Math.random() * 0.8 + 0.5).toFixed(1)} GB`,
    connections: Math.floor(Math.random() * 300) + 100
  })).sort((a, b) => parseFloat(b.traffic) - parseFloat(a.traffic));
  
  // Generate threats
  const threats = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, i) => ({
    id: uuidv4(),
    type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
    severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString()
  }));
  
  return {
    id: uuidv4(),
    timestamp: now.toISOString(),
    totalRequests,
    activeConnections,
    bandwidthUsage: `${bandwidth} GB/s`,
    packetLoss: `${(Math.random() * 0.3).toFixed(2)}%`,
    responseTime: `${Math.floor(Math.random() * 50) + 30}ms`,
    threatsBlocked: Math.floor(Math.random() * 50) + 75,
    encryptedTraffic: `${(Math.random() * 10 + 85).toFixed(1)}%`,
    protocols: protocolData,
    topCountries,
    currentThreats: threats,
    deviceDistribution: {
      Desktop: Math.floor(Math.random() * 30) + 40,
      Mobile: Math.floor(Math.random() * 30) + 25,
      Tablet: Math.floor(Math.random() * 10) + 5,
      IoT: Math.floor(Math.random() * 10) + 5,
      Server: Math.floor(Math.random() * 10) + 5
    }
  };
}

function getProtocolColor(protocol) {
  const colors = {
    'HTTP': '#2196f3',
    'HTTPS': '#4caf50',
    'DNS': '#ff9800',
    'FTP': '#f44336',
    'SSH': '#9c27b0',
    'SMTP': '#607d8b'
  };
  return colors[protocol] || '#757575';
}

// Generate traffic history for chart
function generateHistoryData() {
  const data = [];
  const now = new Date();
  
  for (let i = 59; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      traffic: Math.floor(Math.random() * 100) + 50,
      connections: Math.floor(Math.random() * 200) + 100,
      threats: Math.floor(Math.random() * 10)
    });
  }
  
  return data;
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  const clientId = uuidv4();
  connections.set(clientId, ws);
  
  console.log(`Client connected: ${clientId}`);
  
  // Send initial data
  const initialData = {
    type: 'INITIAL_DATA',
    trafficData: generateTrafficData(),
    trafficHistory: generateHistoryData()
  };
  
  ws.send(JSON.stringify(initialData));
  
  // Set up interval to send live updates
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const update = {
        type: 'LIVE_UPDATE',
        trafficData: generateTrafficData(),
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(update));
    }
  }, 5000); // Update every 5 seconds
  
  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    connections.delete(clientId);
    clearInterval(interval);
  });
  
  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
    connections.delete(clientId);
    clearInterval(interval);
  });
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Message from ${clientId}:`, data);
      
      // Handle different message types
      switch (data.type) {
        case 'GET_HISTORY':
          ws.send(JSON.stringify({
            type: 'HISTORY_DATA',
            trafficHistory: generateHistoryData()
          }));
          break;
          
        case 'PAUSE_MONITORING':
          // Handle pause request
          break;
          
        case 'RESUME_MONITORING':
          // Handle resume request
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
});

// REST API Endpoints
app.get('/api/traffic/status', (req, res) => {
  res.json({
    status: 'active',
    serverTime: new Date().toISOString(),
    connectedClients: connections.size,
    totalRequestsProcessed: trafficHistory.length,
    uptime: process.uptime()
  });
});

app.get('/api/traffic/data', (req, res) => {
  const data = generateTrafficData();
  trafficHistory.push(data);
  
  // Keep only last 1000 entries
  if (trafficHistory.length > 1000) {
    trafficHistory.shift();
  }
  
  res.json(data);
});

app.get('/api/traffic/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const history = trafficHistory.slice(-limit);
  res.json(history);
});

app.get('/api/traffic/threats', (req, res) => {
  const threats = Array.from({ length: 10 }, (_, i) => ({
    id: uuidv4(),
    type: ['DDoS Attack', 'SQL Injection', 'Port Scan', 'Malware', 'Brute Force', 'Phishing'][Math.floor(Math.random() * 6)],
    severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
    blocked: Math.random() > 0.3
  }));
  
  res.json(threats);
});

app.get('/api/traffic/countries', (req, res) => {
  const countries = [
    { country: 'United States', traffic: '1.2 GB', connections: 450 },
    { country: 'Germany', traffic: '890 MB', connections: 320 },
    { country: 'Japan', traffic: '750 MB', connections: 280 },
    { country: 'United Kingdom', traffic: '620 MB', connections: 240 },
    { country: 'Canada', traffic: '510 MB', connections: 190 },
    { country: 'France', traffic: '480 MB', connections: 180 },
    { country: 'Australia', traffic: '420 MB', connections: 160 },
    { country: 'China', traffic: '380 MB', connections: 140 },
    { country: 'India', traffic: '350 MB', connections: 120 },
    { country: 'Brazil', traffic: '320 MB', connections: 110 }
  ];
  
  res.json(countries);
});

app.get('/api/traffic/protocols', (req, res) => {
  const protocols = [
    { protocol: 'HTTP', percentage: 45, color: '#2196f3' },
    { protocol: 'HTTPS', percentage: 38, color: '#4caf50' },
    { protocol: 'DNS', percentage: 8, color: '#ff9800' },
    { protocol: 'FTP', percentage: 5, color: '#f44336' },
    { protocol: 'SSH', percentage: 3, color: '#9c27b0' },
    { protocol: 'SMTP', percentage: 1, color: '#607d8b' }
  ];
  
  res.json(protocols);
});

app.post('/api/traffic/control', (req, res) => {
  const { action, value } = req.body;
  
  console.log(`Traffic control: ${action} = ${value}`);
  
  // Broadcast control action to all connected clients
  const controlMessage = {
    type: 'TRAFFIC_CONTROL',
    action,
    value,
    timestamp: new Date().toISOString()
  };
  
  connections.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(controlMessage));
    }
  });
  
  res.json({
    success: true,
    message: `Traffic control applied: ${action} = ${value}`,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/traffic/export', (req, res) => {
  const { format, startDate, endDate } = req.body;
  
  // Generate sample export data
  const exportData = {
    format: format || 'csv',
    startDate: startDate || new Date(Date.now() - 86400000).toISOString(),
    endDate: endDate || new Date().toISOString(),
    records: trafficHistory.slice(-100),
    generatedAt: new Date().toISOString(),
    filename: `traffic-export-${Date.now()}.${format || 'csv'}`
  };
  
  res.json({
    success: true,
    message: 'Export data generated successfully',
    data: exportData,
    downloadUrl: `/api/traffic/download/${exportData.filename}`
  });
});

app.get('/api/traffic/download/:filename', (req, res) => {
  const { filename } = req.params;
  
  // In a real application, this would generate and serve the actual file
  res.json({
    success: true,
    message: `File ${filename} would be downloaded here`,
    mockData: 'This is mock CSV data for traffic export\nTime,Traffic,Connections,Threats\n10:00,120MB,450,2\n11:00,145MB,520,5\n12:00,180MB,600,3'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    connections: connections.size
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Traffic Analyzer Backend Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time connections`);
  console.log(`📊 REST API available at http://localhost:${PORT}/api`);
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}`);
});