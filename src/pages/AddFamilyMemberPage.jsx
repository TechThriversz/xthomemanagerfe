// src/pages/AddFamilyMemberPage.jsx
import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Avatar, CircularProgress, Tooltip
} from '@mui/material';
import { Add, Search, Upgrade, Delete, Edit, Close } from '@mui/icons-material';
import { toast } from 'react-toastify';
import UpgradeBadge from '../components/UpgradeBadge';
import FamilyMemberForm from '../components/FamilyMemberForm';
import { Link } from 'react-router-dom';
import { getFamilyTree, addFamilyMember, updateFamilyMember, deleteFamilyMember } from '../services/api';
import { CONFIG } from '../../config';

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


  return (
    <Box sx={{ textAlign: 'center', position: 'relative' }}>
      <Tooltip title={member.isDeceased ? `Died: ${new Date(member.deathDate).toLocaleDateString('en-GB')}` : ''}>
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
            border: member.isDeceased ? '5px dashed #999' : '5px solid #1A2A44',
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
          {member.isDeceased && (
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
        {/* {member.relation.replace('Paternal ', '').replace('Maternal ', '')} */}
        {member.relation}
      </Typography>
  
    </Box>
  );
}

 

function AddFamilyMemberPage({ user }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (data.ParentIdsJson) formData.append('ParentIdsJson', data.ParentIdsJson);
    if (data.SpouseIdsJson) formData.append('SpouseIdsJson', data.SpouseIdsJson);
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
    } catch (err) {
  
      toast.error('Failed to save');
    }
  };

  const userMock = {
    id: '0',
    name: user?.name || 'You',
    birthday: user?.birthday || '1990-01-01',
    relation: 'You',
    ParentIds: '[]',
    SpouseIds: '[]',
    isDeceased: false,
    bornPlace: user?.bornPlace || 'Lahore',
    ImagePath: user?.avatar || ''
  };

  const parseIds = (str) => {
    if (!str || str === '[]') return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const buildTree = () => {
    const allMembers = [...members];
    const you = allMembers.find(m => m.relation === 'You') || userMock;

    const parsedMembers = allMembers.map(m => ({
      ...m,
      parentIds: parseIds(m.ParentIds),
      spouseIds: parseIds(m.SpouseIds)
    }));

    const youParsed = {
      ...you,
      parentIds: parseIds(you.ParentIds),
      spouseIds: parseIds(you.SpouseIds)
    };

    const grandparents = parsedMembers.filter(m => 
      ['Paternal Grandfather', 'Paternal Grandmother', 'Maternal Grandfather', 'Maternal Grandmother'].includes(m.relation)
    );
    const paternalGP = grandparents.filter(m => m.relation.includes('Paternal'));
    const maternalGP = grandparents.filter(m => m.relation.includes('Maternal'));

    const father = parsedMembers.find(m => m.relation === 'Father');
    const mother = parsedMembers.find(m => m.relation === 'Mother');

    const siblings = parsedMembers.filter(m => 
      ['Brother', 'Sister'].includes(m.relation) && 
      m.parentIds.includes(father?.id) && 
      m.parentIds.includes(mother?.id)
    );

    const yourSpouses = parsedMembers.filter(m => 
      ['Wife', 'Husband'].includes(m.relation) 
      // && 
      // m.spouseIds.includes(youParsed.id)
    );

    const brotherWives = parsedMembers.filter(m => m.relation === "Brother's Wife");
    const sisterHusbands = parsedMembers.filter(m => m.relation === "Sister's Husband");

    const yourChildren = parsedMembers.filter(m => 
      ['Son', 'Daughter'].includes(m.relation) 
      // && 
      // m.parentIds.includes(youParsed.id)
    );

    const brotherChildren = parsedMembers.filter(m => 
      ["Brother's Son", "Brother's Daughter"].includes(m.relation)
    );
    const sisterChildren = parsedMembers.filter(m => 
      ["Sister's Son", "Sister's Daughter"].includes(m.relation)
    );

    return {
      paternalGP, maternalGP, father, mother,
      siblings, yourSpouses, brotherWives, sisterHusbands,
      yourChildren, brotherChildren, sisterChildren, you: youParsed
    };
  };

  const {
    paternalGP, maternalGP, father, mother,
    siblings, yourSpouses, brotherWives, sisterHusbands,
    yourChildren, brotherChildren, sisterChildren, you
  } = buildTree();

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
    <Box sx={{ p: 3, maxWidth: 1800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>Family Tree</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" placeholder="Search..." />
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingMember(null); setFormOpen(true); }}
            sx={{ bgcolor: '#1A2A44', borderRadius: 50 }}>Add Member</Button>
          <Button component={Link} to="/other-members" variant="outlined" sx={{ borderRadius: 50 }}>
            Other Members
          </Button>
        </Box>
      </Box>

      <Box sx={{ overflowX: 'auto', py: 4 }}>
        <Box sx={{ minWidth: 1400, position: 'relative' }}>

          {/* GRANDPARENTS */}
          {(paternalGP.length > 0 || maternalGP.length > 0) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 16, mb: 12 }}>
              {paternalGP.map(m => <FamilyTreeNode key={m.id} member={m} onOpenModal={openModal} />)}
              {paternalGP.length > 0 && maternalGP.length > 0 && <Box sx={{ width: 100, height: 2, bgcolor: '#1A2A44', alignSelf: 'center' }} />}
              {maternalGP.map(m => <FamilyTreeNode key={m.id} member={m} onOpenModal={openModal} />)}
            </Box>
          )}

          {/* PARENTS */}
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

          {/* YOU + SPOUSE */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 12, gap: 8 }}>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: -60, left: '50%', width: 2, height: 60, bgcolor: '#1A2A44', transform: 'translateX(-50%)' }} />
              <FamilyTreeNode member={you} onOpenModal={openModal} />
            </Box>
            {yourSpouses.map(spouse => (
              <Box key={spouse.id} sx={{ position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: -60, left: '50%', width: 2, height: 60, bgcolor: '#1A2A44', transform: 'translateX(-50%)' }} />
                <FamilyTreeNode member={spouse} onOpenModal={openModal} />
              </Box>
            ))}
          </Box>

          {/* SIBLINGS + THEIR FAMILIES */}
          {siblings.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 10, mb: 12 }}>
              {siblings.map(sib => (
                <Box key={sib.id} sx={{ position: 'relative', textAlign: 'center' }}>
                  <Box sx={{ position: 'absolute', top: -60, left: '50%', width: 2, height: 60, bgcolor: '#1A2A44', transform: 'translateX(-50%)' }} />
                  <FamilyTreeNode member={sib} onOpenModal={openModal} />
                  {/* Spouse */}
                  {(sib.relation === 'Brother' ? brotherWives : sisterHusbands).find(s => s.spouseIds?.includes(sib.id)) && (
                    <Box sx={{ mt: 2 }}>
                      <FamilyTreeNode member={(sib.relation === 'Brother' ? brotherWives : sisterHusbands).find(s => s.spouseIds?.includes(sib.id))} onOpenModal={openModal} />
                    </Box>
                  )}
                  {/* Children */}
                  {(sib.relation === 'Brother' ? brotherChildren : sisterChildren).filter(c => c.parentIds?.includes(sib.id)).length > 0 && (
                    <Box sx={{ display: 'flex', gap: 4, mt: 2, justifyContent: 'center' }}>
                      {(sib.relation === 'Brother' ? brotherChildren : sisterChildren).filter(c => c.parentIds?.includes(sib.id)).map(child => (
                        <FamilyTreeNode key={child.id} member={child} onOpenModal={openModal} />
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* YOUR CHILDREN */}
          {yourChildren.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              {yourChildren.map(child => (
                <Box key={child.id} sx={{ position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: -60, left: '50%', width: 2, height: 60, bgcolor: '#1A2A44', transform: 'translateX(-50%)' }} />
                  <FamilyTreeNode member={child} onOpenModal={openModal} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* BEAUTIFUL MODAL WITH AGE & DEATH AGE */}
<Dialog
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: { borderRadius: 3 }
  }}
>
  <DialogTitle sx={{ bgcolor: '#1A2A44', color: 'white', fontWeight: 'bold', position: 'relative', pr: 6 }}>
    {selectedMember?.name}
    <IconButton
      onClick={() => setModalOpen(false)}
      sx={{
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'white'
      }}
    >
      <Close />
    </IconButton>
  </DialogTitle>

  <DialogContent dividers sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
      <Avatar
        src={selectedMember?.ImagePath ? `${CONFIG.R2_BASE_URL}/${selectedMember.ImagePath}` : ''}
        sx={{ width: 120, height: 120, mb: 2 }}
      >
        {selectedMember?.name.split(' ').map(n => n[0]).join('')}
      </Avatar>

      <Box sx={{ width: '100%', textAlign: 'left' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="#1A2A44">Relation</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {selectedMember?.relation || 'You'}
        </Typography>

        {selectedMember?.birthday && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" color="#1A2A44">Birthday</Typography>
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              {new Date(selectedMember.birthday).toLocaleDateString('en-GB')}
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
              Age: {calculateAge(selectedMember.birthday, selectedMember.isDeceased ? selectedMember.deathDate : null).years} years,{' '}
              {calculateAge(selectedMember.birthday, selectedMember.isDeceased ? selectedMember.deathDate : null).months} months
            </Typography>
          </>
        )}

        {selectedMember?.isDeceased && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" color="#1A2A44" sx={{ mt: 2 }}>Death Date</Typography>
            <Typography variant="body1" sx={{ mb: 0.5, color: 'error.main' }}>
              {selectedMember.deathDate ? new Date(selectedMember.deathDate).toLocaleDateString('en-GB') : 'Not set'}
            </Typography>
            {selectedMember.deathDate && selectedMember.birthday && (
              <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                Died at age: {calculateAge(selectedMember.birthday, selectedMember.deathDate).years} years,{' '}
                {calculateAge(selectedMember.birthday, selectedMember.deathDate).months} months
              </Typography>
            )}
          </>
        )}

        <Typography variant="subtitle1" fontWeight="bold" color="#1A2A44" sx={{ mt: selectedMember?.isDeceased ? 2 : 2 }}>
          Born Place
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {selectedMember?.bornPlace || 'Not set'}
        </Typography>

        {selectedMember?.isDeceased && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" color="#1A2A44">Died Place</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {selectedMember?.diedPlace || 'Not set'}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  </DialogContent>

  <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', justifyContent: 'space-between' }}>
    <Button
      variant="contained"
      startIcon={<Edit />}
      onClick={handleEdit}
      sx={{ bgcolor: '#1A2A44', borderRadius: 50, px: 4 }}
    >
      Edit
    </Button>
    <Button
      variant="outlined"
      startIcon={<Delete />}
      onClick={handleDelete}
      color="error"
      sx={{ borderRadius: 50, px: 4 }}
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>

      {/* OTHER DIALOGS */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1A2A44', color: 'white' }}>{editingMember ? 'Edit' : 'Add'} Family Member</DialogTitle>
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