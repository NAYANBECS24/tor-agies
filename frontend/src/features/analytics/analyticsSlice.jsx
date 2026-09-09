import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsAPI } from '../../api/analytics';
import { showError } from '../../utils/notifications';

// Async thunks
export const fetchTrafficStats = createAsyncThunk(
  'analytics/fetchTrafficStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getTrafficStats(params);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch traffic statistics');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch traffic statistics');
    }
  }
);

export const fetchRealtimeTraffic = createAsyncThunk(
  'analytics/fetchRealtimeTraffic',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getRealtimeTraffic(params);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch real-time traffic');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch real-time traffic');
    }
  }
);

export const fetchMaliciousTraffic = createAsyncThunk(
  'analytics/fetchMaliciousTraffic',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getMaliciousTraffic(params);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch malicious traffic');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch malicious traffic');
    }
  }
);

export const fetchTrafficTrends = createAsyncThunk(
  'analytics/fetchTrafficTrends',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getTrafficTrends(params);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch traffic trends');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch traffic trends');
    }
  }
);

export const fetchGeographicAnalysis = createAsyncThunk(
  'analytics/fetchGeographicAnalysis',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getGeographicAnalysis(params);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch geographic analysis');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch geographic analysis');
    }
  }
);

export const fetchProtocolAnalysis = createAsyncThunk(
  'analytics/fetchProtocolAnalysis',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getProtocolAnalysis(params);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch protocol analysis');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch protocol analysis');
    }
  }
);

export const fetchThreatIntelligence = createAsyncThunk(
  'analytics/fetchThreatIntelligence',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getThreatIntelligence(params);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch threat intelligence');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch threat intelligence');
    }
  }
);

export const analyzeTrafficLog = createAsyncThunk(
  'analytics/analyzeTrafficLog',
  async (logId, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.analyzeTrafficLog(logId);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to analyze traffic log');
      return rejectWithValue(error.response?.data?.message || 'Failed to analyze traffic log');
    }
  }
);

// Initial state
const initialState = {
  trafficStats: null,
  realtimeTraffic: [],
  maliciousTraffic: {
    traffic: [],
    statistics: null,
    pagination: null,
  },
  trafficTrends: null,
  geographicAnalysis: null,
  protocolAnalysis: null,
  threatIntelligence: null,
  trafficLogAnalysis: null,
  isLoading: false,
  error: null,
};

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearTrafficStats: (state) => {
      state.trafficStats = null;
    },
    clearRealtimeTraffic: (state) => {
      state.realtimeTraffic = [];
    },
    clearMaliciousTraffic: (state) => {
      state.maliciousTraffic = {
        traffic: [],
        statistics: null,
        pagination: null,
      };
    },
    clearTrafficTrends: (state) => {
      state.trafficTrends = null;
    },
    clearGeographicAnalysis: (state) => {
      state.geographicAnalysis = null;
    },
    clearProtocolAnalysis: (state) => {
      state.protocolAnalysis = null;
    },
    clearThreatIntelligence: (state) => {
      state.threatIntelligence = null;
    },
    clearTrafficLogAnalysis: (state) => {
      state.trafficLogAnalysis = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Traffic Stats
      .addCase(fetchTrafficStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrafficStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trafficStats = action.payload;
      })
      .addCase(fetchTrafficStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Realtime Traffic
      .addCase(fetchRealtimeTraffic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRealtimeTraffic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.realtimeTraffic = action.payload;
      })
      .addCase(fetchRealtimeTraffic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Malicious Traffic
      .addCase(fetchMaliciousTraffic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaliciousTraffic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.maliciousTraffic = action.payload;
      })
      .addCase(fetchMaliciousTraffic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Traffic Trends
      .addCase(fetchTrafficTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrafficTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trafficTrends = action.payload;
      })
      .addCase(fetchTrafficTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Geographic Analysis
      .addCase(fetchGeographicAnalysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGeographicAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.geographicAnalysis = action.payload;
      })
      .addCase(fetchGeographicAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Protocol Analysis
      .addCase(fetchProtocolAnalysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProtocolAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.protocolAnalysis = action.payload;
      })
      .addCase(fetchProtocolAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Threat Intelligence
      .addCase(fetchThreatIntelligence.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchThreatIntelligence.fulfilled, (state, action) => {
        state.isLoading = false;
        state.threatIntelligence = action.payload;
      })
      .addCase(fetchThreatIntelligence.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Analyze Traffic Log
      .addCase(analyzeTrafficLog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(analyzeTrafficLog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trafficLogAnalysis = action.payload;
      })
      .addCase(analyzeTrafficLog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearTrafficStats,
  clearRealtimeTraffic,
  clearMaliciousTraffic,
  clearTrafficTrends,
  clearGeographicAnalysis,
  clearProtocolAnalysis,
  clearThreatIntelligence,
  clearTrafficLogAnalysis,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;