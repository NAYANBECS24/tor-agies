import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  ErrorOutline as ErrorIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            width: '100%'
          }}
        >
          <ErrorIcon sx={{ fontSize: 100, color: 'error.main', mb: 3 }} />
          
          <Typography variant="h1" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            404
          </Typography>
          
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="textSecondary" paragraph sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            The page you're looking for doesn't exist or has been moved. 
            Please check the URL or return to the dashboard.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/"
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
            >
              Go to Dashboard
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </Box>

          <Box sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="textSecondary">
              If you believe this is an error, please contact the system administrator.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;