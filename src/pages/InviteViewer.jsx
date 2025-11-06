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
<Box   className= 'invite-container' sx={{
  mt: 4,
  maxHeight: '500px',
  overflow: 'hidden',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  bgcolor: '#FFFFFF',
  marginBottom: '80px',
  paddingBottom: '30px'

}}>
  <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E0E0E0' }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
      Invited Viewers
    </Typography>
  </Box>

  <Box sx={{ maxHeight: '420px', overflowY: 'auto', py: 4}}>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#1A2A44' }} />
      </Box>
    ) : invitedViewers.length === 0 ? (
      <Typography sx={{ textAlign: 'center', color: '#888', py: 4 }}>
        No one invited yet
      </Typography>
    ) : (
      <List sx={{ p: 0 }}>
        {invitedViewers.flatMap((viewer) =>
          (viewer.records || []).map((record) => (
            <Paper key={`${viewer.id}-${record.id}`} sx={{ mb: 2, p: 2, borderLeft: '4px solid #FF9800' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{textAlign: 'left', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
                    {viewer.fullName || viewer.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {viewer.email}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: '#444' }}>
                    Record: <strong>{record.name}</strong> ({record.type})
                  </Typography>
                  <Chip
                    label={record.isAccepted ? 'Accepted' : 'Pending'}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: record.isAccepted ? '#10B981' : '#F59E0B',
                      color: 'white'
                    }}
                  />
                </Box>
                <IconButton
                  onClick={() => handleRevoke(viewer.id, record.id)}
                  sx={{ color: '#EF4444' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))
        )}
      </List>
    )}
  </Box>
</Box>
    </>
  );
}

export default InviteViewer;