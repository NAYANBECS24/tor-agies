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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  LinearProgress,
  Alert,
  TextField,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Lock as LockIcon,
  VpnKey as KeyIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
  LockOpen as LockOpenIcon,
  LockReset as LockResetIcon,
  KeyOff as KeyOffIcon,
  EnhancedEncryption as EncryptedIcon,
  Autorenew as AutorenewIcon,
} from '@mui/icons-material';

// Mock API for demonstration
const encryptionApi = {
  getStatus: () => Promise.resolve({
    data: {
      active: true,
      algorithm: 'AES-256-GCM',
      strength: '256-bit',
      lastRotation: new Date(Date.now() - 86400000).toISOString(),
      nextRotation: new Date(Date.now() + 3600000).toISOString(),
      encryptedConnections: '98.7%',
      keyVersion: 'v2.4.1'
    }
  }),
  rotateKeys: () => Promise.resolve({}),
  encryptData: () => Promise.resolve({})
};

const EncryptionPage = () => {
  const [status, setStatus] = useState({
    active: true,
    algorithm: 'AES-256-GCM',
    strength: '256-bit',
    lastRotation: new Date(Date.now() - 86400000).toISOString(),
    nextRotation: new Date(Date.now() + 3600000).toISOString(),
    encryptedConnections: '98.7%',
    keyVersion: 'v2.4.1'
  });
  const [isRotating, setIsRotating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [encryptText, setEncryptText] = useState('');
  const [encryptedResult, setEncryptedResult] = useState(null);
  const [keyHistory, setKeyHistory] = useState([
    { version: 'v2.4.1', created: new Date().toISOString(), algorithm: 'AES-256-GCM', status: 'active' },
    { version: 'v2.4.0', created: new Date(Date.now() - 86400000).toISOString(), algorithm: 'AES-256-GCM', status: 'expired' },
    { version: 'v2.3.2', created: new Date(Date.now() - 172800000).toISOString(), algorithm: 'AES-256-CBC', status: 'expired' },
    { version: 'v2.3.1', created: new Date(Date.now() - 259200000).toISOString(), algorithm: 'AES-256-CBC', status: 'revoked' },
  ]);
  const [encryptionStats, setEncryptionStats] = useState({
    totalEncrypted: 1245000,
    encryptionSpeed: '2.4GB/s',
    failedAttempts: 12,
    successRate: '99.9%'
  });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await encryptionApi.getStatus();
      setStatus(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Error loading encryption status:', error);
    }
  };

  const handleRotateKeys = async () => {
    setIsRotating(true);
    try {
      await encryptionApi.rotateKeys();
      setStatus(prev => ({
        ...prev,
        lastRotation: new Date().toISOString(),
        nextRotation: new Date(Date.now() + 3600000).toISOString(),
        keyVersion: `v2.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`
      }));
      
      // Add to key history
      setKeyHistory(prev => [{
        version: status.keyVersion,
        created: new Date().toISOString(),
        algorithm: status.algorithm,
        status: 'active'
      }, ...prev.map(k => ({ ...k, status: 'expired' }))]);
    } catch (error) {
      console.error('Error rotating keys:', error);
    } finally {
      setIsRotating(false);
    }
  };

  const handleEncrypt = async () => {
    try {
      await encryptionApi.encryptData({ data: encryptText });
      setEncryptedResult({
        encrypted: btoa(encryptText + ' [ENCRYPTED]'),
        algorithm: status.algorithm,
        timestamp: new Date().toISOString(),
        keyVersion: status.keyVersion
      });
    } catch (error) {
      console.error('Error encrypting data:', error);
    }
  };

  const getTimeUntilRotation = () => {
    const now = new Date();
    const next = new Date(status.nextRotation);
    const diff = next - now;
    
    if (diff <= 0) return 'Due now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Add missing function for generating key name
  const getKeyName = () => {
    return `key-${Date.now()}`;
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#0a1929', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold', 
            color: '#ffffff',
            mb: 1
          }}>
            Encryption Manager
          </Typography>
          <Typography variant="body2" sx={{ color: '#b0bec5' }}>
            End-to-end encryption and cryptographic key management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStatus}
            sx={{ color: '#ffffff', borderColor: '#9c27b0' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={isRotating ? <CircularProgress size={20} color="inherit" /> : <AutorenewIcon />}
            onClick={handleRotateKeys}
            disabled={isRotating}
            sx={{
              background: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
              boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)'
            }}
          >
            {isRotating ? 'Rotating...' : 'Rotate Keys'}
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          textColor="inherit"
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: '#9c27b0',
                fontWeight: 'bold'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#9c27b0'
            }
          }}
        >
          <Tab label="Overview" icon={<LockIcon />} />
          <Tab label="Key Management" icon={<KeyIcon />} />
          <Tab label="Encryption Tools" icon={<SecurityIcon />} />
          <Tab label="Statistics" icon={<HistoryIcon />} />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Status Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={6}>
                <Card sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${status.active ? '#4caf50' : '#f44336'}`,
                  height: '100%',
                  color: '#ffffff'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <LockIcon sx={{ 
                        color: status.active ? '#4caf50' : '#f44336', 
                        fontSize: 32 
                      }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {status.active ? 'ACTIVE' : 'INACTIVE'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                          Encryption Status
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Switch 
                        checked={status.active} 
                        color="success"
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={status.active ? 'Secured' : 'Vulnerable'}
                        size="small"
                        color={status.active ? 'success' : 'error'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={6}>
                <Card sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #2196f3',
                  height: '100%',
                  color: '#ffffff'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <SecurityIcon sx={{ color: '#2196f3', fontSize: 32 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {status.algorithm}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                          Encryption Algorithm
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#b0bec5' }}>
                      {status.strength} security
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={6}>
                <Card sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #4caf50',
                  height: '100%',
                  color: '#ffffff'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <ScheduleIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {getTimeUntilRotation()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                          Next Key Rotation
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={75}
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #4caf50, #81c784)'
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={6}>
                <Card sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #ff9800',
                  height: '100%',
                  color: '#ffffff'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <EncryptedIcon sx={{ color: '#ff9800', fontSize: 32 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {status.encryptedConnections}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                          Encrypted Connections
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#b0bec5' }}>
                      All network traffic
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Key Rotation Status */}
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                Key Rotation Status
              </Typography>
              
              <Stepper activeStep={3} alternativeLabel sx={{ mb: 3 }}>
                <Step>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#ffffff' } }}>Current Key</StepLabel>
                </Step>
                <Step>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#ffffff' } }}>Rotation Scheduled</StepLabel>
                </Step>
                <Step>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#ffffff' } }}>New Key Generated</StepLabel>
                </Step>
                <Step>
                  <StepLabel sx={{ '& .MuiStepLabel-label': { color: '#ffffff' } }}>Activation Pending</StepLabel>
                </Step>
              </Stepper>
              
              <Alert severity="info" sx={{ mb: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                Next automatic key rotation scheduled in {getTimeUntilRotation()}
              </Alert>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={() => setActiveTab(1)}
                  sx={{ color: '#ffffff', borderColor: '#2196f3' }}
                >
                  Schedule Rotation
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AutorenewIcon />}
                  onClick={handleRotateKeys}
                  disabled={isRotating}
                  sx={{
                    background: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
                  }}
                >
                  Rotate Now
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Quick Actions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                Quick Actions
              </Typography>
              
              <List>
                <ListItem button sx={{ color: '#ffffff' }}>
                  <ListItemIcon>
                    <LockResetIcon sx={{ color: '#2196f3' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Reset Encryption" 
                    secondary="Reset all encryption settings" 
                    secondaryTypographyProps={{ color: '#b0bec5' }}
                  />
                </ListItem>
                
                <ListItem button sx={{ color: '#ffffff' }}>
                  <ListItemIcon>
                    <KeyOffIcon sx={{ color: '#ff9800' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Revoke Keys" 
                    secondary="Revoke current encryption keys" 
                    secondaryTypographyProps={{ color: '#b0bec5' }}
                  />
                </ListItem>
                
                <ListItem button sx={{ color: '#ffffff' }}>
                  <ListItemIcon>
                    <DownloadIcon sx={{ color: '#00bcd4' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Export Keys" 
                    secondary="Export encryption keys (secure)" 
                    secondaryTypographyProps={{ color: '#b0bec5' }}
                  />
                </ListItem>
                
                <ListItem button sx={{ color: '#ffffff' }}>
                  <ListItemIcon>
                    <UploadIcon sx={{ color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Import Keys" 
                    secondary="Import new encryption keys" 
                    secondaryTypographyProps={{ color: '#b0bec5' }}
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                Security Audit
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ color: '#ffffff' }}>
                  Encryption Strength: <strong>Excellent</strong>
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={95}
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
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ color: '#ffffff' }}>
                  Key Management: <strong>Good</strong>
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={85}
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
              
              <Box>
                <Typography variant="body2" gutterBottom sx={{ color: '#ffffff' }}>
                  Compliance: <strong>Excellent</strong>
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={98}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #9c27b0, #ba68c8)'
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                Key History
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#ffffff' }}>Key Version</TableCell>
                      <TableCell sx={{ color: '#ffffff' }}>Algorithm</TableCell>
                      <TableCell sx={{ color: '#ffffff' }}>Created</TableCell>
                      <TableCell sx={{ color: '#ffffff' }}>Status</TableCell>
                      <TableCell sx={{ color: '#ffffff' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {keyHistory.map((key, index) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' } }}>
                        <TableCell sx={{ color: '#ffffff' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <KeyIcon fontSize="small" sx={{ color: '#9c27b0' }} />
                            <Typography sx={{ color: '#ffffff' }}>{key.version}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>
                          <Chip 
                            label={key.algorithm}
                            size="small"
                            variant="outlined"
                            sx={{ color: '#ffffff', borderColor: '#9c27b0' }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>
                          <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                            {new Date(key.created).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>
                          <Chip 
                            label={key.status}
                            size="small"
                            color={
                              key.status === 'active' ? 'success' :
                              key.status === 'expired' ? 'warning' : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Key Details">
                              <IconButton size="small" sx={{ color: '#ffffff' }}>
                                <SecurityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {key.status !== 'active' && (
                              <Tooltip title="Restore Key">
                                <IconButton size="small" sx={{ color: '#ffffff' }}>
                                  <HistoryIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                Key Generation
              </Typography>
              
              <TextField
                fullWidth
                label="Key Name"
                defaultValue={getKeyName()}
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#b0bec5' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#b0bec5' }}>Key Size</InputLabel>
                <Select 
                  label="Key Size" 
                  defaultValue="256"
                  sx={{ color: '#ffffff' }}
                  inputProps={{ style: { color: '#ffffff' } }}
                >
                  <MenuItem value="128">128-bit</MenuItem>
                  <MenuItem value="192">192-bit</MenuItem>
                  <MenuItem value="256">256-bit</MenuItem>
                  <MenuItem value="512">512-bit</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: '#b0bec5' }}>Algorithm</InputLabel>
                <Select 
                  label="Algorithm" 
                  defaultValue="AES-256-GCM"
                  sx={{ color: '#ffffff' }}
                  inputProps={{ style: { color: '#ffffff' } }}
                >
                  <MenuItem value="AES-256-GCM">AES-256-GCM</MenuItem>
                  <MenuItem value="AES-256-CBC">AES-256-CBC</MenuItem>
                  <MenuItem value="ChaCha20-Poly1305">ChaCha20-Poly1305</MenuItem>
                  <MenuItem value="RSA-2048">RSA-2048</MenuItem>
                  <MenuItem value="ECDSA-P256">ECDSA-P256</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<KeyIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
                }}
              >
                Generate New Key
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                Encryption Tool
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Text to Encrypt"
                value={encryptText}
                onChange={(e) => setEncryptText(e.target.value)}
                placeholder="Enter sensitive text to encrypt..."
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#b0bec5' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: '#b0bec5' }}>Encryption Method</InputLabel>
                <Select 
                  label="Encryption Method" 
                  defaultValue="AES-256-GCM"
                  sx={{ color: '#ffffff' }}
                  inputProps={{ style: { color: '#ffffff' } }}
                >
                  <MenuItem value="AES-256-GCM">AES-256-GCM</MenuItem>
                  <MenuItem value="AES-256-CBC">AES-256-CBC</MenuItem>
                  <MenuItem value="RSA-OAEP">RSA-OAEP</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={<LockIcon />}
                onClick={handleEncrypt}
                sx={{ mb: 3 }}
              >
                Encrypt Text
              </Button>
              
              {encryptedResult && (
                <>
                  <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#ffffff' }}>
                    Encrypted Result:
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'monospace', 
                      wordBreak: 'break-all',
                      fontSize: '0.8rem',
                      color: '#ffffff'
                    }}>
                      {encryptedResult.encrypted}
                    </Typography>
                  </Paper>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: '#b0bec5' }}>
                      Algorithm: {encryptedResult.algorithm}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b0bec5' }}>
                      Key: {encryptedResult.keyVersion}
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                Decryption Tool
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Encrypted Text"
                placeholder="Paste encrypted text here..."
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#b0bec5' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
              
              <TextField
                fullWidth
                label="Decryption Key"
                type="password"
                placeholder="Enter decryption key"
                sx={{ mb: 3 }}
                InputLabelProps={{ style: { color: '#b0bec5' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<LockOpenIcon />}
                sx={{ color: '#ffffff', borderColor: '#2196f3' }}
              >
                Decrypt Text
              </Button>
              
              <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#ffffff' }}>
                Security Notes:
              </Typography>
              <Alert severity="warning" sx={{ mb: 2, backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
                Never share decryption keys. Store them securely.
              </Alert>
              <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                All encryption uses military-grade algorithms with perfect forward secrecy.
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                Encryption Statistics
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff'
                  }}>
                    <Typography variant="h4" sx={{ color: '#ffffff' }}>
                      {(encryptionStats.totalEncrypted / 1000000).toFixed(1)}M
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b0bec5' }}>
                      Total Encrypted
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff'
                  }}>
                    <Typography variant="h4" sx={{ color: '#ffffff' }}>
                      {encryptionStats.encryptionSpeed}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b0bec5' }}>
                      Encryption Speed
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff'
                  }}>
                    <Typography variant="h4" sx={{ color: '#ffffff' }}>
                      {encryptionStats.failedAttempts}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b0bec5' }}>
                      Failed Attempts
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff'
                  }}>
                    <Typography variant="h4" sx={{ color: '#ffffff' }}>
                      {encryptionStats.successRate}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b0bec5' }}>
                      Success Rate
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#ffffff' }}>
                Performance Metrics
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ color: '#ffffff' }}>
                  Encryption Overhead: <strong>2.3%</strong>
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={2.3}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4caf50'
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ color: '#ffffff' }}>
                  Key Retrieval Time: <strong>45ms</strong>
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={45}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#2196f3'
                    }
                  }}
                />
              </Box>
              
              <Box>
                <Typography variant="body2" gutterBottom sx={{ color: '#ffffff' }}>
                  Memory Usage: <strong>128MB</strong>
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={20}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#9c27b0'
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default EncryptionPage;