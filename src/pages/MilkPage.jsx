import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress, Select, MenuItem } from '@mui/material';
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
      console.log('Milk Entries Response:', response.data);
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
        adminId: user.id
      };
      await createMilk(payload);
      setMilkForm({ ...milkForm, quantityLiters: '', date: new Date() });
      setSuccess('Milk entry added');
      fetchMilkEntries();
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

  // Calculate summary
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
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#8B0000', fontWeight: 'bold', fontSize: '1.5rem', mb: 4 }}>
          {recordName || 'Loading...'} Records
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#8B0000' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#2E8B57', color: '#FFF' }} onClose={() => setSuccess('')}>{success}</Alert>}
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#FF4500' }} />}
        <Box className="form-container milk-add-form">
          <Typography variant="h6" sx={{ color: '#8B0000' }}>Add Milk Log</Typography>
          <form onSubmit={handleMilkSubmit}>
            <DatePicker
              label="Date"
              value={milkForm.date}
              onChange={(date) => setMilkForm({ ...milkForm, date })}
              minDate={new Date()}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required sx={{ '& .MuiInputLabel-root': { color: '#8B0000' }, '& .MuiInputBase-input': { color: '#2E8B57' } }} />}
            />
            <TextField
              label="Quantity (Liters)"
              type="number"
              fullWidth
              margin="normal"
              value={milkForm.quantityLiters}
              onChange={(e) => setMilkForm({ ...milkForm, quantityLiters: e.target.value })}
              required
              sx={{ '& .MuiInputLabel-root': { color: '#8B0000' }, '& .MuiInputBase-input': { color: '#2E8B57' } }}
            />
            <Select
              label="Status"
              fullWidth
              value={milkForm.status}
              onChange={(e) => setMilkForm({ ...milkForm, status: e.target.value })}
              required
              sx={{ '& .MuiInputLabel-root': { color: '#8B0000' }, '& .MuiSelect-select': { color: '#2E8B57' }, mt: 2 }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Leave">Leave</MenuItem>
            </Select>
            <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: '#FF4500', '&:hover': { bgcolor: '#FF6347' } }} disabled={loading}>
              Add Milk Log
            </Button>
          </form>
        </Box>
        {milkEntries.length === 0 ? (
          <Typography sx={{ margin: '2rem auto', textAlign: 'center', color: '#8B0000', bgcolor: '#fff', padding: '20px', maxWidth: '992px' }}>No data</Typography>
        ) : (
          <Box className="table-container logs-table-container">
            <Typography variant="h5" align="center" gutterBottom sx={{ color: '#8B0000', fontWeight: 'bold', fontSize: '1.5rem', mb: 4 }}>
              Current Month Records
            </Typography>
            <Table sx={{ border: '1px solid #2E8B57' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#2E8B57' }}>
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
                    <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>{getDayName(entry.date)}</TableCell>
                    <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>{entry.quantityLiters}</TableCell>
                    <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>{entry.totalCost.toFixed(2)}</TableCell>
                    <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>
                      {entry.status === 'Active' ? 'Bought' : entry.status}
                    </TableCell>
                    <TableCell>
                      {user.role === 'Admin' && (
                        <IconButton onClick={() => handleDelete(entry.id)} disabled={loading}>
                          <Delete sx={{ color: '#FF4500' }} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57', fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57', fontWeight: 'bold' }}>{days}</TableCell>
                  <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57', fontWeight: 'bold' }}>{totalLiters.toFixed(2)}</TableCell>
                  <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57', fontWeight: 'bold' }}>{totalCost.toFixed(2)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}

// Helper function
const getDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export default MilkPage;