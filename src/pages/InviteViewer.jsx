import { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { inviteViewer } from '../services/api';

function InviteViewer() {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [recordName, setRecordName] = useState('');
    const [recordType, setRecordType] = useState('Milk');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await inviteViewer(email, fullName, user.id, recordName, recordType);
            setSuccess('Viewer invited successfully');
            setEmail('');
            setFullName('');
            setRecordName('');
            setError('');
        } catch (err) {
            setError('Failed to invite viewer');
            setSuccess('');
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Invite Viewer
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Viewer Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <TextField
                    label="Viewer Full Name"
                    fullWidth
                    margin="normal"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
                <TextField
                    label="Record Name"
                    fullWidth
                    margin="normal"
                    value={recordName}
                    onChange={(e) => setRecordName(e.target.value)}
                    required
                />
                <TextField
                    label="Record Type"
                    select
                    fullWidth
                    margin="normal"
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    SelectProps={{ native: true }}
                    required
                >
                    <option value="Milk">Milk</option>
                    <option value="Bill">Bill</option>
                    <option value="Rent">Rent</option>
                </TextField>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Invite
                </Button>
            </form>
        </Box>
    );
}

export default InviteViewer;