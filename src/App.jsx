import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import RecordDetail from './pages/RecordDetail';
import RecordsPage from './pages/RecordsPage';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import InviteViewer from './pages/InviteViewer';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Manage user state globally

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogin = (userData) => {
    setUser(userData); // Update user state on login
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null); // Clear user state on logout
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Callback to update user state from any component
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
          <Sidebar user={user} />
        </>
      )}
      <Box id="root" className="content-container">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleLogin} />} />
          <Route path="/dashboard" element={<DashboardPage user={user} />} />
          <Route path="/record/:recordId" element={<RecordDetail user={user} />} />
          <Route path="/records" element={<RecordsPage user={user} />} />
          <Route path="/settings" element={<SettingsPage user={user} setUser={updateUser} />} /> 
          <Route path="/invite" element={<InviteViewer user={user} />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;