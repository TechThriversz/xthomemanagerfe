import { useState, useEffect } from 'react';
import {
  Typography, Box, Select, MenuItem, Alert, Paper, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { getMilkAnalytics, getBillsAnalytics, getRentAnalytics, getRecords } from '../services/api';
import { format, subMonths } from 'date-fns';

function DashboardPage({ user }) {
  const [records, setRecords] = useState([]);
  const [milkAnalytics, setMilkAnalytics] = useState([]);
  const [billsAnalytics, setBillsAnalytics] = useState([]);
  const [rentAnalytics, setRentAnalytics] = useState([]);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (records.length) {
      fetchAnalytics();
    }
  }, [records, month]);

  const fetchRecords = async () => {
    try {
      const res = await getRecords();
      setRecords(res.data);
    } catch (err) {
      setError('Failed to fetch records: ' + err.message);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setError('');
      const milkRecords = records.filter(r => r.type === 'Milk');
      const billRecords = records.filter(r => r.type === 'Bill');
      const rentRecords = records.filter(r => r.type === 'Rent');
      const milkPromises = milkRecords.map(r => getMilkAnalytics(r.id, month).catch(() => ({ data: { recordId: r.id, totalQuantity: 0, totalCost: 0 } })));
      const billPromises = billRecords.map(r => getBillsAnalytics(r.id, month).catch(() => ({ data: { recordId: r.id, totalAmount: 0 } })));
      const rentPromises = rentRecords.map(r => getRentAnalytics(r.id, month).catch(() => ({ data: { recordId: r.id, totalAmount: 0 } })));
      const [milkResults, billResults, rentResults] = await Promise.all([
        Promise.all(milkPromises),
        Promise.all(billPromises),
        Promise.all(rentPromises)
      ]);
      setMilkAnalytics(milkResults.map(res => res.data));
      setBillsAnalytics(billResults.map(res => res.data));
      setRentAnalytics(rentResults.map(res => res.data));
    } catch (err) {
      setError('Failed to fetch analytics: ' + err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      <Select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        sx={{ mb: 2 }}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const date = subMonths(new Date(), i);
          return <MenuItem key={i} value={format(date, 'yyyy-MM')}>{format(date, 'MMMM yyyy')}</MenuItem>;
        })}
      </Select>
      <Paper sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ p: 2 }}>Milk Analytics</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Record Name</TableCell>
              <TableCell>Total Quantity (liters)</TableCell>
              <TableCell>Total Cost (Rs)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {milkAnalytics.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{records.find(r => r.id === data.recordId)?.name || 'Unknown'}</TableCell>
                <TableCell>{data.totalQuantity || 0}</TableCell>
                <TableCell>{data.totalCost || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Paper sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ p: 2 }}>Bill Analytics</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Record Name</TableCell>
              <TableCell>Total Amount (Rs)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billsAnalytics.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{records.find(r => r.id === data.recordId)?.name || 'Unknown'}</TableCell>
                <TableCell>{data.totalAmount || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Paper>
        <Typography variant="h6" sx={{ p: 2 }}>Rent Analytics</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Record Name</TableCell>
              <TableCell>Total Amount (Rs)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rentAnalytics.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{records.find(r => r.id === data.recordId)?.name || 'Unknown'}</TableCell>
                <TableCell>{data.totalAmount || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default DashboardPage;