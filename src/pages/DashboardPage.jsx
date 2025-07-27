import { useState, useEffect } from 'react';
import { Box, Typography, Alert, Grid, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import { LocalDrink, AttachMoney, Home, Receipt } from '@mui/icons-material';
import { getRecords, getMilkAnalytics, getBillsAnalytics, getRentAnalytics } from '../services/api';
import '../App.css';

function DashboardPage({ user }) {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('DashboardPage: Received user:', user);
    if (!user?.id) {
      setError('User not authenticated. Please log in again.');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const recordsRes = await getRecords();
      setRecords(recordsRes.data);
      const analyticsData = {};
      let totalMilk = 0, totalCost = 0, totalRent = 0, totalBills = 0;

      for (const record of recordsRes.data) {
        try {
          if (record.type === 'Milk') {
            const analyticsRes = await getMilkAnalytics(record.id);
            analyticsData[record.id] = analyticsRes.data;
            totalMilk += analyticsRes.data.totalQuantity || 0;
            totalCost += analyticsRes.data.totalCost || 0;
          } else if (record.type === 'Bill') {
            const analyticsRes = await getBillsAnalytics(record.id);
            analyticsData[record.id] = analyticsRes.data;
            totalBills += analyticsRes.data.totalAmount || 0;
          } else if (record.type === 'Rent') {
            const analyticsRes = await getRentAnalytics(record.id);
            analyticsData[record.id] = analyticsRes.data;
            totalRent += analyticsRes.data.totalAmount || 0;
          }
        } catch (err) {
          console.error(`DashboardPage: Failed to fetch analytics for record ${record.id}:`, err);
          analyticsData[record.id] = { totalQuantity: 0, totalCost: 0, totalAmount: 0 };
        }
      }
      setAnalytics({ ...analyticsData, totalMilk, totalCost, totalRent, totalBills });
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="dashboard-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#8B0000' }}>
          Welcome {user?.fullName || 'User'} to Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#FF4500' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#FFF3E0', color: '#8B0000' }} onClose={() => setError('')}>{error}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#FF4500' }} />}
      <Grid className="analytical-boxes-grid" container spacing={4}>
        <Grid item xs={12} sm={4} md={4} lg={6}>
          <Card sx={{ bgcolor: '#2E8B57', color: '#FFF', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalDrink sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6">Total Milk</Typography>
                <Typography variant="h5">{analytics.totalMilk || 0} Liters</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Card sx={{ bgcolor: '#FF4500', color: '#FFF', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6">Total Milk Cost</Typography>
                <Typography variant="h5">Rs {analytics.totalCost || 0}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Card sx={{ bgcolor: '#8B0000', color: '#FFF', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Home sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6">Total Rent</Typography>
                <Typography variant="h5">Rs {analytics.totalRent || 0}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={2} md={2}>
          <Card sx={{ bgcolor: '#FFA500', color: '#FFF', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Receipt sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6">Total Bills</Typography>
                <Typography variant="h5">Rs {analytics.totalBills || 0}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 16 }}>
        <Typography variant="h5" sx={{ color: '#8B0000', mb: 2 }}>Records Summary</Typography>
        {records.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: '#8B0000' }}>No data</Typography>
        ) : (
          <Box className="table-container">
            <Table sx={{ border: '1px solid #2E8B57' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#2E8B57' }}>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Name</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Type</TableCell>
                  <TableCell sx={{ color: '#FFF', border: '1px solid #FFF3E0' }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>{record.name}</TableCell>
                    <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>{record.type}</TableCell>
                    <TableCell sx={{ color: '#2E8B57', border: '1px solid #2E8B57' }}>
                      {analytics[record.id] ? (
                        <>
                          {record.type === 'Milk' && (
                            <Typography>
                              Total Quantity: {analytics[record.id].totalQuantity} Liters, Total Cost: Rs {analytics[record.id].totalCost}
                            </Typography>
                          )}
                          {record.type === 'Bill' && (
                            <Typography>
                              Total Amount: Rs {analytics[record.id].totalAmount}
                            </Typography>
                          )}
                          {record.type === 'Rent' && (
                            <Typography>
                              Total Amount: Rs {analytics[record.id].totalAmount}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography>No analytics data available.</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DashboardPage;