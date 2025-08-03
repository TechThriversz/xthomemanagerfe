import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, CircularProgress } from '@mui/material'; // Added CircularProgress to import
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import RecordDetail from './pages/RecordDetail';
import RecordsPage from './pages/RecordsPage';
import MilkPage from './pages/MilkPage';
import RentPage from './pages/RentPage';
import BillsPage from './pages/BillsPage';
import MilkListPage from './pages/MilkListPage';
import RentListPage from './pages/RentListPage';
import BillsListPage from './pages/BillsListPage';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import InviteViewer from './pages/InviteViewer';
import MilkHistoryPage from './pages/MilkHistoryPage';
import Layout from './components/Layout';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [currentRecordId, setCurrentRecordId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('user');
          navigate('/login');
        }
      } catch (e) {
        console.error('Invalid user data in localStorage:', e);
        localStorage.removeItem('user');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    setLoading(false); // Set loading to false after check
  }, [navigate]);

  useEffect(() => {
    // Extract recordId from the URL if on a milk page
    const match = location.pathname.match(/\/milk\/(\d+)/);
    if (match) {
      setCurrentRecordId(match[1]);
    } else {
      setCurrentRecordId(null);
    }
  }, [location.pathname]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f2f2f2', minHeight: '100vh', display: 'flex', width: '100%' }} className="app-layout" >
      <CssBaseline />
      {user ? (
        <Layout user={user} onLogout={handleLogout} >
          <Routes>
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
            <Route path="/records" element={<RecordsPage user={user} />} />
            <Route path="/milk" element={<MilkListPage user={user} />} />
            <Route path="/milk/:recordId/:name" element={<MilkPage user={user} />} />
            <Route path="/rent" element={<RentListPage user={user} />} />
            <Route path="/rent/:recordId/:name" element={<RentPage user={user} />} />
            <Route path="/bills" element={<BillsListPage user={user} />} />
            <Route path="/bills/:recordId/:name" element={<BillsPage user={user} />} />
            <Route path="/settings" element={<SettingsPage user={user} setUser={updateUser} />} />
            <Route path="/invite" element={<InviteViewer user={user} />} />
            <Route path="/record/:recordId" element={<RecordDetail user={user} />} />
            <Route path="/milk/:recordId/history" element={<MilkHistoryPage user={user} />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleLogin} />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} /> {/* Redirect all unauthorized routes to login */}
        </Routes>
      )}
    </Box>
  );
}

export default App;