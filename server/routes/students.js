const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, req.body.prn + ext);
  },
});
const upload = multer({ storage });

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

// Debug endpoint to check current user
router.get('/debug/user', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user,
      message: 'Current user information'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student's own profile (for students)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    console.log('User from token:', req.user);
    console.log('StudentId from token:', req.user.studentId);
    
    let student = null;
    
    if (req.user.studentId) {
      student = await Student.findById(req.user.studentId);
    }
    
    // Fallback: if studentId is missing or student not found, try to find by username (PRN)
    if (!student && req.user.username) {
      console.log('Trying to find student by PRN:', req.user.username);
      student = await Student.findOne({ prn: req.user.username });
      
      // If found, update the user record with the correct studentId
      if (student) {
        console.log('Found student by PRN, updating user record');
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, { studentId: student._id });
      }
    }
    
    if (!student) {
      return res.status(404).json({ 
        message: 'Student profile not found. Please contact administrator.',
        debug: { userId: req.user.id, studentId: req.user.studentId, username: req.user.username }
      });
    }
    
    res.json(student);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Student profile update (students can update their own profile with restrictions)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const student = await Student.findById(req.user.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if 3 months have passed since last update
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    if (student.lastProfileUpdate && student.lastProfileUpdate > threeMonthsAgo) {
      const nextUpdateDate = new Date(student.lastProfileUpdate);
      nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 3);
      
      return res.status(403).json({ 
        message: 'Profile can only be updated once every 3 months',
        nextUpdateDate: nextUpdateDate,
        lastUpdateDate: student.lastProfileUpdate,
        updateCount: student.profileUpdateCount
      });
    }

    // Only allow updating phone and address
    const allowedFields = ['phone', 'address'];
    const updates = {};
    const updateHistory = [];

    for (const field of allowedFields) {
      if (req.body[field] && req.body[field] !== student[field]) {
        updates[field] = req.body[field];
        updateHistory.push({
          field: field,
          oldValue: student[field],
          newValue: req.body[field]
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid changes to update' });
    }

    // Update the student record
    updates.lastProfileUpdate = new Date();
    updates.profileUpdateCount = (student.profileUpdateCount || 0) + 1;
    updates.profileUpdateHistory = [...(student.profileUpdateHistory || []), ...updateHistory];

    const updatedStudent = await Student.findByIdAndUpdate(
      req.user.studentId, 
      updates, 
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      student: updatedStudent,
      updatedFields: Object.keys(updates).filter(key => allowedFields.includes(key))
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student's profile update history
router.get('/profile/history', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const student = await Student.findById(req.user.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({
      updateHistory: student.profileUpdateHistory || [],
      updateCount: student.profileUpdateCount || 0,
      lastUpdate: student.lastProfileUpdate,
      nextUpdateDate: student.lastProfileUpdate ? 
        new Date(new Date(student.lastProfileUpdate).setMonth(new Date(student.lastProfileUpdate).getMonth() + 3)) : 
        null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add student (admin only)
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { name, branch, dob, phone, ac_year, address, prn } = req.body;
    const photo_path = req.file ? `/uploads/${req.file.filename}` : '';
    const student = new Student({ name, branch, dob, phone, ac_year, address, prn, photo_path });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all students (admin only) with optional filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { 
      search, 
      branch, 
      ac_year, 
      hasPhoto, 
      updateStatus,
      sortBy = 'name',
      sortOrder = 'asc',
      limit,
      page 
    } = req.query;

    // Build filter object
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { prn: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (branch) filter.branch = branch;
    if (ac_year) filter.ac_year = ac_year;
    
    if (hasPhoto === 'yes') {
      filter.photo_path = { $exists: true, $ne: '' };
    } else if (hasPhoto === 'no') {
      filter.$or = [
        { photo_path: { $exists: false } },
        { photo_path: '' },
        { photo_path: null }
      ];
    }

    // Build sort object
    let sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build query
    let query = Student.find(filter).sort(sort);

    // Add pagination if specified
    if (limit && page) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      query = query.skip(skip).limit(parseInt(limit));
    }

    const students = await query.exec();

    // Apply update status filter on client side for now
    let filteredStudents = students;
    if (updateStatus === 'restricted') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filteredStudents = students.filter(student => 
        student.lastProfileUpdate && student.lastProfileUpdate > threeMonthsAgo
      );
    } else if (updateStatus === 'can_update') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filteredStudents = students.filter(student => 
        !student.lastProfileUpdate || student.lastProfileUpdate <= threeMonthsAgo
      );
    }

    // Get total count for pagination
    const totalCount = await Student.countDocuments(filter);

    res.json({
      students: filteredStudents,
      totalCount,
      currentPage: page ? parseInt(page) : 1,
      totalPages: limit ? Math.ceil(totalCount / parseInt(limit)) : 1,
      hasNextPage: limit && page ? (parseInt(page) * parseInt(limit)) < totalCount : false,
      hasPrevPage: page ? parseInt(page) > 1 : false
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update student (admin only)
router.put('/:id', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const updates = req.body;
    if (req.file) updates.photo_path = `/uploads/${req.file.filename}`;
    const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete student (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin override for student profile update (bypass 3-month restriction)
router.put('/:id/admin-update', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Only allow updating phone and address
    const allowedFields = ['phone', 'address'];
    const updates = {};
    const updateHistory = [];

    for (const field of allowedFields) {
      if (req.body[field] && req.body[field] !== student[field]) {
        updates[field] = req.body[field];
        updateHistory.push({
          field: field,
          oldValue: student[field],
          newValue: req.body[field],
          updatedBy: 'admin',
          reason: req.body.reason || 'Admin override'
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid changes to update' });
    }

    // Update the student record (admin override doesn't change lastProfileUpdate)
    updates.profileUpdateCount = (student.profileUpdateCount || 0) + 1;
    updates.profileUpdateHistory = [...(student.profileUpdateHistory || []), ...updateHistory];

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully by admin',
      student: updatedStudent,
      updatedFields: Object.keys(updates).filter(key => allowedFields.includes(key))
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 