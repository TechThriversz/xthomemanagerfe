import { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';
import { getMilk, createMilk, getBills, createBill, getRent, createRent } from '../services/api';

function Dashboard({ user }) {
  const [milkData, setMilkData] = useState([]);
  const [billData, setBillData] = useState([]);
  const [rentData, setRentData] = useState([]);
  const [milkForm, setMilkForm] = useState({ quantity: '', date: '' });
  const [billForm, setBillForm] = useState({ amount: '', description: '' });
  const [rentForm, setRentForm] = useState({ amount: '', month: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [milkRes, billRes, rentRes] = await Promise.all([
        getMilk(),
        getBills(),
        getRent(),
      ]);
      setMilkData(milkRes.data);
      setBillData(billRes.data);
      setRentData(rentRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    }
  };

  const handleMilkSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMilk({ ...milkForm, userId: user.id });
      fetchData();
      setMilkForm({ quantity: '', date: '' });
    } catch (err) {
      setError('Failed to add milk');
    }
  };

  const handleBillSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBill({ ...billForm, userId: user.id });
      fetchData();
      setBillForm({ amount: '', description: '' });
    } catch (err) {
      setError('Failed to add bill');
    }
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRent({ ...rentForm, userId: user.id });
      fetchData();
      setRentForm({ amount: '', month: '' });
    } catch (err) {
      setError('Failed to add rent');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.email} ({user.role})
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={3}>
        {user.role === 'Admin' && (
          <>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Add Milk</Typography>
                  <form onSubmit={handleMilkSubmit}>
                    <TextField
                      label="Quantity (liters)"
                      type="number"
                      fullWidth
                      margin="normal"
                      value={milkForm.quantity}
                      onChange={(e) =>
                        setMilkForm({ ...milkForm, quantity: e.target.value })
                      }
                      required
                    />
                    <TextField
                      label="Date"
                      type="date"
                      fullWidth
                      margin="normal"
                      value={milkForm.date}
                      onChange={(e) =>
                        setMilkForm({ ...milkForm, date: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Add Milk
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Add Bill</Typography>
                  <form onSubmit={handleBillSubmit}>
                    <TextField
                      label="Amount"
                      type="number"
                      fullWidth
                      margin="normal"
                      value={billForm.amount}
                      onChange={(e) =>
                        setBillForm({ ...billForm, amount: e.target.value })
                      }
                      required
                    />
                    <TextField
                      label="Description"
                      fullWidth
                      margin="normal"
                      value={billForm.description}
                      onChange={(e) =>
                        setBillForm({ ...billForm, description: e.target.value })
                      }
                      required
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Add Bill
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Add Rent</Typography>
                  <form onSubmit={handleRentSubmit}>
                    <TextField
                      label="Amount"
                      type="number"
                      fullWidth
                      margin="normal"
                      value={rentForm.amount}
                      onChange={(e) =>
                        setRentForm({ ...rentForm, amount: e.target.value })
                      }
                      required
                    />
                    <TextField
                      label="Month"
                      fullWidth
                      margin="normal"
                      value={rentForm.month}
                      onChange={(e) =>
                        setRentForm({ ...rentForm, month: e.target.value })
                      }
                      required
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Add Rent
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Milk Records</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Quantity (liters)</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>User ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {milkData.map((milk) => (
                    <TableRow key={milk.id}>
                      <TableCell>{milk.id}</TableCell>
                      <TableCell>{milk.quantity}</TableCell>
                      <TableCell>{milk.date}</TableCell>
                      <TableCell>{milk.userId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Bills</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>User ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billData.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.id}</TableCell>
                      <TableCell>{bill.amount}</TableCell>
                      <TableCell>{bill.description}</TableCell>
                      <TableCell>{bill.userId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Rent Records</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>User ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rentData.map((rent) => (
                    <TableRow key={rent.id}>
                      <TableCell>{rent.id}</TableCell>
                      <TableCell>{rent.amount}</TableCell>
                      <TableCell>{rent.month}</TableCell>
                      <TableCell>{rent.userId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;