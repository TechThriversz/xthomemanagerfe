import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { getPasswords, addPassword, updatePassword, deletePassword } from '../services/api';
import { toast } from 'react-toastify';
import PasswordForm from '../components/PasswordForm';
import PasswordCard from '../components/PasswordCard';

function PasswordVaultPage() {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const res = await getPasswords();
      const data = (res.data || []).map(p => ({
        ...p,
        decryptedPassword: p.decryptedPassword,
        securityQuestions: p.securityQuestions || []
      }));
      // SHUFFLE
      const shuffled = data.sort(() => 0.5 - Math.random());
      setPasswords(shuffled);
    } catch (err) {
      console.error(err);
      setPasswords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setFormOpen(false);
    setEditingPassword(null);
    fetchPasswords();
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await deletePassword(deleteDialog.id);
      setPasswords(prev => prev.filter(p => p.id !== deleteDialog.id));
      toast.success('Password deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteDialog(null);
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
          Password Vault
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setFormOpen(true)}
          sx={{ bgcolor: '#1A2A44', '&:hover': { bgcolor: '#101C31' }, borderRadius: 50 }}
        >
          Add Password
        </Button>
      </Box>

      {passwords.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#f8f9fa', borderRadius: 3, border: '2px dashed #ddd' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Passwords Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            It looks like you haven't added any passwords yet. Let's get started by securing your first account.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
            sx={{ bgcolor: '#1A2A44', borderRadius: 50 }}
          >
            Add Your First Password
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' } }}>
          {passwords.map(p => (
            <PasswordCard
              key={p.id}
              password={p}
              onEdit={() => {
                setEditingPassword(p);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteDialog(p)}
              expanded={expanded[p.id]}
              onToggleExpand={() => setExpanded(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
              showPassword={showPassword[p.id]}
              onTogglePassword={() => setShowPassword(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
            />
          ))}
        </Box>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1A2A44', color: 'white' }}>
          {editingPassword ? 'Edit Password' : 'Add New Password'}
        </DialogTitle>
        <DialogContent dividers>
          <PasswordForm
            password={editingPassword}
            onSave={handleSave}
            onCancel={() => {
              setFormOpen(false);
              setEditingPassword(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Password?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog?.accountName}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PasswordVaultPage;