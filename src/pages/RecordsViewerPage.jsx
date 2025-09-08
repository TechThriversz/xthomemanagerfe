// src/pages/RecordsViewerPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import { getViewerRecords } from '../services/api';
import '../App.css';

function RecordsViewerPage({ user }) {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    fetchRecords();
  }, [user, navigate]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await getViewerRecords(user.id);
      setRecords(response.data || []);
    } catch (error) {
      console.error('Failed to fetch viewer records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  if (records.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Invited Records</Typography>
        <Typography>No invited records found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Invited Records</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.name}</TableCell>
              <TableCell>{record.type}</TableCell>
              <TableCell>
                <Button
                  onClick={() => navigate(`/record/view/${record.id}`)}
                  disabled={!record.isAccepted}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default RecordsViewerPage;