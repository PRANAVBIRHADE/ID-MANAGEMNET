const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const Session = require('../models/Session');
const {
  generateTwoFactorSecret,
  generateBackupCodes,
  generateTOTP,
  verifyTOTP,
  generatePasswordResetToken,
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
} = require('../utils/security');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access token required' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Get client IP address
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
};

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    const user = await User.findOne({ username });
    if (!user) {
      await logSecurityEvent(null, 'password_reset', ipAddress, userAgent, 'failed', 'User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = generatePasswordResetToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send email (in production, you'd get email from user profile)
    const emailSent = await sendPasswordResetEmail(username, resetToken);
    
    await logSecurityEvent(user._id, 'password_reset', ipAddress, userAgent, 'success');
    
    res.json({ 
      message: 'Password reset email sent',
      emailSent 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      await logSecurityEvent(null, 'password_reset', ipAddress, userAgent, 'failed', 'Invalid or expired token');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.failedLoginAttempts = 0;
    user.accountLocked = false;
    await user.save();

    await logSecurityEvent(user._id, 'password_reset', ipAddress, userAgent, 'success', 'Password changed');
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Setup 2FA
router.post('/setup-2fa', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    const secret = generateTwoFactorSecret();
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(code => hashBackupCode(code));

    user.twoFactorSecret = secret;
    user.backupCodes = hashedBackupCodes;
    await user.save();

    // Send email with secret (in production, you'd get email from user profile)
    const emailSent = await send2FASetupEmail(user.username, secret);

    await logSecurityEvent(userId, '2fa_enabled', ipAddress, userAgent, 'success');

    res.json({
      secret,
      backupCodes,
      qrCode: `otpauth://totp/StudentID:${user.username}?secret=${secret}&issuer=StudentID`,
      emailSent
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enable 2FA
router.post('/enable-2fa', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not set up' });
    }

    if (verifyTOTP(user.twoFactorSecret, code)) {
      user.twoFactorEnabled = true;
      await user.save();
      
      await logSecurityEvent(userId, '2fa_enabled', ipAddress, userAgent, 'success');
      res.json({ message: '2FA enabled successfully' });
    } else {
      await logSecurityEvent(userId, '2fa_enabled', ipAddress, userAgent, 'failed', 'Invalid code');
      res.status(400).json({ message: 'Invalid 2FA code' });
    }
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Disable 2FA
router.post('/disable-2fa', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA not enabled' });
    }

    if (verifyTOTP(user.twoFactorSecret, code)) {
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      user.backupCodes = [];
      await user.save();
      
      await logSecurityEvent(userId, '2fa_disabled', ipAddress, userAgent, 'success');
      res.json({ message: '2FA disabled successfully' });
    } else {
      await logSecurityEvent(userId, '2fa_disabled', ipAddress, userAgent, 'failed', 'Invalid code');
      res.status(400).json({ message: 'Invalid 2FA code' });
    }
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify 2FA code
router.post('/verify-2fa', async (req, res) => {
  try {
    const { username, code } = req.body;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    const user = await User.findOne({ username });
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA not enabled' });
    }

    if (verifyTOTP(user.twoFactorSecret, code)) {
      await logSecurityEvent(user._id, 'login', ipAddress, userAgent, 'success', '2FA verified');
      res.json({ message: '2FA verification successful' });
    } else {
      await logSecurityEvent(user._id, 'login_failed', ipAddress, userAgent, 'failed', 'Invalid 2FA code');
      res.status(400).json({ message: 'Invalid 2FA code' });
    }
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Use backup code
router.post('/use-backup-code', async (req, res) => {
  try {
    const { username, backupCode } = req.body;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    const user = await User.findOne({ username });
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA not enabled' });
    }

    const isValidCode = user.backupCodes.some(hashedCode => 
      verifyBackupCode(backupCode, hashedCode)
    );

    if (isValidCode) {
      // Remove used backup code
      user.backupCodes = user.backupCodes.filter(hashedCode => 
        !verifyBackupCode(backupCode, hashedCode)
      );
      await user.save();
      
      await logSecurityEvent(user._id, 'login', ipAddress, userAgent, 'success', 'Backup code used');
      res.json({ message: 'Backup code accepted' });
    } else {
      await logSecurityEvent(user._id, 'login_failed', ipAddress, userAgent, 'failed', 'Invalid backup code');
      res.status(400).json({ message: 'Invalid backup code' });
    }
  } catch (error) {
    console.error('Backup code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await getUserSessions(userId);
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Invalidate session
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'];

    await invalidateSession(sessionId);
    await logSecurityEvent(userId, 'logout', ipAddress, userAgent, 'success', 'Session invalidated');
    
    res.json({ message: 'Session invalidated' });
  } catch (error) {
    console.error('Invalidate session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get security logs
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const logs = await SecurityLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await SecurityLog.countDocuments({ userId });
    
    res.json({
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clean expired sessions (admin only)
router.post('/clean-sessions', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await cleanExpiredSessions();
    res.json({ message: 'Expired sessions cleaned' });
  } catch (error) {
    console.error('Clean sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 