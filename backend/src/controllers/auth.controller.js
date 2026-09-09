const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = User.findByEmail(email) || User.findByUsername(username);
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }
      
      // Create new user
      const user = await User.create({
        username,
        email,
        password,
        role: role || 'user'
      });
      
      const jwtSecret = process.env.JWT_SECRET || 'tor_sentinel_secret_key_26151';
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.userId || user.id, role: user.role },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      });
      
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  },
  
  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email (or username)
      const user = User.findByEmail(email) || User.findByUsername(email);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }
      
      // Verify password
      const isPasswordValid = await User.comparePassword(user.userId || user.id, password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Update last login
      User.updateLastLogin(user.userId || user.id);
      
      const jwtSecret = process.env.JWT_SECRET || 'tor_sentinel_secret_key_26151';
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.userId || user.id, role: user.role },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token
        }
      });
      
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  },
  
  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = User.findById(req.user.userId || req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: user
      });
      
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: error.message
      });
    }
  },
  
  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { preferences, role } = req.body;
      const updateData = {};
      if (preferences) updateData.preferences = preferences;
      if (role) updateData.role = role;
      
      const user = User.updateById(req.user.userId || req.user.id, updateData);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
      
    } catch (error) {
      logger.error(`Update profile error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  },
  
  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId || req.user.id;
      const user = User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Verify current password
      const isPasswordValid = await User.comparePassword(userId, currentPassword);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Update password
      const { getDB } = require('../config/database');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      getDB().prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE user_id = ?').run(passwordHash, new Date().toISOString(), userId);
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
      
    } catch (error) {
      logger.error(`Change password error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message
      });
    }
  },
  
  // Logout user
  logout: async (req, res) => {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  },
  
  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const user = User.findById(req.user.userId || req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const jwtSecret = process.env.JWT_SECRET || 'tor_sentinel_secret_key_26151';
      // Generate new JWT token
      const token = jwt.sign(
        { userId: user.userId || user.id, role: user.role },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
      res.json({
        success: true,
        data: { token }
      });
      
    } catch (error) {
      logger.error(`Refresh token error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
        error: error.message
      });
    }
  }
};

module.exports = authController;