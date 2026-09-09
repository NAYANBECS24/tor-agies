import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, CircularProgress } from '@mui/material';

const NetworkMap = ({ height = 500, showTraffic = true }) => {
  const mapRef = useRef();
  const dispatch = useDispatch();
  
  // This would come from your Redux store
  const { nodes, connections, isLoading } = useSelector((state) => state.visualization.networkMap);

  const getNodeColor = (node) => {
    switch (node.type) {
      case 'exit':
        return '#ff4444';
      case 'guard':
        return '#44ff44';
      default:
        return '#4444ff';
    }
  };

  const getNodeSize = (bandwidth) => {
    return Math.max(5, Math.min(20, Math.log10(bandwidth + 1) * 5));
  };

  if (isLoading) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height, width: '100%', position: 'relative' }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {nodes.map((node) => (
          node.latitude && node.longitude && (
            <CircleMarker
              key={node.id}
              center={[node.latitude, node.longitude]}
              radius={getNodeSize(node.bandwidth)}
              fillColor={getNodeColor(node)}
              color="#000"
              weight={1}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup>
                <Typography variant="subtitle2">{node.name}</Typography>
                <Typography variant="body2">Country: {node.country}</Typography>
                <Typography variant="body2">Bandwidth: {Math.round(node.bandwidth / 1000000)} MB/s</Typography>
                <Typography variant="body2">Type: {node.type}</Typography>
              </Popup>
            </CircleMarker>
          )
        ))}
        
        {showTraffic && connections.map((conn) => {
          const sourceNode = nodes.find(n => n.ipAddress === conn.source);
          const destCoords = conn.destination ? null : null; // Would need geolocation service
          
          if (sourceNode?.latitude && sourceNode?.longitude && destCoords) {
            return (
              <Polyline
                key={conn.id}
                positions={[
                  [sourceNode.latitude, sourceNode.longitude],
                  destCoords
                ]}
                color={conn.isMalicious ? '#ff0000' : '#00ff00'}
                weight={1}
                opacity={0.5}
              />
            );
          }
          return null;
        })}
      </MapContainer>
      
      <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: '#4444ff', mr: 1, borderRadius: '50%' }} />
          Relay Nodes
        </Typography>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: '#44ff44', mr: 1, borderRadius: '50%' }} />
          Guard Nodes
        </Typography>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 10, height: 10, bgcolor: '#ff4444', mr: 1, borderRadius: '50%' }} />
          Exit Nodes
        </Typography>
      </Box>
    </Box>
  );
};

export default NetworkMap;