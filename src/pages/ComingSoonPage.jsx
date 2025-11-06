import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockOutlined from '@mui/icons-material/LockOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import HealthAndSafetyOutlined from '@mui/icons-material/HealthAndSafetyOutlined'

function ComingSoonPage({ title, icon: Icon, color = '#1A2A44' }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Box sx={{
        maxWidth: 500,
        textAlign: 'center',
        p: 5,
        bgcolor: 'white',
        borderRadius: 4,
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
      }}>
        <Icon sx={{ fontSize: 80, color, mb: 3 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2A44', mb: 2 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 4, lineHeight: 1.8 }}>
          This feature is currently under development. We're working hard to bring you a secure and powerful way to manage your data.
        </Typography>
        <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic', mb: 4 }}>
          Thank you for your patience. Exciting things are coming soon!
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          sx={{ 
            bgcolor: '#1A2A44', 
            '&:hover': { bgcolor: '#101C31' },
            px: 4, py: 1.5,
            borderRadius: 3
          }}
        >
          Go Back
        </Button>
      </Box>
    </Box>
  );
}

export default ComingSoonPage;