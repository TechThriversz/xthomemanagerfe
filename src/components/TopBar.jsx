import { Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { Settings, AccountCircle, Logout } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationsNoneOutlined, EmailOutlined } from '@mui/icons-material';
import { CONFIG } from '../../config';
import assets from '../asset';

function TopBar({ user, onLogout }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    onLogout();
    handleMenuClose();
  };

  const handleProfileClick = () => {
    navigate('/settings');
    handleMenuClose();
  };

  const { R2_BASE_URL, DUMMY_IMAGE_URL } = CONFIG;
  const imageUrl = user?.imagePath ? `${R2_BASE_URL}/${user.imagePath.replace(/\\/g, '/')}` : DUMMY_IMAGE_URL;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#FFFFFF', color: '#1A2A44', boxShadow: 'none', borderBottom: '1px solid #E0E0E0' }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
           <img
                src={assets.logo}
                alt="Main Logo"
                style={{ width: 'auto', height: '50px',  }}
              />
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" sx={{ color: '#888' }}><NotificationsNoneOutlined /></IconButton>
            <IconButton color="inherit" sx={{ color: '#888', mr: 2 }}><EmailOutlined /></IconButton>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
              <img
                src={imageUrl}
                alt="User Profile"
                style={{ width: 36, height: 36, borderRadius: '50%', marginRight: 10, border: '2px solid #FFD700' }}
                onError={(e) => { console.error(`Image load failed for URL: ${imageUrl}`); e.target.src = DUMMY_IMAGE_URL; }}
              />
              <Typography variant="body1" sx={{ color: '#1A2A44', fontWeight: 'medium' }}>
                {user.fullName}
              </Typography>
            </div>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { bgcolor: '#F5F5F5', borderRadius: '8px' } }}
            >
              <MenuItem onClick={handleProfileClick} sx={{ color: '#333' }}>
                <AccountCircle sx={{ mr: 1, color: '#666' }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleLogoutClick} sx={{ color: '#333' }}>
                <Logout sx={{ mr: 1, color: '#666' }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
