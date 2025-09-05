import { useState, useEffect } from 'react';
import { Typography, TextField, Button, Alert, Box, CircularProgress } from '@mui/material';
import { getSettings, updateSettings, updateUser } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';
import { CONFIG } from '../../config'; // Adjust path based on your project structure

function SettingsPage({ user, setUser }) {
  const [settings, setSettings] = useState({ milkRatePerLiter: 0 });
  const [userForm, setUserForm] = useState({ fullName: user?.fullName || '', password: '', image: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id || !user?.role) {
      setError('User data is missing. Please log in again.');
      return;
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      setSettings(res.data || { milkRatePerLiter: 0 });
      setError('');
    } catch (err) {
      toast.error(err.response?.data?.title || 'Failed to fetch settings.', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({ milkRatePerLiter: parseFloat(settings.milkRatePerLiter) });
     toast.success(response.message || 'Settings updated successfully', { position: 'top-right', autoClose: 3000 });
      setError('');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings.', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!user?.id) {
      setError('User ID is missing. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('fullName', userForm.fullName);
      if (userForm.password) formData.append('password', userForm.password);
      if (userForm.image) formData.append('image', userForm.image);
      const response = await updateUser(user.id, formData);
      toast.success(response.message || 'Your profile updated successfully', { position: 'top-right', autoClose: 3000 });
      setUserForm({ ...userForm, password: '', image: null });
      setUser(response.data); // Use the callback to update the global user state
      setError('');
    } catch (err) {
       toast.error(err.message || 'Failed to update your profile', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  // Use config variables
  const { R2_BASE_URL, DUMMY_IMAGE_URL } = CONFIG;
  const imageUrl = user?.imagePath ? `${R2_BASE_URL}/${user.imagePath.replace(/\\/g, '/')}` : DUMMY_IMAGE_URL;

  return (
    <Box className="settings-container">
      <Typography variant="h4" gutterBottom align="center" sx={{ color: '#222222' }}>
        Settings
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#222222' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#1a2a44', color: '#FFF' }} onClose={() => setSuccess('')}>{success}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1a2a44' }} />}
      {user?.role === 'Admin' && (
        <Box className="form-container">
          <Typography variant="h6" sx={{ color: '#222222' }}>Milk Rate</Typography>
          <form onSubmit={handleSettingsSubmit}>
            <TextField
              label="Milk Rate Per Liter (Rs)"
              type="number"
              fullWidth
              margin="normal"
              value={settings.milkRatePerLiter}
              onChange={(e) => setSettings({ ...settings, milkRatePerLiter: e.target.value })}
              sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
            />
            <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} disabled={loading}>
              Update Rate
            </Button>
          </form>
        </Box>
      )}
      <Box className="form-container" sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ color: '#222222' }}>Profile</Typography>
        {imageUrl && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <img
              src={imageUrl}
              alt="Current Profile"
              style={{ width: 100, height: 100, borderRadius: '50%' }}
              onError={(e) => {
                console.error(`Image load failed for URL: ${imageUrl}`);
                e.target.src = DUMMY_IMAGE_URL; // Fallback to dummy image on error
              }}
            />
          </Box>
        )}
        <form onSubmit={handleUserSubmit}>
          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={userForm.fullName}
            onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
            sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
          />
          <TextField
            label="Upload Profile Image"
            type="file"
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            onChange={(e) => setUserForm({ ...userForm, image: e.target.files[0] })}
            sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
          />
          <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} disabled={loading}>
            Update Profile
          </Button>
        </form>
      </Box>
    </Box>
  );
}

export default SettingsPage;