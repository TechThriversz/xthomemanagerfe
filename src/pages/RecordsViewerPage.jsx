import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress, Chip } from '@mui/material';
import { getViewerRecords, acceptInvite, declineInvite } from '../services/api';
import { toast } from 'react-toastify';

function RecordsViewerPage({ user }) {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchRecords();
  }, [user, navigate]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await getViewerRecords(user.id);
      setRecords(response.data || []);
    } catch (error) {
      toast.error('Failed to load invited records');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (recordId) => {
    try {
      await acceptInvite(recordId);
      toast.success("Accepted! You can now view this record.");
      setRecords(prev => prev.map(r => 
        r.id === recordId ? { ...r, isAccepted: true } : r
      ));
    } catch (err) {
      toast.error("Failed to accept invite");
    }
  };

  const handleDecline = async (recordId) => {
    try {
      await declineInvite(recordId);
      toast.info("Invite declined");
      setRecords(prev => prev.map(r => 
        r.id === recordId ? { ...r, isAccepted: false, declined: true } : r
      ));
    } catch (err) {
      toast.error("Failed to decline");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#1A2A44' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '900px', mx: 'auto' }}>
      <Box sx={{
        p: 4,
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        bgcolor: '#FFFFFF',
        mb: 4,
        textAlign: 'center',
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2A44', mb: 1 }}>
          Invited Records
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          View records shared with you
        </Typography>
      </Box>

      {records.length === 0 ? (
        <Box sx={{ p: 8, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: '16px' }}>
          <Typography variant="h6" sx={{ color: '#444' }}>No invitations yet</Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>
            When someone invites you, it will appear here.
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          p: 4,
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          bgcolor: '#FFFFFF',
          maxHeight: '70vh',
          overflow: 'hidden'
        }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        record.declined ? 'Declined' :
                        record.isAccepted ? 'Accepted' : 'Pending'
                      }
                      size="small"
                      sx={{
                        bgcolor: record.declined ? '#EF4444' :
                                 record.isAccepted ? '#10B981' : '#F59E0B',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {record.isAccepted ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/invited-record-details/${record.id}`)}
                        sx={{ bgcolor: '#1A2A44', '&:hover': { bgcolor: '#101C31' } }}
                      >
                        View Record
                      </Button>
                    ) : record.declined ? (
                      <Button disabled size="small" variant="outlined">
                        Declined
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                          onClick={() => handleAccept(record.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDecline(record.id)}
                        >
                          Decline
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}

export default RecordsViewerPage;