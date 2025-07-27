import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, ListAlt, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Sidebar({ user }) {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard sx={{ color: '#FF4500' }} />, path: '/dashboard' },
    { text: 'Records', icon: <ListAlt sx={{ color: '#FF4500' }} />, path: '/records' },
     { text: 'Invite Viewer', icon: <ListAlt sx={{ color: '#FF4500' }} />, path: '/invite' },
    { text: 'Settings', icon: <Settings sx={{ color: '#FF4500' }} />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: '#FFF3E0',
          mt: '64px',
          boxShadow: '4px 0 8px rgba(0,0,0,0.2)',
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: '#8B0000' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;