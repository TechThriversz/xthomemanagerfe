// src/components/FamilyMemberForm.jsx
import { useState } from 'react';
import {
  Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Avatar,
  IconButton, Typography, Switch, FormControlLabel
} from '@mui/material';
import { PhotoCamera, Person, Cake } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { CONFIG } from '../../config';

function FamilyMemberForm({ member, onSave, onClose, members, user }) {
  const [form, setForm] = useState({
    name: member?.name || '',
    birthday: member?.birthday?.split('T')[0] || '',
    relation: member?.relation || '',
    parentIds: member?.parentIds || [],
    spouseIds: member?.spouseIds || [],
    isDeceased: member?.isDeceased || false,
    deathDate: member?.deathDate?.split('T')[0] || '',
    bornPlace: member?.bornPlace || '',
    diedPlace: member?.diedPlace || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(member?.ImagePath ? `${CONFIG.R2_BASE_URL}/${member.ImagePath}` : '');

  const relations = [
    'Paternal Grandfather', 'Paternal Grandmother',
    'Maternal Grandfather', 'Maternal Grandmother',
    'Father', 'Mother',
    'Brother', 'Sister',
    'Wife', 'Husband',
    "Brother's Wife", "Sister's Husband",
    'Son', 'Daughter',
    "Brother's Son", "Brother's Daughter",
    "Sister's Son", "Sister's Daughter",
    'You'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.birthday || !form.relation) {
      toast.error('Name, Birthday, and Relation are required');
      return;
    }
    onSave({
      ...form,
      image: imageFile,
      ParentIdsJson: JSON.stringify(form.parentIds),
      SpouseIdsJson: JSON.stringify(form.spouseIds)
    });
  };

  // Hide parent selection for: You, Grandparents, Parents, Wives/Husbands, Nieces/Nephews
  const showParents = ![
    'You', 'Paternal Grandfather', 'Paternal Grandmother',
    'Maternal Grandfather', 'Maternal Grandmother',
    'Father', 'Mother',
    "Brother's Wife", "Sister's Husband",
    "Brother's Son", "Brother's Daughter",
    "Sister's Son", "Sister's Daughter"
  ].includes(form.relation);

  // Show spouse selection for: You, Brother, Sister, Son, Daughter
  const showSpouse = ['You', 'Brother', 'Sister', 'Son', 'Daughter'].includes(form.relation);

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <input accept="image/*" type="file" onChange={handleImageChange} id="img" style={{ display: 'none' }} />
        <label htmlFor="img">
          <IconButton component="span">
            <Avatar src={imagePreview} sx={{ width: 100, height: 100, bgcolor: '#1A2A44' }}>
              <Person sx={{ fontSize: 50 }} />
            </Avatar>
          </IconButton>
        </label>
        <Typography variant="body2" color="text.secondary">Click to upload photo</Typography>
      </Box>

      <TextField label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} fullWidth sx={{ mb: 2 }} />
      <TextField label="Birthday" type="date" value={form.birthday} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Relation to You</InputLabel>
        <Select value={form.relation} onChange={e => setForm(p => ({ ...p, relation: e.target.value }))}>
          {relations.map(rel => <MenuItem key={rel} value={rel}>{rel}</MenuItem>)}
        </Select>
      </FormControl>

      {/* PARENTS — MULTIPLE */}
      {showParents && members.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Parents</InputLabel>
          <Select multiple value={form.parentIds} onChange={e => setForm(p => ({ ...p, parentIds: e.target.value }))}>
            {members.filter(m => m.relation !== 'You').map(m => (
              <MenuItem key={m.id} value={m.id}>{m.name} ({m.relation})</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* SPOUSE — MULTIPLE */}
      {showSpouse && members.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Spouse(s)</InputLabel>
          <Select multiple value={form.spouseIds} onChange={e => setForm(p => ({ ...p, spouseIds: e.target.value }))}>
            {members.filter(m => ['Wife', 'Husband', "Brother's Wife", "Sister's Husband"].includes(m.relation)).map(m => (
              <MenuItem key={m.id} value={m.id}>{m.name} ({m.relation})</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField label="Born Place" value={form.bornPlace} onChange={e => setForm(p => ({ ...p, bornPlace: e.target.value }))} fullWidth sx={{ mb: 2 }} />

      <FormControlLabel
        control={<Switch checked={form.isDeceased} onChange={e => setForm(p => ({ ...p, isDeceased: e.target.checked }))} />}
        label="Deceased"
        sx={{ mb: 2 }}
      />

      {form.isDeceased && (
        <>
          <TextField label="Death Date" type="date" value={form.deathDate} onChange={e => setForm(p => ({ ...p, deathDate: e.target.value }))} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
          <TextField label="Died Place" value={form.diedPlace} onChange={e => setForm(p => ({ ...p, diedPlace: e.target.value }))} fullWidth sx={{ mb: 2 }} />
        </>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleSubmit} fullWidth sx={{ bgcolor: '#1A2A44', py: 1.5 }}>
          {member ? 'Update' : 'Add'} Member
        </Button>
        <Button variant="outlined" onClick={onClose} fullWidth sx={{ py: 1.5 }}>Cancel</Button>
      </Box>
    </Box>
  );
}

export default FamilyMemberForm;