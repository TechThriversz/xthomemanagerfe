import { useState } from 'react';
import { Box, CssBaseline, Typography, IconButton } from '@mui/material';
import { Settings } from '@mui/icons-material';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const drawerWidth = 250;

function Layout({ user, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F6FA' }} className="layout-container">
      <CssBaseline />
      <TopBar user={user} onLogout={onLogout} />
      <Sidebar user={user} mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: '64px', // Adjust for TopBar height
          minHeight: 'calc(100vh - 64px)',
          bgcolor: '#fff', // Adjust for TopBar height
        }}
      >
        {children}
      </Box>

      {/* Footer component for logged-in users */}
      {user && (
        <Box
          component="footer"
          sx={{
            ml: { sm: `${drawerWidth}px` },
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            p: 2,
            mt: 'auto',
            bgcolor: '#FFFFFF',
            borderTop: '1px solid #E0E0E0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'fixed',
            bottom: 0,
            zIndex: 1000
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; 2025 XTHomeManager. All rights reserved.
          </Typography>
          <Box>
            <IconButton color="inherit">
              <Settings />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Layout;
