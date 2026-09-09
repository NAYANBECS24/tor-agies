import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTrafficData = createAsyncThunk(
  'tor/fetchTrafficData',
  async () => {
    // Simulate API call
    return [
      { id: 1, timestamp: '2024-12-14 15:30:22', source: 'GuardNode01', destination: '192.168.1.100:443', protocol: 'HTTPS', bytes: '2.4 MB', threat: 'low' },
      { id: 2, timestamp: '2024-12-14 15:29:45', source: 'ExitNode01', destination: '10.0.0.5:80', protocol: 'HTTP', bytes: '1.8 MB', threat: 'low' },
    ];
  }
);

const torSlice = createSlice({
  name: 'tor',
  initialState: {
    traffic: [],
    nodes: [],
    threats: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addTraffic: (state, action) => {
      state.traffic.unshift(action.payload);
    },
    updateNode: (state, action) => {
      const { id, status } = action.payload;
      const node = state.nodes.find(n => n.id === id);
      if (node) {
        node.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrafficData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTrafficData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.traffic = action.payload;
      })
      .addCase(fetchTrafficData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { addTraffic, updateNode } = torSlice.actions;
export default torSlice.reducer;