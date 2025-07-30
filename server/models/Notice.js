const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['general', 'academic', 'event', 'important', 'announcement'], 
    default: 'general' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  targetAudience: { 
    type: String, 
    enum: ['all', 'students', 'operators'], 
    default: 'all' 
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  attachments: [{ 
    filename: String, 
    path: String, 
    uploadedAt: { type: Date, default: Date.now } 
  }]
});

// Index for better query performance
noticeSchema.index({ isActive: 1, targetAudience: 1, createdAt: -1 });
noticeSchema.index({ category: 1, priority: 1 });

module.exports = mongoose.model('Notice', noticeSchema); 