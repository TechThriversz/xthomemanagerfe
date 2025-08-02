import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
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

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [currentRecordId, setCurrentRecordId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
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

  return (
    <Box sx={{ bgcolor: '#f2f2f2', minHeight: '100vh', display: 'flex' }}>
      <CssBaseline />
      {user && (
        <>
          <TopBar user={user} onLogout={handleLogout} />
          <Sidebar user={user} currentRecordId={currentRecordId} /> {/* Pass currentRecordId */}
        </>
      )}
      <Box id="root" className={`content-container ${user ? 'with-sidebar' : 'no-sidebar'}`}>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleLogin} />} />
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
      </Box>
    </Box>
  );
}

export default App;