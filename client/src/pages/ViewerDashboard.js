import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert } from '@mui/material';
import { Download } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function ViewerDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/students');
        setStudents(res.data);
      } catch (err) {
        setError('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <Container sx={{ pt: 12, zIndex: 1, position: 'relative' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight={700} color="primary">Viewer Dashboard</Typography>
        <Button variant="outlined" startIcon={<Download />} color="secondary">Export CSV</Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box component={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Table sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 4 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>DOB</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>PRN</TableCell>
                <TableCell>Photo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(s => (
                <TableRow key={s._id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.branch}</TableCell>
                  <TableCell>{s.dob ? s.dob.slice(0,10) : ''}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>{s.ac_year}</TableCell>
                  <TableCell>{s.address}</TableCell>
                  <TableCell>{s.prn}</TableCell>
                  <TableCell>{s.photo_path ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Container>
  );
} 