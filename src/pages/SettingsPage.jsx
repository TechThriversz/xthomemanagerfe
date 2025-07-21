import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { getSettings, updateSettings } from '../services/api';

function SettingsPage() {
    const [ratePerLiter, setRatePerLiter] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await getSettings();
            setRatePerLiter(res.data.milkRatePerLiter);
        } catch (err) {
            setError('Failed to fetch settings');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateSettings({ milkRatePerLiter: parseFloat(ratePerLiter) });
            setSuccess('Settings updated successfully');
            setError('');
        } catch (err) {
            setError('Failed to update settings');
            setSuccess('');
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Settings
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Milk Rate Per Liter (Rs)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={ratePerLiter}
                    onChange={(e) => setRatePerLiter(e.target.value)}
                    required
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    Save
                </Button>
            </form>
        </Box>
    );
}

export default SettingsPage;