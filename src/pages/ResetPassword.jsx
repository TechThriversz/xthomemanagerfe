import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { resetPassword } from '../services/api';
import { toast } from 'react-toastify';
import '../App.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const query = useQuery();

  const token = query.get('token');
  const email = decodeURIComponent(query.get('email') || ''); // FIX: DECODE

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid link. Please request a new password reset.");
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token || !email) {
      setError("Missing token or email.");
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await resetPassword({ email, token, newPassword: password });
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data || "Link expired or invalid.";
      setError(msg);
      toast.error("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <Box className="login-container">
        <Box className="form-container" sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid or expired link. <a href="/forgot-password" style={{ color: '#1A2A44' }}>Request a new one</a>.
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="login-container">
      <Box className="form-container">
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222' }}>
          Reset Your Password
        </Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2, py: 1.5, bgcolor: '#1A2A44', '&:hover': { bgcolor: '#101C31' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ResetPassword;