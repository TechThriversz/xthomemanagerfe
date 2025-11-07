// src/components/PasswordForm.jsx
import { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, IconButton, Typography } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { addPassword, updatePassword } from '../services/api';
import { toast } from 'react-toastify';

const securityOptions = [
  { value: 'Phone', label: 'Phone Number' },
  { value: 'Email', label: 'Recovery Email' },
  { value: 'AuthApp', label: 'Authenticator App' }
];

function PasswordForm({ password, onSave, onCancel }) {
  const [form, setForm] = useState({
    accountName: '',
    email: '',
    username: '',
    password: '',
    securityMethod: '',
    securityValue: '',
    associatedPhone: '',
    recoveryEmail: '',
    securityQuestions: [{ question: '', answer: '' }]
  });

 useEffect(() => {
  if (password) {
    setForm({
      accountName: password.accountName || '',
      email: password.email || '',
      username: password.username || '',
      password: '', // NEVER pre-fill password
      securityMethod: password.securityMethod || '',
      securityValue: password.securityValue || '',
      associatedPhone: password.associatedPhone || '',
      recoveryEmail: password.recoveryEmail || '',
      securityQuestions: Array.isArray(password.securityQuestions)
        ? password.securityQuestions
        : password.securityQuestions
          ? JSON.parse(password.securityQuestions)
          : [{ question: '', answer: '' }]
    });
  }
}, [password]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...form.securityQuestions];
    updated[index][field] = value;
    setForm(prev => ({ ...prev, securityQuestions: updated }));
  };

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      securityQuestions: [...prev.securityQuestions, { question: '', answer: '' }]
    }));
  };

  const removeQuestion = (index) => {
    setForm(prev => ({
      ...prev,
      securityQuestions: prev.securityQuestions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password) {
        await updatePassword(password.id, form);
      } else {
        await addPassword(form);
      }
      toast.success(password ? 'Updated!' : 'Saved!');
      onSave();
    } catch {
      toast.error('Failed to save');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
      <TextField
        label="Account Name"
        value={form.accountName}
        onChange={(e) => handleChange('accountName', e.target.value)}
        fullWidth
      />
      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => handleChange('email', e.target.value)}
        fullWidth
      />
      <TextField
        label="Username"
        value={form.username}
        onChange={(e) => handleChange('username', e.target.value)}
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => handleChange('password', e.target.value)}
        fullWidth
        required={!password}
      />

      <TextField
        select
        label="Security Method"
        value={form.securityMethod}
        onChange={(e) => handleChange('securityMethod', e.target.value)}
        fullWidth
      >
        {securityOptions.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </TextField>

      {form.securityMethod && (
        <TextField
          label={form.securityMethod === 'Phone' ? 'Phone Number' : form.securityMethod === 'Email' ? 'Email' : 'App Code'}
          value={form.securityValue}
          onChange={(e) => handleChange('securityValue', e.target.value)}
          fullWidth
        />
      )}

      <TextField
        label="Associated Phone"
        value={form.associatedPhone}
        onChange={(e) => handleChange('associatedPhone', e.target.value)}
        fullWidth
      />
      <TextField
        label="Recovery Email"
        type="email"
        value={form.recoveryEmail}
        onChange={(e) => handleChange('recoveryEmail', e.target.value)}
        fullWidth
      />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Security Questions</Typography>
        {form.securityQuestions.map((q, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
            <TextField
              label="Question"
              value={q.question}
              onChange={(e) => handleQuestionChange(i, 'question', e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Answer"
              value={q.answer}
              onChange={(e) => handleQuestionChange(i, 'answer', e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
            {form.securityQuestions.length > 1 && (
              <IconButton size="small" onClick={() => removeQuestion(i)}><Remove /></IconButton>
            )}
          </Box>
        ))}
        <Button startIcon={<Add />} onClick={addQuestion} size="small">
          Add Question
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#1A2A44' }}>
          {password ? 'Update' : 'Save'}
        </Button>
        <Button variant="outlined" onClick={onCancel} fullWidth>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

export default PasswordForm;