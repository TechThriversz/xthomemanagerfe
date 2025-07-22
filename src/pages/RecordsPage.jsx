import { useState, useEffect } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, Alert, IconButton, Box
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getRecords, createRecord, deleteRecord } from '../services/api';

function RecordsPage({ user }) {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', userId: getUserIdFromToken() || user?.id || '', allowViewerAccess: false });

  // Decode JWT token to get user ID
  function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('RecordsPage: No token found in localStorage');
      return '';
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('RecordsPage: Decoded JWT payload:', payload);
      return payload.id || '';
    } catch (err) {
      console.error('RecordsPage: Failed to decode token:', err.message);
      return '';
    }
  }

  useEffect(() => {
    console.log('RecordsPage rendered, user:', user, 'token userId:', getUserIdFromToken());
    if (!user?.id && !getUserIdFromToken()) {
      setError('User not authenticated. Please log in again.');
    }
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    try {
      const res = await getRecords();
      setRecords(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch records: ' + (err.response?.data || err.message));
    }
  };

  const handleAddRecord = async () => {
    try {
      if (!form.name || !form.type) {
        setError('Name and Type are required');
        return;
      }
      if (!form.userId) {
        setError('User ID is missing. Please log in again.');
        return;
      }
      console.log('RecordsPage: Creating record with payload:', form);
      await createRecord(form);
      setForm({ name: '', type: '', userId: getUserIdFromToken() || user?.id || '', allowViewerAccess: false });
      setOpen(false);
      fetchRecords();
      setError('');
    } catch (err) {
      setError('Failed to add record: ' + (err.response?.data || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecord(id);
      fetchRecords();
      setError('');
    } catch (err) {
      setError('Failed to delete record: ' + (err.response?.data || err.message));
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">Records</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Add Record
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.name}</TableCell>
              <TableCell>{record.type}</TableCell>
              <TableCell>
                <IconButton onClick={() => alert('Edit functionality TBD')}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(record.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Record</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Select
            label="Type"
            fullWidth
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            required
          >
            <MenuItem value="Milk">Milk</MenuItem>
            <MenuItem value="Bill">Bill</MenuItem>
            <MenuItem value="Rent">Rent</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleAddRecord} variant="contained" color="primary">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RecordsPage;