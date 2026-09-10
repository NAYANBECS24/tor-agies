import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DashboardIcon from '@mui/icons-material/Dashboard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Paper sx={{ p: 4, maxWidth: 650, width: '100%', bgcolor: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 2 }}>
            <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 700, mb: 1 }}>
              Module Render Interrupted
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
              TOR-AEGIS intercepted a UI rendering anomaly to prevent platform crash. You can safely reload the view or navigate back to the operational command center.
            </Typography>
            {this.state.error?.message && (
              <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
                {this.state.error.message}
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}
              >
                Reload Component
              </Button>
              <Button
                variant="outlined"
                startIcon={<DashboardIcon />}
                onClick={this.handleGoDashboard}
                sx={{ color: '#94a3b8', borderColor: '#475569' }}
              >
                Return to Dashboard
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
