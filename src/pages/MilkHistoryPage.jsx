import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Alert, Select, MenuItem } from '@mui/material';
import { getMilk } from '../services/api';
import '../App.css';

function MilkHistoryPage({ user }) {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [milkEntries, setMilkEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Current month (yyyy-MM)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      setError('Please log in to view this page');
      navigate('/login');
      return;
    }
    fetchMonths();
    fetchMilkEntries();
  }, [recordId, user, navigate, selectedMonth]);

  const fetchMonths = async () => {
    setLoading(true);
    try {
      const response = await getMilk(recordId);
      const uniqueMonths = [...new Set(response.data.map(entry => entry.date.slice(0, 7)))].sort().reverse();
      setMonths(uniqueMonths);
      if (!uniqueMonths.includes(selectedMonth)) {
        setSelectedMonth(uniqueMonths[0] || new Date().toISOString().slice(0, 7));
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch months: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchMilkEntries = async () => {
    setLoading(true);
    try {
      const response = await getMilk(recordId);
      const filteredEntries = response.data.filter(entry => entry.date.slice(0, 7) === selectedMonth);
      setMilkEntries(filteredEntries || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch milk entries: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const totalQuantity = milkEntries.reduce((sum, entry) => sum + (entry.status !== 'Leave' ? entry.quantityLiters : 0), 0);
  const totalCost = milkEntries.reduce((sum, entry) => sum + (entry.status !== 'Leave' ? entry.totalCost : 0), 0);
  const totalLeaves = milkEntries.filter(entry => entry.status === 'Leave').length;

  return (
    <Box className="milk-container">
      <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222', fontWeight: 'bold', fontSize: '1.5rem', mb: 4 }}>
        Milk History
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#222222' }} onClose={() => setError('')}>{error}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1a2a44' }} />}
      <Box sx={{ mb: 2 }}>
        <Select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          sx={{ '& .MuiInputLabel-root': { color: '#222222' }, '& .MuiSelect-select': { color: '#1a2a44' } }}
        >
          {months.map(month => (
            <MenuItem key={month} value={month}>{new Date(`${month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}</MenuItem>
          ))}
        </Select>
      </Box>
      {milkEntries.length === 0 ? (
        <Typography sx={{ margin: '2rem auto', textAlign: 'center', color: '#222222', bgcolor: '#fff', padding: '20px', maxWidth: '992px' }}>No data for {selectedMonth}</Typography>
      ) : (
        <Box className="table-container logs-table-container">
          <Table sx={{ border: '1px solid #1a2a44' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a2a44' }}>
                <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Date</TableCell>
                <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Quantity (Liters)</TableCell>
                <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {milkEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.quantityLiters}</TableCell>
                  <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{entry.status || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ mt: 2, textAlign: 'right', color: '#1a2a44' }}>
            <Typography>Total Quantity: {totalQuantity} Liters</Typography>
            <Typography>Total Cost: {totalCost} Rs</Typography>
            <Typography>Total Leaves: {totalLeaves}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default MilkHistoryPage;