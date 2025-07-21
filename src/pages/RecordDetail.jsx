import { useState, useEffect } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, Alert, Tabs, Tab, IconButton,
  Box
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useParams } from 'react-router-dom';
import { format, startOfMonth, subMonths } from 'date-fns';
import {
  getRecords, getMilk, createMilk, deleteMilk, getBills, createBill, deleteBill,
  getRent, createRent, deleteRent
} from '../services/api';

function RecordDetail({ user }) {
  const { recordId } = useParams();
  const [record, setRecord] = useState(null);
  const [milkData, setMilkData] = useState([]);
  const [billData, setBillData] = useState([]);
  const [rentData, setRentData] = useState([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [milkForm, setMilkForm] = useState({ quantityLiters: '', status: 'Bought', date: new Date() });
  const [filter, setFilter] = useState({ type: 'all', startDate: null, endDate: null });
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetchRecord();
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [recordId, filter]);

  const fetchRecord = async () => {
    try {
      const res = await getRecords();
      const found = res.data.find(r => r.id === recordId);
      setRecord(found);
    } catch (err) {
      setError('Failed to fetch record');
    }
  };

  const fetchData = async () => {
    try {
      if (record?.type === 'Milk') {
        const res = await getMilk(recordId);
        let filtered = res.data;
        if (filter.type !== 'all') {
          const start = filter.startDate || subMonths(new Date(), 1);
          const end = filter.endDate || new Date();
          filtered = filtered.filter(m => {
            const date = new Date(m.date);
            return date >= start && date <= end;
          });
        }
        setMilkData(filtered);
      } else if (record?.type === 'Bill') {
        const res = await getBills(recordId);
        setBillData(res.data);
      } else if (record?.type === 'Rent') {
        const res = await getRent(recordId);
        setRentData(res.data);
      }
    } catch (err) {
      setError('Failed to fetch data');
    }
  };

  const handleMilkSubmit = async () => {
    try {
      await createMilk({ ...milkForm, recordId, date: format(milkForm.date, 'yyyy-MM-dd') });
      setMilkForm({ quantityLiters: '', status: 'Bought', date: new Date() });
      setOpen(false);
      fetchData();
    } catch (err) {
      setError('Failed to add milk log');
    }
  };

  const handleDeleteMilk = async (id) => {
    try {
      await deleteMilk(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete milk log');
    }
  };

  if (!record) return <Typography>Loading...</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          {record.name} ({record.type}) - Created by {record.user?.fullName}
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
            {filter.type !== 'all' && (
              <>
                <DatePicker
                  label="Start Date"
                  value={filter.startDate}
                  onChange={(date) => setFilter({ ...filter, startDate: date })}
                />
                <DatePicker
                  label="End Date"
                  value={filter.endDate}
                  onChange={(date) => setFilter({ ...filter, endDate: date })}
                />
              </>
            )}
          </Box>
          {user.role === 'Admin' && (
            <Button variant="contained" onClick={() => setOpen(true)}>
              Add {record.type} Log
            </Button>
          )}
        </Box>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="List View" />
        </Tabs>
        {tab === 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                {record.type === 'Milk' && (
                  <>
                    <TableCell>Quantity (liters)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Rate/Liter (Rs)</TableCell>
                    <TableCell>Total Cost (Rs)</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {record.type === 'Milk' && milkData.map((milk) => (
                <TableRow key={milk.id} sx={{ backgroundColor: milk.status === 'Leave' ? '#ffe6e6' : 'inherit' }}>
                  <TableCell>{milk.id}</TableCell>
                  <TableCell>{milk.status === 'Leave' ? 'N/A' : milk.quantityLiters}</TableCell>
                  <TableCell>{milk.status}</TableCell>
                  <TableCell>{milk.status === 'Leave' ? 'N/A' : milk.ratePerLiter}</TableCell>
                  <TableCell>{milk.status === 'Leave' ? 'N/A' : milk.totalCost}</TableCell>
                  <TableCell>{format(new Date(milk.date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => alert('Edit functionality TBD')}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteMilk(milk.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Add {record.type} Log</DialogTitle>
          <DialogContent>
            {record.type === 'Milk' && (
              <>
                <TextField
                  label="Quantity (liters)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={milkForm.quantityLiters}
                  onChange={(e) => setMilkForm({ ...milkForm, quantityLiters: e.target.value })}
                  disabled={milkForm.status === 'Leave'}
                />
                <Select
                  label="Status"
                  fullWidth
                  value={milkForm.status}
                  onChange={(e) => setMilkForm({ ...milkForm, status: e.target.value })}
                >
                  <MenuItem value="Bought">Bought</MenuItem>
                  <MenuItem value="Leave">Leave</MenuItem>
                </Select>
                <DatePicker
                  label="Date"
                  value={milkForm.date}
                  onChange={(date) => setMilkForm({ ...milkForm, date })}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleMilkSubmit} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default RecordDetail;