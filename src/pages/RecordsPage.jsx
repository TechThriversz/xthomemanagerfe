import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem } from '@mui/material';
import { Delete, Add, Visibility, EditDocument } from '@mui/icons-material';
import { getRecords, createRecord, deleteRecord } from '../services/api';
import '../App.css';

function RecordsPage({ user }) {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ name: '', type: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setError('Please log in to view this page');
      navigate('/login');
      return;
    }
    fetchRecords();
  }, [user, navigate]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await getRecords();
      console.log('Fetched records:', response.data);
      setRecords(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch records: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRecord({ ...form, userId: user.id });
      setForm({ name: '', type: '' });
      setSuccess('Record created successfully');
      setOpenDialog(false);
      fetchRecords();
    } catch (err) {
      setError('Failed to create record: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteRecord(id);
      setSuccess('Record deleted successfully');
      fetchRecords();
    } catch (err) {
      setError('Failed to delete record: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm({ name: '', type: '' });
  };
  
  // Placeholder image for the empty state.
  const emptyStateImage = "https://img.freepik.com/premium-photo/spring-flowers-hands-beautiful-bouquet-female-hands_217529-507.jpg";
  const handleViewDemoData = () => {
      // Logic for demo data button
      setSuccess('Simulating adding demo data...');
      setTimeout(() => {
          setSuccess('');
          fetchRecords();
      }, 2000);
  };

  return (
    <Box className="record-container" sx={{ p: 3 }}>
   

      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FEE2E2', color: '#EF4444' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#ECFDF5', color: '#10B981' }} onClose={() => setSuccess('')}>{success}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1A2A44' }} />}

      {records.length === 0 ? (
        <Box
        className="empty-state" 
        >
           <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
          Records
        </Typography>
          <Typography variant="h6" sx={{ mt: 2, color: '#1A2A44', fontWeight: 'bold' }}>
            No Records Found
          </Typography>
          <Typography sx={{ mt: 1, color: '#666', mb: 4 }}>
            It looks like you haven't added any records yet. Let's get started by creating your first record to track your home expenses.
          </Typography>
          <Box
            component="img"
            src={emptyStateImage}
            alt="No records illustration"
            sx={{ width: 400, height: 'auto', mb: 4, borderRadius: '8px' }}
          />
          <Typography variant="body1" sx={{ color: '#888', mb: 2 }}>
            What would you like to do next?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
             className="create-record-button"
              variant="contained"
              onClick={handleOpenDialog}
               startIcon={<EditDocument />}
            >
              Create New Record
            </Button>
            <Button
              className="view-demo-button"
              variant="outlined"
              onClick={handleViewDemoData}
              startIcon={<Visibility />}
            >
              View Demo Data
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            p: 4,
            borderRadius: '16px',
            boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
            bgcolor: '#FFFFFF',
             width: '1170px',
             m: "auto",
             mt: 2,
          }}
        >
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
          Records
        </Typography>
        <Button variant="contained" onClick={handleOpenDialog}
            sx={{
            bgcolor: '#1A2A44',
            letterSpacing:"2px",
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '8px',
            textTransform: 'uppercase',
            px: 6,
            py: 1.5,
            '&:hover': { bgcolor: '#2E4057' }
          }}
          disabled={loading}
        >
          Create Record
        </Button>
      </Box>
      {/* inner Buttons */}
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC', '& > th': { fontWeight: 'bold', color: '#1A2A44', border: 'none' } }}>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                {user.role === 'Admin' && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FFFFFF' }, '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, '& > td': { borderBottom: 'none' } }}>
                  <TableCell>
                    <Link
                      to={
                        record.type === 'Milk' ? `/milk/${record.id}/${record.name.replace(/ /g, '-')}` :
                        record.type === 'Rent' ? `/rent/${record.id}/${record.name.replace(/ /g, '-')}` :
                        record.type === 'Bill' ? `/bills/${record.id}/${record.name.replace(/ /g, '-')}` : `/record/${record.id}`
                      }
                      style={{ textDecoration: 'none', color: '#1A2A44', fontWeight: 'medium' }}
                    >
                      {record.name}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ color: '#666' }}>{record.type}</TableCell>
                  {user.role === 'Admin' && (
                    <TableCell align="right">
                      <IconButton onClick={() => handleDelete(record.id)} disabled={loading}>
                        <Delete sx={{ color: '#EF4444' }} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: '16px', p: 2 } }}>
        <DialogTitle sx={{ color: '#1A2A44', fontWeight: 'bold' }}>Create New Record</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Record Name"
              fullWidth
              margin="normal"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              sx={{ '& .MuiInputLabel-root': { color: '#666' }, '& .MuiInputBase-input': { color: '#1A2A44' }, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <Select
              label="Type"
              fullWidth
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
              sx={{ '& .MuiInputLabel-root': { color: '#666' }, '& .MuiSelect-select': { color: '#1A2A44' }, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            >
              <MenuItem value="">Select Type</MenuItem>
              <MenuItem value="Milk">Milk</MenuItem>
              <MenuItem value="Bill">Bill</MenuItem>
              <MenuItem value="Rent">Rent</MenuItem>
            </Select>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{ color: '#666', textTransform: 'none' }}>Cancel</Button>
              <Button type="submit" variant="contained"
                sx={{
                  bgcolor: '#1A2A44',
                  color: '#FFD700',
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#2E4057' }
                }}
                disabled={loading}
              >
                Create
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default RecordsPage;