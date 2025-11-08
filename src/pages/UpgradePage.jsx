// src/pages/UpgradePage.jsx
import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { Upgrade, Send, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { requestProUpgrade } from '../services/api';

function UpgradePage({ user }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestProUpgrade();
      setSuccess(true);
      toast.success('Request sent! Admin will upgrade you to PRO.');
    } catch {
      toast.error('Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  const proEnd = user?.ProEndDate ? new Date(user.ProEndDate) : null;
  const daysLeft = proEnd ? Math.ceil((proEnd - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2A44', mb: 2 }}>
          Upgrade to <span style={{ color: '#1A2A44' }}>XT Home Manager PRO</span>
        </Typography>
        <Typography variant="h6" color="text.secondary">
          1-Year Access • Password Vault • Family • Medical Records
        </Typography>
      </Box>

      {user?.IsPro ? (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <CardContent sx={{ p: 5 }}>
            <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, color: '#1A2A44' }}>
              You are on PRO
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
              {daysLeft} <span style={{ fontSize: '1rem' }}>days left</span>
            </Typography>
            <Typography color="text.secondary">
              Expires: {proEnd?.toLocaleDateString('en-GB')}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 5 }}>
            {success ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                <strong>Request Sent!</strong> Admin will upgrade you to PRO soon.
              </Alert>
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 3, color: '#1A2A44', fontWeight: 'bold' }}>
                  Request 1-Year PRO Access
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField label="Phone Number" value={user?.PhoneNumber || ''} disabled fullWidth />
                  <TextField label="Full Name" value={user?.FullName || ''} disabled fullWidth />
                  <TextField label="Email" value={user?.Email} disabled fullWidth />
                  <TextField label="Request Date" value={new Date().toLocaleDateString('en-GB')} disabled fullWidth />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                    disabled={loading}
                    sx={{ bgcolor: '#1A2A44', borderRadius: 50, py: 1.5, fontWeight: 'bold' }}
                  >
                    {loading ? 'Sending...' : 'Send Request'}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 6, textAlign: 'center' }}>
  <Typography variant="body2" color="text.secondary">
    Need help? Contact support at 
    <a href="mailto:support@xthomemanager.com" style={{ color: '#1A2A44', fontWeight: 'bold' }}>
      support@xthomemanager.com
    </a>
  </Typography>
</Box>
    </Box>
  );
}

export default UpgradePage;