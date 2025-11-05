import { useState, useEffect, Fragment } from 'react';
import { Typography, TextField, Button, Select, MenuItem, Box, IconButton, List, ListItem, ListItemText, CircularProgress, Paper, Chip, Divider } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { inviteViewer, getRecords, revokeViewer, getInvitedViewers } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';

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
      // Filter records to include only those created by the logged-in user
      const userRecords = res.data.filter(record => record.userId === user.id);
      setRecords(userRecords);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch records', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitedViewers = async () => {
    setLoading(true);
    try {
      if (!user?.id) throw new Error('User ID is undefined');
      const res = await getInvitedViewers(user.id);
      setInvitedViewers(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch invited viewers', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedRecord.id) {
    toast.error('Please select a record.');
    return;
  }

  setLoading(true);
  try {
    const res = await inviteViewer(email, selectedRecord.name, selectedRecord.id);
    const msg = res.data.Message;

    if (msg.includes("already a viewer")) {
      toast.warn(msg);
    } else if (msg.includes("No password needed")) {
      toast.success(`${email} added! They can accept the invite.`);
    } else {
      toast.success("Invitation sent with temp password!");
    }

    setEmail('');
    setSelectedRecord({ id: '', name: '' });
    fetchInvitedViewers();
  } catch (err) {
    toast.error(err.response?.data?.Message || 'Failed to invite.');
  } finally {
    setLoading(false);
  }
};


const handleRevoke = async (viewerId, recordId) => { // Changed recordName to recordId
  setLoading(true);
  try {
    await revokeViewer(viewerId, recordId); // Updated to use recordId
    toast.success('Viewer access revoked successfully', { position: 'top-right', autoClose: 3000 });
    fetchInvitedViewers();
  } catch (err) {
    toast.error(err.response?.data?.Message || 'Failed to revoke viewer access', { position: 'top-right', autoClose: 3000 });
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Box className="form-container invite-container">
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222' }}>
          Invite Viewer
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Viewer Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
          />
          <Select
            label="Record"
            fullWidth
            value={selectedRecord.id}
            onChange={(e) => {
              const rec = records.find(r => r.id === e.target.value);
              setSelectedRecord({ id: rec.id, name: rec.name });
            }}
            required
            sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiSelect-select': { color: '#1a2a44' } }}
          >
            <MenuItem value="">Select Record</MenuItem>
            {records.length > 0 ? (
              records.map((record) => (
                <MenuItem key={record.id} value={record.id}>
                  {record.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                <Typography color="text.secondary">Create a record first to invite someone.</Typography>
              </MenuItem>
            )}
          </Select>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }}
            disabled={loading || records.length === 0}
          >
            Invite
          </Button>
        </form>
      </Box>

      <Box className="invite-container">
        <Typography variant="h6" sx={{ mt: 4, color: '#222222', fontWeight: 'bold' }}>Invited Viewers</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
            <CircularProgress sx={{ color: '#1A2A44' }} />
          </Box>
        ) : (
          <List sx={{ width: '100%', mt: 2, p: 0 }}>
            {invitedViewers.flatMap((viewer) =>
              (viewer.records || []).map((record, index) => (
                <Paper key={`${viewer.id}-${record.name}-${index}`} sx={{ mb: 2, borderRadius: '12px', border: '2px solid #ff9800', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <ListItem sx={{ py: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ListItemText
                      primary={
                        <>
                          <span style={{ color: '#888', fontWeight: 400 }}>Name:</span>
                          <span style={{ marginLeft: 6 }}>{viewer.fullName}</span>
                          <br />
                          <span style={{ color: '#888', fontWeight: 400 }}>Email:</span>
                          <span style={{ marginLeft: 6 }}>{viewer.email}</span>
                        </>
                      }
                      secondary={
                        <span>
                          <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
                            Record: <Typography component="span" fontWeight="medium">{record.name}</Typography>
                          </Typography>
                          <Chip
                            label={record.isAccepted ? 'Accepted' : 'Pending'}
                            sx={{
                              bgcolor: record.isAccepted ? '#4caf50' : '#ff9800',
                              color: '#fff',
                              fontWeight: 'bold',
                              borderRadius: '8px',
                              mt: 1,
                            }}
                          />
                        </span>
                      }
                      primaryTypographyProps={{ fontWeight: 'bold', color: '#1A2A44' }}
                      secondaryTypographyProps={{ color: '#666' }}
                    />
                    <IconButton edge="end" aria-label="revoke" onClick={() => handleRevoke(viewer.id, record.id)}>
                      <DeleteIcon sx={{ color: '#EF4444' }} />
                    </IconButton>
                  </ListItem>
                </Paper>
              ))
            )}
          </List>
        )}
      </Box>
    </>
  );
}

export default InviteViewer;