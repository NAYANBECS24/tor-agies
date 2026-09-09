/**
 * socAuditService.js — TOR Sentinel 2.0
 * Tamper-Evident Audit Trail & RBAC Authorization Service
 * Reference: RFT-26.2026 Terms of Reference (Data Protection, Least Privilege & Audit Logging)
 *
 * RBAC Matrix:
 *   - ADMIN: Full permissions (VIEW, QUERY, EXPORT, CASE_EDIT, EVIDENCE_ACCESS, ADMIN)
 *   - INVESTIGATOR: VIEW, QUERY, EXPORT, CASE_EDIT, EVIDENCE_ACCESS
 *   - ANALYST: VIEW, QUERY, CASE_EDIT
 *   - AUDITOR: VIEW, QUERY, EXPORT (read-only compliance)
 *   - VIEWER: VIEW only
 */

const crypto = require('crypto');
const { getDB, toJson } = require('../config/database');
const logger = require('../utils/logger');

const ROLE_PERMISSIONS = {
  ADMIN: ['VIEW', 'QUERY', 'EXPORT', 'CASE_EDIT', 'EVIDENCE_ACCESS', 'ADMIN'],
  INVESTIGATOR: ['VIEW', 'QUERY', 'EXPORT', 'CASE_EDIT', 'EVIDENCE_ACCESS'],
  ANALYST: ['VIEW', 'QUERY', 'CASE_EDIT'],
  AUDITOR: ['VIEW', 'QUERY', 'EXPORT'],
  VIEWER: ['VIEW']
};

class SocAuditService {
  constructor() {
    this.serviceVersion = '1.5.0';
  }

  uuid(prefix = 'AUDIT') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  /**
   * Check if a role possesses a specific permission
   */
  hasPermission(role, permission) {
    const perms = ROLE_PERMISSIONS[role?.toUpperCase()] || [];
    return perms.includes(permission.toUpperCase());
  }

  getRoleMatrix() {
    return ROLE_PERMISSIONS;
  }

  /**
   * Generate cryptographic non-repudiation signature for an audit entry
   */
  generateSignature(auditId, userId, action, resource, timestamp) {
    return crypto
      .createHash('sha256')
      .update(`${auditId}|${userId}|${action}|${resource}|${timestamp}|TORSENTINEL_AUDIT_SALT`)
      .digest('hex');
  }

  /**
   * Record a tamper-evident audit entry
   */
  logAction(data) {
    const db = getDB();
    const auditId = data.auditId || this.uuid();
    const timestamp = new Date().toISOString();
    const userId = data.userId || 'USR-ANALYST-01';
    const username = data.username || 'Analyst-Alpha';
    const role = (data.role || 'ANALYST').toUpperCase();
    const action = (data.action || 'ACCESS').toUpperCase();
    const resource = data.resource || 'System';
    const ipAddress = data.ipAddress || '127.0.0.1';
    const status = (data.status || 'SUCCESS').toUpperCase();

    const signature = this.generateSignature(auditId, userId, action, resource, timestamp);

    db.prepare(`
      INSERT INTO soc_audit_logs (
        audit_id, user_id, username, role, action, resource, details_json, ip_address, status, signature_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      auditId,
      userId,
      username,
      role,
      action,
      resource,
      toJson(data.details || {}),
      ipAddress,
      status,
      signature,
      timestamp
    );

    return {
      success: true,
      auditId,
      signatureHash: signature,
      timestamp
    };
  }

  /**
   * Retrieve audit logs with filters
   */
  getAuditLogs(filters = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM soc_audit_logs WHERE 1=1';
    const params = [];

    if (filters.userId) {
      sql += ' AND user_id = ?';
      params.push(filters.userId);
    }
    if (filters.action) {
      sql += ' AND action = ?';
      params.push(filters.action);
    }
    if (filters.resource) {
      sql += ' AND resource = ?';
      params.push(filters.resource);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit, 10));
    } else {
      sql += ' LIMIT 50';
    }

    const rows = db.prepare(sql).all(...params);

    return rows.map(r => ({
      id: r.id,
      auditId: r.audit_id,
      userId: r.user_id,
      username: r.username,
      role: r.role,
      action: r.action,
      resource: r.resource,
      ipAddress: r.ip_address,
      status: r.status,
      signatureHash: r.signature_hash,
      details: JSON.parse(r.details_json || '{}'),
      createdAt: r.created_at
    }));
  }

  /**
   * Cryptographically verify an audit log record
   */
  verifyLogIntegrity(auditId) {
    const db = getDB();
    const r = db.prepare('SELECT * FROM soc_audit_logs WHERE audit_id = ?').get(auditId);
    if (!r) return { verified: false, reason: 'Record not found' };

    const expectedSig = this.generateSignature(r.audit_id, r.user_id, r.action, r.resource, r.created_at);
    const isValid = expectedSig === r.signature_hash;

    return {
      auditId: r.audit_id,
      verified: isValid,
      storedSignature: r.signature_hash,
      calculatedSignature: expectedSig,
      tamperEvident: isValid ? 'INTEGRITY_VERIFIED' : 'TAMPERING_DETECTED'
    };
  }
}

module.exports = new SocAuditService();
