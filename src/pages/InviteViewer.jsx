import { useState, useEffect } from 'react';
import { Typography, TextField, Button, Select, MenuItem, Alert, Box } from '@mui/material'; // Added Box import
import { inviteViewer, getRecords } from '../services/api';
import '../App.css';

function InviteViewer({ user }) {
  const [email, setEmail] = useState('');
  const [recordName, setRecordName] = useState('');
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await getRecords();
      setRecords(res.data);
    } catch (err) {
      setError('Failed to fetch records');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inviteViewer(email, email.split('@')[0], user.id, recordName);
      setSuccess('Viewer invited successfully');
      setEmail('');
      setRecordName('');
      setError('');
    } catch (err) {
      setError('Failed to invite viewer');
    }
  };

  return (
    <Box className="form-container inivte-container">
      <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222' }}>
        Invite Viewer
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#222222' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#1a2a44', color: '#FFF' }} onClose={() => setSuccess('')}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Viewer Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
        />
        <Select
          label="Record"
          fullWidth
          value={recordName}
          onChange={(e) => setRecordName(e.target.value)}
          required
          sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiSelect-select': { color: '#1a2a44' } }}
        >
          <MenuItem value="">Select Record</MenuItem>
          {records.map((record) => (
            <MenuItem key={record.id} value={record.name}>{record.name}</MenuItem>
          ))}
        </Select>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, py: 1.5, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }}
        >
          Invite
        </Button>
      </form>
    </Box>
  );
}

export default InviteViewer;