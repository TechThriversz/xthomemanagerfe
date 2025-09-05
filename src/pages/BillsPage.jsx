import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Delete, Visibility, EditDocument } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getBills, createBill, deleteBill, getRecords } from '../services/api';
import { CONFIG } from '../../config';
import '../App.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function BillsPage({ user }) {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [billEntries, setBillEntries] = useState([]);
  const [billForm, setBillForm] = useState({ month: null, amount: '', referenceNumber: '', file: null });
  const [recordName, setRecordName] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const { R2_BASE_URL } = CONFIG;

  useEffect(() => {
    if (!user?.id) {
      toast.error('Please log in to view this page', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
      return;
    }
    fetchBillEntries();
    fetchRecordName();
  }, [recordId, user, navigate]);

  const fetchBillEntries = async () => {
    setLoading(true);
    try {
      const response = await getBills(recordId);
      setBillEntries(response.data || []);
    } catch (err) {
      toast.error('Failed to fetch bill entries: ' + (err.response?.data || err.message), { position: 'top-right', autoClose: 3000 });
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
        toast.error('Record not found', { position: 'top-right', autoClose: 3000 });
      }
    } catch (err) {
      toast.error('Failed to fetch record name: ' + (err.response?.data || err.message), { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleBillSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('recordId', recordId);
      formData.append('month', billForm.month?.toISOString().slice(0, 7));
      formData.append('amount', parseFloat(billForm.amount));
      formData.append('referenceNumber', billForm.referenceNumber);
      formData.append('adminId', user.id);
      if (billForm.file) formData.append('file', billForm.file);
      await createBill(formData);
      setBillForm({ month: null, amount: '', referenceNumber: '', file: null });
      toast.success('Bill entry added successfully', { position: 'top-right', autoClose: 3000 });
      setOpenDialog(false);
      fetchBillEntries();
    } catch (err) {
      toast.error('Failed to add bill entry: ' + (err.response?.data || err.message), { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    setLoading(true);
    try {
      await deleteBill(entryId);
      toast.success('Bill entry deleted successfully', { position: 'top-right', autoClose: 3000 });
      fetchBillEntries();
    } catch (err) {
      toast.error('Failed to delete bill entry: ' + (err.response?.data || err.message), { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setBillForm({ month: null, amount: '', referenceNumber: '', file: null });
  };
  
  const emptyStateImage = "https://img.freepik.com/premium-photo/spring-flowers-hands-beautiful-bouquet-female-hands_217529-507.jpg";
  const handleViewDemoData = () => {
      setSuccess('Simulating adding demo data...');
      setTimeout(() => {
          setSuccess('');
          fetchBillEntries(); // Fixed to fetchBillEntries instead of fetchRecords
      }, 2000);
  };

  // Calculate statistics on the frontend
  const totalAmount = billEntries.length > 0 ? billEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0).toFixed(2) : 0;
  const totalMonths = billEntries.length > 0 ? new Set(billEntries.map(entry => entry.month)).size : 0;

  return (
    <Box sx={{ p: 3 }}>
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1A2A44' }} />}

      {billEntries.length === 0 ? (
        <Box className="empty-state">
          <Typography variant="h6" sx={{ mt: 2, color: '#1A2A44', fontWeight: 'bold' }}>
            No Bills Found
          </Typography>
          <Typography sx={{ mt: 1, color: '#666', mb: 4 }}>
            It looks like there are no bills for this record yet. Let's add the first bill to track your expenses.
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
              Create New Bill Entry
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
        <Box>
          {/* Summary Boxes */}
          <Box className="inner-boxes" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 4 }}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'rgba(26, 42, 68, 0.9)', // Glassmorphism base color
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                  bgcolor: 'rgba(26, 42, 68, 0.95)',
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#FFD700' }}>Total Amount</Typography>
              <Typography variant="h4" sx={{ color: '#FFD700' }}>{CONFIG.currencySymbol}{totalAmount}</Typography>
            </Box>
            <Box
              sx={{
                p: 3,
                bgcolor: 'rgba(245, 158, 11, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                  bgcolor: 'rgba(245, 158, 11, 0.95)',
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#FFFFFF' }}>Total Months</Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>{totalMonths}</Typography>
            </Box>
          </Box>

          {/* Table Section */}
          <Box
            sx={{
              p: 4,
              borderRadius: '16px',
              boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
              bgcolor: '#FFFFFF',
              width: '1170px',
              m: 'auto',
              mt: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
                Bills for {recordName}
              </Typography>
              <Button
                variant="contained"
                onClick={handleOpenDialog}
                sx={{
                  bgcolor: '#1A2A44',
                  letterSpacing: '2px',
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
                Create Bill
              </Button>
            </Box>

            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC', '& > th': { fontWeight: 'bold', color: '#1A2A44', border: 'none' } }}>
                  <TableCell>Month</TableCell>
                  <TableCell>Amount ({CONFIG.currencySymbol})</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billEntries.map((entry) => (
                  <TableRow key={entry.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FFFFFF' }, '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, '& > td': { borderBottom: 'none' } }}>
                    <TableCell>{new Date(entry.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</TableCell>
                    <TableCell sx={{ color: '#666' }}>{CONFIG.currencySymbol}{entry.amount}</TableCell>
                    <TableCell sx={{ color: '#666' }}>{entry.referenceNumber}</TableCell>
                    <TableCell>
                      {entry.filePath && (
                        <a href={`${R2_BASE_URL}/${entry.filePath}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1A2A44' }}>
                          View Bill
                        </a>
                      )}
                    </TableCell>
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
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: '16px', p: 2 } }}>
        <DialogTitle sx={{ color: '#1A2A44', fontWeight: 'bold' }}>Add Bill</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Month"
              views={['year', 'month']}
              value={billForm.month}
              onChange={(date) => setBillForm({ ...billForm, month: date })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required sx={{ '& .MuiInputLabel-root': { color: '#666' }, '& .MuiInputBase-input': { color: '#1A2A44' }, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />}
            />
          </LocalizationProvider>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="normal"
            value={billForm.amount}
            onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
            required
            sx={{ '& .MuiInputLabel-root': { color: '#666' }, '& .MuiInputBase-input': { color: '#1A2A44' }, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
          <TextField
            label="Reference Number"
            fullWidth
            margin="normal"
            value={billForm.referenceNumber}
            onChange={(e) => setBillForm({ ...billForm, referenceNumber: e.target.value })}
            required
            sx={{ '& .MuiInputLabel-root': { color: '#666' }, '& .MuiInputBase-input': { color: '#1A2A44' }, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
          <TextField
            label="Upload Bill Image"
            type="file"
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            onChange={(e) => setBillForm({ ...billForm, file: e.target.files[0] })}
            sx={{ '& .MuiInputLabel-root': { color: '#666' }, '& .MuiInputBase-input': { color: '#1A2A44' }, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: '#666', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleBillSubmit} variant="contained"
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

export default BillsPage;