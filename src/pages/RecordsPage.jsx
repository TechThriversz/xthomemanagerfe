import { useState, useEffect } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, Alert, IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getRecords, createRecord, deleteRecord } from '../services/api';

function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: '' });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await getRecords();
      setRecords(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch records');
    }
  };

  const handleAddRecord = async () => {
    try {
      if (!form.name || !form.type) {
        setError('Name and Type are required');
        return;
      }
      await createRecord(form);
      setForm({ name: '', type: '' });
      setOpen(false);
      fetchRecords();
      setError('');
    } catch (err) {
      setError('Failed to add record');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecord(id);
      fetchRecords();
      setError('');
    } catch (err) {
      setError('Failed to delete record');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Records</Typography>
      {error && <Alert severity="error">{error}</Alert>}
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
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Record</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Select
            label="Type"
            fullWidth
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <MenuItem value="Milk">Milk</MenuItem>
            <MenuItem value="Bill">Bill</MenuItem>
            <MenuItem value="Rent">Rent</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddRecord} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default RecordsPage;