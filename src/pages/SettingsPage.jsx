import { useState, useEffect } from 'react';
import { Typography, TextField, Button, Alert, Box } from '@mui/material';
import { getSettings, updateSettings, updateUser } from '../services/api';

function SettingsPage({ user }) {
  const [settings, setSettings] = useState({ milkRatePerLiter: 0 });
  const [userForm, setUserForm] = useState({ fullName: user.fullName, password: '', image: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSettings();
      setSettings(res.data);
    } catch (err) {
      setError('Failed to fetch settings');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({ milkRatePerLiter: parseFloat(settings.milkRatePerLiter) });
      setSuccess('Settings updated successfully');
      setError('');
    } catch (err) {
      setError('Failed to update settings');
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('fullName', userForm.fullName);
      if (userForm.password) formData.append('password', userForm.password);
      if (userForm.image) formData.append('image', userForm.image);
      await updateUser(user.id, formData);
      setSuccess('User profile updated successfully');
      setUserForm({ ...userForm, password: '', image: null });
      setError('');
    } catch (err) {
      setError('Failed to update user profile');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {user.role === 'Admin' && (
        <>
          <Typography variant="h6">Milk Rate</Typography>
          <form onSubmit={handleSettingsSubmit}>
            <TextField
              label="Milk Rate Per Liter (Rs)"
              type="number"
              fullWidth
              margin="normal"
              value={settings.milkRatePerLiter}
              onChange={(e) => setSettings({ ...settings, milkRatePerLiter: e.target.value })}
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              Update Rate
            </Button>
          </form>
        </>
      )}
      <Typography variant="h6" sx={{ mt: 4 }}>Profile</Typography>
      <form onSubmit={handleUserSubmit}>
        <TextField
          label="Full Name"
          fullWidth
          margin="normal"
          value={userForm.fullName}
          onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
        />
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={userForm.password}
          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setUserForm({ ...userForm, image: e.target.files[0] })}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Update Profile
        </Button>
      </form>
    </Box>
  );
}

export default SettingsPage;