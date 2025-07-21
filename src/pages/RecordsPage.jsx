import { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getRecords, createRecord } from '../services/api';

function RecordsPage() {
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState({ name: '', type: 'Milk' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await getRecords();
            setRecords(res.data);
        } catch (err) {
            setError('Failed to fetch records');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRecord(form);
            fetchRecords();
            setForm({ name: '', type: 'Milk' });
        } catch (err) {
            setError('Failed to create record');
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Records
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Record Name"
                    fullWidth
                    margin="normal"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
                <TextField
                    label="Type"
                    select
                    fullWidth
                    margin="normal"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
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
                    Create Record
                </Button>
            </form>
            <List>
                {records.map((record) => (
                    <ListItem
                        key={record.id}
                        button
                        onClick={() => navigate(`/record/${record.id}`)}
                    >
                        <ListItemText primary={`${record.name} (${record.type})`} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default RecordsPage;