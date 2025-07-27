import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { Settings, AccountCircle, Logout } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../../config'; // Adjust path based on your project structure

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

  // Use config variables
  const { R2_BASE_URL, DUMMY_IMAGE_URL } = CONFIG;

  // Convert imagePath to URL using R2_BASE_URL
  const imageUrl = user?.imagePath ? `${R2_BASE_URL}/${user.imagePath.replace(/\\/g, '/')}` : DUMMY_IMAGE_URL;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#ff4500' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#FFF' }}>
          XTHomeManager
        </Typography>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={imageUrl}
              alt="User Profile"
              style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }}
              onError={(e) => {
                console.error(`Image load failed for URL: ${imageUrl}`);
                e.target.src = DUMMY_IMAGE_URL; // Fallback to dummy image on error
              }}
            />
            <Typography variant="body1" sx={{ color: '#FFF', mr: 2 }}>
              {user.fullName}
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen} sx={{ color: '#FFF' }}>
              <Settings />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleProfileClick}>
                <AccountCircle sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleLogoutClick}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;