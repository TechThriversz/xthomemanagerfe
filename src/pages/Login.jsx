import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
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
    setError('');
    try {
      const res = await login({ email, password });
      const { user, token } = res.data;
      if (!user?.id) {
        throw new Error('Login failed: User data missing');
      }
      // The onLogin function will handle storing data and navigating
      onLogin(user, token);
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
          {/* NEW: Forgot Password Link */}
          <Box sx={{ textAlign: 'right', my: 1 }}>
              <Link to="/forgot-password" style={{ color: '#1a2a44', textDecoration: 'none', fontWeight: 'bold' }}>
                  Forgot Password?
              </Link>
          </Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 1, py: 1.5, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
          <Button
            variant="text"
            fullWidth
            sx={{ mt: 1, color: '#1a2a44' }}
            onClick={() => navigate('/register')}
          >
            Don't have an account? Register
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
