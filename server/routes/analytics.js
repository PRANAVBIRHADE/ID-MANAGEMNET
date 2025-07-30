const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Notice = require('../models/Notice');
const ImportantDate = require('../models/ImportantDate');

// Get analytics data
router.get('/', async (req, res) => {
  try {
    const { timeRange = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    // Get total students
    const totalStudents = await Student.countDocuments();

    // Get students with photos
    const studentsWithPhotos = await Student.countDocuments({ photo_path: { $exists: true, $ne: null } });

    // Get recent profile updates
    const recentUpdates = await Student.countDocuments({
      lastProfileUpdate: { $gte: daysAgo }
    });

    // Branch distribution
    const branchDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$branch',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      },
      { $sort: { value: -1 } }
    ]);

    // Academic year distribution
    const yearDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$ac_year',
          students: { $sum: 1 }
        }
      },
      {
        $project: {
          year: '$_id',
          students: 1,
          _id: 0
        }
      },
      { $sort: { year: 1 } }
    ]);

    // Update trend (last 30 days)
    const updateTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const updates = await Student.countDocuments({
        lastProfileUpdate: { $gte: startOfDay, $lte: endOfDay }
      });

      updateTrend.push({
        date: startOfDay.toLocaleDateString(),
        updates
      });
    }

    // Monthly registrations (last 12 months)
    const monthlyRegistrations = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const registrations = await Student.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      monthlyRegistrations.push(registrations);
    }

    // Notices statistics
    const totalNotices = await Notice.countDocuments();
    const activeNotices = await Notice.countDocuments({ isActive: true });
    const urgentNotices = await Notice.countDocuments({ 
      isActive: true, 
      priority: 'urgent' 
    });

    // Events statistics
    const totalEvents = await ImportantDate.countDocuments();
    const upcomingEvents = await ImportantDate.countDocuments({
      date: { $gte: new Date() }
    });

    res.json({
      totalStudents,
      studentsWithPhotos,
      studentsWithoutPhotos: totalStudents - studentsWithPhotos,
      recentUpdates,
      branchDistribution,
      yearDistribution,
      updateTrend,
      monthlyRegistrations,
      notices: {
        total: totalNotices,
        active: activeNotices,
        urgent: urgentNotices
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

// Export analytics data
router.get('/export', async (req, res) => {
  try {
    const { timeRange = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    // Get detailed student data
    const students = await Student.find({
      createdAt: { $gte: daysAgo }
    }).select('name branch ac_year phone createdAt lastProfileUpdate photo_path');

    // Convert to CSV format
    const csvHeader = 'Name,Branch,Academic Year,Phone,Created Date,Last Update,Has Photo\n';
    const csvData = students.map(student => {
      return `"${student.name}","${student.branch}","${student.ac_year}","${student.phone}","${student.createdAt.toLocaleDateString()}","${student.lastProfileUpdate ? student.lastProfileUpdate.toLocaleDateString() : 'Never'}","${student.photo_path ? 'Yes' : 'No'}"`;
    }).join('\n');

    const csvContent = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}days.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting analytics data' });
  }
});

module.exports = router; 