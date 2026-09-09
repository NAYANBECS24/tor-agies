import React from 'react';
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
} from '@mui/material';
import {
  DeviceHub as DeviceHubIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const NodesPage = () => {
  const nodes = [
    { id: 1, name: 'Node-01', type: 'Guard', status: 'active', connections: 245, uptime: '99.8%', location: 'US' },
    { id: 2, name: 'Node-02', type: 'Relay', status: 'active', connections: 189, uptime: '99.5%', location: 'DE' },
    { id: 3, name: 'Node-03', type: 'Exit', status: 'warning', connections: 156, uptime: '95.2%', location: 'JP' },
    { id: 4, name: 'Node-04', type: 'Bridge', status: 'active', connections: 89, uptime: '98.7%', location: 'UK' },
    { id: 5, name: 'Node-05', type: 'Guard', status: 'active', connections: 312, uptime: '99.9%', location: 'CA' },
    { id: 6, name: 'Node-06', type: 'Relay', status: 'error', connections: 0, uptime: '0%', location: 'FR' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Network Nodes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage all network nodes
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<RefreshIcon />}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Nodes
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                6
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Active Nodes
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                4
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Connections
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                891
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Avg Uptime
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                98.7%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <Typography variant="h6">Node List</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Node Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Connections</TableCell>
                <TableCell>Uptime</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nodes.map((node) => (
                <TableRow key={node.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DeviceHubIcon fontSize="small" />
                      <Typography>{node.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={node.type} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={node.status}
                      size="small"
                      color={
                        node.status === 'active' ? 'success' :
                        node.status === 'warning' ? 'warning' : 'error'
                      }
                      icon={node.status === 'active' ? <CheckCircleIcon /> : <WarningIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography>{node.connections}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography>{node.uptime}</Typography>
                      <LinearProgress variant="determinate" value={parseFloat(node.uptime)} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography>{node.location}</Typography>
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default NodesPage;