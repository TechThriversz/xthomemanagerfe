import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { resetPassword } from '../services/api';
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
    const email = query.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError("Invalid or expired password reset link. Please request a new one.");
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!token || !email) {
             setError("Missing required information from the link.");
             return;
        }

        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await resetPassword({ email, token, newPassword: password });
            setMessage(res.data.message + " Redirecting to login in 3 seconds...");
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Reset password error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'An error occurred. The link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

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
                        disabled={!token || !email || !!message}
                        sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
                    />
                    <TextField
                        label="Confirm New Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={!token || !email || !!message}
                        sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2, py: 1.5, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }}
                        disabled={loading || !token || !email || !!message}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default ResetPassword;

