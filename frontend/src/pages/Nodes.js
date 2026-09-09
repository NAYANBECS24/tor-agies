import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Public as PublicIcon
} from '@mui/icons-material';

const Nodes = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const nodes = [
    { id: 1, name: 'GuardNode01', fingerprint: '0x1234...abcd', country: 'United States', status: 'online', type: 'Guard', bandwidth: '50 MB/s', flags: ['Fast', 'Stable'] },
    { id: 2, name: 'ExitNode01', fingerprint: '0x5678...efgh', country: 'Germany', status: 'online', type: 'Exit', bandwidth: '75 MB/s', flags: ['Exit', 'Valid'] },
    { id: 3, name: 'RelayNode01', fingerprint: '0x90ab...ijkl', country: 'Canada', status: 'online', type: 'Relay', bandwidth: '30 MB/s', flags: ['Running'] },
    { id: 4, name: 'SuspiciousNode', fingerprint: '0xcd12...3456', country: 'Russia', status: 'suspicious', type: 'Exit', bandwidth: '10 MB/s', flags: ['Running'] },
    { id: 5, name: 'OfflineNode', fingerprint: '0xef78...90gh', country: 'France', status: 'offline', type: 'Guard', bandwidth: '20 MB/s', flags: ['Fast'] },
    { id: 6, name: 'NodeAlpha', fingerprint: '0x12ab...34cd', country: 'Japan', status: 'online', type: 'Relay', bandwidth: '45 MB/s', flags: ['Stable', 'Valid'] },
    { id: 7, name: 'TorGuard99', fingerprint: '0x56cd...78ef', country: 'United Kingdom', status: 'online', type: 'Guard', bandwidth: '60 MB/s', flags: ['Fast', 'Stable', 'Guard'] },
    { id: 8, name: 'ExitMaster', fingerprint: '0x90ef...12gh', country: 'Netherlands', status: 'online', type: 'Exit', bandwidth: '85 MB/s', flags: ['Exit', 'Fast'] },
    { id: 9, name: 'BridgeNode', fingerprint: '0x34gh...56ij', country: 'Switzerland', status: 'online', type: 'Bridge', bandwidth: '25 MB/s', flags: ['Bridge'] },
    { id: 10, name: 'OldRelay', fingerprint: '0x78ij...90kl', country: 'Australia', status: 'offline', type: 'Relay', bandwidth: '15 MB/s', flags: ['Running'] },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'suspicious': return 'warning';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Guard': return 'primary';
      case 'Exit': return 'secondary';
      case 'Bridge': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Tor Nodes Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="subtitle2">Online Nodes</Typography>
              </Box>
              <Typography variant="h4">8</Typography>
              <Typography variant="caption" color="text.secondary">80% of total</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="subtitle2">Suspicious</Typography>
              </Box>
              <Typography variant="h4">1</Typography>
              <Typography variant="caption" color="text.secondary">Needs attention</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PublicIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="subtitle2">Countries</Typography>
              </Box>
              <Typography variant="h4">8</Typography>
              <Typography variant="caption" color="text.secondary">Global distribution</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2">Total Bandwidth</Typography>
              </Box>
              <Typography variant="h4">415 MB/s</Typography>
              <Typography variant="caption" color="text.secondary">Network capacity</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search nodes by name, fingerprint, or country..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Tooltip title="Filter nodes">
                <IconButton>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh data">
                <IconButton>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Nodes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Node Name</TableCell>
              <TableCell>Fingerprint</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Bandwidth</TableCell>
              <TableCell>Flags</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nodes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((node) => (
              <TableRow key={node.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {node.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {node.fingerprint}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PublicIcon sx={{ mr: 1, fontSize: 'small' }} />
                    {node.country}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={node.status}
                    size="small"
                    color={getStatusColor(node.status)}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={node.type}
                    size="small"
                    color={getTypeColor(node.type)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{node.bandwidth}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {node.flags.map((flag, index) => (
                      <Chip key={index} label={flag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View details">
                    <IconButton size="small">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={nodes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Legend */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Legend
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label="Online" size="small" color="success" />
          <Chip label="Offline" size="small" color="error" />
          <Chip label="Suspicious" size="small" color="warning" />
          <Chip label="Guard Node" size="small" color="primary" />
          <Chip label="Exit Node" size="small" color="secondary" />
          <Chip label="Bridge Node" size="small" color="info" />
        </Box>
      </Paper>
    </Box>
  );
};

export default Nodes;