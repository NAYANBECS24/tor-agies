import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Create basic reducers if the slice files don't exist
const authReducer = (state = { user: null, isAuthenticated: false }, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    default:
      return state;
  }
};

const torReducer = (state = { nodes: [], traffic: [] }, action) => {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    case 'SET_TRAFFIC':
      return { ...state, traffic: action.payload };
    default:
      return state;
  }
};

const alertsReducer = (state = { alerts: [], loading: false }, action) => {
  switch (action.type) {
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const analyticsReducer = (state = { data: [], metrics: {} }, action) => {
  switch (action.type) {
    case 'SET_ANALYTICS_DATA':
      return { ...state, data: action.payload };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  auth: authReducer,
  tor: torReducer,
  alerts: alertsReducer,
  analytics: analyticsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});