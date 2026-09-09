const crypto = require('crypto');
const logger = require('../utils/logger');

class EncryptionManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.authTagLength = 16;
    this.saltLength = 64;
    
    // Generate or load master key from environment
    this.masterKey = this.loadOrGenerateMasterKey();
  }
  
  loadOrGenerateMasterKey() {
    let masterKey = process.env.MASTER_ENCRYPTION_KEY;
    
    if (!masterKey) {
      logger.warn('No master encryption key found in environment. Generating temporary key...');
      masterKey = crypto.randomBytes(this.keyLength).toString('hex');
      logger.warn(`TEMP MASTER KEY: ${masterKey} - Store this in MASTER_ENCRYPTION_KEY env variable!`);
    } else if (masterKey.length !== this.keyLength * 2) {
      throw new Error(`Master key must be ${this.keyLength * 2} characters (${this.keyLength} bytes)`);
    }
    
    return Buffer.from(masterKey, 'hex');
  }
  
  generateKeyFromPassword(password, salt = null) {
    const saltBuffer = salt || crypto.randomBytes(this.saltLength);
    
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, saltBuffer, this.keyLength, (err, derivedKey) => {
        if (err) reject(err);
        resolve({
          key: derivedKey,
          salt: saltBuffer
        });
      });
    });
  }
  
  encrypt(text, key = this.masterKey) {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: this.algorithm
      };
    } catch (error) {
      logger.error(`Encryption failed: ${error.message}`);
      throw error;
    }
  }
  
  decrypt(encryptedData, key = this.masterKey) {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        key,
        Buffer.from(encryptedData.iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error(`Decryption failed: ${error.message}`);
      throw error;
    }
  }
  
  encryptSensitiveData(data) {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Data must be an object');
    }
    
    const encrypted = {};
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'credential',
      'api_key', 'private_key', 'ssh_key', 'pem', 'certificate'
    ];
    
    for (const [key, value] of Object.entries(data)) {
      const keyLower = key.toLowerCase();
      const isSensitive = sensitiveFields.some(field => keyLower.includes(field));
      
      if (isSensitive && value) {
        try {
          encrypted[key] = this.encrypt(String(value));
        } catch (error) {
          logger.warn(`Failed to encrypt field ${key}: ${error.message}`);
          encrypted[key] = value; // Keep as-is if encryption fails
        }
      } else {
        encrypted[key] = value;
      }
    }
    
    return encrypted;
  }
  
  hashData(data, algorithm = 'sha256') {
    const hash = crypto.createHash(algorithm);
    hash.update(typeof data === 'object' ? JSON.stringify(data) : String(data));
    return hash.digest('hex');
  }
  
  generateHMAC(data, key) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(typeof data === 'object' ? JSON.stringify(data) : String(data));
    return hmac.digest('hex');
  }
  
  verifyHMAC(data, hmac, key) {
    const calculatedHMAC = this.generateHMAC(data, key);
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHMAC, 'hex'),
      Buffer.from(hmac, 'hex')
    );
  }
  
  generateKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
  }
  
  encryptWithPublicKey(data, publicKey) {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  }
  
  decryptWithPrivateKey(encryptedData, privateKey) {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString('utf8');
  }
  
  generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
  
  createDigitalSignature(data, privateKey) {
    const sign = crypto.createSign('SHA256');
    sign.update(typeof data === 'object' ? JSON.stringify(data) : String(data));
    sign.end();
    return sign.sign(privateKey, 'hex');
  }
  
  verifyDigitalSignature(data, signature, publicKey) {
    const verify = crypto.createVerify('SHA256');
    verify.update(typeof data === 'object' ? JSON.stringify(data) : String(data));
    verify.end();
    return verify.verify(publicKey, signature, 'hex');
  }
  
  // For storing encrypted data in database
  prepareForStorage(data, encryptionContext = {}) {
    const encrypted = this.encryptSensitiveData(data);
    
    return {
      data: encrypted,
      metadata: {
        encryptedAt: new Date().toISOString(),
        algorithm: this.algorithm,
        encryptionContext,
        version: '1.0'
      },
      checksum: this.hashData(JSON.stringify(encrypted))
    };
  }
  
  // For retrieving and decrypting from database
  retrieveFromStorage(storedData) {
    if (!storedData.data || !storedData.metadata) {
      throw new Error('Invalid stored data format');
    }
    
    // Verify checksum
    const calculatedChecksum = this.hashData(JSON.stringify(storedData.data));
    if (calculatedChecksum !== storedData.checksum) {
      throw new Error('Data integrity check failed');
    }
    
    // Decrypt sensitive fields
    const decrypted = { ...storedData.data };
    
    for (const [key, value] of Object.entries(storedData.data)) {
      if (value && typeof value === 'object' && value.encryptedData && value.iv && value.authTag) {
        try {
          decrypted[key] = this.decrypt(value);
        } catch (error) {
          logger.error(`Failed to decrypt field ${key}: ${error.message}`);
          decrypted[key] = '[DECRYPTION_FAILED]';
        }
      }
    }
    
    return decrypted;
  }
}

module.exports = new EncryptionManager();