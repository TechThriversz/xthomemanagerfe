import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { AttachMoney, People, Lock, Healing } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getRecords, getMilkAnalytics, getBillsAnalytics, getRentAnalytics, getDashboardSummary } from '../services/api';
import '../App.css';

function DashboardPage({ user }) {
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState({ totalCost: 0, totalRent: 0, totalBills: 0 });
  const [dashboardSummary, setDashboardSummary] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setError('User not authenticated. Please log in again.');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, summaryRes] = await Promise.all([getRecords(), getDashboardSummary()]);
      setRecords(recordsRes.data || []);
      setDashboardSummary(summaryRes.data || {});
      const analyticsData = { totalCost: 0, totalRent: 0, totalBills: 0 };

      for (const record of recordsRes.data) {
        try {
          if (record.type === 'Milk') {
            const analyticsRes = await getMilkAnalytics(record.id);
            analyticsData.totalCost += analyticsRes.data.totalCost || 0;
          } else if (record.type === 'Bill') {
            const analyticsRes = await getBillsAnalytics(record.id);
            analyticsData.totalBills += analyticsRes.data.totalAmount || 0;
          } else if (record.type === 'Rent') {
            const analyticsRes = await getRentAnalytics(record.id);
            analyticsData.totalRent += analyticsRes.data.totalAmount || 0;
          }
        } catch (err) {
          console.error(`Failed to fetch analytics for record ${record.id}:`, err);
        }
      }
      setAnalytics(analyticsData);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Real data for Milk, Rent, Bills
  const totalExpense = analytics.totalCost + analytics.totalRent + analytics.totalBills || 0;
  const milkCostData = [{ name: 'Jan', cost: 5000 }, { name: 'Feb', cost: 5200 }, { name: 'Mar', cost: 4800 }]; // Placeholder, replace with API data
  const boughtVsLeaveData = [
    { name: 'Bought', value: 70 },
    { name: 'Leave', value: 30 },
  ];
  const billHistoryData = [{ name: 'Jan', amount: 3000 }, { name: 'Feb', amount: 3200 }, { name: 'Mar', amount: 2800 }]; // Placeholder
  const rentByPropertyData = records
    .filter(r => r.type === 'Rent')
    .map(async (r, index) => ({ name: `Property ${index + 1}`, value: (await getRentAnalytics(r.id)).data.totalAmount || 0 }));
  const expenseBreakdownData = [
    { name: 'Milk', value: analytics.totalCost },
    { name: 'Rent', value: analytics.totalRent },
    { name: 'Bills', value: analytics.totalBills },
  ];

  // Dummy data for Family, Passwords, Medical
  const familyDistributionData = [
    { name: 'Parent', value: 2 },
    { name: 'Sibling', value: 3 },
    { name: 'Child', value: 1 },
  ];
  const sharedDataCountData = [
    { name: 'Shared', value: 15 },
    { name: 'Not Shared', value: 5 },
  ];
  const oldestYoungestData = { oldest: 'John (50)', youngest: 'Jane (5)' }; // Dummy
  const genderSplitData = [
    { name: 'Male', value: 4 },
    { name: 'Female', value: 2 },
  ];
  const passwordCategoryData = [
    { name: 'Email', value: 20 },
    { name: 'Banking', value: 15 },
    { name: 'Social', value: 12 },
  ];
  const passwordWebsiteData = [
    { name: 'Google', value: 10 },
    { name: 'Facebook', value: 8 },
    { name: 'Bank', value: 7 },
  ];
  const weakPasswordData = { count: 3 }; // Dummy
  const recordsByMemberData = [
    { name: 'John', value: 5 },
    { name: 'Jane', value: 3 },
  ];
  const medicalVisitsData = [{ name: 'Jan', visits: 2 }, { name: 'Feb', visits: 1 }, { name: 'Mar', visits: 3 }];
  const reportsByTypeData = [
    { name: 'Lab', value: 5 },
    { name: 'Imaging', value: 4 },
    { name: 'Prescription', value: 3 },
  ];

  const cardStyles = [
  { background: 'linear-gradient(135deg, #2563EB, #3B82F6)' },
  { background: 'linear-gradient(135deg, #059669, #10B981)' },
  { background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' },
  { background: 'linear-gradient(135deg, #D97706, #F59E0B)' }
];

  return (
    <Box sx={{ p: 4, bgcolor: '#F3F4F6', minHeight: '100vh' }}>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
  <Box>
    <Typography variant="h5" fontWeight="bold">
      {(() => {
        const hour = new Date().getHours();
        if (hour < 12) return `Good Morning, ${user?.fullName || 'User'}!`;
        if (hour < 18) return `Good Afternoon, ${user?.fullName || 'User'}!`;
        return `Good Evening, ${user?.fullName || 'User'}!`;
      })()}
    </Typography>
    <Typography variant="subtitle1">Welcome back to your dashboard.</Typography>
  </Box>
  <Box textAlign="right">
    <Typography variant="body1">
      {new Date().toLocaleDateString('en-PK', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })}
    </Typography>
    <Typography variant="body2">
      {new Date().toLocaleTimeString('en-PK')}
    </Typography>
  </Box>
</Box>

          {/* KPI Cards */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
  {[
    { icon: <AttachMoney sx={{ fontSize: 40, color: '#BFDBFE' }} />, label: 'Total Monthly Expense', value: `Rs ${totalExpense.toLocaleString()}` },
    { icon: <People sx={{ fontSize: 40, color: '#A7F3D0' }} />, label: 'Active Family Members', value: `${dashboardSummary.activeFamilyMembers || 6} Members` },
    { icon: <Lock sx={{ fontSize: 40, color: '#DDD6FE' }} />, label: 'Total Stored Passwords', value: dashboardSummary.totalPasswords || 47 },
    { icon: <Healing sx={{ fontSize: 40, color: '#FDE68A' }} />, label: 'Medical Records Count', value: dashboardSummary.medicalRecords || 12 }
  ].map((item, i) => (
    <Grid item xs={12} sm={6} md={3} key={i}>
      <Card sx={{ ...cardStyles[i], color: '#fff', borderRadius: 2, boxShadow: 3, '&:hover': { boxShadow: 6 } }}>
        <CardContent>
          {item.icon}
          <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>{item.label}</Typography>
          <Typography variant="h6">{item.value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>

          {/* Milk Section */}
          <Typography variant="h5" gutterBottom sx={{ color: '#1E3A8A', fontWeight: 700, mb: 3 }}>
            Milk Analytics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 3, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Milk Cost per Month</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={milkCostData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cost" stroke="#3B82F6" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 3, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Bought vs Leave Days</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={boughtVsLeaveData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {boughtVsLeaveData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B'][index % 2]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>

          {/* Bills Section */}
          <Typography variant="h5" gutterBottom sx={{ color: '#1E3A8A', fontWeight: 700, mb: 3 }}>
            Bills Analytics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={12}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 3, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Electricity Bill History</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={billHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8B5CF6" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>

          {/* Rent Section */}
          <Typography variant="h5" gutterBottom sx={{ color: '#1E3A8A', fontWeight: 700, mb: 3 }}>
            Rent Analytics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={12}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 3, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Rent by Property</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rentByPropertyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>

          {/* Expense Breakdown */}
          <Typography variant="h5" gutterBottom sx={{ color: '#1E3A8A', fontWeight: 700, mb: 3 }}>
            Expense Overview
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={12}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 3, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Expense Breakdown</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdownData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label
                    >
                      {expenseBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#8B5CF6'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>

          {/* Family Section (Dummy) */}
          <Typography variant="h5" gutterBottom sx={{ color: '#1E3A8A', fontWeight: 700, mb: 3 }}>
            Family Insights
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 3, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Family Member Distribution</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={familyDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {familyDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#3B82F6'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 3, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Gender Split</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={genderSplitData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {genderSplitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#8B5CF6'][index % 2]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>

          {/* Password Section (Dummy) */}
          <Typography variant="h5" gutterBottom sx={{ color: '#1E3A8A', fontWeight: 700, mb: 3 }}>
            Password Insights
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 3, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Passwords Stored by Category</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={passwordCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 2, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Passwords by Website</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={passwordWebsiteData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {passwordWebsiteData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>

          {/* Medical Section (Dummy) */}
          <Typography variant="h5" gutterBottom sx={{ color: '#1E3A8A', fontWeight: 700, mb: 3 }}>
            Medical Insights
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 3, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Records by Member</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={recordsByMemberData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, p: 3, boxShadow: 1, minHeight: 350, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1E40AF', mb: 2 }}>Medical Visits Timeline</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={medicalVisitsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#10B981" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

export default DashboardPage;