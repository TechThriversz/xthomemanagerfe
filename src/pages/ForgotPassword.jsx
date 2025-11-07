import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { forgotPassword } from '../services/api'; 
import '../App.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setMessage('');
  try {
    await forgotPassword({ email });
    setMessage("If an account exists, a reset link has been sent to your email.");
  } catch (err) {
    const msg = err.response?.data || err.message;
    setError(typeof msg === 'string' ? msg : 'Failed to send reset link. Try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <Box className="login-container">
      <Box className="form-container">
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222' }}>
          Forgot Password
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 2, color: '#666' }}>
          Enter your email and we'll send you a link to reset your password.
        </Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
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
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }}
            disabled={loading || !!message}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
          </Button>
          <Button
            variant="text"
            fullWidth
            component={Link}
            to="/login"
            sx={{ mt: 1, color: '#1a2a44' }}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ForgotPassword;

