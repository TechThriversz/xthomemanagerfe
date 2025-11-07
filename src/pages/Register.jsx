import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { register } from '../services/api';
import { toast } from 'react-toastify';
import '../App.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // === CAPTCHA LOGIC ===
  const [num1, num2] = [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(captcha) !== num1 + num2) {
      toast.error("Incorrect answer. Try again.");
      return;
    }

    setLoading(true);
    try {
      await register({ email, password, fullName });
      toast.success("Registered successfully! Redirecting to login...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.Message || err.message;
      toast.error(msg.includes("already exists") ? "Email already registered" : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <Box className="form-container">
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222' }}>
          Register for XTHomeManager
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Full Name"
            fullWidth
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* CAPTCHA */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
              {num1} + {num2} =
            </Typography>
            <TextField
              size="small"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value.replace(/\D/g, ''))}
              placeholder="?"
              inputProps={{ maxLength: 2, style: { textAlign: 'center' } }}
              sx={{ width: 60 }}
              required
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !captcha}
            sx={{ mt: 1, py: 1.5, bgcolor: '#1A2A44', '&:hover': { bgcolor: '#101C31' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={() => navigate('/login')}
            sx={{ color: '#1A2A44' }}
          >
            Already have an account? Login
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Register;