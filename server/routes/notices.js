const express = require('express');
const jwt = require('jsonwebtoken');
const Notice = require('../models/Notice');
const { notifyNewNotice } = require('../socket');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access token required' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Get all active notices (for students and operators)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, priority, limit = 10 } = req.query;
    
    let filter = { isActive: true };
    
    // Filter by target audience
    if (req.user.role === 'student') {
      filter.targetAudience = { $in: ['all', 'students'] };
    } else if (req.user.role === 'operator') {
      filter.targetAudience = { $in: ['all', 'operators'] };
    }
    
    // Additional filters
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    
    // Check for expired notices
    filter.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];
    
    const notices = await Notice.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .exec();
    
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get notice by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    // Check if user has access to this notice
    if (req.user.role === 'student' && !['all', 'students'].includes(notice.targetAudience)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new notice (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { title, content, category, priority, targetAudience, expiresAt } = req.body;
    
    const notice = new Notice({
      title,
      content,
      category,
      priority,
      targetAudience,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user.username || 'admin'
    });
    
    await notice.save();
    
    // Send real-time notification
    notifyNewNotice(notice);
    
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update notice (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const updates = req.body;
    updates.updatedAt = new Date();
    
    const notice = await Notice.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true }
    );
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    res.json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete notice (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle notice active status (admin only)
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    notice.isActive = !notice.isActive;
    notice.updatedAt = new Date();
    await notice.save();
    
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 