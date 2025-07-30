import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getBills, createBill, deleteBill, getRecords } from '../services/api';
import { CONFIG } from '../../config';
import '../App.css';

function BillsPage({ user }) {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [billEntries, setBillEntries] = useState([]);
  const [billForm, setBillForm] = useState({ month: null, amount: '', referenceNumber: '', file: null });
  const [recordName, setRecordName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const { R2_BASE_URL } = CONFIG;

  useEffect(() => {
    if (!user?.id) {
      setError('Please log in to view this page');
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
      setError('');
    } catch (err) {
      setError('Failed to fetch bill entries: ' + (err.response?.data || err.message));
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

  const handleBillSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('recordId', recordId);
      formData.append('month', billForm.month?.toISOString().slice(0, 7));
      formData.append('amount', parseFloat(billForm.amount));
      formData.append('referenceNumber', billForm.referenceNumber);
      formData.append('adminId', user.id);
      if (billForm.file) formData.append('file', billForm.file);
      const response = await createBill(formData);
      setBillForm({ month: null, amount: '', referenceNumber: '', file: null });
      setSuccess('Bill entry added');
      fetchBillEntries();
      setOpenDialog(false);
    } catch (err) {
      setError('Failed to add bill entry: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteBill(id);
      setSuccess('Bill entry deleted');
      fetchBillEntries();
    } catch (err) {
      setError('Failed to delete bill entry: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthString) => {
    const [year, month] = monthString.split('-');
    return new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleImageClick = (filePath) => {
    if (filePath) {
      window.open(`${R2_BASE_URL}/${filePath}`, '_blank');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="bills-container">
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222', fontWeight: 'bold', fontSize: '1.5rem', mb: 4 }}>
          {recordName || 'Loading...'} Records
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#222222' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#1a2a44', color: '#FFF' }} onClose={() => setSuccess('')}>{success}</Alert>}
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1a2a44' }} />}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" sx={{ bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} onClick={() => setOpenDialog(true)}>
            Create
          </Button>
        </Box>
        {billEntries.length === 0 ? (
          <Box sx={{ border: '2px dotted #1a2a44', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
            <Box sx={{ textAlign: 'center', color: '#222222' }}>
              <Typography>There is no data to show add some to show data</Typography>
            </Box>
            <Button variant="contained" sx={{ mt: 2, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} onClick={() => setOpenDialog(true)}>
              Create
            </Button>
          </Box>
        ) : (
          <Box className="table-container logs-table-container">
            <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222', fontWeight: 'bold', fontSize: '1.5rem', mb: 4 }}>
              Bill Records
            </Typography>
            <Table sx={{ border: '1px solid #1a2a44' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#1a2a44' }}>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Month</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Month Name</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Amount (Rs)</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Reference Number</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Image</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.month}</TableCell>
                    <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{getMonthName(entry.month)}</TableCell>
                    <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.amount}</TableCell>
                    <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.referenceNumber}</TableCell>
                    <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>
                      {entry.filePath && (
                        <img
                          src={`${R2_BASE_URL}/${entry.filePath}`}
                          alt="Bill"
                          style={{ width: '100px', height: 'auto', cursor: 'pointer' }}
                          onClick={() => handleImageClick(entry.filePath)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role === 'Admin' && (
                        <IconButton onClick={() => handleDelete(entry.id)} disabled={loading}>
                          <Delete sx={{ color: '#1a2a44' }} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle sx={{ bgcolor: '#1a2a44', color: '#FFF' }}>Add Electricity Bill</DialogTitle>
          <DialogContent>
            <DatePicker
              label="Month"
              views={['year', 'month']}
              value={billForm.month}
              onChange={(date) => setBillForm({ ...billForm, month: date })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }} />}
            />
            <TextField
              label="Amount (Rs)"
              type="number"
              fullWidth
              margin="normal"
              value={billForm.amount}
              onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
              required
              sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
            />
            <TextField
              label="Reference Number"
              fullWidth
              margin="normal"
              value={billForm.referenceNumber}
              onChange={(e) => setBillForm({ ...billForm, referenceNumber: e.target.value })}
              required
              sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
            />
            <TextField
              label="Upload Bill Image"
              type="file"
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              onChange={(e) => setBillForm({ ...billForm, file: e.target.files[0] })}
              sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} sx={{ color: '#1a2a44' }}>Cancel</Button>
            <Button onClick={handleBillSubmit} variant="contained" sx={{ bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} disabled={loading}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default BillsPage;