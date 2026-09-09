/**
 * User.js — SQLite-backed model (replaces Mongoose)
 * Authentication user store using better-sqlite3 + bcryptjs
 */

const bcrypt = require('bcryptjs');
const { getDB } = require('../config/database');

function uuid() { return `USER-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`; }

function toPublic(row) {
  if (!row) return null;
  let prefs = {};
  try { prefs = JSON.parse(row.preferences_json || '{}'); } catch {}
  return {
    id: row.user_id,
    userId: row.user_id,
    username: row.username,
    email: row.email,
    role: row.role,
    isActive: !!row.is_active,
    preferences: prefs,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Ensure preferences column exists (migration-safe)
function ensurePreferencesCol() {
  try {
    const db = getDB();
    db.exec(`ALTER TABLE users ADD COLUMN preferences_json TEXT DEFAULT '{}'`);
  } catch {}
}
ensurePreferencesCol();

const User = {
  findByUsername(username) {
    return toPublic(getDB().prepare('SELECT * FROM users WHERE username = ?').get(username));
  },

  findByEmail(email) {
    return toPublic(getDB().prepare('SELECT * FROM users WHERE email = ?').get(email));
  },

  findById(userId) {
    return toPublic(getDB().prepare('SELECT * FROM users WHERE user_id = ?').get(userId));
  },

  findAll() {
    return getDB().prepare('SELECT * FROM users WHERE is_active = 1').all().map(toPublic);
  },

  async create(data) {
    const db = getDB();
    const userId = uuid();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    db.prepare(`
      INSERT INTO users (user_id, username, email, password_hash, role, is_active, preferences_json)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run(userId, data.username, data.email, passwordHash, data.role || 'analyst', JSON.stringify(data.preferences || {}));
    return this.findById(userId);
  },

  async comparePassword(userId, candidatePassword) {
    const row = getDB().prepare('SELECT password_hash FROM users WHERE user_id = ?').get(userId);
    if (!row) return false;
    return bcrypt.compare(candidatePassword, row.password_hash);
  },

  updateLastLogin(userId) {
    getDB().prepare('UPDATE users SET last_login = ?, updated_at = ? WHERE user_id = ?')
      .run(new Date().toISOString(), new Date().toISOString(), userId);
  },

  updateById(userId, updates) {
    const db = getDB();
    const fields = [];
    const vals = [];
    if ('role' in updates) { fields.push('role = ?'); vals.push(updates.role); }
    if ('isActive' in updates) { fields.push('is_active = ?'); vals.push(updates.isActive ? 1 : 0); }
    if ('preferences' in updates) { fields.push('preferences_json = ?'); vals.push(JSON.stringify(updates.preferences)); }
    if (fields.length === 0) return this.findById(userId);
    fields.push('updated_at = ?');
    vals.push(new Date().toISOString(), userId);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`).run(...vals);
    return this.findById(userId);
  },

  count() {
    return getDB().prepare('SELECT COUNT(*) as c FROM users WHERE is_active = 1').get().c;
  },
};

module.exports = User;