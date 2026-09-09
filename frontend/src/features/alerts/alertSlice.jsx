import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { alertsAPI } from '../../api/alerts';
import { showError, showSuccess } from '../../utils/notifications';

// Async thunks
export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.getAlerts(params);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch alerts');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

export const fetchAlertById = createAsyncThunk(
  'alerts/fetchAlertById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.getAlertById(id);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch alert');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alert');
    }
  }
);

export const createAlert = createAsyncThunk(
  'alerts/createAlert',
  async (alertData, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.createAlert(alertData);
      showSuccess('Alert created successfully');
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create alert');
      return rejectWithValue(error.response?.data?.message || 'Failed to create alert');
    }
  }
);

export const updateAlert = createAsyncThunk(
  'alerts/updateAlert',
  async ({ id, alertData }, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.updateAlert(id, alertData);
      showSuccess('Alert updated successfully');
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update alert');
      return rejectWithValue(error.response?.data?.message || 'Failed to update alert');
    }
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'alerts/acknowledgeAlert',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.acknowledgeAlert(id, data);
      showSuccess('Alert acknowledged');
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to acknowledge alert');
      return rejectWithValue(error.response?.data?.message || 'Failed to acknowledge alert');
    }
  }
);

export const resolveAlert = createAsyncThunk(
  'alerts/resolveAlert',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.resolveAlert(id, data);
      showSuccess('Alert resolved');
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to resolve alert');
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve alert');
    }
  }
);

export const closeAlert = createAsyncThunk(
  'alerts/closeAlert',
  async (id, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.closeAlert(id);
      showSuccess('Alert closed');
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to close alert');
      return rejectWithValue(error.response?.data?.message || 'Failed to close alert');
    }
  }
);

export const addNote = createAsyncThunk(
  'alerts/addNote',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.addNote(id, data);
      showSuccess('Note added');
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add note');
      return rejectWithValue(error.response?.data?.message || 'Failed to add note');
    }
  }
);

export const assignAlert = createAsyncThunk(
  'alerts/assignAlert',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.assignAlert(id, data);
      showSuccess('Alert assigned');
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to assign alert');
      return rejectWithValue(error.response?.data?.message || 'Failed to assign alert');
    }
  }
);

export const fetchAlertStatistics = createAsyncThunk(
  'alerts/fetchAlertStatistics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.getAlertStatistics(params);
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to fetch alert statistics');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alert statistics');
    }
  }
);

export const bulkUpdateAlerts = createAsyncThunk(
  'alerts/bulkUpdateAlerts',
  async (data, { rejectWithValue }) => {
    try {
      const response = await alertsAPI.bulkUpdateAlerts(data);
      showSuccess('Alerts updated successfully');
      return response.data.data;
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update alerts');
      return rejectWithValue(error.response?.data?.message || 'Failed to update alerts');
    }
  }
);

// Initial state
const initialState = {
  alerts: {
    data: [],
    statistics: null,
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    },
  },
  alertDetail: null,
  alertStatistics: null,
  realtimeAlerts: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Slice
const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    clearAlerts: (state) => {
      state.alerts = {
        data: [],
        statistics: null,
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
        },
      };
    },
    clearAlertDetail: (state) => {
      state.alertDetail = null;
    },
    setRealtimeAlerts: (state, action) => {
      // Add new alert to the beginning of the array
      state.realtimeAlerts = [action.payload, ...state.realtimeAlerts.slice(0, 19)];
      state.unreadCount += 1;
    },
    clearRealtimeAlerts: (state) => {
      state.realtimeAlerts = [];
    },
    markAllAsRead: (state) => {
      state.unreadCount = 0;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alerts.data = action.payload.alerts;
        state.alerts.statistics = action.payload.statistics;
        state.alerts.pagination = action.payload.pagination;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Alert by ID
      .addCase(fetchAlertById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlertById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alertDetail = action.payload;
      })
      .addCase(fetchAlertById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Alert
      .addCase(createAlert.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new alert to the beginning of the list
        state.alerts.data = [action.payload, ...state.alerts.data];
        state.alerts.pagination.total += 1;
      })
      .addCase(createAlert.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Alert
      .addCase(updateAlert.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAlert.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update alert in the list
        const index = state.alerts.data.findIndex(alert => alert._id === action.payload._id);
        if (index !== -1) {
          state.alerts.data[index] = action.payload;
        }
        // Also update alert detail if it's the same alert
        if (state.alertDetail && state.alertDetail._id === action.payload._id) {
          state.alertDetail = action.payload;
        }
      })
      .addCase(updateAlert.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Acknowledge Alert
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        // Update alert in the list
        const index = state.alerts.data.findIndex(alert => alert._id === action.payload._id);
        if (index !== -1) {
          state.alerts.data[index] = action.payload;
        }
        // Also update alert detail if it's the same alert
        if (state.alertDetail && state.alertDetail._id === action.payload._id) {
          state.alertDetail = action.payload;
        }
      })
      
      // Resolve Alert
      .addCase(resolveAlert.fulfilled, (state, action) => {
        // Update alert in the list
        const index = state.alerts.data.findIndex(alert => alert._id === action.payload._id);
        if (index !== -1) {
          state.alerts.data[index] = action.payload;
        }
        // Also update alert detail if it's the same alert
        if (state.alertDetail && state.alertDetail._id === action.payload._id) {
          state.alertDetail = action.payload;
        }
      })
      
      // Close Alert
      .addCase(closeAlert.fulfilled, (state, action) => {
        // Remove alert from the list
        state.alerts.data = state.alerts.data.filter(alert => alert._id !== action.payload._id);
        state.alerts.pagination.total -= 1;
        // Clear alert detail if it's the same alert
        if (state.alertDetail && state.alertDetail._id === action.payload._id) {
          state.alertDetail = null;
        }
      })
      
      // Add Note
      .addCase(addNote.fulfilled, (state, action) => {
        // Update alert detail with new note
        if (state.alertDetail) {
          if (!state.alertDetail.notes) {
            state.alertDetail.notes = [];
          }
          state.alertDetail.notes.push(action.payload);
        }
      })
      
      // Assign Alert
      .addCase(assignAlert.fulfilled, (state, action) => {
        // Update alert in the list
        const index = state.alerts.data.findIndex(alert => alert._id === action.payload._id);
        if (index !== -1) {
          state.alerts.data[index] = action.payload;
        }
        // Also update alert detail if it's the same alert
        if (state.alertDetail && state.alertDetail._id === action.payload._id) {
          state.alertDetail = action.payload;
        }
      })
      
      // Fetch Alert Statistics
      .addCase(fetchAlertStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlertStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alertStatistics = action.payload;
      })
      .addCase(fetchAlertStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Bulk Update Alerts
      .addCase(bulkUpdateAlerts.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(bulkUpdateAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearAlerts,
  clearAlertDetail,
  setRealtimeAlerts,
  clearRealtimeAlerts,
  markAllAsRead,
  decrementUnreadCount,
} = alertsSlice.actions;

export default alertsSlice.reducer;