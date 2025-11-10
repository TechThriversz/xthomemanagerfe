// src/pages/AddFamilyMemberPage.jsx
import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Avatar, CircularProgress, Tooltip
} from '@mui/material';
import { Add, Search, Upgrade, Delete, Edit, Cake } from '@mui/icons-material';
import { toast } from 'react-toastify';
import UpgradeBadge from '../components/UpgradeBadge';
import FamilyMemberForm from '../components/FamilyMemberForm';
import { Link } from 'react-router-dom';
import {
  getFamilyTree, addFamilyMember, updateFamilyMember, deleteFamilyMember
} from '../services/api';
import { CONFIG } from '../../config';

// Age Calculator
const calculateAge = (birth, death = null) => {
  const end = death ? new Date(death) : new Date();
  const start = new Date(birth);
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) { months--; days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }

  return { years, months, days };
};

function FamilyTreeNode({ member, onOpenModal }) {
  const isDeceased = member.isDeceased;
  const age = calculateAge(member.birthday, member.deathDate);

  return (
    <Box sx={{ textAlign: 'center', position: 'relative' }}>
      <Tooltip title={isDeceased ? `Died: ${new Date(member.deathDate).toLocaleDateString('en-GB')}` : ''}>
        <Box
          onClick={() => onOpenModal(member)}
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'white',
            boxShadow: 4,
            cursor: 'pointer',
            transition: '0.3s',
            '&:hover': { transform: 'scale(1.1)', boxShadow: 8 },
            border: isDeceased ? '5px dashed #999' : '5px solid #1A2A44',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Avatar
            src={member.ImagePath ? `${CONFIG.R2_BASE_URL}/${member.ImagePath}` : ''}
            sx={{ width: '100%', height: '100%', fontSize: '2rem', border: '4px solid white' }}
          >
            {member.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          {isDeceased && (
            <Box sx={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              DECEASED
            </Box>
          )}
        </Box>
      </Tooltip>
      <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600, color: '#1A2A44' }}>
        {member.name.split(' ')[0]}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {member.relation.replace('Paternal ', '').replace('Maternal ', '')}
      </Typography>
    </Box>
  );
}

function AddFamilyMemberPage({ user }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const loadFamilyTree = async () => {
    try {
      setLoading(true);
      const res = await getFamilyTree();
      setMembers(res.data);
    } catch (err) {
      toast.error('Failed to load family tree');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isPro && user?.canUseFamilyMembers) {
      loadFamilyTree();
    } else {
      setLoading(false);
    }
  }, [user]);

  const openModal = (member) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  const handleEdit = () => {
    setEditingMember(selectedMember);
    setFormOpen(true);
    setModalOpen(false);
  };

  const handleDelete = () => {
    setDeleteConfirm(selectedMember);
    setModalOpen(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteFamilyMember(deleteConfirm.id);
      toast.success('Deleted');
      await loadFamilyTree();
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSave = async (data) => {
    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('Birthday', data.birthday);
    formData.append('Relation', data.relation);
    formData.append('BornPlace', data.bornPlace || '');
    formData.append('DiedPlace', data.diedPlace || '');
    formData.append('IsDeceased', data.isDeceased);
    if (data.deathDate) formData.append('DeathDate', data.deathDate);
    if (data.parentIds?.length) formData.append('ParentIds', JSON.stringify(data.parentIds));
    if (data.spouseIds?.length) formData.append('SpouseIds', JSON.stringify(data.spouseIds));
    if (data.image) formData.append('Image', data.image);

    try {
      if (editingMember?.id) {
        await updateFamilyMember(editingMember.id, formData);
        toast.success('Updated');
      } else {
        await addFamilyMember(formData);
        toast.success('Added');
      }
      await loadFamilyTree();
      setFormOpen(false);
      setEditingMember(null);
    } catch {
      toast.error('Failed to save');
    }
  };

  const userMock = {
    id: '0',
    name: user?.name || 'You',
    birthday: user?.birthday || '1990-01-01',
    relation: 'You',
    parentIds: [],
    spouseIds: [],
    isDeceased: false,
    bornPlace: user?.bornPlace || 'Lahore',
    ImagePath: user?.avatar || ''
  };

  const buildTree = () => {
    const grandparents = members.filter(m => m.relation.includes('Grandfather') || m.relation.includes('Grandmother'));
    const paternalGP = grandparents.filter(m => m.relation.includes('Paternal'));
    const maternalGP = grandparents.filter(m => m.relation.includes('Maternal'));
    const father = members.find(m => m.relation === 'Father');
    const mother = members.find(m => m.relation === 'Mother');
    const children = members.filter(m => m.parentIds?.some(id => father?.id === id) && m.parentIds?.some(id => mother?.id === id));
    const YOMe = members.find(m => m.relation === 'You') || userMock;
    return { paternalGP, maternalGP, father, mother, children, YOMe };
  };

  const { paternalGP, maternalGP, father, mother, children, YOMe } = buildTree();

  if (loading) return <Box sx={{ textAlign: 'center', mt: 8 }}><CircularProgress /></Box>;

  if (!user?.isPro || !user?.canUseFamilyMembers) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Family Tree</Typography>
          <UpgradeBadge />
        </Box>
        <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 3, p: 6, textAlign: 'center', border: '2px dashed #ddd', maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>Family Tree Locked</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Available only in <strong>XT Home Manager PRO</strong>.
          </Typography>
          <Button variant="contained" startIcon={<Upgrade />} sx={{ bgcolor: '#1A2A44', borderRadius: 50 }} onClick={() => window.location.href = '/upgrade'}>
            Upgrade to PRO
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Family Tree</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ color: 'text.secondary' }} /> }} sx={{ minWidth: 200 }} />
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingMember(null); setFormOpen(true); }}
            sx={{ bgcolor: '#1A2A44', borderRadius: 50 }}>Add Member</Button>
          <Button component={Link} to="/other-members" variant="outlined" sx={{ borderRadius: 50 }}>
            Other Members
          </Button>
        </Box>
      </Box>

      <Box sx={{ overflowX: 'auto', py: 4 }}>
        <Box sx={{ minWidth: 1200, position: 'relative' }}>
          {(paternalGP.length > 0 || maternalGP.length > 0) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 16, mb: 12 }}>
              {paternalGP.map(m => <FamilyTreeNode key={m.id} member={m} onOpenModal={openModal} />)}
              {paternalGP.length > 0 && maternalGP.length > 0 && <Box sx={{ width: 100, height: 2, bgcolor: '#1A2A44', alignSelf: 'center' }} />}
              {maternalGP.map(m => <FamilyTreeNode key={m.id} member={m} onOpenModal={openModal} />)}
            </Box>
          )}

          {(father || mother) && (
            <>
              <Box sx={{ position: 'absolute', top: paternalGP.length > 0 ? 140 : 0, left: '50%', width: 2, height: 60, bgcolor: '#1A2A44', transform: 'translateX(-50%)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 12, mb: 12 }}>
                {father && <FamilyTreeNode member={father} onOpenModal={openModal} />}
                <Box sx={{ width: 80, height: 2, bgcolor: '#1A2A44', alignSelf: 'center' }} />
                {mother && <FamilyTreeNode member={mother} onOpenModal={openModal} />}
              </Box>
            </>
          )}

          {YOMe && (
            <>
              <Box sx={{ position: 'absolute', top: (paternalGP.length > 0 ? 420 : 280), left: '50%', width: 2, height: 60, bgcolor: '#1A2A44', transform: 'translateX(-50%)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 12 }}>
                <FamilyTreeNode member={YOMe} onOpenModal={openModal} />
              </Box>
            </>
          )}

          {children.length > 0 && (
            <>
              <Box sx={{ position: 'absolute', top: (paternalGP.length > 0 ? 280 : 140), left: '50%', width: 2, height: 60, bgcolor: '#1A2A44', transform: 'translateX(-50%)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                {children.map(child => (
                  <Box key={child.id} sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: -60, left: '50%', width: 2, height: 60, bgcolor: '#1A2A44', transform: 'translateX(-50%)' }} />
                    <FamilyTreeNode member={child} onOpenModal={openModal} />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1A2A44', color: 'white' }}>
          {selectedMember?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Button fullWidth startIcon={<Edit />} onClick={handleEdit} variant="contained" sx={{ bgcolor: '#1A2A44' }}>
              Edit Member
            </Button>
            <Button fullWidth startIcon={<Delete />} onClick={handleDelete} color="error">
              Delete Member
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1A2A44', color: 'white' }}>
          {editingMember ? 'Edit' : 'Add'} Family Member
        </DialogTitle>
        <DialogContent dividers>
          <FamilyMemberForm member={editingMember} onSave={handleSave} onClose={() => setFormOpen(false)} members={members} user={user} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete {deleteConfirm?.name}?</DialogTitle>
        <DialogContent><Typography>This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AddFamilyMemberPage;