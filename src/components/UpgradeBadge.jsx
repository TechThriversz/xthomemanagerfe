// components/UpgradeBadge.jsx
import { Box, Typography } from '@mui/material';
import { Upgrade } from '@mui/icons-material';

export default function UpgradeBadge() {
  return (
    <Box sx={{
      bgcolor: '#FFF3CD',
      color: '#856404',
      px: 1.5,
      py: 0.5,
      borderRadius: 1,
      fontSize: '0.7rem',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      fontWeight: 'bold'
    }}>
      <Upgrade fontSize="small" />
      PRO
    </Box>
  );
}