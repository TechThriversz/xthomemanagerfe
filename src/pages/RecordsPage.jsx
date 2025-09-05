import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Visibility as VisibilityIcon, Edit as EditIcon } from '@mui/icons-material';
import { getRecords, createRecord, deleteRecord } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';

function RecordsPage({ user }) {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ name: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      toast.error('Please log in to view this page', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
      return;
    }
    fetchRecords();
  }, [user, navigate]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await getRecords();
      setRecords(response.data || []);
    } catch (err) {
      toast.error(err.response?.data?.Message || 'Failed to fetch records', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createRecord({ name: form.name, type: form.type });
      toast.success(response.message || 'Record has been created successfully!', { position: 'top-right', autoClose: 3000 });
      setForm({ name: '', type: '' });
      setOpenDialog(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.message || 'Failed to create record', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await deleteRecord(id);
      toast.success(response.message || 'Record has been deleted successfully!', { position: 'top-right', autoClose: 3000 });
      fetchRecords();
    } catch (err) {
      toast.error(err.message || 'Failed to delete record', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm({ name: '', type: '' });
  };

  const emptyStateImage = "https://img.freepik.com/premium-photo/spring-flowers-hands-beautiful-bouquet-female-hands_217529-507.jpg";

  return (
    <Box className="record-container" sx={{ p: 3 }}>
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2, color: '#1A2A44' }} />}

      {records.length === 0 ? (
        <Box className="empty-state" sx={{ textAlign: 'center', maxWidth: '600px', mx: 'auto', mt: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Records</Typography>
          <Typography variant="h6" sx={{ mt: 2, color: '#1A2A44', fontWeight: 'bold' }}>No Records Found</Typography>
          <Typography sx={{ mt: 1, color: '#666', mb: 4 }}>
            It looks like you haven't added any records yet. Let's get started by creating your first record to track your home expenses.
          </Typography>
          <Box component="img" src={emptyStateImage} alt="No records illustration" sx={{ width: 500, height: 'auto', mb: 4, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Typography variant="body1" sx={{ color: '#888', mb: 2 }}>What would you like to do next?</Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleOpenDialog}
              startIcon={<EditIcon />}
              sx={{ bgcolor: '#1A2A44', color: '#FFD700', borderRadius: '8px', px: 3, py: 1.5, '&:hover': { bgcolor: '#2E4057' } }}
            >
              Create New Record
            </Button>
            <Button
              variant="outlined"
              onClick={() => toast.info('View Demo Data feature coming soon!', { position: 'top-right', autoClose: 3000 })}
              startIcon={<VisibilityIcon />}
              sx={{ color: '#1A2A44', borderColor: '#1A2A44', borderRadius: '8px', px: 3, py: 1.5, '&:hover': { borderColor: '#2E4057', color: '#2E4057' } }}
            >
              View Demo Data
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: '#FFFFFF', width: '1170px', m: 'auto', mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Records</Typography>
            <Button
              variant="contained"
              onClick={handleOpenDialog}
              startIcon={<AddIcon />}
              sx={{ bgcolor: '#1A2A44', color: '#FFD700', fontWeight: 'bold', borderRadius: '8px', px: 4, py: 1.5, '&:hover': { bgcolor: '#2E4057' } }}
              disabled={loading}
            >
              Create Record
            </Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC', '& > th': { fontWeight: 'bold', color: '#1A2A44', border: 'none' } }}>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                {user.role === 'Admin' && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FFFFFF' }, '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, '& > td': { borderBottom: 'none' } }}>
                  <TableCell>
                    <Link
                      to={
                        record.type === 'Milk' ? `/milk/${record.id}/${record.name.replace(/ /g, '-')}` :
                        record.type === 'Rent' ? `/rent/${record.id}/${record.name.replace(/ /g, '-')}` :
                        record.type === 'Bill' ? `/bills/${record.id}/${record.name.replace(/ /g, '-')}` : `/record/${record.id}`
                      }
                      style={{ textDecoration: 'none', color: '#1A2A44', fontWeight: 'medium' }}
                    >
                      {record.name}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ color: '#666' }}>{record.type}</TableCell>
                  {user.role === 'Admin' && (
                    <TableCell align="right">
                      <IconButton onClick={() => handleDelete(record.id)} disabled={loading}>
                        <DeleteIcon sx={{ color: '#EF4444' }} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 3, bgcolor: '#F9FAFB' } }}>
        <DialogTitle sx={{ color: '#1A2A44', fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center', pb: 2 }}>
          Create New Record
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Record Name"
              fullWidth
              variant="outlined"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' } } }}
              InputLabelProps={{ sx: { color: '#666', '&.Mui-focused': { color: '#1A2A44' } } }}
            />
            <Select
              label="Type"
              fullWidth
              variant="outlined"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
              InputProps={{ sx: { borderRadius: '12px', bgcolor: '#FFFFFF', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' } } }}
              MenuProps={{ PaperProps: { sx: { borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } } }}
            >
              <MenuItem value="">Select Type</MenuItem>
              <MenuItem value="Milk" sx={{ '&:hover': { bgcolor: '#F3F4F6' } }}>Milk</MenuItem>
              <MenuItem value="Bill" sx={{ '&:hover': { bgcolor: '#F3F4F6' } }}>Bill</MenuItem>
              <MenuItem value="Rent" sx={{ '&:hover': { bgcolor: '#F3F4F6' } }}>Rent</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#666', textTransform: 'none', px: 3, py: 1, borderRadius: '12px', '&:hover': { bgcolor: '#F3F4F6' } }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: '#1A2A44',
              color: '#FFD700',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              '&:hover': { bgcolor: '#2E4057' }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#FFD700' }} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RecordsPage;