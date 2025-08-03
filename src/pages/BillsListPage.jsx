import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import { getRecords } from '../services/api';
import '../App.css';

function BillsListPage({ user }) {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setError('Please log in to view this page');
      navigate('/login');
      return;
    }
    fetchBillsRecords();
  }, [user, navigate]);

  const fetchBillsRecords = async () => {
    setLoading(true);
    try {
      const response = await getRecords();
      const billRecords = response.data.filter(record => record.type === 'Bill');
      setRecords(billRecords);
      setError('');
    } catch (err) {
      setError('Failed to fetch bill records: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id, name) => {
   navigate(`/bills/${id}/${name.replace(/ /g, '-')}`);
  };

  return (
    <Box className="record-container">
      <Typography variant="h5" align="center" gutterBottom sx={{ color: '#222222' }}>
        Bill Records
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#222222' }} onClose={() => setError('')}>{error}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1a2a44' }} />}
      {records.length === 0 && !loading && (
        <Typography sx={{ mt: 2, textAlign: 'center', color: '#222222' }}>No bill records</Typography>
      )}
      {records.length > 0 && (
        <Box className="table-container">
          <Table sx={{ border: '1px solid #1a2a44' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1a2a44' }}>
                <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Name</TableCell>
                <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} onClick={() => handleRowClick(record.id, record.name)} style={{ cursor: 'pointer' }}>
                  <TableCell sx={{ border: '1px solid #1a2a44' }}><b>{record.name}</b></TableCell>
                  <TableCell sx={{ color: '#1a2a44', border: '1px solid #1a2a44' }}>{record.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}

export default BillsListPage;