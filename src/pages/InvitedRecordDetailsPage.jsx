import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import { getRecordDetails } from '../services/api';
import '../App.css';
import { CONFIG } from '../../config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function InvitedRecordDetailsPage({ user }) {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    if (!user?.id) {
      toast.error('Please log in to view this page', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
      return;
    }
    fetchRecordDetails();
  }, [user, recordId, navigate]);

  const fetchRecordDetails = async () => {
    setLoading(true);
    try {
      const response = await getRecordDetails(recordId);
      const data = response.data;
      setRecord(data);
      calculateKpis(data);
    } catch (error) {
      console.error('Failed to fetch record details:', error);
      toast.error('Failed to load record details. Please try again.', { position: 'top-right', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const calculateKpis = (data) => {
    if (!data || !data.entries) {
      setKpis({ totalCost: 0, totalLiters: 0, totalEntries: 0 });
      return;
    }

    const totalEntries = data.entries.length;
    let totalCost = 0;
    let totalLiters = 0;
    let boughtDays = 0;
    let leaveDays = 0;

    switch (data.type.toLowerCase()) {
      case 'milk':
        totalCost = data.entries.reduce((sum, entry) => sum + (entry.totalCost || 0), 0);
        totalLiters = data.entries.reduce((sum, entry) => sum + entry.quantityLiters, 0);
        boughtDays = data.entries.filter(entry => entry.status === 'Active').length;
        leaveDays = data.entries.filter(entry => entry.status === 'Leave').length;
        setKpis({ totalCost, totalLiters, boughtDays, leaveDays, totalEntries });
        break;
      case 'bill':
      case 'rent':
        totalCost = data.entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        setKpis({ totalCost, totalEntries });
        break;
      default:
        setKpis({ totalCost: 0, totalEntries: 0 });
        break;
    }
  };

  const renderEntriesTable = () => {
    switch (record.type.toLowerCase()) {
      case 'milk':
        return (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC', '& > th': { fontWeight: 'bold', color: '#1A2A44', border: 'none' } }}>
                <TableCell>Date</TableCell>
                <TableCell>Quantity (Liters)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {record.entries.map((entry, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FFFFFF' }, '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, '& > td': { borderBottom: 'none' } }}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.quantityLiters}</TableCell>
                  <TableCell>
                    <Box component="span" sx={{
                      color: entry.status === 'Active' ? '#10B981' : '#F59E0B',
                      bgcolor: entry.status === 'Active' ? '#ECFDF5' : '#FEF3C7',
                      px: 2, py: 0.5, borderRadius: '16px', fontWeight: 'bold'
                    }}>
                      {entry.status}
                    </Box>
                  </TableCell>
                  <TableCell>{entry.totalCost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case 'bill':
        return (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC', '& > th': { fontWeight: 'bold', color: '#1A2A44', border: 'none' } }}>
                <TableCell>Month</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Reference Number</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {record.entries.map((entry, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FFFFFF' }, '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, '& > td': { borderBottom: 'none' } }}>
                  <TableCell>{entry.month}</TableCell>
                  <TableCell>{entry.amount}</TableCell>
                  <TableCell>{entry.referenceNumber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case 'rent':
        return (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC', '& > th': { fontWeight: 'bold', color: '#1A2A44', border: 'none' } }}>
                <TableCell>Month</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {record.entries.map((entry, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FFFFFF' }, '&:nth-of-type(even)': { bgcolor: '#F8FAFC' }, '& > td': { borderBottom: 'none' } }}>
                  <TableCell>{entry.month}</TableCell>
                  <TableCell>{entry.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      default:
        return <Typography>No entries available for this record type.</Typography>;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#1A2A44' }} />
      </Box>
    );
  }

  if (!record) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Record not found or access denied.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ p: 4, borderRadius: '16px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px', bgcolor: '#FFFFFF', mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2A44', mb: 1 }}>{record.name}</Typography>
        <Typography variant="h6" sx={{ color: '#666' }}>{record.type} Record</Typography>
        <Typography variant="body2" sx={{ mt: 2, color: '#444' }}>Shared By: <b>{record.createdBy}</b></Typography>
      </Box>

      {/* KPI Boxes */}
      <Box className="inner-boxes" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 4 }}>
        <Box sx={{
          p: 3,
          bgcolor: 'rgba(26, 42, 68, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
            bgcolor: 'rgba(26, 42, 68, 0.95)',
          },
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#FFD700' }}>Total Cost</Typography>
          <Typography variant="h4" sx={{ color: '#FFD700' }}>{CONFIG.currencySymbol}{kpis.totalCost ? kpis.totalCost.toFixed(2) : '0.00'}</Typography>
        </Box>

        {/* Dynamic KPIs based on record type */}
        {record.type.toLowerCase() === 'milk' && (
          <>
            <Box sx={{
              p: 3,
              bgcolor: 'rgba(16, 185, 129, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                bgcolor: 'rgba(16, 185, 129, 0.95)',
              },
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#FFFFFF' }}>Total Liters</Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>{kpis.totalLiters ? kpis.totalLiters.toFixed(2) : '0.00'}</Typography>
            </Box>
            <Box sx={{
              p: 3,
              bgcolor: 'rgba(245, 158, 11, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                bgcolor: 'rgba(245, 158, 11, 0.95)',
              },
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#FFFFFF' }}>Bought Days</Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>{kpis.boughtDays}</Typography>
            </Box>
            <Box sx={{
              p: 3,
              bgcolor: 'rgba(239, 68, 68, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                bgcolor: 'rgba(239, 68, 68, 0.95)',
              },
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#FFFFFF' }}>Leave Days</Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>{kpis.leaveDays}</Typography>
            </Box>
          </>
        )}
        {record.type.toLowerCase() !== 'milk' && (
          <Box sx={{
            p: 3,
            bgcolor: 'rgba(16, 185, 129, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
              bgcolor: 'rgba(16, 185, 129, 0.95)',
            },
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#FFFFFF' }}>Total Entries</Typography>
            <Typography variant="h4" sx={{ color: '#FFFFFF' }}>{kpis.totalEntries}</Typography>
          </Box>
        )}
      </Box>

      {/* Entries Table Section */}
      <Box
        sx={{
          p: 4,
          borderRadius: '16px',
          boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
          bgcolor: '#FFFFFF',
        }}
      >
        <Typography variant="h5" sx={{ mt: 2, mb: 2, fontWeight: 'bold', color: '#1A2A44' }}>Entries</Typography>
        {renderEntriesTable()}
      </Box>
    </Box>
  );
}

export default InvitedRecordDetailsPage;
