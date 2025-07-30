import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  Avatar, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import { 
  Person, 
  School, 
  Phone, 
  Home, 
  CalendarToday, 
  Badge, 
  Edit, 
  Save, 
  Cancel,
  Info,
  Warning
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [formData, setFormData] = useState({ phone: '', address: '' });
  const [showHistory, setShowHistory] = useState(false);
  const [updateHistory, setUpdateHistory] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/students/profile');
        setStudent(res.data);
        setFormData({
          phone: res.data.phone || '',
          address: res.data.address || ''
        });
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      phone: student.phone || '',
      address: student.address || ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      setUpdateError('');
      setUpdateSuccess('');
      
      const res = await api.put('/students/profile', formData);
      
      setStudent(res.data.student);
      setEditMode(false);
      setUpdateSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(''), 3000);
      
    } catch (err) {
      if (err.response?.status === 403) {
        // 3-month restriction error
        const errorData = err.response.data;
        setUpdateDialog(true);
        setUpdateError(`${errorData.message}. Next update available: ${new Date(errorData.nextUpdateDate).toLocaleDateString()}`);
      } else {
        setUpdateError(err.response?.data?.message || 'Failed to update profile');
      }
    }
  };

  const canUpdateProfile = () => {
    if (!student?.lastProfileUpdate) return true;
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return new Date(student.lastProfileUpdate) <= threeMonthsAgo;
  };

  const getNextUpdateDate = () => {
    if (!student?.lastProfileUpdate) return null;
    
    const nextUpdate = new Date(student.lastProfileUpdate);
    nextUpdate.setMonth(nextUpdate.getMonth() + 3);
    return nextUpdate;
  };

  const fetchUpdateHistory = async () => {
    try {
      const res = await api.get('/students/profile/history');
      setUpdateHistory(res.data.updateHistory || []);
    } catch (err) {
      console.error('Failed to fetch update history:', err);
    }
  };

  const handleViewHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      fetchUpdateHistory();
    }
  };

  if (loading) {
    return (
      <Container sx={{ pt: 12, zIndex: 1, position: 'relative' }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ pt: 12, zIndex: 1, position: 'relative' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container sx={{ pt: 12, zIndex: 1, position: 'relative' }}>
        <Alert severity="warning">No profile data found</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ pt: 12, zIndex: 1, position: 'relative' }}>
      <Box component={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Typography variant="h4" fontWeight={700} color="primary" mb={4} textAlign="center">
          My Student Profile
        </Typography>

        {/* Update Status Banner */}
        {!canUpdateProfile() && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => setUpdateDialog(true)}>
                View Details
              </Button>
            }
          >
            Profile updates are restricted. Next update available: {getNextUpdateDate()?.toLocaleDateString()}
          </Alert>
        )}

        {updateSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {updateSuccess}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Paper elevation={8} sx={{ p: 4, borderRadius: 3, bgcolor: 'rgba(34,24,74,0.95)', color: 'white', boxShadow: '0 8px 32px #8f5cff88' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'secondary.main', fontSize: 36 }}>
                  {student.name?.charAt(0)?.toUpperCase() || 'S'}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="secondary">
                    {student.name}
                  </Typography>
                  <Typography variant="body1" color="primary.light">
                    PRN: {student.prn}
                  </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2}>
                  {student.profileUpdateCount > 0 && (
                    <Chip 
                      label={`Updated ${student.profileUpdateCount} time(s)`}
                      color="secondary"
                      size="small"
                    />
                  )}
                  
                  {canUpdateProfile() ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<Edit />}
                      onClick={handleEditClick}
                      disabled={editMode}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<Info />}
                      onClick={() => setUpdateDialog(true)}
                    >
                      Update Restricted
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={6}>
            <Card component={motion.div} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={3} color="primary">
                  Personal Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" fontWeight={600}>{student.name}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {student.dob ? new Date(student.dob).toLocaleDateString() : 'Not provided'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone sx={{ mr: 2, color: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                    {editMode ? (
                      <TextField
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                    <Typography variant="body1" fontWeight={600}>{student.phone}</Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Home sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    {editMode ? (
                      <TextField
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        sx={{ mt: 0.5 }}
                      />
                    ) : (
                    <Typography variant="body1" fontWeight={600}>{student.address}</Typography>
                    )}
                  </Box>
                </Box>

                {editMode && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<Cancel />}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card component={motion.div} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={3} color="primary">
                  Academic Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <School sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Branch</Typography>
                    <Typography variant="body1" fontWeight={600}>{student.branch}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Badge sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Academic Year</Typography>
                    <Typography variant="body1" fontWeight={600}>{student.ac_year}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Badge sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">PRN Number</Typography>
                    <Typography variant="body1" fontWeight={600}>{student.prn}</Typography>
                  </Box>
                </Box>

                {student.photo_path && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Photo</Typography>
                      <Typography variant="body1" fontWeight={600} color="success.main">✓ Uploaded</Typography>
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Profile Update Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {canUpdateProfile() ? (
                    <Chip label="Can Update" color="success" size="small" />
                  ) : (
                    <Chip label="Update Restricted" color="warning" size="small" />
                  )}
                </Box>

                {student.profileUpdateCount > 0 && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleViewHistory}
                    sx={{ mt: 1 }}
                  >
                    {showHistory ? 'Hide' : 'View'} Update History
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Update History Section */}
          {showHistory && updateHistory.length > 0 && (
            <Grid item xs={12}>
              <Card component={motion.div} 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={3} color="primary">
                    Profile Update History
                  </Typography>
                  
                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {updateHistory.map((update, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            {update.field.charAt(0).toUpperCase() + update.field.slice(1)} Updated
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(update.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Previous:</Typography>
                            <Typography variant="body2">{update.oldValue}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">New:</Typography>
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              {update.newValue}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Photo Display */}
          {student.photo_path && (
            <Grid item xs={12}>
              <Card component={motion.div} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={3} color="primary">
                    Student Photo
                  </Typography>
                  <Box display="flex" justifyContent="center">
                    <img 
                      src={student.photo_path} 
                      alt="Student" 
                      style={{ 
                        maxWidth: '200px', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Update Restriction Dialog */}
      <Dialog open={updateDialog} onClose={() => setUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="warning" />
            Profile Update Restriction
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your profile can only be updated once every 3 months to maintain data integrity.
          </Typography>
          
          {student.lastProfileUpdate && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Last updated: {new Date(student.lastProfileUpdate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Next update available: {getNextUpdateDate()?.toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total updates: {student.profileUpdateCount || 0}
              </Typography>
            </Box>
          )}
          
          <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
            To make changes before the next update period, please contact your administrator.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 