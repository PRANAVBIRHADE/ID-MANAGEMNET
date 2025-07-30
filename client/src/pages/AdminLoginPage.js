import React, { useState } from 'react';
import { Box, Typography, Button, Container, TextField, Paper, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import api from '../utils/api';

export default function AdminLoginPage() {
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await api.post('/auth/admin/login', adminForm);
      setSuccess('Admin login successful! Token: ' + res.data.token.substring(0, 20) + '...');
      localStorage.setItem('token', res.data.token);
      
      // Navigate to admin dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard/operator');
      }, 1500); // Wait 1.5 seconds to show success message
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 12, zIndex: 1, position: 'relative' }}>
      <Box component={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3, bgcolor: 'rgba(34,24,74,0.95)', color: 'white', boxShadow: '0 8px 32px #8f5cff88' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SecurityIcon sx={{ fontSize: 64, color: '#ff4fd8', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} color="secondary" gutterBottom>
              Admin Login (API Testing)
            </Typography>
            <Typography variant="h6" color="#bdbaff" sx={{ mb: 3 }}>
              Test admin authentication via API
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(25,118,210,0.1)', color: '#90caf9' }}>
            <Typography variant="body1">
              This is for testing admin API access. In production, admin login should be handled through secure API calls only.
            </Typography>
          </Alert>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => navigate('/dashboard/operator')}
                sx={{ ml: 2, fontWeight: 700 }}
              >
                Go to Admin Dashboard
              </Button>
            </Alert>
          )}

          <Box component="form" onSubmit={handleAdminLogin}>
            <TextField
              fullWidth
              label="Username"
              value={adminForm.username}
              onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
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
              {loading ? 'Testing...' : 'Test Admin Login'}
            </Button>
          </Box>

          <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2 }}>
            <Typography variant="h6" color="secondary" gutterBottom>
              Default Credentials
            </Typography>
            <Typography variant="body2" color="#bdbaff">
              Username: admin<br />
              Password: admin123
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/login')}
              sx={{ fontWeight: 700, px: 4, py: 1.5 }}
            >
              Go to Student Login
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/')}
              sx={{ fontWeight: 700, px: 4, py: 1.5 }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 