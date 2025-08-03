import {Box,  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { Settings, AccountCircle, Logout } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../../config';

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
  <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1A2A44', color: '#FFF' }}>
  <Toolbar sx={{ justifyContent: 'flex-start' }}>
    <Typography variant="h6" component="div" sx={{ color: '#FFD700' }}>
      XTHomeManager
    </Typography>

    {user && (
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
        <img
          src={imageUrl}
          alt="User Profile"
          style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }}
          onError={(e) => { console.error(`Image load failed for URL: ${imageUrl}`); e.target.src = DUMMY_IMAGE_URL; }}
        />
        <Typography variant="body1" sx={{ color: '#FFF', mr: 2 }}>
          {user.fullName}
        </Typography>
        <IconButton color="inherit" onClick={handleMenuOpen} sx={{ color: '#FFD700' }}>
          <Settings />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { bgcolor: '#2E4057' } }}
        >
          <MenuItem onClick={handleProfileClick} sx={{ color: '#FFF' }}>
            <AccountCircle sx={{ mr: 1, color: '#FFD700' }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleLogoutClick} sx={{ color: '#FFF' }}>
            <Logout sx={{ mr: 1, color: '#FFD700' }} /> Logout
          </MenuItem>
        </Menu>
      </div>
    )}
  </Toolbar>
</AppBar>
  );
}

export default TopBar;