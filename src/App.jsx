import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import InviteViewer from './pages/InviteViewer';
import RecordsPage from './pages/RecordsPage';
import RecordDetail from './pages/RecordDetail';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';
import Layout from './components/Layout';

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
        background: { default: '#f5f5f5' },
    },
});

function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    useEffect(() => {
        console.log('App: User state initialized:', user); // Debug user state
    }, [user]);

    const handleLogin = (userData) => {
        console.log('App: handleLogin received:', userData); // Debug login data
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        console.log('App: Logging out, clearing user and token');
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
                <Route
                    path="/login"
                    element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
                />
                <Route
                    path="/register"
                    element={user ? <Navigate to="/dashboard" /> : <Register />}
                />
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
                    path="/invite"
                    element={
                        user && user.role === 'Admin' ? (
                            <Layout user={user} onLogout={handleLogout}>
                                <InviteViewer />
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
                    path="/settings"
                    element={
                        user && user.role === 'Admin' ? (
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
        </ThemeProvider>
    );
}

export default App;