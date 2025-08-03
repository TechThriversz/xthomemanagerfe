import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, TextField, Button, Alert, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { getMilk, createMilk, deleteMilk, getBills, createBill, deleteBill, getRent, createRent, deleteRent } from '../services/api';
import '../App.css';

function RecordDetail({ user }) {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [milkEntries, setMilkEntries] = useState([]);
  const [billEntries, setBillEntries] = useState([]);
  const [rentEntries, setRentEntries] = useState([]);
  const [milkForm, setMilkForm] = useState({ date: null, quantityLiters: '', status: '' });
  const [billForm, setBillForm] = useState({ month: null, amount: '', referenceNumber: '', file: null });
  const [rentForm, setRentForm] = useState({ month: null, amount: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('RecordDetail: user:', user, 'recordId:', recordId);
    if (!user?.id) {
      setError('Please log in to view this page');
      navigate('/login');
      return;
    }
    fetchEntries();
  }, [recordId, user, navigate]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const [milkRes, billRes, rentRes] = await Promise.all([
        getMilk(recordId),
        getBills(recordId),
        getRent(recordId),
      ]);
      setMilkEntries(milkRes.data || []);
      setBillEntries(billRes.data || []);
      setRentEntries(rentRes.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch entries: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleMilkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMilk({ recordId: parseInt(recordId), date: milkForm.date?.toISOString().split('T')[0], quantityLiters: parseFloat(milkForm.quantityLiters), status: milkForm.status });
      setMilkForm({ date: null, quantityLiters: '', status: '' });
      setSuccess('Milk entry added');
      fetchEntries();
    } catch (err) {
      setError('Failed to add milk entry: ' + (err.response?.data || err.message));
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
      await createBill(formData);
      setBillForm({ month: null, amount: '', referenceNumber: '', file: null });
      setSuccess('Bill entry added');
      fetchEntries();
    } catch (err) {
      setError('Failed to add bill entry: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRent({ recordId: parseInt(recordId), month: rentForm.month?.toISOString().slice(0, 7), amount: parseFloat(rentForm.amount), adminId: user.id });
      setRentForm({ month: null, amount: '' });
      setSuccess('Rent entry added');
      fetchEntries();
    } catch (err) {
      setError('Failed to add rent entry: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    setLoading(true);
    try {
      if (type === 'milk') await deleteMilk(id);
      else if (type === 'bill') await deleteBill(id);
      else if (type === 'rent') await deleteRent(id);
      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} entry deleted`);
      fetchEntries();
    } catch (err) {
      setError(`Failed to delete ${type} entry: ` + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222' }}>
          Record Details (ID: {recordId})
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#222222' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#1a2a44', color: '#FFF' }} onClose={() => setSuccess('')}>{success}</Alert>}
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1a2a44' }} />}
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          centered
          sx={{ mb: 2, '& .MuiTab-root': { color: '#222222' }, '& .Mui-selected': { color: '#1a2a44' } }}
        >
          <Tab label="Milk" />
          <Tab label="Electricity Bills" />
          <Tab label="Rent" />
        </Tabs>
        {tab === 0 && (
          <Box className="form-container">
            <Typography variant="h6" sx={{ color: '#222222' }}>Add Milk Log</Typography>
            <form onSubmit={handleMilkSubmit}>
              <DatePicker
                label="Date"
                value={milkForm.date}
                onChange={(date) => setMilkForm({ ...milkForm, date })}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" required sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }} />}
              />
              <TextField
                label="Quantity (Liters)"
                type="number"
                fullWidth
                margin="normal"
                value={milkForm.quantityLiters}
                onChange={(e) => setMilkForm({ ...milkForm, quantityLiters: e.target.value })}
                required
                sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
              />
              <TextField
                label="Status (e.g., Active, Leave)"
                fullWidth
                margin="normal"
                value={milkForm.status}
                onChange={(e) => setMilkForm({ ...milkForm, status: e.target.value })}
                sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
              />
              <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} disabled={loading}>
                Add Milk Log
              </Button>
            </form>
            {milkEntries.length === 0 ? (
              <Typography sx={{ mt: 2, textAlign: 'center', color: '#222222' }}>No data</Typography>
            ) : (
              <Box className="table-container">
                <Table sx={{ border: '1px solid #1a2a44' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#1a2a44' }}>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Date</TableCell>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Quantity (Liters)</TableCell>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Status</TableCell>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {milkEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.quantityLiters}</TableCell>
                        <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.status || '-'}</TableCell>
                        <TableCell>
                          {user.role === 'Admin' && (
                            <IconButton onClick={() => handleDelete('milk', entry.id)} disabled={loading}>
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
          </Box>
        )}
        {tab === 1 && (
          <Box className="form-container">
            <Typography variant="h6" sx={{ color: '#222222' }}>Add Electricity Bill</Typography>
            <form onSubmit={handleBillSubmit}>
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
              <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} disabled={loading}>
                Add Bill
              </Button>
            </form>
            {billEntries.length === 0 ? (
              <Typography sx={{ mt: 2, textAlign: 'center', color: '#222222' }}>No data</Typography>
            ) : (
              <Box className="table-container">
                <Table sx={{ border: '1px solid #1a2a44' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#1a2a44' }}>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Month</TableCell>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Amount (Rs)</TableCell>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Reference Number</TableCell>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.month}</TableCell>
                        <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.amount}</TableCell>
                        <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.referenceNumber}</TableCell>
                        <TableCell>
                          {user.role === 'Admin' && (
                            <IconButton onClick={() => handleDelete('bill', entry.id)} disabled={loading}>
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
          </Box>
        )}
        {tab === 2 && (
          <Box className="form-container">
            <Typography variant="h6" sx={{ color: '#222222' }}>Add Rent Log</Typography>
            <form onSubmit={handleRentSubmit}>
              <DatePicker
                label="Month"
                views={['year', 'month']}
                value={rentForm.month}
                onChange={(date) => setRentForm({ ...rentForm, month: date })}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" required sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }} />}
              />
              <TextField
                label="Amount (Rs)"
                type="number"
                fullWidth
                margin="normal"
                value={rentForm.amount}
                onChange={(e) => setRentForm({ ...rentForm, amount: e.target.value })}
                required
                sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiInputBase-input': { color: '#1a2a44' } }}
              />
              <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} disabled={loading}>
                Add Rent Log
              </Button>
            </form>
            {rentEntries.length === 0 ? (
              <Typography sx={{ mt: 2, textAlign: 'center', color: '#222222' }}>No data</Typography>
            ) : (
              <Box className="table-container">
                <Table sx={{ border: '1px solid #1a2a44' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#1a2a44' }}>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Month</TableCell>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Amount (Rs)</TableCell>
                      <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rentEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.month}</TableCell>
                        <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.amount}</TableCell>
                        <TableCell>
                          {user.role === 'Admin' && (
                            <IconButton onClick={() => handleDelete('rent', entry.id)} disabled={loading}>
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
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}

export default RecordDetail;