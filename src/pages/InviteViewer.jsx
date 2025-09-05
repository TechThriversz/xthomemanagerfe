import { useState, useEffect, Fragment } from 'react';
import { Typography, TextField, Button, Select, MenuItem, Box, IconButton, List, ListItem, ListItemText, CircularProgress, Paper, Chip, Divider } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { inviteViewer, getRecords, revokeViewer, getInvitedViewers } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';

function InviteViewer({ user }) {
  const [email, setEmail] = useState('');
  const [recordName, setRecordName] = useState('');
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
      setRecords(res.data);
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
    if (!recordName) {
      toast.error('Please select a record.', { position: 'top-right', autoClose: 3000 });
      return;
    }
    setLoading(true);
    try {
      const response = await inviteViewer( email, recordName);
      toast.success(response.message || 'User has been invited successfully!', { position: 'top-right', autoClose: 3000 });
      setEmail('');
      setRecordName('');
      fetchInvitedViewers();
    } catch (err) {
      toast.error(err.message || 'Failed to invite viewer', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (viewerId, recordName) => {
    setLoading(true);
    try {
      await revokeViewer({ viewerId, recordName });
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
      <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222', }}>
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
          value={recordName}
          onChange={(e) => setRecordName(e.target.value)}
          required
          sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiSelect-select': { color: '#1a2a44' } }}
        >
          <MenuItem value="">Select Record</MenuItem>
          {records.map((record) => (
            <MenuItem key={record.id} value={record.name}>
              {record.name}
            </MenuItem>
          ))}
        </Select>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2, py: 1.5, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }}
          disabled={loading}
        >
          Invite
        </Button>
      </form>
   
    </Box>

 <Box className="invite-container" >
   <Typography variant="h6" sx={{ mt: 4, color: '#222222',fontWeight: 'bold' }}>Invited Viewers</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <CircularProgress sx={{ color: '#1A2A44' }} />
        </Box>
      ) : (
      <List sx={{ width: '100%', mt: 2, p: 0,}}>
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
                        <Typography sx={{ mt:1, }} variant="body2" color="text.secondary">
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
                  {!record.isAccepted && (
                    <IconButton edge="end" aria-label="revoke" onClick={() => handleRevoke(viewer.id, record.name)}>
                      <DeleteIcon sx={{ color: '#EF4444' }} />
                    </IconButton>
                  )}
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