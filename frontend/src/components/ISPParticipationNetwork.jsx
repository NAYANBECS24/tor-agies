import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import { Hub as HubIcon, CheckCircle, Sync, ErrorOutline } from '@mui/icons-material';

const ISPParticipationNetwork = ({ isps = [], onISPSelect, height = 420 }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoveredISP, setHoveredISP] = useState(null);
  const animationFrameRef = useRef(null);

  // Keep node positions in ref for accurate mouse interactions
  const nodePositionsRef = useRef([]);

  // Packet animation state
  const particlesRef = useRef([]);

  const initParticles = useCallback(() => {
    const particles = [];
    const activeIsps = isps.filter(isp => isp.isActive);
    activeIsps.forEach((isp, i) => {
      // create 2-3 moving particles per active link
      for (let p = 0; p < 2; p++) {
        particles.push({
          ispIndex: i,
          ispId: isp.id,
          progress: Math.random(),
          speed: 0.006 + Math.random() * 0.008,
          direction: isp.status === 'training' ? (Math.random() > 0.5 ? 1 : -1) : 1
        });
      }
    });
    particlesRef.current = particles;
  }, [isps]);

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 480;
    let canvasHeight = height;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.03;
      ctx.clearRect(0, 0, width, canvasHeight);

      const centerX = width / 2;
      const centerY = canvasHeight / 2 - 10;
      const radius = Math.min(centerX, centerY) * 0.72;

      // Draw subtle orbital guide circles
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(156, 39, 176, 0.06)';
      ctx.stroke();

      // Calculate node positions
      const positions = [];
      const total = isps.length || 1;

      isps.forEach((isp, index) => {
        const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const nodeRadius = 16 + (isp.dataPoints ? Math.min(10, isp.dataPoints / 1800) : 4);
        positions.push({ isp, x, y, radius: nodeRadius, angle });
      });
      nodePositionsRef.current = positions;

      // Draw connection lines to central hub
      positions.forEach((pos) => {
        const { isp, x, y } = pos;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);

        if (isp.status === 'training') {
          ctx.strokeStyle = 'rgba(255, 179, 0, 0.6)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ffb300';
          ctx.shadowBlur = 8;
        } else if (isp.isActive) {
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.28)';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 4;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      });

      // Update & draw flying particles along active connections
      particlesRef.current.forEach((p) => {
        const targetPos = positions.find(pos => pos.isp.id === p.ispId);
        if (!targetPos) return;

        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const px = centerX + (targetPos.x - centerX) * p.progress;
        const py = centerY + (targetPos.y - centerY) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = targetPos.isp.status === 'training' ? '#ffb300' : '#00e5ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Central Federation Hub
      const centralPulse = Math.sin(pulseTime) * 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 28 + centralPulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(156, 39, 176, 0.15)';
      ctx.fill();

      // Hub outer glowing border
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
      const hubGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 24);
      hubGrad.addColorStop(0, '#9c27b0');
      hubGrad.addColorStop(1, '#4a148c');
      ctx.fillStyle = hubGrad;
      ctx.shadowColor = '#ab47bc';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.strokeStyle = '#e1bee7';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Hub icon / letter
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ATWC', centerX, centerY - 2);

      ctx.fillStyle = '#ce93d8';
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText('HUB', centerX, centerY + 9);

      // Draw ISP Nodes
      positions.forEach((pos) => {
        const { isp, x, y, radius: r } = pos;
        const isHovered = hoveredISP && hoveredISP.id === isp.id;

        // Hover outer aura
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(x, y, r + 7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
          ctx.fill();
        }

        // Training pulse halo
        if (isp.status === 'training') {
          const trainPulse = (Math.sin(pulseTime * 2 + pos.angle) + 1) * 3;
          ctx.beginPath();
          ctx.arc(x, y, r + trainPulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 179, 0, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Main node circle
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);

        let nodeColor = '#00e5ff';
        if (isp.status === 'training') nodeColor = '#ffb300';
        else if (!isp.isActive) nodeColor = '#64748b';
        else if (isp.ispType === 'government') nodeColor = '#00e5ff';
        else nodeColor = '#00e676';

        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = isHovered ? 15 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        // Node initial
        ctx.fillStyle = '#0a192f';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isp.name ? isp.name.charAt(0) : 'I', x, y);

        // ISP Name Label (High Contrast on Dark Theme)
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 10px Inter, sans-serif';
        const shortName = isp.name.split(' ')[0];
        const labelY = y + (y > centerY ? r + 13 : -(r + 8));
        ctx.fillText(shortName, x, labelY);

        // Telemetry sub-label
        ctx.fillStyle = isp.isActive ? '#38bdf8' : '#94a3b8';
        ctx.font = '9px Inter, sans-serif';
        const subLabelY = y + (y > centerY ? r + 24 : -(r + 19));
        ctx.fillText(isp.isActive ? `${Math.round(isp.modelAccuracy * 100)}% acc` : 'Idle', x, subLabelY);
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    // Resize observer to handle dynamic card size changes
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && canvasRef.current) {
        width = containerRef.current.clientWidth || 480;
        canvas.width = width * dpr;
        canvas.height = canvasHeight * dpr;
        ctx.scale(dpr, dpr);
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [isps, hoveredISP, height]);

  // Handle mouse move for hover detection
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const hit = nodePositionsRef.current.find((pos) => {
      const dx = mouseX - pos.x;
      const dy = mouseY - pos.y;
      return Math.sqrt(dx * dx + dy * dy) <= pos.radius + 6;
    });

    if (hit) {
      setHoveredISP(hit.isp);
      canvas.style.cursor = 'pointer';
    } else {
      setHoveredISP(null);
      canvas.style.cursor = 'default';
    }
  };

  // Handle click on node
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const hit = nodePositionsRef.current.find((pos) => {
      const dx = mouseX - pos.x;
      const dy = mouseY - pos.y;
      return Math.sqrt(dx * dx + dy * dy) <= pos.radius + 8;
    });

    if (hit && onISPSelect) {
      onISPSelect(hit.isp);
    }
  };

  const activeCount = isps.filter(i => i.isActive).length;

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      {/* Top right status badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          background: 'rgba(10, 25, 41, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 229, 255, 0.2)'
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#00e676',
            boxShadow: '0 0 8px #00e676'
          }}
        />
        <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.75rem' }}>
          {activeCount}/{isps.length} Nodes Quorum Active
        </Typography>
      </Box>

      {/* Sleek bottom HUD instruction */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          px: 1.5,
          py: 0.6,
          borderRadius: 1.5,
          background: 'rgba(10, 25, 41, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
          💡 Click any ISP node to inspect deep local model telemetry
        </Typography>
      </Box>
    </Box>
  );
};

export default ISPParticipationNetwork;