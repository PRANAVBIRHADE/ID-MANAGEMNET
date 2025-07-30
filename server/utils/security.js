const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const SecurityLog = require('../models/SecurityLog');
const Session = require('../models/Session');

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Generate 2FA secret
const generateTwoFactorSecret = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Generate backup codes
const generateBackupCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// Generate TOTP code (Time-based One-Time Password)
const generateTOTP = (secret, timeStep = 30) => {
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter), 0);
  
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(buffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0xf;
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);
  
  return (code % 1000000).toString().padStart(6, '0');
};

// Verify TOTP code
const verifyTOTP = (secret, code, timeStep = 30, window = 1) => {
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  
  for (let i = -window; i <= window; i++) {
    const testCounter = counter + i;
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(testCounter), 0);
    
    const hmac = crypto.createHmac('sha1', secret);
    hmac.update(buffer);
    const hash = hmac.digest();
    
    const offset = hash[hash.length - 1] & 0xf;
    const expectedCode = ((hash[offset] & 0x7f) << 24) |
                         ((hash[offset + 1] & 0xff) << 16) |
                         ((hash[offset + 2] & 0xff) << 8) |
                         (hash[offset + 3] & 0xff);
    
    const expectedCodeStr = (expectedCode % 1000000).toString().padStart(6, '0');
    if (code === expectedCodeStr) {
      return true;
    }
  }
  return false;
};

// Generate password reset token
const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate session ID
const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash backup code
const hashBackupCode = (code) => {
  return bcrypt.hashSync(code, 10);
};

// Verify backup code
const verifyBackupCode = (code, hashedCode) => {
  return bcrypt.compareSync(code, hashedCode);
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@studentid.com',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your Student ID Management account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Send 2FA setup email
const send2FASetupEmail = async (email, secret) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@studentid.com',
    to: email,
    subject: 'Two-Factor Authentication Setup',
    html: `
      <h2>Two-Factor Authentication Setup</h2>
      <p>Your 2FA secret key: <strong>${secret}</strong></p>
      <p>Use this secret key in your authenticator app (Google Authenticator, Authy, etc.)</p>
      <p>Keep this secret key secure and don't share it with anyone.</p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Log security event
const logSecurityEvent = async (userId, eventType, ipAddress, userAgent, status, details = '') => {
  try {
    const log = new SecurityLog({
      userId,
      eventType,
      ipAddress,
      userAgent,
      status,
      details
    });
    await log.save();
  } catch (error) {
    console.error('Security logging failed:', error);
  }
};

// Create session
const createSession = async (userId, token, ipAddress, userAgent) => {
  try {
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const session = new Session({
      userId,
      sessionId,
      token,
      ipAddress,
      userAgent,
      expiresAt
    });
    
    await session.save();
    return sessionId;
  } catch (error) {
    console.error('Session creation failed:', error);
    return null;
  }
};

// Validate session
const validateSession = async (sessionId, token) => {
  try {
    const session = await Session.findOne({
      sessionId,
      token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (session) {
      // Update last activity
      session.lastActivity = new Date();
      await session.save();
      return session;
    }
    
    return null;
  } catch (error) {
    console.error('Session validation failed:', error);
    return null;
  }
};

// Invalidate session
const invalidateSession = async (sessionId) => {
  try {
    await Session.updateOne(
      { sessionId },
      { isActive: false }
    );
  } catch (error) {
    console.error('Session invalidation failed:', error);
  }
};

// Get user sessions
const getUserSessions = async (userId) => {
  try {
    return await Session.find({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ lastActivity: -1 });
  } catch (error) {
    console.error('Get user sessions failed:', error);
    return [];
  }
};

// Clean expired sessions
const cleanExpiredSessions = async () => {
  try {
    await Session.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  } catch (error) {
    console.error('Clean expired sessions failed:', error);
  }
};

module.exports = {
  generateTwoFactorSecret,
  generateBackupCodes,
  generateTOTP,
  verifyTOTP,
  generatePasswordResetToken,
  generateSessionId,
  hashBackupCode,
  verifyBackupCode,
  sendPasswordResetEmail,
  send2FASetupEmail,
  logSecurityEvent,
  createSession,
  validateSession,
  invalidateSession,
  getUserSessions,
  cleanExpiredSessions
}; 