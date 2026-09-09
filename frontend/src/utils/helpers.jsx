import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Format bytes to human readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Format date
export const formatDate = (date, formatStr = 'PPpp') => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

// Get color based on threat level
export const getThreatLevelColor = (level) => {
  switch (level?.toLowerCase()) {
    case 'critical':
      return '#f44336';
    case 'high':
      return '#ff9800';
    case 'medium':
      return '#ffeb3b';
    case 'low':
      return '#4caf50';
    default:
      return '#9e9e9e';
  }
};

// Get color based on severity
export const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#f44336';
    case 'high':
      return '#ff9800';
    case 'medium':
      return '#ffeb3b';
    case 'low':
      return '#4caf50';
    case 'info':
      return '#2196f3';
    default:
      return '#9e9e9e';
  }
};

// Get color based on status
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'online':
      return '#4caf50';
    case 'offline':
      return '#f44336';
    case 'suspicious':
      return '#ff9800';
    case 'compromised':
      return '#9c27b0';
    case 'new':
      return '#2196f3';
    case 'acknowledged':
      return '#ff9800';
    case 'investigating':
      return '#9c27b0';
    case 'resolved':
      return '#4caf50';
    case 'closed':
      return '#607d8b';
    default:
      return '#9e9e9e';
  }
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format IP address
export const formatIpAddress = (ip) => {
  if (!ip) return 'N/A';
  // Add IP formatting logic here
  return ip;
};

// Format country code to flag emoji
export const getCountryFlag = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '🏴';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  
  return String.fromCodePoint(...codePoints);
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 6;
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  return null;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Get query parameters from URL
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};

// Set query parameters in URL
export const setQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });
  
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState({}, '', newUrl);
};

// Remove undefined/null values from object
export const cleanObject = (obj) => {
  const cleaned = { ...obj };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined || cleaned[key] === null || cleaned[key] === '') {
      delete cleaned[key];
    }
  });
  return cleaned;
};