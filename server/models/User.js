const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['operator', 'student'], required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  
  // 2FA fields
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null },
  backupCodes: [{ type: String }],
  
  // Security fields
  lastLogin: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  accountLocked: { type: Boolean, default: false },
  lockExpiresAt: { type: Date },
  passwordResetToken: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
  
  // Email verification
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
  
  // Account settings
  maxSessions: { type: Number, default: 5 },
  sessionTimeout: { type: Number, default: 24 * 60 * 60 * 1000 }, // 24 hours in milliseconds
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema); 