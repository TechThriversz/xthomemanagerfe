import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import RecordsPage from './pages/RecordsPage';
import RecordDetail from './pages/RecordDetail';
import InviteViewer from './pages/InviteViewer';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import { useState } from 'react';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <DashboardPage user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/records"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <RecordsPage user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/record/:recordId"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <RecordDetail user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/invite"
          element={
            user && user.role === 'Admin' ? (
              <Layout user={user} onLogout={handleLogout}>
                <InviteViewer user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/settings"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <SettingsPage user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;