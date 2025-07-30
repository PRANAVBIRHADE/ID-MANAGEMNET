const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: ['login', 'logout', 'login_failed', 'password_reset', '2fa_enabled', '2fa_disabled', 'session_expired', 'suspicious_activity'],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  location: {
    country: String,
    city: String,
    region: String
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'blocked'],
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
securityLogSchema.index({ userId: 1, timestamp: -1 });
securityLogSchema.index({ eventType: 1, timestamp: -1 });
securityLogSchema.index({ ipAddress: 1, timestamp: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema); 