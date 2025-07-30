import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getMilk, createMilk, deleteMilk, getRecords } from '../services/api';
import '../App.css';

function MilkPage({ user }) {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [milkEntries, setMilkEntries] = useState([]);
  const [milkForm, setMilkForm] = useState({ date: new Date(), quantityLiters: '', status: 'Active' });
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
    fetchMilkEntries();
    fetchRecordName();
  }, [recordId, user, navigate]);

  const fetchMilkEntries = async () => {
    setLoading(true);
    try {
      const response = await getMilk(recordId);
      setMilkEntries(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch milk entries: ' + (err.response?.data || err.message));
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

  const handleMilkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        recordId: parseInt(recordId),
        date: milkForm.date.toISOString().split('T')[0],
        quantityLiters: parseFloat(milkForm.quantityLiters),
        status: milkForm.status,
        adminId: user.id,
      };
      await createMilk(payload);
      setMilkForm({ ...milkForm, quantityLiters: '', date: new Date() });
      setSuccess('Milk entry added');
      fetchMilkEntries();
      setOpenDialog(false);
    } catch (err) {
      setError('Failed to add milk entry: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteMilk(id);
      setSuccess('Milk entry deleted');
      fetchMilkEntries();
    } catch (err) {
      setError('Failed to delete milk entry: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const calculateSummary = () => {
    const days = milkEntries.length;
    const totalLiters = milkEntries.reduce((sum, entry) => sum + entry.quantityLiters, 0);
    const totalCost = milkEntries.reduce((sum, entry) => sum + entry.totalCost, 0);
    return { days, totalLiters, totalCost };
  };

  const { days, totalLiters, totalCost } = calculateSummary();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="milk-container">
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
        {milkEntries.length === 0 ? (
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
              Current Month Records
            </Typography>
            <Table sx={{ border: '1px solid #1a2a44' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#1a2a44' }}>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Date</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Day Name</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Quantity (Liters)</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Cost</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Status</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {milkEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{getDayName(entry.date)}</TableCell>
                    <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.quantityLiters}</TableCell>
                    <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.totalCost.toFixed(2)}</TableCell>
                    <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>
                      {entry.status === 'Active' ? 'Bought' : entry.status}
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
                <TableRow>
                  <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44', fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44', fontWeight: 'bold' }}>{days}</TableCell>
                  <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44', fontWeight: 'bold' }}>{totalLiters.toFixed(2)}</TableCell>
                  <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44', fontWeight: 'bold' }}>{totalCost.toFixed(2)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle sx={{ bgcolor: '#1a2a44', color: '#FFF' }}>Add Milk Log</DialogTitle>
          <DialogContent>
            <DatePicker
              label="Date"
              value={milkForm.date}
              onChange={(date) => setMilkForm({ ...milkForm, date })}
              minDate={new Date()}
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
            <Select
              label="Status"
              fullWidth
              value={milkForm.status}
              onChange={(e) => setMilkForm({ ...milkForm, status: e.target.value })}
              required
              sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiSelect-select': { color: '#1a2a44' }, mt: 2 }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Leave">Leave</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} sx={{ color: '#1a2a44' }}>Cancel</Button>
            <Button onClick={handleMilkSubmit} variant="contained" sx={{ bgcolor: '#1a2a44', '&:hover': { bgcolor: '#1a2a44cc' } }} disabled={loading}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default MilkPage;