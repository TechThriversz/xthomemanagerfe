import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem } from '@mui/material';
import { Delete } from '@mui/icons-material';
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

  return (
    <Box className="record-container">
      <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222' }}>
        Records
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#222222' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#1a2a44', color: '#FFF' }} onClose={() => setSuccess('')}>{success}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1a2a44' }} />}
      {user.role === 'Admin' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" onClick={handleOpenDialog} sx={{ bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} disabled={loading}>
            Create Record
          </Button>
        </Box>
      )}
      {records.length === 0 ? (
        <Typography sx={{ mt: 2, textAlign: 'center', color: '#222222' }}>No data</Typography>
      ) : (
        <Box className="table-container">
          <Table sx={{ border: '1px solid #1a2a44' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a2a44' }}>
                <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Name</TableCell>
                <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Type</TableCell>
                {user.role === 'Admin' && <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell sx={{ border: '1px solid #1a2a44' }}>
                    <Link
                      to={
                        record.type === 'Milk' ? `/milk/${record.id}/${record.name.replace(/ /g, '-')}` :
                        record.type === 'Rent' ? `/rent/${record.id}/${record.name.replace(/ /g, '-')}` :
                        record.type === 'Bill' ? `/bills/${record.id}/${record.name.replace(/ /g, '-')}` : `/record/${record.id}`
                      }
                      style={{ textDecoration: 'none', color: '#1a2a44' }}
                    >
                      {record.name}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{record.type}</TableCell>
                  {user.role === 'Admin' && (
                    <TableCell sx={{ border: '1px solid #1a2a44' }}>
                      <IconButton onClick={() => handleDelete(record.id)} disabled={loading}>
                        <Delete sx={{ color: '#1a2a44' }} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ color: '#222222' }}>Create New Record</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Record Name"
              fullWidth
              margin="normal"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
            />
            <Select
              label="Type"
              fullWidth
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
              sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiSelect-select': { color: '#1a2a44' } }}
            >
              <MenuItem value="">Select Type</MenuItem>
              <MenuItem value="Milk">Milk</MenuItem>
              <MenuItem value="Bill">Bill</MenuItem>
              <MenuItem value="Rent">Rent</MenuItem>
            </Select>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{ color: '#222222' }}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} disabled={loading}>
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