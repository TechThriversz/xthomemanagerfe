import { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { inviteViewer } from '../services/api';

function InviteViewer() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await inviteViewer(email, user.id);
      setSuccess('Viewer invited successfully');
      setEmail('');
      setError('');
    } catch (err) {
      setError('Failed to invite viewer');
      setSuccess('');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Invite Viewer
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Viewer Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Invite
        </Button>
      </form>
    </Box>
  );
}

export default InviteViewer;