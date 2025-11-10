// src/pages/OtherMembersPage.jsx
import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, Switch, FormControlLabel, CircularProgress
} from '@mui/material';
import { Edit, Delete, Add, PhotoCamera, PictureAsPdf, People, AddCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getOtherMembers, addOtherMember, updateOtherMember, deleteOtherMember } from '../services/api';
import { CONFIG } from '../../config';

const { jsPDF } = window.jspdf;

const calculateAge = (birth, death = null) => {
  const end = death ? new Date(death) : new Date();
  const start = new Date(birth);
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) { months--; days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  return `${years}y ${months}m ${days}d`;
};

function OtherMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', relation: '', birthday: '', isDeceased: false, deathDate: '', bornPlace: '', diedPlace: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await getOtherMembers();
      setMembers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({ name: '', relation: '', birthday: '', isDeceased: false, deathDate: '', bornPlace: '', diedPlace: '' });
    setImageFile(null);
    setImagePreview('');
    setEditing(null);
  };

  const handleOpenForm = (member = null) => {
    if (member) {
      setEditing(member);
      setForm({
        name: member.name || '',
        relation: member.relation || '',
        birthday: member.birthday?.split('T')[0] || '',
        isDeceased: member.isDeceased || false,
        deathDate: member.deathDate?.split('T')[0] || '',
        bornPlace: member.bornPlace || '',
        diedPlace: member.diedPlace || ''
      });
      setImagePreview(member.ImagePath ? `${CONFIG.R2_BASE_URL}/${member.ImagePath}` : '');
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleCloseForm = () => {
    setOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!form.name || !form.birthday || !form.relation) {
      toast.error('Name, Birthday, and Relation are required');
      return;
    }

    const formData = new FormData();
    formData.append('Name', form.name);
    formData.append('Relation', form.relation);
    formData.append('Birthday', form.birthday);
    if (form.bornPlace) formData.append('BornPlace', form.bornPlace);
    if (form.diedPlace) formData.append('DiedPlace', form.diedPlace);
    formData.append('IsDeceased', form.isDeceased);
    if (form.isDeceased && form.deathDate) formData.append('DeathDate', form.deathDate);
    if (imageFile) formData.append('Image', imageFile);

    try {
      if (editing) {
        await updateOtherMember(editing.id, formData);
        toast.success('Updated successfully!');
      } else {
        await addOtherMember(formData);
        toast.success('Added successfully!');
      }
      await loadMembers();
      handleCloseForm();
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Failed to save. Please try again.';
      toast.error(msg);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    try {
      await deleteOtherMember(deleteDialog.id);
      toast.success('Deleted successfully!');
      await loadMembers();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteDialog(null);
    }
  };

  const exportPDF = () => {
    if (!jsPDF || !jsPDF.prototype.autoTable) {
      toast.error('PDF library not loaded');
      return;
    }
    if (members.length === 0) {
      toast.warn('No members to export');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Other Family Members', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 25);

    const tableData = members.map(m => [
      m.name,
      m.relation,
      new Date(m.birthday).toLocaleDateString('en-GB'),
      calculateAge(m.birthday),
      m.isDeceased ? new Date(m.deathDate).toLocaleDateString('en-GB') : '-',
      m.isDeceased ? calculateAge(m.birthday, m.deathDate) : '-',
      m.bornPlace || '-',
      m.diedPlace || '-'
    ]);

    doc.autoTable({
      head: [['Name', 'Relation', 'Birthday', 'Age', 'Death Date', 'Death Age', 'Born', 'Died']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [26, 42, 68] },
      alternateRowStyles: { fillColor: [248, 249, 250] }
    });

    doc.save('other-family-members.pdf');
  };

  // LOADING
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // EMPTY STATE
  if (members.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Other Family Members</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenForm()}
            sx={{ bgcolor: '#1A2A44', borderRadius: 50 }}
          >
            Add Member
          </Button>
        </Box>

        <Box
          sx={{
            bgcolor: '#f8f9fa',
            borderRadius: 3,
            p: 6,
            textAlign: 'center',
            border: '2px dashed #ddd',
            maxWidth: 600,
            mx: 'auto',
            mt: 8
          }}
        >
          <People sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Other Members Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start adding uncles, aunts, cousins, or friends to keep track of your extended family.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() => handleOpenForm()}
            sx={{ bgcolor: '#1A2A44', borderRadius: 50 }}
          >
            Add First Member
          </Button>
        </Box>

        {/* DIALOGS IN EMPTY STATE */}
        <MemberFormDialog
          open={open}
          onClose={handleCloseForm}
          editing={editing}
          form={form}
          setForm={setForm}
          handleImageChange={handleImageChange}
          imagePreview={imagePreview}
          onSave={handleSave}
        />
        <DeleteConfirmationDialog
          open={!!deleteDialog}
          onClose={() => setDeleteDialog(null)}
          member={deleteDialog}
          onConfirm={confirmDelete}
        />
      </Box>
    );
  }

  // MAIN CONTENT
  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Other Family Members</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={exportPDF} sx={{ borderRadius: 50 }}>
            Export PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenForm()}
            sx={{ bgcolor: '#1A2A44', borderRadius: 50 }}
          >
            Add Member
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell>Photo</TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Relation</strong></TableCell>
              <TableCell><strong>Birthday</strong></TableCell>
              <TableCell><strong>Age</strong></TableCell>
              <TableCell><strong>Death Date</strong></TableCell>
              <TableCell><strong>Death Age</strong></TableCell>
              <TableCell><strong>Born</strong></TableCell>
              <TableCell><strong>Died</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map(m => (
              <TableRow key={m.id} hover>
                <TableCell>
                  <Avatar
                    src={m.ImagePath ? `${CONFIG.R2_BASE_URL}/${m.ImagePath}` : ''}
                    sx={{ width: 40, height: 40 }}
                  >
                    {m.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </TableCell>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.relation}</TableCell>
                <TableCell>{new Date(m.birthday).toLocaleDateString('en-GB')}</TableCell>
                <TableCell>{calculateAge(m.birthday)}</TableCell>
                <TableCell>{m.isDeceased ? new Date(m.deathDate).toLocaleDateString('en-GB') : '-'}</TableCell>
                <TableCell>{m.isDeceased ? calculateAge(m.birthday, m.deathDate) : '-'}</TableCell>
                <TableCell>{m.bornPlace || '-'}</TableCell>
                <TableCell>{m.diedPlace || '-'}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenForm(m)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setDeleteDialog(m)} color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIALOGS IN MAIN STATE */}
      <MemberFormDialog
        open={open}
        onClose={handleCloseForm}
        editing={editing}
        form={form}
        setForm={setForm}
        handleImageChange={handleImageChange}
        imagePreview={imagePreview}
        onSave={handleSave}
      />
      <DeleteConfirmationDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        member={deleteDialog}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}

// Extracted Dialogs
function MemberFormDialog({ open, onClose, editing, form, setForm, handleImageChange, imagePreview, onSave }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1A2A44', color: 'white' }}>
        {editing ? 'Edit' : 'Add'} Other Member
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <input accept="image/*" type="file" onChange={handleImageChange} id="img-upload" style={{ display: 'none' }} />
          <label htmlFor="img-upload">
            <IconButton component="span">
              <Avatar src={imagePreview} sx={{ width: 80, height: 80, bgcolor: '#1A2A44' }}>
                <PhotoCamera />
              </Avatar>
            </IconButton>
          </label>
          <Typography variant="caption" color="text.secondary">Upload Photo</Typography>
        </Box>

        <TextField label="Name" fullWidth sx={{ mb: 2 }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        <TextField label="Relation" fullWidth sx={{ mb: 2 }} value={form.relation} onChange={e => setForm(p => ({ ...p, relation: e.target.value }))} />
        <TextField label="Birthday" type="date" fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} value={form.birthday} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} />
        <TextField label="Born Place" fullWidth sx={{ mb: 2 }} value={form.bornPlace} onChange={e => setForm(p => ({ ...p, bornPlace: e.target.value }))} />

        <FormControlLabel
          control={<Switch checked={form.isDeceased} onChange={e => setForm(p => ({ ...p, isDeceased: e.target.checked, deathDate: e.target.checked ? form.deathDate : '' }))} />}
          label="Deceased"
          sx={{ mb: 1 }}
        />

        {form.isDeceased && (
          <>
            <TextField label="Death Date" type="date" fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} value={form.deathDate} onChange={e => setForm(p => ({ ...p, deathDate: e.target.value }))} />
            <TextField label="Died Place" fullWidth sx={{ mb: 2 }} value={form.diedPlace} onChange={e => setForm(p => ({ ...p, diedPlace: e.target.value }))} />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" sx={{ bgcolor: '#1A2A44' }}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteConfirmationDialog({ open, onClose, member, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete {member?.name}?</DialogTitle>
      <DialogContent>
        <Typography>This action cannot be undone.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

export default OtherMembersPage;