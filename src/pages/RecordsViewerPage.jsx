import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress } from '@mui/material';
import { getViewerRecords } from '../services/api';
import '../App.css';

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
      console.error('Failed to fetch viewer records:', error);
    } finally {
      setLoading(false);
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
        boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
        bgcolor: '#FFFFFF',
        mb: 4,
        textAlign: 'center'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2A44', mb: 1 }}>Invited Records</Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>View records you have been invited to manage.</Typography>
      </Box>

      {records.length === 0 ? (
        <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#F5F6FA', borderRadius: '16px' }}>
          <Typography variant="h6" sx={{ color: '#444' }}>No invited records found.</Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>You haven't been invited to view any records yet.</Typography>
        </Box>
      ) : (
        <Box sx={{ p: 4, borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px', bgcolor: '#FFFFFF' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC', '& > th': { fontWeight: 'bold', color: '#1A2A44', borderBottom: 'none' } }}>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record, index) => (
                <TableRow key={record.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FFFFFF' }, '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, '& > td': { borderBottom: 'none' } }}>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>
                    <Box component="span" sx={{
                      color: record.isAccepted ? '#10B981' : '#F59E0B',
                      bgcolor: record.isAccepted ? '#ECFDF5' : '#FEF3C7',
                      px: 2, py: 0.5, borderRadius: '16px', fontWeight: 'bold'
                    }}>
                      {record.isAccepted ? 'Accepted' : 'Pending'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => navigate(`/invited-record-details/${record.id}`)}
                      disabled={!record.isAccepted}
                      variant="contained"
                      sx={{
                        backgroundColor: '#1A2A44',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        textTransform: 'none',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          backgroundColor: '#101C31',
                          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#E0E0E0',
                          color: '#A0A0A0',
                          boxShadow: 'none',
                        }
                      }}
                    >
                      View
                    </Button>
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
