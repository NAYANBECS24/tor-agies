const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous'
  });
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      success: false,
      message,
      error: 'Invalid resource identifier'
    };
    return res.status(404).json(error);
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = {
      success: false,
      message,
      error: 'Duplicate key error'
    };
    return res.status(400).json(error);
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      success: false,
      message,
      error: 'Validation failed'
    };
    return res.status(400).json(error);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token',
      error: 'Authentication failed'
    };
    return res.status(401).json(error);
  }
  
  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token expired',
      error: 'Authentication failed'
    };
    return res.status(401).json(error);
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };
  
  res.status(statusCode).json(response);
};

module.exports = errorHandler;