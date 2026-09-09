import React, { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';

const FederatedTrainingChart = ({ data = [], height = 230, showAllMetrics = false }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: '#94a3b8' }}>No federated convergence rounds recorded yet</Typography>
      </Box>
    );
  }

  const chartWidth = 800;
  const chartHeight = 230;
  const paddingLeft = 50;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (index) => {
    if (data.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  };

  // Accuracy ranges from 0.5 to 1.0 (or min to max)
  const minAcc = 0.5;
  const maxAcc = 1.0;
  const getYAcc = (val) => {
    const clamped = Math.max(minAcc, Math.min(maxAcc, val));
    return paddingTop + plotHeight - ((clamped - minAcc) / (maxAcc - minAcc)) * plotHeight;
  };

  // Loss ranges from 0.0 to 0.5
  const maxLoss = 0.5;
  const getYLoss = (val) => {
    const clamped = Math.max(0, Math.min(maxLoss, val));
    return paddingTop + plotHeight - (clamped / maxLoss) * plotHeight;
  };

  // Generate smooth SVG curve path using Catmull-Rom or cubic bezier
  const createSmoothPath = (points) => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const accPoints = data.map((d, i) => ({ x: getX(i), y: getYAcc(d.accuracy), val: d.accuracy, round: d.round, loss: d.loss }));
  const lossPoints = data.map((d, i) => ({ x: getX(i), y: getYLoss(d.loss), val: d.loss, round: d.round }));

  const accPath = createSmoothPath(accPoints);
  const lossPath = createSmoothPath(lossPoints);

  // Closed area under accuracy path for gradient fill
  const accAreaPath = accPoints.length > 1
    ? `${accPath} L ${accPoints[accPoints.length - 1].x} ${paddingTop + plotHeight} L ${accPoints[0].x} ${paddingTop + plotHeight} Z`
    : '';

  return (
    <Box sx={{ position: 'relative', width: '100%', height }}>
      {/* Legend header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
          TRAINING CONVERGENCE (ACCURACY VS LOSS)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 12, height: 3, bgcolor: '#00e676', borderRadius: 1 }} />
            <Typography variant="caption" sx={{ color: '#00e676', fontWeight: 600, fontSize: '0.72rem' }}>
              Global Accuracy
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 12, height: 3, bgcolor: '#ff4081', borderRadius: 1 }} />
            <Typography variant="caption" sx={{ color: '#ff4081', fontWeight: 600, fontSize: '0.72rem' }}>
              Cross-Entropy Loss
            </Typography>
          </Box>
        </Box>
      </Box>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ width: '100%', height: 'calc(100% - 24px)', display: 'block', overflow: 'visible' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="accGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00e676" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00e676" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#00e676" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal Grid lines & left labels (Accuracy) */}
        {[0.5, 0.65, 0.8, 0.95, 1.0].map((val, i) => {
          const y = getYAcc(val);
          return (
            <g key={`grid-acc-${i}`}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + plotWidth}
                y2={y}
                stroke="rgba(255, 255, 255, 0.07)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fontFamily="Inter, sans-serif"
                fill="#94a3b8"
                fontWeight="500"
              >
                {Math.round(val * 100)}%
              </text>
            </g>
          );
        })}

        {/* Right axis labels (Loss) */}
        {[0.1, 0.25, 0.4].map((lossVal, i) => {
          const y = getYLoss(lossVal);
          return (
            <text
              key={`loss-lbl-${i}`}
              x={paddingLeft + plotWidth + 10}
              y={y + 4}
              textAnchor="start"
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fill="#ff4081"
              opacity="0.8"
            >
              {lossVal.toFixed(2)}
            </text>
          );
        })}

        {/* Area under accuracy line */}
        {accAreaPath && (
          <path d={accAreaPath} fill="url(#accGradient)" />
        )}

        {/* Loss curve */}
        {lossPath && (
          <path
            d={lossPath}
            fill="none"
            stroke="#ff4081"
            strokeWidth="2"
            strokeDasharray="5 3"
            opacity="0.85"
          />
        )}

        {/* Accuracy curve */}
        {accPath && (
          <path
            d={accPath}
            fill="none"
            stroke="url(#lineGlow)"
            strokeWidth="3"
            filter="url(#glow)"
          />
        )}

        {/* Data points on accuracy line */}
        {accPoints.map((pt, i) => {
          const isHovered = hoveredPoint && hoveredPoint.round === pt.round;
          return (
            <g
              key={`pt-acc-${i}`}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 4}
                fill="#00e676"
                stroke="#ffffff"
                strokeWidth={isHovered ? 2.5 : 1.5}
                filter="url(#glow)"
              />
              {/* Show label on last point or when hovered */}
              {(i === accPoints.length - 1 || isHovered) && (
                <g>
                  <rect
                    x={pt.x - 22}
                    y={pt.y - 25}
                    width={44}
                    height={18}
                    rx="4"
                    fill="#0f172a"
                    stroke="#00e676"
                    strokeWidth="1"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 13}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#00e676"
                    fontFamily="Inter, sans-serif"
                  >
                    {(pt.val * 100).toFixed(1)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Round labels on X axis */}
        {data.map((d, i) => (
          <text
            key={`round-${i}`}
            x={getX(i)}
            y={chartHeight - 12}
            textAnchor="middle"
            fontSize="10"
            fontFamily="Inter, sans-serif"
            fontWeight={i === data.length - 1 ? 'bold' : 'normal'}
            fill={i === data.length - 1 ? '#00e5ff' : '#64748b'}
          >
            R{d.round}
          </text>
        ))}
      </svg>
    </Box>
  );
};

export default FederatedTrainingChart;