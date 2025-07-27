import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { register } from '../services/api';
import '../App.css';

function Register({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register({ email, password, fullName, role: 'Admin' });
      console.log('Register: Response:', res.data);
      const { user, token } = res.data;
      if (!user.id) {
        console.error('Register: No user.id in response');
        setError('Registration failed: User ID missing');
        setLoading(false);
        return;
      }
      onRegister(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      setError('Registration failed: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <Box className="form-container">
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#8B0000' }}>
          Register to XTHomeManager
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#8B0000' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#FF4500' }} />}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            sx={{ '& .MuiInputLabel-root': { color: '#8B0000' }, '& .MuiInputBase-input': { color: '#2E8B57' } }}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ '& .MuiInputLabel-root': { color: '#8B0000' }, '& .MuiInputBase-input': { color: '#2E8B57' } }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ '& .MuiInputLabel-root': { color: '#8B0000' }, '& .MuiInputBase-input': { color: '#2E8B57' } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5, bgcolor: '#FF4500', '&:hover': { bgcolor: '#FF6347' } }}
            disabled={loading}
          >
            Register
          </Button>
          <Button
            variant="text"
            fullWidth
            sx={{ mt: 1, color: '#2E8B57' }}
            onClick={() => navigate('/login')}
          >
            Already have an account? Login
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Register;