// src/pages/AdminUsersPage.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Alert, CircularProgress } from '@mui/material';
import { getUsers, toggleUserStatus } from '../services/api';
import { toast } from 'react-toastify';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
      toast.error('Could not load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      toast.success(`User ${!currentStatus ? 'has been Active' : 'has been Deactivated'}`);
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#1A2A44', fontWeight: 'bold' }}>
        User Management
      </Typography>

      {users.length === 0 ? (
        <Alert severity="info">No users found</Alert>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead sx={{ bgcolor: '#1A2A44' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      bgcolor: user.role === 'Admin' ? '#FF6B6B' : '#4ECDC4',
                      color: 'white',
                      px: 1.5, py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.8rem',
                      display: 'inline-block'
                    }}>
                      {user.role}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={user.isActive}
                      onChange={() => handleToggle(user.id, user.isActive)}
                      color="primary"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default AdminUsersPage;