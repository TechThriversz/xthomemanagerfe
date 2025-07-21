import { useState, useEffect } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Select, MenuItem, Box, Alert
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfMonth } from 'date-fns';
import { getRecords, getMilkAnalytics } from '../services/api';

function DashboardPage({ user }) {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (records.length > 0) fetchAnalytics();
  }, [records, selectedMonth]);

  const fetchRecords = async () => {
    try {
      const res = await getRecords();
      setRecords(res.data.filter(r => r.type === 'Milk'));
    } catch (err) {
      setError('Failed to fetch records');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const month = format(selectedMonth, 'yyyy-MM');
      const analyticsData = await Promise.all(
        records.map(async (record) => {
          const res = await getMilkAnalytics(record.id, month);
          return { ...res.data, recordName: record.name };
        })
      );
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to fetch analytics');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <DatePicker
          views={['year', 'month']}
          label="Select Month"
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Record</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Total Quantity (liters)</TableCell>
              <TableCell>Total Cost (Rs)</TableCell>
              <TableCell>Bought Days</TableCell>
              <TableCell>Leave Days</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analytics.map((item) => (
              <TableRow key={`${item.recordName}-${item.month}`}>
                <TableCell>{item.recordName}</TableCell>
                <TableCell>{item.month}</TableCell>
                <TableCell>{item.totalQuantity}</TableCell>
                <TableCell>{item.totalCost}</TableCell>
                <TableCell>{item.boughtDays}</TableCell>
                <TableCell>{item.leaveDays}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </LocalizationProvider>
  );
}

export default DashboardPage;