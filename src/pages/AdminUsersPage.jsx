// src/pages/AdminUsersPage.jsx
import { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Switch, Alert, CircularProgress, IconButton, Badge, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button 
} from '@mui/material';
import { Upgrade, CheckCircle } from '@mui/icons-material';
import { getUsers, toggleUserStatus, updateUserPermissions, approveProUpgrade } from '../services/api';
import { toast } from 'react-toastify';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleTogglePermission = async (userId, permission, currentValue) => {
    try {
      const permissions = {
        canUsePasswordVault: permission === 'passwordVault' ? !currentValue : users.find(u => u.id === userId).canUsePasswordVault,
        canUseFamilyMembers: permission === 'familyMembers' ? !currentValue : users.find(u => u.id === userId).canUseFamilyMembers,
        canUseMedicalRecords: permission === 'medicalRecords' ? !currentValue : users.find(u => u.id === userId).canUseMedicalRecords
      };

      await updateUserPermissions(userId, permissions);
      setUsers(users.map(u => u.id === userId ? { ...u, ...permissions } : u));
      toast.success(`${permission} access ${!currentValue ? 'granted' : 'revoked'}`);
    } catch {
      toast.error('Failed to update permission');
    }
  };

  const openRequestDialog = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const approvePro = async (userId) => {
    try {
      await approveProUpgrade(userId);
      setUsers(users.map(u => u.id === userId ? { 
        ...u, 
        isPro: true, 
        proEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        proUpgradeRequests: u.proUpgradeRequests.map(r => r.status === 'Pending' ? { ...r, status: 'Approved' } : r)
      } : u));
      setDialogOpen(false);
      toast.success('PRO approved for 1 year!');
    } catch {
      toast.error('Failed to approve');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Password Vault</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Family Members</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Medical Records</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">PRO Request</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.fullName || '—'}</TableCell>
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
                      onChange={() => handleToggleStatus(user.id, user.isActive)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={user.canUsePasswordVault}
                      onChange={() => handleTogglePermission(user.id, 'passwordVault', user.canUsePasswordVault)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={user.canUseFamilyMembers}
                      onChange={() => handleTogglePermission(user.id, 'familyMembers', user.canUseFamilyMembers)}
                      color="warning"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={user.canUseMedicalRecords}
                      onChange={() => handleTogglePermission(user.id, 'medicalRecords', user.canUseMedicalRecords)}
                      color="error"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {user.proUpgradeRequests?.some(r => r.status === 'Pending') ? (
                      <IconButton size="small" onClick={() => openRequestDialog(user)}>
                        <Badge badgeContent="!" color="error">
                          <Upgrade fontSize="small" />
                        </Badge>
                      </IconButton>
                    ) : user.isPro ? (
                      <CheckCircle sx={{ color: '#4CAF50' }} />
                    ) : (
                      <Box sx={{ color: '#9E9E9E' }}>—</Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* PRO UPGRADE POPUP */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1A2A44', color: 'white' }}>
          PRO Upgrade Request
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Typography><strong>User:</strong> {selectedUser?.fullName}</Typography>
            <Typography><strong>Phone:</strong> {selectedUser?.phoneNumber || '—'}</Typography>
            <Typography><strong>Email:</strong> {selectedUser?.email}</Typography>
            <Typography><strong>Requested:</strong> {selectedUser?.proUpgradeRequests?.[0]?.requestDate ? formatDate(selectedUser.proUpgradeRequests[0].requestDate) : '—'}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => approvePro(selectedUser?.id)}
          >
            Approve 1-Year PRO
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminUsersPage;