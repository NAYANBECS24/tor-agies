/**
 * seedDatabase.js — Seed script for SQLite database
 */

const { connectDB, getDB } = require('../config/database');
const User = require('../models/User');
const TorNode = require('../models/TorNode');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    connectDB();
    logger.info('Connected to SQLite for manual seeding');

    // Create admin, analyst, user
    if (!User.findByUsername('admin')) {
      await User.create({
        username: 'admin',
        email: 'admin@torsentinel.com',
        password: 'admin123',
        role: 'admin',
        preferences: { notifications: { email: true, push: true }, theme: 'dark' }
      });
    }

    if (!User.findByUsername('analyst')) {
      await User.create({
        username: 'analyst',
        email: 'analyst@torsentinel.com',
        password: 'analyst123',
        role: 'analyst',
        preferences: { notifications: { email: true, push: false }, theme: 'auto' }
      });
    }

    if (!User.findByUsername('user')) {
      await User.create({
        username: 'user',
        email: 'user@torsentinel.com',
        password: 'user123',
        role: 'user',
        preferences: { notifications: { email: false, push: true }, theme: 'light' }
      });
    }

    logger.info('Created users: admin, analyst, user');

    // Create sample Tor nodes
    const sampleNodes = [
      {
        nodeId: 'node001',
        fingerprint: '1234567890ABCDEF1234567890ABCDEF12345678',
        nickname: 'GuardNode01',
        ipAddress: '192.168.1.100',
        country: 'United States',
        bandwidth: 50000000,
        flags: ['Running', 'Valid', 'Fast', 'Stable', 'Guard'],
        isGuard: true,
        isExit: false,
        isStable: true
      },
      {
        nodeId: 'node002',
        fingerprint: '234567890ABCDEF1234567890ABCDEF123456789',
        nickname: 'ExitNode01',
        ipAddress: '192.168.1.101',
        country: 'Germany',
        bandwidth: 75000000,
        flags: ['Running', 'Valid', 'Fast', 'Stable', 'Exit'],
        isGuard: false,
        isExit: true,
        isStable: true
      },
      {
        nodeId: 'node003',
        fingerprint: '34567890ABCDEF1234567890ABCDEF1234567890',
        nickname: 'RelayNode01',
        ipAddress: '192.168.1.102',
        country: 'Canada',
        bandwidth: 30000000,
        flags: ['Running', 'Valid', 'Stable'],
        isGuard: false,
        isExit: false,
        isStable: true
      },
      {
        nodeId: 'node004',
        fingerprint: '4567890ABCDEF1234567890ABCDEF12345678901',
        nickname: 'SuspiciousNode',
        ipAddress: '192.168.1.103',
        country: 'Russia',
        bandwidth: 10000000,
        flags: ['Running', 'Valid'],
        isGuard: false,
        isExit: true,
        isStable: false
      }
    ];

    for (const node of sampleNodes) {
      TorNode.create(node);
    }
    logger.info(`Created ${sampleNodes.length} sample Tor nodes`);

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();