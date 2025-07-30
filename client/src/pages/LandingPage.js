import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Container, Accordion, AccordionSummary, AccordionDetails, Avatar, Link as MuiLink, TextField, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const features = [
  { title: 'Student Access', desc: 'Students can register and view their own profile securely.' },
  { title: 'Student Registration', desc: 'Students can register with their PRN number and password.' },
  { title: 'Photo Uploads', desc: 'Upload student photos securely for ID cards.' },
  { title: 'CSV Export', desc: 'Export all student data for printing or processing.' },
  { title: 'Secure & Scalable', desc: 'Modern authentication and cloud database.' },
];

const faqs = [
  { q: 'Who can use this app?', a: 'Students can register and login to view their profile. Admin access is available through API only.' },
  { q: 'How do students register?', a: 'Students can register with their PRN number and create a password.' },
  { q: 'Where are photos stored?', a: 'Photos are securely stored on the backend server.' },
  { q: 'Is my data safe?', a: 'Yes, all data is protected with modern security best practices.' },
  { q: 'How do I access admin features?', a: 'Admin access is restricted to API calls only for security purposes.' },
];

const techStack = [
  { name: 'React', color: '#61dafb' },
  { name: 'MUI', color: '#007fff' },
  { name: 'Framer Motion', color: '#e14eca' },
  { name: 'Node.js', color: '#8cc84b' },
  { name: 'MongoDB', color: '#47a248' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ bgcolor: '#1a1446', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box component={motion.div} initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        sx={{ py: 12, textAlign: 'center', bgcolor: 'primary.main', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Typography variant="h2" fontWeight={800} gutterBottom sx={{ letterSpacing: '-2px', fontSize: { xs: 36, md: 64 } }}>
          Student ID Management
        </Typography>
        <Typography variant="h5" mb={4} sx={{ maxWidth: 600, mx: 'auto', color: '#fff', opacity: 0.9 }}>
          Modern, secure, and animated platform for student ID data. Fast, paperless, and role-based for colleges.
        </Typography>
        <Button variant="contained" size="large" color="secondary" sx={{ fontWeight: 700, px: 5, py: 1.5, fontSize: 22, borderRadius: 8, boxShadow: '0 0 32px #ff4fd8' }} onClick={() => navigate('/login')}
          component={motion.button} whileHover={{ scale: 1.06, boxShadow: '0 0 48px #ff4fd8' }}>
          Get Started
        </Button>
        <Box sx={{ position: 'absolute', right: 40, top: 40, opacity: 0.2, fontSize: 120, pointerEvents: 'none' }}>
          <span role="img" aria-label="id-card">🪪</span>
        </Box>
      </Box>

      {/* About the Developers */}
      <Container sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Paper elevation={8} sx={{ p: 5, borderRadius: 5, bgcolor: 'rgba(34,24,74,0.95)', mb: 6, color: '#fff', boxShadow: '0 8px 32px #8f5cff88', border: '1.5px solid #8f5cff' }}
          component={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={2} color="secondary">About the Developers</Typography>
          <Grid container columns={12} spacing={4} justifyContent="center">
            <Grid gridColumn="span 6" textAlign="center">
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 36, color: '#fff' }}>R</Avatar>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>Rahil</Typography>
              <Typography color="#bdbaff">Full Stack Developer</Typography>
            </Grid>
            <Grid gridColumn="span 6" textAlign="center">
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'secondary.main', fontSize: 36, color: '#fff' }}>P</Avatar>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>Pranav</Typography>
              <Typography color="#bdbaff">Full Stack Developer</Typography>
            </Grid>
          </Grid>
          <Typography mt={4} textAlign="center" color="primary" fontWeight={600} sx={{ color: '#8f5cff' }}>
            This site is proudly made by Rahil & Pranav.
          </Typography>
        </Paper>
      </Container>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={600} textAlign="center" mb={4}>Features</Typography>
        <Grid container columns={12} spacing={4} justifyContent="center">
          {features.map((f, i) => (
            <Grid gridColumn="span 4" key={f.title}>
              <Card component={motion.div} whileHover={{ scale: 1.05, boxShadow: '0 8px 32px #1976d2' }} transition={{ type: 'spring', stiffness: 300 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{f.title}</Typography>
                  <Typography color="text.secondary">{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container>
          <Typography variant="h4" fontWeight={600} textAlign="center" mb={4}>How It Works</Typography>
          <Grid container columns={12} spacing={4} justifyContent="center">
            {['Register/Login', 'Manage Students', 'View Profile'].map((step, i) => (
              <Grid gridColumn="span 4" key={step}>
                <Box component={motion.div} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                  sx={{ p: 4, borderRadius: 3, boxShadow: 3, textAlign: 'center', bgcolor: '#f0f4ff' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>{i + 1}</Typography>
                  <Typography variant="h6" fontWeight={600}>{step}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Tech Stack */}
      <Container sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Paper elevation={8} sx={{ p: 5, borderRadius: 5, bgcolor: 'rgba(34,24,74,0.95)', color: '#fff', boxShadow: '0 8px 32px #8f5cff88', border: '1.5px solid #8f5cff' }}>
          <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>Powered By</Typography>
          <Grid container columns={12} spacing={2} justifyContent="center">
            {techStack.map((tech) => (
              <Grid gridColumn="span 2" key={tech.name}>
                <Box sx={{ p: 2, fontWeight: 700, fontSize: 20, color: tech.color, borderRadius: 2, bgcolor: 'white', boxShadow: 1, textAlign: 'center' }}>{tech.name}</Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Site Usage Section */}
      <Container sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Paper elevation={8} sx={{ p: 5, borderRadius: 5, bgcolor: 'rgba(34,24,74,0.95)', mb: 6, color: '#fff', boxShadow: '0 8px 32px #8f5cff88', border: '1.5px solid #8f5cff' }}
          component={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={2} color="primary">How to Use This Site</Typography>
          <Typography textAlign="center" color="#bdbaff" fontSize={18}>
            1. Students can register and login with their PRN number<br />
            2. Students can view their own profile only<br />
            3. Admin access is available through API only for security<br />
            4. Export all student data to CSV for ID card processing<br />
            5. Secure photo uploads and data management
          </Typography>
        </Paper>
      </Container>

      {/* FAQ */}
      <Container sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Typography variant="h4" fontWeight={600} textAlign="center" mb={4}>FAQ</Typography>
        {faqs.map((faq, i) => (
          <Paper key={faq.q} elevation={8} sx={{ mb: 2, bgcolor: 'rgba(34,24,74,0.95)', color: '#fff', boxShadow: '0 8px 32px #8f5cff88', border: '1.5px solid #8f5cff' }}>
            <Accordion component={motion.div} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} sx={{ bgcolor: 'transparent', color: '#fff', boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ff4fd8' }} />}>
                <Typography fontWeight={600} sx={{ color: '#fff' }}>{faq.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: '#bdbaff' }}>{faq.a}</Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        ))}
      </Container>

      {/* Contact Us Section */}
      <Container sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Paper elevation={8} sx={{ p: 5, borderRadius: 5, bgcolor: 'rgba(34,24,74,0.95)', color: '#fff', boxShadow: '0 8px 32px #8f5cff88', border: '1.5px solid #8f5cff' }}
          component={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={2} color="secondary">Contact Us</Typography>
          <Typography textAlign="center" color="#bdbaff" mb={3}>
            Have questions or feedback? Reach out to the developers below:
          </Typography>
          <Grid container columns={12} spacing={4} justifyContent="center">
            <Grid gridColumn="span 6" textAlign="center">
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>Rahil</Typography>
              <MuiLink href="mailto:rahil@example.com" color="primary">rahil@example.com</MuiLink>
            </Grid>
            <Grid gridColumn="span 6" textAlign="center">
              <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>Pranav</Typography>
              <MuiLink href="mailto:pranav@example.com" color="primary">pranav@example.com</MuiLink>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, textAlign: 'center' }}>
        <Typography>&copy; {new Date().getFullYear()} Student ID Management. All rights reserved.<br />Made by Rahil & Pranav.</Typography>
      </Box>
    </Box>
  );
} 