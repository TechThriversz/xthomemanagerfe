// src/pages/UpgradePage.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, Card, CardContent } from '@mui/material';
import { Upgrade, Send, CheckCircle, Edit } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { requestProUpgrade } from '../services/api';

function UpgradePage({ user }) {
  const [form, setForm] = useState({
    phoneNumber: user?.phoneNumber || '',
    fullName: user?.fullName || '',
    email: user?.email || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState('');

  useEffect(() => {
    const pending = user?.proUpgradeRequests?.some(r => r.status === 'Pending');
    const approved = user?.isPro;
    setRequestStatus(pending ? 'pending' : approved ? 'approved' : 'none');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phoneNumber) {
      toast.error('Full Name and Phone Number are required');
      return;
    }
    setLoading(true);
    try {
      await requestProUpgrade();
      setRequestStatus('pending');
      toast.success('Request sent! Admin will review.');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to send request';
      if (msg.includes('pending')) {
        toast.warn('Request already pending');
        setRequestStatus('pending');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const daysLeft = user?.proEndDate ? Math.ceil((new Date(user.proEndDate) - new Date()) / (86400000)) : 0;

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

      {/* APPROVED */}
      {requestStatus === 'approved' && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <CardContent sx={{ p: 5 }}>
            <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, color: '#1A2A44' }}>You are on PRO</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
              {daysLeft} <span style={{ fontSize: '1rem' }}>days left</span>
            </Typography>
            <Typography color="text.secondary">
              Expires: {new Date(user.proEndDate).toLocaleDateString('en-GB')}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* PENDING */}
      {requestStatus === 'pending' && (
        <Card sx={{ borderRadius: 3, p: 5, textAlign: 'center' }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Request Pending</strong> — Admin will upgrade you soon.
          </Alert>
        </Card>
      )}

      {/* FORM ONLY IF NONE */}
      {requestStatus === 'none' && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#1A2A44', fontWeight: 'bold' }}>
                Request 1-Year PRO Access
              </Typography>
              <Button size="small" startIcon={<Edit />} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Done' : 'Edit'}
              </Button>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Phone Number"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                disabled={!isEditing}
                required
                fullWidth
              />
              <TextField
                label="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                disabled={!isEditing}
                required
                fullWidth
              />
              <TextField label="Email" value={form.email} disabled fullWidth />
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
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Need help? Contact support at 
          <a href="mailto:support@xthomemanager.com" style={{ color: '#1A2A44', fontWeight: 'bold', textDecoration: 'underline' }}>
            support@xthomemanager.com
          </a>
        </Typography>
      </Box>
    </Box>
  );
}

export default UpgradePage;