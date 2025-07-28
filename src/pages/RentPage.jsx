import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress } from '@mui/material';
import { Delete } from '@mui/icons-material';
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
        console.log('Record Name Response:', response.data);
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

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRent({ recordId: parseInt(recordId), month: rentForm.month?.toISOString().slice(0, 7), amount: parseFloat(rentForm.amount), adminId: user.id });
      setRentForm({ month: null, amount: '' });
      setSuccess('Rent entry added');
      fetchRentEntries();
    } catch (err) {
      setError('Failed to add rent entry: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteRent(id);
      setSuccess('Rent entry deleted');
      fetchRentEntries();
    } catch (err) {
      setError('Failed to delete rent entry: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="rent-container">
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#8B0000', fontWeight: 'bold', fontSize: '1.5rem', mb: 4 }}>
           {recordName || 'Loading...'} Records
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#8B0000' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#2E8B57', color: '#FFF' }} onClose={() => setSuccess('')}>{success}</Alert>}
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#FF4500' }} />}
        <Box className="form-container rent-add-form">
          <Typography variant="h6" sx={{ color: '#8B0000' }}>Add Rent Log</Typography>
          <form onSubmit={handleRentSubmit}>
            <DatePicker
              label="Month"
              views={['year', 'month']}
              value={rentForm.month}
              onChange={(date) => setRentForm({ ...rentForm, month: date })}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" required sx={{ '& .MuiInputLabel-root': { color: '#8B0000' }, '& .MuiInputBase-input': { color: '#2E8B57' } }} />}
            />
            <TextField
              label="Amount (Rs)"
              type="number"
              fullWidth
              margin="normal"
              value={rentForm.amount}
              onChange={(e) => setRentForm({ ...rentForm, amount: e.target.value })}
              required
              sx={{ '& .MuiInputLabel-root': { color: '#8B0000' }, '& .MuiInputBase-input': { color: '#2E8B57' } }}
            />
            <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: '#FF4500', '&:hover': { bgcolor: '#FF6347' } }} disabled={loading}>
              Add Rent Log
            </Button>
          </form>
          </Box>
          {rentEntries.length === 0 ? (
            <Typography sx={{ margin: '2rem auto', textAlign: 'center', color: '#8B0000', bgcolor: '#fff', padding: '20px', maxWidth: '992px', }}>No data</Typography>
          ) : (
            <Box className="table-container logs-table-container">
                   <Typography variant="h5" align="center" gutterBottom sx={{ color: '#8B0000', fontWeight: 'bold', fontSize: '1.5rem', mb: 4 }}>
          Rent Records
        </Typography>
              <Table sx={{ border: '1px solid #2E8B57' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#2E8B57' }}>
                    <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Month</TableCell>
                    <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Amount (Rs)</TableCell>
                    <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rentEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>{entry.month}</TableCell>
                      <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>{entry.amount}</TableCell>
                      <TableCell>
                        {user.role === 'Admin' && (
                          <IconButton onClick={() => handleDelete(entry.id)} disabled={loading}>
                            <Delete sx={{ color: '#FF4500' }} />
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
    </LocalizationProvider>
  );
}

export default RentPage;