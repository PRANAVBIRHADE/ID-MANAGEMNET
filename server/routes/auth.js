const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const router = express.Router();

// Admin login with fixed credentials
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Check for admin credentials
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ id: 'admin', role: 'operator' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: 'operator' });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
});

// Student registration
router.post('/register', async (req, res) => {
  try {
    const { name, branch, dob, phone, ac_year, address, prn, password } = req.body;
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ prn });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this PRN already exists' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create student user
    const studentUser = new User({
      username: prn,
      password_hash,
      role: 'student',
      studentId: null // Will be updated after student creation
    });
    
    await studentUser.save();
    
    // Create student record
    const student = new Student({
      name, branch, dob, phone, ac_year, address, prn
    });
    
    await student.save();
    
    // Update user with student ID
    studentUser.studentId = student._id;
    await studentUser.save();
    
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Student login
router.post('/student/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username, role: 'student' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ 
      id: user._id, 
      role: user.role, 
      studentId: user.studentId,
      username: user.username 
    }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router; 