import { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const drawerWidth = 250;

function Layout({ user, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }} className="layout-container">
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
          mt: { xs: '64px', sm: '64px' }, // Adjust for TopBar height
          bgcolor: '#F5F6FA',
          minHeight: 'calc(100vh - 64px)', // Adjust for TopBar height
        
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;