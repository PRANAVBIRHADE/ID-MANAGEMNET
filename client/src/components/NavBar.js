import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Badge } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Person, Notifications, Analytics } from '@mui/icons-material';
import NotificationBell from './NotificationBell';

const navLinks = [
  { label: 'Home', to: '/' },
];

export default function NavBar({ onLogout, isLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user role from localStorage token (simplified approach)
  const getCurrentRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // This is a simplified approach - in production you'd decode the JWT properly
      // For now, we'll check the current path to determine role
      if (location.pathname.includes('/dashboard/operator')) return 'operator';
      if (location.pathname.includes('/dashboard/student')) return 'student';
      return null;
    } catch (error) {
      return null;
    }
  };

  const currentRole = getCurrentRole();
  
  return (
    <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'rgba(34,24,74,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 2px 24px #8f5cff44', zIndex: 10 }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1, letterSpacing: 2, color: 'white', cursor: 'pointer' }} onClick={() => navigate('/')}>STUDENT ID</Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          {navLinks.map(link => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              color="inherit"
              sx={{
                fontWeight: 700,
                color: location.pathname === link.to ? 'secondary.main' : 'white',
                borderBottom: location.pathname === link.to ? '2px solid #ff4fd8' : 'none',
                borderRadius: 0,
                transition: '0.2s',
              }}
            >
              {link.label}
            </Button>
          ))}
          
          {isLoggedIn && currentRole === 'operator' && (
            <>
              <Button
                component={Link}
                to="/dashboard/operator"
                color="inherit"
                sx={{
                  fontWeight: 700,
                  color: location.pathname === '/dashboard/operator' ? 'secondary.main' : 'white',
                  borderBottom: location.pathname === '/dashboard/operator' ? '2px solid #ff4fd8' : 'none',
                  borderRadius: 0,
                  transition: '0.2s',
                }}
              >
                Admin Dashboard
              </Button>
              <Button
                component={Link}
                to="/analytics"
                color="inherit"
                startIcon={<Analytics />}
                sx={{
                  fontWeight: 700,
                  color: location.pathname === '/analytics' ? 'secondary.main' : 'white',
                  borderBottom: location.pathname === '/analytics' ? '2px solid #ff4fd8' : 'none',
                  borderRadius: 0,
                  transition: '0.2s',
                }}
              >
                Analytics
              </Button>
            </>
          )}
          
          {isLoggedIn && currentRole === 'student' && (
            <>
              <Button
                component={Link}
                to="/dashboard/student"
                color="inherit"
                startIcon={<Person />}
                sx={{
                  fontWeight: 700,
                  color: location.pathname === '/dashboard/student' ? 'secondary.main' : 'white',
                  borderBottom: location.pathname === '/dashboard/student' ? '2px solid #ff4fd8' : 'none',
                  borderRadius: 0,
                  transition: '0.2s',
                }}
              >
                My Profile
              </Button>
              <NotificationBell />
              <Button
                color="inherit"
                startIcon={
                  <Badge badgeContent={0} color="error">
                    <Notifications />
                  </Badge>
                }
                onClick={() => {
                  // Scroll to notices section if on home page, otherwise navigate to home
                  if (location.pathname === '/') {
                    document.getElementById('notices-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/');
                  }
                }}
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  borderRadius: 0,
                  transition: '0.2s',
                }}
              >
                Notices
              </Button>
            </>
          )}
          
          {isLoggedIn && (
            <Button
              color="secondary"
              variant="outlined"
              sx={{ ml: 2, fontWeight: 700, borderRadius: 3, borderColor: '#ff4fd8', color: '#ff4fd8' }}
              onClick={onLogout}
              component={motion.button}
              whileHover={{ scale: 1.08, boxShadow: '0 0 16px #ff4fd8' }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
} 