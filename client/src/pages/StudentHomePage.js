import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Container, 
  Paper, 
  Avatar, 
  Chip, 
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Notifications, 
  School, 
  Person, 
  Event, 
  Info, 
  Warning, 
  CheckCircle,
  CalendarToday,
  AccessTime,
  Close,
  Announcement
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'success';
    default: return 'default';
  }
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'academic': return <School />;
    case 'event': return <Event />;
    case 'important': return <Warning />;
    case 'announcement': return <Announcement />;
    default: return <Info />;
  }
};

export default function StudentHomePage() {
  const [student, setStudent] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [noticeDialog, setNoticeDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching student profile...');
        // Fetch student profile first
        const profileRes = await api.get('/students/profile');
        console.log('Profile response:', profileRes.data);
        setStudent(profileRes.data);
        
        // Then fetch notices (this might fail if no notices exist yet)
        try {
          console.log('Fetching notices...');
          const noticesRes = await api.get('/notices');
          console.log('Notices response:', noticesRes.data);
          setNotices(noticesRes.data || []);
        } catch (noticesErr) {
          console.warn('Failed to fetch notices:', noticesErr);
          console.warn('Notices error response:', noticesErr.response);
          setNotices([]); // Set empty array if notices fail
          // Don't show error for notices failure, just log it
        }
        
      } catch (err) {
        console.error('Failed to fetch student data:', err);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        
        // Try to get debug info
        try {
          const debugRes = await api.get('/students/debug/user');
          console.log('Debug user info:', debugRes.data);
        } catch (debugErr) {
          console.error('Debug endpoint failed:', debugErr);
        }
        
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response?.status === 404) {
          setError('Student profile not found. Please contact administrator.');
        } else {
          setError(`Failed to fetch student data: ${err.response?.data?.message || err.message}. Please try refreshing the page.`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
    setNoticeDialog(true);
  };

  const handleCloseNotice = () => {
    setNoticeDialog(false);
    setSelectedNotice(null);
  };

  const getUrgentNotices = () => {
    return notices.filter(notice => notice.priority === 'urgent' || notice.priority === 'high');
  };

  const getRecentNotices = () => {
    return notices.slice(0, 5); // Show latest 5 notices
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
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        
        {/* Debug information */}
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.100' }}>
          <Typography variant="h6" gutterBottom>Debug Information:</Typography>
          <Typography variant="body2">
            Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
          </Typography>
          <Typography variant="body2">
            Token length: {localStorage.getItem('token')?.length || 0}
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => window.location.reload()}
            sx={{ mt: 1 }}
          >
            Refresh Page
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            sx={{ mt: 1, ml: 1 }}
          >
            Clear Token & Relogin
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#1a1446', minHeight: '100vh' }}>
      {/* Welcome Hero Section */}
      <Box component={motion.div} 
        initial={{ opacity: 0, y: -40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        sx={{ 
          py: 8, 
          textAlign: 'center', 
          bgcolor: 'primary.main', 
          color: 'white', 
          position: 'relative', 
          overflow: 'hidden' 
        }}
      >
        <Container>
          <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'secondary.main', 
                fontSize: 36, 
                mr: 3 
              }}
            >
              {student?.name?.charAt(0)?.toUpperCase() || 'S'}
            </Avatar>
            <Box textAlign="left">
              <Typography variant="h4" fontWeight={700} color="secondary">
                Welcome back, {student?.name}!
              </Typography>
              <Typography variant="body1" color="primary.light">
                PRN: {student?.prn} • {student?.branch}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="h6" mb={4} sx={{ maxWidth: 600, mx: 'auto', color: '#fff', opacity: 0.9 }}>
            Stay updated with the latest announcements and manage your student profile
          </Typography>
          
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              startIcon={<Person />}
              onClick={() => navigate('/dashboard/student')}
              component={motion.button} 
              whileHover={{ scale: 1.05 }}
            >
              View My Profile
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              size="large"
              startIcon={<Notifications />}
              onClick={() => document.getElementById('notices-section').scrollIntoView({ behavior: 'smooth' })}
              component={motion.button} 
              whileHover={{ scale: 1.05 }}
            >
              View Notices
            </Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card component={motion.div} 
              initial={{ opacity: 0, x: -40 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={2} color="primary">
                  Quick Stats
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Badge badgeContent={getUrgentNotices().length} color="error">
                        <Notifications color="warning" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Urgent Notices" 
                      secondary={`${getUrgentNotices().length} require attention`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Profile Status" 
                      secondary={student?.photo_path ? "Photo uploaded" : "Photo pending"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Academic Year" 
                      secondary={student?.ac_year}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Urgent Notices */}
          <Grid item xs={12} md={8}>
            <Card component={motion.div} 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Warning color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={700} color="error">
                    Urgent Notices
                  </Typography>
                </Box>
                
                {getUrgentNotices().length > 0 ? (
                  <List>
                    {getUrgentNotices().map((notice, index) => (
                      <ListItem 
                        key={notice._id}
                        button
                        onClick={() => handleNoticeClick(notice)}
                        sx={{ 
                          mb: 1, 
                          borderRadius: 1, 
                          bgcolor: 'grey.50',
                          '&:hover': { bgcolor: 'grey.100' }
                        }}
                      >
                        <ListItemIcon>
                          {getCategoryIcon(notice.category)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={notice.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {notice.content.substring(0, 100)}...
                              </Typography>
                              <Box display="flex" gap={1} mt={1}>
                                <Chip 
                                  label={notice.priority} 
                                  size="small" 
                                  color={getPriorityColor(notice.priority)}
                                />
                                <Chip 
                                  label={notice.category} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          }
                        />
                        <Box textAlign="right">
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notice.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="success">
                    No urgent notices at the moment. You're all caught up!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Notices Section */}
          <Grid item xs={12}>
            <Box id="notices-section">
              <Typography variant="h5" fontWeight={700} mb={3} color="primary">
                Recent Notices
              </Typography>
              
              {notices.length > 0 ? (
                <Grid container spacing={3}>
                  {getRecentNotices().map((notice, index) => (
                    <Grid item xs={12} md={6} lg={4} key={notice._id}>
                      <Card 
                        component={motion.div}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        sx={{ 
                          height: '100%',
                          cursor: 'pointer',
                          '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                            transition: 'all 0.3s ease'
                          }
                        }}
                        onClick={() => handleNoticeClick(notice)}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={2}>
                            <Box sx={{ mr: 1 }}>
                              {getCategoryIcon(notice.category)}
                            </Box>
                            <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                              {notice.title}
                            </Typography>
                            <Chip 
                              label={notice.priority} 
                              size="small" 
                              color={getPriorityColor(notice.priority)}
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" mb={2}>
                            {notice.content.substring(0, 120)}...
                          </Typography>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={notice.category} 
                              size="small" 
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notice.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No notices available at the moment. Check back later for updates!
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Notice Detail Dialog */}
      <Dialog 
        open={noticeDialog} 
        onClose={handleCloseNotice}
        maxWidth="md"
        fullWidth
      >
        {selectedNotice && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  {getCategoryIcon(selectedNotice.category)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {selectedNotice.title}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseNotice}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <Box display="flex" gap={1} mb={2}>
                  <Chip 
                    label={selectedNotice.priority} 
                    color={getPriorityColor(selectedNotice.priority)}
                  />
                  <Chip 
                    label={selectedNotice.category} 
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedNotice.content}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Posted by: {selectedNotice.createdBy}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(selectedNotice.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseNotice}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
} 