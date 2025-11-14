import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Chip,
  Modal,
} from '@mui/material';
import { toast } from 'react-toastify';
import { getDeletionRequests, approveDeletion, approveCancellation } from '../services/api';


const ConfirmationModal = ({ isOpen, onClose, config }) => {
  const { title, message, confirmText, confirmColor, requestId, action } = config;

  const handleConfirm = async () => {
    if (requestId && action) {
      await action(requestId);
    }
    onClose();
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    outline: 'none',
  };

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="confirmation-modal-title">
      <Box sx={style}>
        <Typography 
          id="confirmation-modal-title" 
          variant="h6" 
          component="h2" 
          fontWeight="bold"
          color={confirmColor === 'error' ? 'error.main' : 'success.main'}
        >
          {title}
        </Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary' }}>
          {message}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button 
            variant="outlined" 
            onClick={onClose}
            sx={{ 
              textTransform: 'none',
              borderRadius: '8px',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={confirmColor}
            onClick={handleConfirm}
            sx={{ 
              textTransform: 'none', 
              borderRadius: '8px',
              px: 3,
              bgcolor: confirmColor === 'error' ? 'error.main' : 'success.main',
              '&:hover': {
                bgcolor: confirmColor === 'error' ? 'error.dark' : 'success.dark',
              }
            }}
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};


// --- Main Component ---

function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  const fetchRequests = useCallback(async () => {
    try {
      const res = await getDeletionRequests();
      console.log("Fetched requests:", res.data);
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      // toast.error('Failed to load requests.'); // Uncomment if using real toast
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApproveDeletionClick = (id) => {
    setModalConfig({
      title: 'Confirm Account Deletion Approval',
      message: 'Are you sure you want to approve this deletion? The user will have 24 hours to cancel the scheduled deletion.',
      confirmText: 'Approve Deletion',
      confirmColor: 'error',
      requestId: id,
      action: async (reqId) => {
        await approveDeletion(reqId);
        toast.success('Deletion scheduled');
        fetchRequests();
      }
    });
    setIsModalOpen(true);
  };

  const handleCancelApproveClick = (id) => {
    setModalConfig({
      title: 'Confirm Cancellation Approval',
      message: 'Approve this cancellation request? This action will immediately retain the user\'s account and stop the deletion process.',
      confirmText: 'Retain User',
      confirmColor: 'success',
      requestId: id,
      action: async (reqId) => {
        await approveCancellation(reqId);
        toast.success('User has been retained');
        fetchRequests();
      }
    });
    setIsModalOpen(true);
  };

  const getChipColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Cancellation Requested':
        return 'info';
      case 'Scheduled':
        return 'secondary';
      default:
        return 'default';
    }
  };


  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4, 
          color: '#1A2A44', 
          fontWeight: '700',
          borderBottom: '3px solid #E0E0E0',
          pb: 1
        }}
      >
        Deletion & Retention Requests
      </Typography>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#1A2A44' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>User</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Requested On</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map(r => (
              <TableRow 
                key={r.id} 
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' }, 
                  '&:hover': { backgroundColor: '#f0f4ff', cursor: 'pointer' }
                }}
              >
                <TableCell component="th" scope="row" sx={{ fontWeight: '500' }}>
                  {r.user.fullName}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{r.user.email}</TableCell>
                <TableCell>
                  {new Date(r.requestDate).toLocaleDateString()}
                  <Typography variant="caption" display="block" color="text.hint">
                    {new Date(r.requestDate).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={r.status} 
                    color={getChipColor(r.status)} 
                    size="small" 
                    sx={{ fontWeight: 'bold', borderRadius: '4px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  {r.status === 'Pending' ? (
                    <Button 
                      variant="contained" 
                      color="error" 
                      size="small" 
                      onClick={() => handleApproveDeletionClick(r.id)}
                      sx={{ textTransform: 'none', borderRadius: '6px' }}
                    >
                      Approve Deletion
                    </Button>
                  ) : r.status === 'Cancellation Requested' ? (
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      onClick={() => handleCancelApproveClick(r.id)}
                      sx={{ textTransform: 'none', borderRadius: '6px' }}
                    >
                      Approve Retention
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.hint">
                      Actioned
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={modalConfig}
      />
    </Box>
  );
}

export default AdminRequestsPage;