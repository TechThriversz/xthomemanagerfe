import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { getRecords } from '../services/api';
import '../App.css';

function MilkListPage({ user }) {
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
    fetchMilkRecords();
  }, [user, navigate]);

  const fetchMilkRecords = async () => {
    setLoading(true);
    try {
      const response = await getRecords();
      const milkRecords = response.data.filter(record => record.type === 'Milk');
      setRecords(milkRecords);
      setError('');
    } catch (err) {
      setError('Failed to fetch milk records: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id, name) => {
   navigate(`/milk/${id}/${name.replace(/ /g, '-')}`);
  };

  return (
    <Box className="record-container">
      <Typography variant="h5" align="center" gutterBottom sx={{ color: '#8B0000' }}>
        Milk Records
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#8B0000' }} onClose={() => setError('')}>{error}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#FF4500' }} />}
      {records.length === 0 && !loading && (
        <Typography sx={{ mt: 2, textAlign: 'center', color: '#8B0000' }}>No milk records</Typography>
      )}
      {records.length > 0 && (
        <Box className="table-container">
          <Table sx={{ border: '1px solid #2E8B57' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#2E8B57' }}>
                <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Name</TableCell>
                <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} onClick={() => handleRowClick(record.id, record.name)} style={{ cursor: 'pointer' }}>
                  <TableCell sx={{ border: '1px solid #2E8B57' }}><b>{record.name}</b></TableCell>
                  <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>{record.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}

export default MilkListPage;