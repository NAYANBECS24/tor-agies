import React from 'react';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.subscriptions = new Set();
    this.messageHandlers = new Map();
  }

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.authenticate();
      this.resubscribe();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  authenticate() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.send({
        type: 'auth',
        token: token
      });
    }
  }

  subscribe(channel) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.subscriptions.add(channel);
      this.send({
        type: 'subscribe',
        channel: channel
      });
    }
  }

  unsubscribe(channel) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.subscriptions.delete(channel);
      this.send({
        type: 'unsubscribe',
        channel: channel
      });
    }
  }

  resubscribe() {
    this.subscriptions.forEach(channel => {
      this.subscribe(channel);
    });
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  handleMessage(data) {
    // Call registered message handlers
    if (this.messageHandlers.has(data.type)) {
      this.messageHandlers.get(data.type).forEach(handler => {
        handler(data);
      });
    }

    // Also handle by channel
    if (data.channel && this.messageHandlers.has(data.channel)) {
      this.messageHandlers.get(data.channel).forEach(handler => {
        handler(data);
      });
    }
  }

  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  offMessage(type, handler) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Reconnecting in ${delay}ms...`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.subscriptions.clear();
      this.messageHandlers.clear();
    }
  }
}

export const websocketService = new WebSocketService();

// React hook for using WebSocket
export const useWebSocket = (subscriptions = [], handlers = {}) => {
  React.useEffect(() => {
    websocketService.connect();
    
    // Subscribe to channels
    subscriptions.forEach(channel => {
      websocketService.subscribe(channel);
    });
    
    // Register message handlers
    Object.entries(handlers).forEach(([type, handler]) => {
      websocketService.onMessage(type, handler);
    });
    
    return () => {
      // Unsubscribe from channels
      subscriptions.forEach(channel => {
        websocketService.unsubscribe(channel);
      });
      
      // Unregister message handlers
      Object.entries(handlers).forEach(([type, handler]) => {
        websocketService.offMessage(type, handler);
      });
    };
  }, [subscriptions, handlers]);
};