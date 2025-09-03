import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import RecordsPage from './pages/RecordsPage';
import MilkListPage from './pages/MilkListPage';
import MilkPage from './pages/MilkPage';
import RentListPage from './pages/RentListPage';
import RentPage from './pages/RentPage';
import BillsListPage from './pages/BillsListPage';
import BillsPage from './pages/BillsPage';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import InviteViewer from './pages/InviteViewer';
import ForgotPassword from './pages/ForgotPassword'; // NEW
import ResetPassword from './pages/ResetPassword';   // NEW

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) {
          setUser(parsedUser);
        } else {
          localStorage.clear();
        }
      } catch (e) {
        console.error('Invalid user data in localStorage:', e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      const publicPaths = ['/login', '/register', '/forgot-password'];
      const isPublic = publicPaths.includes(location.pathname) || location.pathname.startsWith('/reset-password');
      
      if (user && isPublic) {
        navigate('/dashboard');
      } else if (!user && !isPublic) {
        navigate('/login');
      }
    }
  }, [user, loading, location.pathname, navigate]);

  const handleAuth = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    navigate('/login');
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f2f2f2', minHeight: '100vh', display: 'flex', width: '100%' }} className="app-layout">
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login onLogin={handleAuth} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onRegister={handleAuth} /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        {user ? (
          <Route path="/*" element={
            <Layout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="dashboard" element={<DashboardPage user={user} />} />
                <Route path="records" element={<RecordsPage user={user} />} />
                <Route path="milk" element={<MilkListPage user={user} />} />
                <Route path="milk/:recordId/:name" element={<MilkPage user={user} />} />
                <Route path="rent" element={<RentListPage user={user} />} />
                <Route path="rent/:recordId/:name" element={<RentPage user={user} />} />
                <Route path="bills" element={<BillsListPage user={user} />} />
                <Route path="bills/:recordId/:name" element={<BillsPage user={user} />} />
                <Route path="settings" element={<SettingsPage user={user} setUser={updateUser} />} />
                <Route path="invite" element={<InviteViewer user={user} />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          } />
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Box>
  );
}

export default App;

