const express = require('express');
const { Parser } = require('json2csv');
const Student = require('../models/Student');

const router = express.Router();

router.get('/csv', async (req, res) => {
  const students = await Student.find();
  const fields = ['name', 'branch', 'dob', 'phone', 'ac_year', 'address', 'prn', 'photo_path'];
  const parser = new Parser({ fields });
  const csv = parser.parse(students.map(s => s.toObject()));
  res.header('Content-Type', 'text/csv');
  res.attachment('students.csv');
  res.send(csv);
});

module.exports = router; 