import { useState, useEffect } from 'react';
import { Typography, TextField, Button, Select, MenuItem, Alert } from '@mui/material';
import { inviteViewer, getRecords } from '../services/api';

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
    <div>
      <Typography variant="h4" gutterBottom>Invite Viewer</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Viewer Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Select
          label="Record"
          fullWidth
          value={recordName}
          onChange={(e) => setRecordName(e.target.value)}
          required
        >
          <MenuItem value="">Select Record</MenuItem>
          {records.map((record) => (
            <MenuItem key={record.id} value={record.name}>{record.name}</MenuItem>
          ))}
        </Select>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Invite
        </Button>
      </form>
    </div>
  );
}

export default InviteViewer;