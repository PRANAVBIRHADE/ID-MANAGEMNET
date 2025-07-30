import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';

const dateTypes = [
  { value: 'exam', label: 'Exam' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'event', label: 'Event' },
  { value: 'deadline', label: 'Deadline' }
];

const ImportantDatesCalendar = ({ isAdmin }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: dayjs(),
    type: 'event'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/important-dates');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = async () => {
    try {
      await axios.post('/api/important-dates', {
        ...newEvent,
        date: newEvent.date.toISOString()
      });
      setOpenDialog(false);
      setNewEvent({
        title: '',
        description: '',
        date: dayjs(),
        type: 'event'
      });
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      dayjs(event.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, display: 'flex', gap: 3 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <DateCalendar 
            value={selectedDate}
            onChange={(newDate) => setSelectedDate(newDate)}
            sx={{ width: 320 }}
          />
        </Paper>
        
        <Paper elevation={3} sx={{ p: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Events for {selectedDate.format('MMMM D, YYYY')}
            </Typography>
            {isAdmin && (
              <Button 
                variant="contained" 
                onClick={() => setOpenDialog(true)}
              >
                Add Event
              </Button>
            )}
          </Box>
          
          {getEventsForDate(selectedDate).map((event) => (
            <Paper 
              key={event._id} 
              sx={{ p: 2, mb: 1, bgcolor: 'background.default' }}
            >
              <Typography variant="subtitle1" color="primary">
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.description}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Type: {event.type}
              </Typography>
            </Paper>
          ))}
        </Paper>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="Type"
            fullWidth
            value={newEvent.type}
            onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
          >
            {dateTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEvent}>Add</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ImportantDatesCalendar;
