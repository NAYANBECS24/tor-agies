import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tooltip,
  useTheme,
} from '@mui/material';

const ThreatHeatmap = ({ data, height = 400 }) => {
  const theme = useTheme();
  
  if (!data || !data.heatmap) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No threat data available</Typography>
      </Box>
    );
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getColorIntensity = (threatCount, maxCount) => {
    if (threatCount === 0) return 0;
    const intensity = (threatCount / maxCount) * 100;
    return Math.min(intensity, 100);
  };

  const getCellColor = (intensity) => {
    if (intensity === 0) return theme.palette.grey[900];
    
    const hue = Math.max(0, 120 - (intensity * 1.2));
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <Paper sx={{ p: 2, height }}>
      <Typography variant="h6" gutterBottom>
        Threat Activity Heatmap
      </Typography>
      
      <Grid container spacing={0.5}>
        {/* Hour labels */}
        <Grid item xs={1}>
          <Box sx={{ height: 40 }} />
        </Grid>
        {hours.map(hour => (
          <Grid item xs key={hour}>
            <Typography variant="caption" align="center" sx={{ display: 'block', height: 40, lineHeight: '40px' }}>
              {hour}
            </Typography>
          </Grid>
        ))}
        
        {/* Heatmap cells */}
        {days.map((day, dayIndex) => (
          <React.Fragment key={day}>
            <Grid item xs={1}>
              <Typography variant="caption" sx={{ display: 'block', height: 40, lineHeight: '40px' }}>
                {day}
              </Typography>
            </Grid>
            {hours.map(hour => {
              const dataPoint = data.heatmap.find(
                d => d.day === day && d.hour === hour
              );
              const threatCount = dataPoint?.threatCount || 0;
              const intensity = getColorIntensity(threatCount, data.maxThreatCount);
              
              return (
                <Grid item xs key={`${day}-${hour}`}>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="caption">{day} {hour}:00</Typography>
                        <Typography variant="body2">Threats: {threatCount}</Typography>
                        {dataPoint?.threatTypes?.length > 0 && (
                          <Typography variant="caption">
                            Types: {dataPoint.threatTypes.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    }
                    arrow
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: 40,
                        bgcolor: getCellColor(intensity),
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.1)',
                          zIndex: 1,
                          position: 'relative'
                        }
                      }}
                    />
                  </Tooltip>
                </Grid>
              );
            })}
          </React.Fragment>
        ))}
      </Grid>
      
      {/* Legend */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Typography variant="caption" sx={{ mr: 2 }}>Intensity:</Typography>
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          {[0, 25, 50, 75, 100].map(intensity => (
            <Box
              key={intensity}
              sx={{
                flexGrow: 1,
                height: 20,
                bgcolor: getCellColor(intensity),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" sx={{ color: intensity > 50 ? 'white' : 'text.primary' }}>
                {intensity}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default ThreatHeatmap;