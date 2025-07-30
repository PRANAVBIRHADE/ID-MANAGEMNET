import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  DialogActions, 
  Tooltip, 
  CircularProgress, 
  Alert, 
  Avatar, 
  Chip,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Collapse,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  CloudUpload, 
  Download, 
  PhotoCamera, 
  AdminPanelSettings,
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
  Notifications,
  AddCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function OperatorDashboard() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [photoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [adminOverrideOpen, setAdminOverrideOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [form, setForm] = useState({ name: '', branch: '', dob: '', phone: '', ac_year: '', address: '', prn: '', photo: '' });
  const [adminForm, setAdminForm] = useState({ phone: '', address: '', reason: '' });
  const [editId, setEditId] = useState(null);

  // Notices management states
  const [notices, setNotices] = useState([]);
  const [noticeDialog, setNoticeDialog] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    targetAudience: 'all',
    expiresAt: ''
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    branch: '',
    ac_year: '',
    hasPhoto: '',
    updateStatus: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/students');
        // Handle both old and new API response formats
        const studentsData = res.data.students || res.data;
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (err) {
        setError('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Fetch notices
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/notices');
        setNotices(res.data);
      } catch (err) {
        console.error('Failed to fetch notices:', err);
      }
    };
    fetchNotices();
  }, []);

  // Enhanced fetch with server-side filtering
  const fetchStudentsWithFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.ac_year) params.append('ac_year', filters.ac_year);
      if (filters.hasPhoto) params.append('hasPhoto', filters.hasPhoto);
      if (filters.updateStatus) params.append('updateStatus', filters.updateStatus);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const res = await api.get(`/students?${params.toString()}`);
      const studentsData = res.data.students || res.data;
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Use server-side filtering for better performance
  useEffect(() => {
    if (students.length > 0) {
      fetchStudentsWithFilters();
    }
  }, [debouncedSearchTerm, filters, sortBy, sortOrder]);

  // Filter and search logic (client-side fallback)
  useEffect(() => {
    let filtered = [...students];

    // Search term filtering (client-side fallback)
    if (searchTerm && !filters.branch && !filters.ac_year && !filters.hasPhoto && !filters.updateStatus) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.name?.toLowerCase().includes(term) ||
        student.prn?.toLowerCase().includes(term) ||
        student.phone?.toLowerCase().includes(term) ||
        student.address?.toLowerCase().includes(term) ||
        student.branch?.toLowerCase().includes(term)
      );
    }

    // Client-side filtering for complex filters
    if (filters.updateStatus === 'restricted') {
      filtered = filtered.filter(student => !canUpdateProfile(student));
    } else if (filters.updateStatus === 'can_update') {
      filtered = filtered.filter(student => canUpdateProfile(student));
    }

    // Client-side sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'dob' || sortBy === 'lastProfileUpdate') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, filters, sortBy, sortOrder]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      branch: '',
      ac_year: '',
      hasPhoto: '',
      updateStatus: ''
    });
    setSortBy('name');
    setSortOrder('asc');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get unique values for filter options
  const getUniqueBranches = () => [...new Set(students.map(s => s.branch).filter(Boolean))];
  const getUniqueYears = () => [...new Set(students.map(s => s.ac_year).filter(Boolean))];

  const handleOpen = (student) => {
    setForm(student || { name: '', branch: '', dob: '', phone: '', ac_year: '', address: '', prn: '', photo: '' });
    setEditId(student ? student._id : null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handlePhotoUploadOpen = (student) => {
    setSelectedStudent(student);
    setPhotoUploadOpen(true);
    setSelectedFile(null);
    setPhotoPreview('');
  };

  const handlePhotoUploadClose = () => {
    setPhotoUploadOpen(false);
    setSelectedStudent(null);
    setSelectedFile(null);
    setPhotoPreview('');
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile || !selectedStudent) return;

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('prn', selectedStudent.prn);

    try {
      await api.put(`/students/${selectedStudent._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Refresh students list
      const res = await api.get('/students');
      setStudents(res.data);
      
      handlePhotoUploadClose();
    } catch (err) {
      setError('Failed to upload photo');
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/students/${editId}`, form);
      } else {
        await api.post('/students', form);
      }
      setOpen(false);
      // Refresh students after save
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      setError('Failed to save student');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        setOpen(false);
        // Refresh students after delete
        const res = await api.get('/students');
        setStudents(res.data);
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export CSV');
    }
  };

  const handleAdminOverrideOpen = (student) => {
    setSelectedStudent(student);
    setAdminForm({
      phone: student.phone || '',
      address: student.address || '',
      reason: ''
    });
    setAdminOverrideOpen(true);
  };

  const handleAdminOverrideClose = () => {
    setAdminOverrideOpen(false);
    setSelectedStudent(null);
    setAdminForm({ phone: '', address: '', reason: '' });
  };

  const handleAdminFormChange = (e) => {
    setAdminForm({
      ...adminForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAdminOverrideSave = async () => {
    try {
      await api.put(`/students/${selectedStudent._id}/admin-update`, adminForm);
      
      // Refresh students list
      const res = await api.get('/students');
      setStudents(res.data);
      
      handleAdminOverrideClose();
      setError('');
    } catch (err) {
      setError('Failed to update student profile');
    }
  };

  // Notices management functions
  const handleNoticeOpen = (notice = null) => {
    if (notice) {
      setNoticeForm({
        title: notice.title,
        content: notice.content,
        category: notice.category,
        priority: notice.priority,
        targetAudience: notice.targetAudience,
        expiresAt: notice.expiresAt ? notice.expiresAt.split('T')[0] : ''
      });
      setSelectedNotice(notice);
    } else {
      setNoticeForm({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        targetAudience: 'all',
        expiresAt: ''
      });
      setSelectedNotice(null);
    }
    setNoticeDialog(true);
  };

  const handleNoticeClose = () => {
    setNoticeDialog(false);
    setSelectedNotice(null);
    setNoticeForm({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      targetAudience: 'all',
      expiresAt: ''
    });
  };

  const handleNoticeFormChange = (e) => {
    setNoticeForm({
      ...noticeForm,
      [e.target.name]: e.target.value
    });
  };

  const handleNoticeSave = async () => {
    try {
      if (selectedNotice) {
        await api.put(`/notices/${selectedNotice._id}`, noticeForm);
      } else {
        await api.post('/notices', noticeForm);
      }
      
      // Refresh notices list
      const res = await api.get('/notices');
      setNotices(res.data);
      
      handleNoticeClose();
      setError('');
    } catch (err) {
      setError('Failed to save notice');
    }
  };

  const handleNoticeDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await api.delete(`/notices/${id}`);
        
        // Refresh notices list
        const res = await api.get('/notices');
        setNotices(res.data);
        
        setError('');
      } catch (err) {
        setError('Failed to delete notice');
      }
    }
  };

  const handleNoticeToggle = async (id) => {
    try {
      await api.patch(`/notices/${id}/toggle`);
      
      // Refresh notices list
      const res = await api.get('/notices');
      setNotices(res.data);
      
      setError('');
    } catch (err) {
      setError('Failed to toggle notice status');
    }
  };

  const canUpdateProfile = (student) => {
    if (!student?.lastProfileUpdate) return true;
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return new Date(student.lastProfileUpdate) <= threeMonthsAgo;
  };

  return (
    <Container sx={{ pt: 12, zIndex: 1, position: 'relative' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight={700} color="primary">Admin Dashboard</Typography>
        <Box>
          <Button variant="contained" startIcon={<Add />} sx={{ mr: 2 }} onClick={() => handleOpen()}>Add Student</Button>
          <Button variant="outlined" startIcon={<AddCircle />} color="secondary" sx={{ mr: 2 }} onClick={() => handleNoticeOpen()}>Add Notice</Button>
          <Button variant="outlined" startIcon={<Download />} color="secondary" onClick={handleExportCSV}>Export CSV</Button>
        </Box>
      </Box>

      {/* Notices Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
            Notices Management
          </Typography>
          <Chip label={`${notices.length} notices`} color="primary" size="small" />
        </Box>
        
        {notices.length > 0 ? (
          <Grid container spacing={2}>
            {notices.slice(0, 3).map((notice) => (
              <Grid item xs={12} md={4} key={notice._id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="h6" fontWeight={600} noWrap>
                        {notice.title}
                      </Typography>
                      <Chip 
                        label={notice.priority} 
                        size="small" 
                        color={notice.priority === 'urgent' ? 'error' : notice.priority === 'high' ? 'warning' : 'info'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {notice.content}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip label={notice.category} size="small" variant="outlined" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} mt={1}>
                      <Button size="small" onClick={() => handleNoticeOpen(notice)}>Edit</Button>
                      <Button size="small" color="secondary" onClick={() => handleNoticeToggle(notice._id)}>
                        {notice.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="small" color="error" onClick={() => handleNoticeDelete(notice._id)}>Delete</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">No notices created yet. Click "Add Notice" to create your first notice.</Alert>
        )}
      </Paper>

      {/* Search and Filter Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={600}>Search & Filter</Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={clearFilters}
              size="small"
              disabled={!searchTerm && Object.values(filters).every(v => !v)}
            >
              Clear All
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search by name, PRN, phone, address, or branch..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Filters */}
        <Collapse in={showFilters}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Branch</InputLabel>
                <Select
                  value={filters.branch}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                  label="Branch"
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {getUniqueBranches().map(branch => (
                    <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={filters.ac_year}
                  onChange={(e) => handleFilterChange('ac_year', e.target.value)}
                  label="Academic Year"
                >
                  <MenuItem value="">All Years</MenuItem>
                  {getUniqueYears().map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Photo Status</InputLabel>
                <Select
                  value={filters.hasPhoto}
                  onChange={(e) => handleFilterChange('hasPhoto', e.target.value)}
                  label="Photo Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="yes">Has Photo</MenuItem>
                  <MenuItem value="no">No Photo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Update Status</InputLabel>
                <Select
                  value={filters.updateStatus}
                  onChange={(e) => handleFilterChange('updateStatus', e.target.value)}
                  label="Update Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="can_update">Can Update</MenuItem>
                  <MenuItem value="restricted">Update Restricted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Collapse>

        {/* Results Summary */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredStudents.length} of {students.length} students
          </Typography>
          <Box display="flex" gap={1}>
            {searchTerm && (
              <Chip label={`Search: "${searchTerm}"`} size="small" color="primary" />
            )}
            {Object.entries(filters).map(([key, value]) => 
              value && (
                <Chip 
                  key={key} 
                  label={`${key}: ${value}`} 
                  size="small" 
                  color="secondary" 
                />
              )
            )}
          </Box>
        </Box>

        {/* Quick Stats */}
        {filteredStudents.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`${filteredStudents.filter(s => s.photo_path).length} with photos`} 
              size="small" 
              color="success" 
              variant="outlined"
            />
            <Chip 
              label={`${filteredStudents.filter(s => !canUpdateProfile(s)).length} update restricted`} 
              size="small" 
              color="warning" 
              variant="outlined"
            />
            <Chip 
              label={`${getUniqueBranches().length} branches`} 
              size="small" 
              color="info" 
              variant="outlined"
            />
            <Chip 
              label={`${getUniqueYears().length} academic years`} 
              size="small" 
              color="secondary" 
              variant="outlined"
            />
          </Box>
        )}
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box component={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Table sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 4 }}>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell 
                  onClick={() => handleSort('name')}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    Name
                    {sortBy === 'name' && (
                      <Typography variant="caption" color="primary">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('branch')}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    Branch
                    {sortBy === 'branch' && (
                      <Typography variant="caption" color="primary">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('dob')}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    DOB
                    {sortBy === 'dob' && (
                      <Typography variant="caption" color="primary">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>Phone</TableCell>
                <TableCell 
                  onClick={() => handleSort('ac_year')}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    Year
                    {sortBy === 'ac_year' && (
                      <Typography variant="caption" color="primary">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>Address</TableCell>
                <TableCell 
                  onClick={() => handleSort('prn')}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    PRN
                    {sortBy === 'prn' && (
                      <Typography variant="caption" color="primary">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map(s => (
                <TableRow key={s._id}>
                  <TableCell>
                    {s.photo_path ? (
                      <Avatar 
                        src={`http://localhost:5000${s.photo_path}`} 
                        sx={{ width: 40, height: 40 }}
                        alt={s.name}
                      />
                    ) : (
                      <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
                        <PhotoCamera />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.branch}</TableCell>
                  <TableCell>{s.dob ? s.dob.slice(0,10) : ''}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>{s.ac_year}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.address}
                  </TableCell>
                  <TableCell>{s.prn}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {!canUpdateProfile(s) && (
                        <Chip label="Restricted" size="small" color="warning" />
                      )}
                      {s.profileUpdateCount > 0 && (
                        <Chip label={`${s.profileUpdateCount} updates`} size="small" color="info" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleOpen(s)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton color="secondary" onClick={() => handleDelete(s._id)}><Delete /></IconButton></Tooltip>
                    <Tooltip title="Upload Photo"><IconButton color="info" onClick={() => handlePhotoUploadOpen(s)}><CloudUpload /></IconButton></Tooltip>
                    {!canUpdateProfile(s) && (
                      <Tooltip title="Admin Override (3-month restriction)">
                        <IconButton 
                          color="warning" 
                          onClick={() => handleAdminOverrideOpen(s)}
                        >
                          <AdminPanelSettings />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredStudents.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No students found matching your criteria
              </Typography>
              <Button onClick={clearFilters} sx={{ mt: 2 }}>
                Clear all filters
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Add/Edit Student Dialog */}
      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: 4, bgcolor: 'background.paper' } }}>
        <DialogTitle>{editId ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="Branch" name="branch" value={form.branch} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="DOB" name="dob" value={form.dob} onChange={handleChange} fullWidth margin="dense" type="date" InputLabelProps={{ shrink: true }} />
          <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="Academic Year" name="ac_year" value={form.ac_year} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="PRN" name="prn" value={form.prn} onChange={handleChange} fullWidth margin="dense" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={photoUploadOpen} onClose={handlePhotoUploadClose} PaperProps={{ sx: { borderRadius: 4, bgcolor: 'background.paper' } }}>
        <DialogTitle>Upload Photo for {selectedStudent?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="photo-upload">
              <Button variant="contained" component="span" startIcon={<CloudUpload />}>
                Choose Photo
              </Button>
            </label>
          </Box>
          
          {photoPreview && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Preview:</Typography>
              <Avatar 
                src={photoPreview} 
                sx={{ width: 120, height: 120, mx: 'auto' }}
                alt="Preview"
              />
            </Box>
          )}

          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`Selected: ${selectedFile.name}`} 
                color="primary" 
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePhotoUploadClose}>Cancel</Button>
          <Button 
            onClick={handlePhotoUpload} 
            variant="contained" 
            disabled={!selectedFile}
            startIcon={<CloudUpload />}
          >
            Upload Photo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Override Dialog */}
      <Dialog open={adminOverrideOpen} onClose={handleAdminOverrideClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AdminPanelSettings color="warning" />
            Admin Override - Update Student Profile
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Override 3-month restriction for: <strong>{selectedStudent?.name}</strong>
          </Typography>
          
          <TextField
            label="Phone Number"
            name="phone"
            value={adminForm.phone}
            onChange={handleAdminFormChange}
            fullWidth
            margin="dense"
          />
          
          <TextField
            label="Address"
            name="address"
            value={adminForm.address}
            onChange={handleAdminFormChange}
            fullWidth
            margin="dense"
            multiline
            rows={3}
          />
          
          <TextField
            label="Reason for Override"
            name="reason"
            value={adminForm.reason}
            onChange={handleAdminFormChange}
            fullWidth
            margin="dense"
            multiline
            rows={2}
            placeholder="Please provide a reason for bypassing the 3-month restriction..."
            required
          />
          
          {selectedStudent && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Last update: {selectedStudent.lastProfileUpdate ? 
                  new Date(selectedStudent.lastProfileUpdate).toLocaleDateString() : 'Never'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update count: {selectedStudent.profileUpdateCount || 0}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAdminOverrideClose}>Cancel</Button>
          <Button 
            onClick={handleAdminOverrideSave} 
            variant="contained" 
            color="warning"
            disabled={!adminForm.reason.trim()}
          >
            Override & Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notice Dialog */}
      <Dialog open={noticeDialog} onClose={handleNoticeClose} PaperProps={{ sx: { borderRadius: 4, bgcolor: 'background.paper' } }}>
        <DialogTitle>{selectedNotice ? 'Edit Notice' : 'Add New Notice'}</DialogTitle>
        <DialogContent>
          <TextField label="Title" name="title" value={noticeForm.title} onChange={handleNoticeFormChange} fullWidth margin="dense" />
          <TextField label="Content" name="content" value={noticeForm.content} onChange={handleNoticeFormChange} fullWidth margin="dense" multiline rows={4} />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select name="category" value={noticeForm.category} onChange={handleNoticeFormChange} label="Category">
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="event">Event</MenuItem>
              <MenuItem value="important">Important</MenuItem>
              <MenuItem value="announcement">Announcement</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select name="priority" value={noticeForm.priority} onChange={handleNoticeFormChange} label="Priority">
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Target Audience</InputLabel>
            <Select name="targetAudience" value={noticeForm.targetAudience} onChange={handleNoticeFormChange} label="Target Audience">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="students">Students Only</MenuItem>
              <MenuItem value="operators">Operators Only</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Expires At (Optional)"
            name="expiresAt"
            value={noticeForm.expiresAt}
            onChange={handleNoticeFormChange}
            fullWidth
            margin="dense"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNoticeClose}>Cancel</Button>
          <Button onClick={handleNoticeSave} variant="contained">Save Notice</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 