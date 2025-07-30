const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  branch: { type: String, required: true },
  dob: { type: Date, required: true },
  phone: { type: String, required: true },
  ac_year: { type: String, required: true },
  address: { type: String, required: true },
  prn: { type: String, required: true, unique: true },
  photo_path: { type: String },
  // New fields for profile update tracking
  lastProfileUpdate: { type: Date, default: null },
  profileUpdateCount: { type: Number, default: 0 },
  profileUpdateHistory: [{
    field: { type: String, required: true },
    oldValue: { type: String },
    newValue: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Student', studentSchema); 