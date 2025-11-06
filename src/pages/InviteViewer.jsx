import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Select, MenuItem,
  IconButton, Paper, Chip, Divider, CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { inviteViewer, getRecords, revokeViewer, getInvitedViewers } from '../services/api';
import { toast } from 'react-toastify';

function InviteViewer({ user }) {
  const [email, setEmail] = useState('');
  const [selectedRecord, setSelectedRecord] = useState({ id: '', name: '' });
  const [records, setRecords] = useState([]);
  const [invitedViewers, setInvitedViewers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchRecords();
      fetchInvitedViewers();
    }
  }, [user?.id]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getRecords();
      const userRecords = res.data.filter(r => r.userId === user.id);
      setRecords(userRecords);
    } catch (err) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitedViewers = async () => {
    setLoading(true);
    try {
      const res = await getInvitedViewers(user.id);
      setInvitedViewers(res.data || []);
    } catch (err) {
      toast.error('Failed to load viewers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord.id) return toast.error('Select a record');

    setLoading(true);
    try {
      const res = await inviteViewer(email, selectedRecord.name, selectedRecord.id);
      const msg = res.data.Message;

      if (msg.includes("already a viewer")) toast.warn(msg);
      else if (msg.includes("No password needed")) toast.success(`${email} added!`);
      else toast.success("Invitation sent!");

      setEmail('');
      setSelectedRecord({ id: '', name: '' });
      fetchInvitedViewers();
    } catch (err) {
      toast.error(err.response?.data?.Message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (viewerId, recordId) => {
    if (!window.confirm('Revoke access to this record?')) return;

    try {
      await revokeViewer(viewerId, recordId);
      toast.success('Access revoked');
      fetchInvitedViewers();
    } catch (err) {
      toast.error('Failed to revoke');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Invite Form */}
      <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'white', boxShadow: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44', textAlign: 'center', mb: 3 }}>
          Invite Viewer
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
          <TextField
            label="Viewer Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select
            fullWidth
            value={selectedRecord.id}
            onChange={(e) => {
              const rec = records.find(r => r.id === e.target.value);
              setSelectedRecord({ id: rec?.id || '', name: rec?.name || '' });
            }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              <em>Select Record to Share</em>
            </MenuItem>
            {records.map(rec => (
              <MenuItem key={rec.id} value={rec.id}>{rec.name}</MenuItem>
            ))}
          </Select>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !email || !selectedRecord.id}
            sx={{ bgcolor: '#1A2A44', '&:hover': { bgcolor: '#101C31' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Invitation'}
          </Button>
        </Box>
      </Paper>

      {/* Invited Viewers List - MOBILE STYLE */}
      <Paper sx={{
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E0E0E0' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
            Invited Viewers
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#1A2A44' }} />
            </Box>
          ) : invitedViewers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#888' }}>
              <Typography variant="h6">No viewers invited yet</Typography>
              <Typography variant="body2">Start sharing your records!</Typography>
            </Box>
          ) : (
            invitedViewers.map((viewer, idx) => (
              <Paper
                key={viewer.id}
                sx={{
                  mb: 3,
                  p: 3,
                  borderRadius: 4,
                  bgcolor: 'white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                  border: '1px solid #F0F0F0'
                }}
              >
                {/* Viewer Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{textAlign:'left'}}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: 18, color: '#1A2A44' }}>
                      {viewer.fullName || 'Unknown User'}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#6E7A91', mt: 0.5 }}>
                      {viewer.email}
                    </Typography>
                  </Box>
                  <Chip
                    label="Viewer"
                    size="small"
                    sx={{ bgcolor: '#E9F1FC', color: '#1A2A44', fontWeight: 'bold', p:2 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Records List */}
                <Box sx={{ pl: 1 }}>
                  {viewer.records.map((rec, i) => (
                    <Box
                      key={rec.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: i < viewer.records.length - 1 ? '1px solid #F4F7FC' : 'none'
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#1A2A44' }}>
                          {rec.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: rec.isAccepted ? '#34C759' : '#FF9500',
                              mr: 1
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: rec.isAccepted ? '#34C759' : '#FF9500',
                              fontWeight: 'bold'
                            }}
                          >
                            {rec.isAccepted ? 'Accepted' : 'Pending'}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={() => handleRevoke(viewer.id, rec.id)}
                        sx={{ color: '#FF3B30' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default InviteViewer;