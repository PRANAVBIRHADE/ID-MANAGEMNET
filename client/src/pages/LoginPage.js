import React, { useState } from 'react';
import { Box, Typography, Button, Container, TextField, Paper, Tabs, Tab, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function LoginPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Student login form
  const [studentLoginForm, setStudentLoginForm] = useState({ username: '', password: '' });
  
  // Student registration form
  const [studentRegForm, setStudentRegForm] = useState({
    name: '', branch: '', dob: '', phone: '', ac_year: '', address: '', prn: '', password: ''
  });
  
  const navigate = useNavigate();

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/student/login', studentLoginForm);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.post('/auth/register', studentRegForm);
      setSuccess('Registration successful! You can now login.');
      setStudentRegForm({ name: '', branch: '', dob: '', phone: '', ac_year: '', address: '', prn: '', password: '' });
      setActiveTab(0); // Switch to login tab
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 12, zIndex: 1, position: 'relative' }}>
      <Box component={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3, bgcolor: 'rgba(34,24,74,0.95)', color: 'white', boxShadow: '0 8px 32px #8f5cff88' }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={3} color="secondary">
            Student ID Management
          </Typography>
          
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Student Login" sx={{ color: 'white' }} />
            <Tab label="Student Registration" sx={{ color: 'white' }} />
          </Tabs>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Student Login Form */}
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleStudentLogin}>
              <TextField
                fullWidth
                label="PRN Number"
                value={studentLoginForm.username}
                onChange={(e) => setStudentLoginForm({ ...studentLoginForm, username: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={studentLoginForm.password}
                onChange={(e) => setStudentLoginForm({ ...studentLoginForm, password: e.target.value })}
                sx={{ mb: 3 }}
                required
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="secondary"
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Student Login'}
              </Button>
            </Box>
          )}

          {/* Student Registration Form */}
          {activeTab === 1 && (
            <Box component="form" onSubmit={handleStudentRegistration}>
              <TextField
                fullWidth
                label="Full Name"
                value={studentRegForm.name}
                onChange={(e) => setStudentRegForm({ ...studentRegForm, name: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Branch"
                value={studentRegForm.branch}
                onChange={(e) => setStudentRegForm({ ...studentRegForm, branch: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={studentRegForm.dob}
                onChange={(e) => setStudentRegForm({ ...studentRegForm, dob: e.target.value })}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={studentRegForm.phone}
                onChange={(e) => setStudentRegForm({ ...studentRegForm, phone: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Academic Year"
                value={studentRegForm.ac_year}
                onChange={(e) => setStudentRegForm({ ...studentRegForm, ac_year: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={studentRegForm.address}
                onChange={(e) => setStudentRegForm({ ...studentRegForm, address: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="PRN Number"
                value={studentRegForm.prn}
                onChange={(e) => setStudentRegForm({ ...studentRegForm, prn: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={studentRegForm.password}
                onChange={(e) => setStudentRegForm({ ...studentRegForm, password: e.target.value })}
                sx={{ mb: 3 }}
                required
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="secondary"
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 