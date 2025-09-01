import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Delete, Visibility, EditDocument } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getRent, createRent, deleteRent, getRecords } from '../services/api';
import '../App.css';

function RentPage({ user }) {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [rentEntries, setRentEntries] = useState([]);
  const [rentForm, setRentForm] = useState({ month: null, amount: '' });
  const [recordName, setRecordName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setError('Please log in to view this page');
      navigate('/login');
      return;
    }
    fetchRentEntries();
    fetchRecordName();
  }, [recordId, user, navigate]);

  const fetchRentEntries = async () => {
    setLoading(true);
    try {
      const response = await getRent(recordId);
      setRentEntries(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch rent entries: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordName = async () => {
    setLoading(true);
    try {
      const response = await getRecords();
      const record = response.data.find(r => r.id === parseInt(recordId));
      if (record) {
        setRecordName(record.name);
      } else {
        setError('Record not found');
      }
    } catch (err) {
      setError('Failed to fetch record name: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRentSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        recordId: parseInt(recordId),
        month: rentForm.month?.toISOString().slice(0, 7),
        amount: parseFloat(rentForm.amount),
        adminId: user.id,
      };
      await createRent(payload);
      setRentForm({ month: null, amount: '' });
      setSuccess('Rent entry added successfully');
      setOpenDialog(false);
      fetchRentEntries();
    } catch (err) {
      setError('Failed to add rent entry: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    setLoading(true);
    try {
      await deleteRent(entryId);
      setSuccess('Rent entry deleted successfully');
      fetchRentEntries();
    } catch (err) {
      setError('Failed to delete rent entry: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRentForm({ month: null, amount: '' });
  };
  
  const emptyStateImage = "https://img.freepik.com/premium-photo/spring-flowers-hands-beautiful-bouquet-female-hands_217529-507.jpg";
  const handleViewDemoData = () => {
      setSuccess('Simulating adding demo data...');
      setTimeout(() => {
          setSuccess('');
          fetchRecords();
      }, 2000);
  };
  return (
    <Box sx={{ p: 3 }}>
   

      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FEE2E2', color: '#EF4444' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#ECFDF5', color: '#10B981' }} onClose={() => setSuccess('')}>{success}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1A2A44' }} />}

      {rentEntries.length === 0 ? (
        <Box
        className="empty-state" 
        >

            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
                          Rent Entries for {recordName}
                      </Typography>
          <Typography variant="h6" sx={{ mt: 2, color: '#1A2A44', fontWeight: 'bold' }}>
            No Rent Entries Found
          </Typography>
          <Typography sx={{ mt: 1, color: '#666', mb: 4 }}>
            It looks like there are no rent entries for this record yet. Let's add the first entry to track your rent payments.
          </Typography>
          <Box
            component="img"
            src={emptyStateImage}
            alt="No records illustration"
            sx={{ width: 400, height: 'auto', mb: 4, borderRadius: '8px' }}
          />
          <Typography variant="body1" sx={{ color: '#888', mb: 2 }}>
            What would you like to do next?
          </Typography>

         <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
             className="create-record-button"
              variant="contained"
              onClick={handleOpenDialog}
               startIcon={<EditDocument />}
            >
              Create New Rent Entry
            </Button>
            <Button
              className="view-demo-button"
              variant="outlined"
              onClick={handleViewDemoData}
              startIcon={<Visibility />}
            >
              View Demo Data
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
       p: 4,
            borderRadius: '16px',
            boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
            bgcolor: '#FFFFFF',
             width: '1170px',
             m: "auto",
             mt: 2,
          }}
        >

             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
          Rent Entries for {recordName}
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenDialog}
          sx={{
            bgcolor: '#1A2A44',
            letterSpacing:"2px",
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '8px',
            textTransform: 'uppercase',
            px: 6,
            py: 1.5,
            '&:hover': { bgcolor: '#2E4057' }
          }}
          disabled={loading}
        >
          Create Rent
        </Button>
      </Box>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC', '& > th': { fontWeight: 'bold', color: '#1A2A44', border: 'none' } }}>
                <TableCell>Month</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rentEntries.map((entry) => (
                <TableRow key={entry.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FFFFFF' }, '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, '& > td': { borderBottom: 'none' } }}>
                  <TableCell>{new Date(entry.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</TableCell>
                  <TableCell sx={{ color: '#666' }}>{entry.amount}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleDelete(entry.id)} disabled={loading}>
                      <Delete sx={{ color: '#EF4444' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: '16px', p: 2 } }}>
        <DialogTitle sx={{ color: '#1A2A44', fontWeight: 'bold' }}>Add Rent Log</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Month"
              views={['year', 'month']}
              value={rentForm.month}
              onChange={(date) => setRentForm({ ...rentForm, month: date })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required sx={{ '& .MuiInputLabel-root': { color: '#666' }, '& .MuiInputBase-input': { color: '#1A2A44' }, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />}
            />
          </LocalizationProvider>
          <TextField
            label="Amount (Rs)"
            type="number"
            fullWidth
            margin="normal"
            value={rentForm.amount}
            onChange={(e) => setRentForm({ ...rentForm, amount: e.target.value })}
            required
            sx={{ '& .MuiInputLabel-root': { color: '#666' }, '& .MuiInputBase-input': { color: '#1A2A44' }, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: '#666', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleRentSubmit} variant="contained"
            sx={{
              bgcolor: '#1A2A44',
              color: '#FFD700',
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { bgcolor: '#2E4057' }
            }}
            disabled={loading}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RentPage;