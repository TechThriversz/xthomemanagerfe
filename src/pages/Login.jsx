import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { login } from '../services/api';
import '../App.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      console.log('Login Response:', res.data);
      const { user, token } = res.data;
      if (!user?.id) {
        console.error('Login: No user.id in response', user);
        setError('Login failed: User ID missing');
        setLoading(false);
        return;
      }
      onLogin(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <Box className="form-container">
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222' }}>
          Login to XTHomeManager
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#222222' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1a2a44' }} />}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }}
            disabled={loading}
          >
            Login
          </Button>
          <Button
            variant="text"
            fullWidth
            sx={{ mt: 1, color: '#1a2a44' }}
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;