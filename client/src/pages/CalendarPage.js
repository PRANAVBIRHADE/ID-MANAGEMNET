import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ImportantDatesCalendar from '../components/ImportantDatesCalendar';

const CalendarPage = () => {
  const isAdmin = localStorage.getItem('userRole') === 'operator';

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Academic Calendar
        </Typography>
        <ImportantDatesCalendar isAdmin={isAdmin} />
      </Box>
    </Container>
  );
};

export default CalendarPage;
