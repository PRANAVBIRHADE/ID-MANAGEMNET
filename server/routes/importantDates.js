const express = require('express');
const router = express.Router();
const ImportantDate = require('../models/ImportantDate');
const auth = require('../middleware/auth');
const { notifyNewEvent } = require('../socket');

// Get all important dates
router.get('/', async (req, res) => {
  try {
    const dates = await ImportantDate.find().sort({ date: 1 });
    res.json(dates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new important date (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, type } = req.body;
    const newDate = new ImportantDate({
      title,
      description,
      date,
      type,
      createdBy: req.user.id
    });
    const savedDate = await newDate.save();
    
    // Send real-time notification
    notifyNewEvent(savedDate);
    
    res.json(savedDate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update important date (requires authentication)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, date, type } = req.body;
    const updatedDate = await ImportantDate.findByIdAndUpdate(
      req.params.id,
      { title, description, date, type },
      { new: true }
    );
    if (!updatedDate) {
      return res.status(404).json({ message: 'Date not found' });
    }
    res.json(updatedDate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete important date (requires authentication)
router.delete('/:id', auth, async (req, res) => {
  try {
    const date = await ImportantDate.findById(req.params.id);
    if (!date) {
      return res.status(404).json({ message: 'Date not found' });
    }
    await date.remove();
    res.json({ message: 'Date removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
