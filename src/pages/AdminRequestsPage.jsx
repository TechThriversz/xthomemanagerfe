// src/pages/AdminRequestsPage.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip } from '@mui/material';
import { getDeletionRequests, approveDeletion } from '../services/api';
import { toast } from 'react-toastify';

function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await getDeletionRequests();
    setRequests(res.data);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (id) => {
    if (confirm('Approve deletion? User will have 24h to cancel.')) {
      await approveDeletion(id);
      toast.success('Deletion scheduled');
      fetchRequests();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#1A2A44', fontWeight: 'bold' }}>
        Account Deletion Requests
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#1A2A44' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>User</TableCell>
              <TableCell sx={{ color: 'white' }}>Email</TableCell>
              <TableCell sx={{ color: 'white' }}>Requested</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {requests.map(r => (
    <TableRow key={r.id}>
      <TableCell>{r.user.fullName}</TableCell>
      <TableCell>{r.user.email}</TableCell>
      <TableCell>{new Date(r.requestDate).toLocaleString()}</TableCell>
      <TableCell>
        <Chip 
          label={r.status} 
          color={r.status === 'Pending' ? 'warning' : 'error'} 
          size="small" 
        />
      </TableCell>
      <TableCell>
        {r.status === 'Pending' && (
          <Button 
            variant="contained" 
            color="error" 
            size="small" 
            onClick={() => handleApprove(r.id)}
          >
            Approve
          </Button>
        )}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
export default AdminRequestsPage;