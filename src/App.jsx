// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from './hooks/useUser';
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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RecordsViewerPage from './pages/RecordsViewerPage';
import InvitedRecordDetailsPage from './pages/InvitedRecordDetailsPage';
import AddFamilyMemberPage from './pages/AddFamilyMemberPage';
import OtherMembersPage from './pages/OtherMembersPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import PasswordVaultPage from './pages/PasswordVaultPage';
import UpgradePage from './pages/UpgradePage';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLoading, setInitialLoading] = useState(true);

  // Load user from localStorage
  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const initialUser = storedUser && token ? JSON.parse(storedUser) : null;

  // Use custom hook
  const { user, setUser, refreshUser, loading: userLoading } = useUser(initialUser);

  useEffect(() => {
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    if (!initialLoading && !userLoading) {
      const publicPaths = ['/login', '/register', '/forgot-password'];
      const isPublic = publicPaths.includes(location.pathname) || location.pathname.startsWith('/reset-password');

      if (user && isPublic) {
        navigate('/dashboard');
      } else if (!user && !isPublic) {
        navigate('/login');
      }
    }
  }, [user, userLoading, initialLoading, location.pathname, navigate]);

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

  if (initialLoading || userLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f2f2f2', minHeight: '100vh', display: 'flex', width: '100%' }} className="app-layout">
      <ToastContainer position="top-right" autoClose={3000} />
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
                <Route path="dashboard" element={<DashboardPage user={user} refreshUser={refreshUser} />} />
                <Route path="records" element={<RecordsPage user={user} refreshUser={refreshUser} />} />
                <Route path="milk" element={<MilkListPage user={user} refreshUser={refreshUser} />} />
                <Route path="milk/:recordId/:name" element={<MilkPage user={user} refreshUser={refreshUser} />} />
                <Route path="rent" element={<RentListPage user={user} refreshUser={refreshUser} />} />
                <Route path="rent/:recordId/:name" element={<RentPage user={user} refreshUser={refreshUser} />} />
                <Route path="bills" element={<BillsListPage user={user} refreshUser={refreshUser} />} />
                <Route path="bills/:recordId/:name" element={<BillsPage user={user} refreshUser={refreshUser} />} />
                <Route path="settings" element={<SettingsPage user={user} setUser={setUser} refreshUser={refreshUser} />} />
                <Route path="invite" element={<InviteViewer user={user} refreshUser={refreshUser} />} />
                <Route path="invited-records" element={<RecordsViewerPage user={user} refreshUser={refreshUser} />} />
                <Route path="invited-record-details/:recordId" element={<InvitedRecordDetailsPage user={user} refreshUser={refreshUser} />} />
                <Route path="/add-family" element={<AddFamilyMemberPage user={user} refreshUser={refreshUser} />} />
                <Route path="/other-members" element={<OtherMembersPage />} />
                <Route path="medical-records" element={<MedicalRecordsPage user={user} refreshUser={refreshUser} />} />
                <Route path="admin/users" element={<AdminUsersPage user={user} refreshUser={refreshUser} />} />
                <Route path="password-vault" element={<PasswordVaultPage user={user} refreshUser={refreshUser} />} />
                <Route path="upgrade" element={<UpgradePage user={user} setUser={setUser} refreshUser={refreshUser} />} />
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