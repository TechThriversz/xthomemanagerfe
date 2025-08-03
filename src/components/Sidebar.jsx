import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography, IconButton } from '@mui/material';
import { Dashboard, ListAlt, LocalDining, LocalAtm, Home, Settings, People, History } from '@mui/icons-material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { CONFIG } from '../../config';

function Sidebar({ user, currentRecordId }) {
  const [openRecords, setOpenRecords] = useState(false);

  const handleClick = () => {
    setOpenRecords(!openRecords);
  };

  // Placeholder for user image.
  const { R2_BASE_URL, DUMMY_IMAGE_URL } = CONFIG;
  const imageUrl = user?.imagePath ? `${R2_BASE_URL}/${user.imagePath.replace(/\\/g, '/')}` : DUMMY_IMAGE_URL;

  return (
    <Box className="sidebar-layout">
      <List sx={{ paddingTop: 0 }}>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/dashboard" sx={{ color: '#72737E', '&.active': { bgcolor: '#F0F2F5', color: '#1A2A44' } }}>
            <ListItemIcon><Dashboard sx={{ color: '#72737E' }} /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleClick} sx={{ color: '#72737E',  '&:hover': { color: '#888' }, '&.active': { bgcolor: '#F0F2F5', color: '#1A2A44' } }}>
            <ListItemIcon><ListAlt sx={{ color: '#72737E' }} /></ListItemIcon>
            <ListItemText primary="Records" />
            {openRecords ? <ExpandLess sx={{ color: '#72737E' }} /> : <ExpandMore sx={{ color: '#72737E' }} />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openRecords} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/records" sx={{ pl: 4, color: '#72737E', '&.active': { bgcolor: '#F0F2F5', color: '#1A2A44' } }}>
                <ListItemIcon><ListAlt sx={{ color: '#72737E' }} /></ListItemIcon>
                <ListItemText primary="Records" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/milk" sx={{ pl: 4, color: '#72737E', '&.active': { bgcolor: '#F0F2F5', color: '#1A2A44' } }}>
                <ListItemIcon><LocalDining sx={{ color: '#72737E' }} /></ListItemIcon>
                <ListItemText primary="Milk" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/rent" sx={{ pl: 4, color: '#72737E', '&.active': { bgcolor: '#F0F2F5', color: '#1A2A44' } }}>
                <ListItemIcon><Home sx={{ color: '#72737E' }} /></ListItemIcon>
                <ListItemText primary="Rent" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/bills" sx={{ pl: 4, color: '#72737E', '&.active': { bgcolor: '#F0F2F5', color: '#1A2A44' } }}>
                <ListItemIcon><LocalAtm sx={{ color: '#72737E' }} /></ListItemIcon>
                <ListItemText primary="Bills" />
              </ListItemButton>
            </ListItem>
            {currentRecordId && (
              <ListItem disablePadding>
                <ListItemButton component={NavLink} to={`/milk/${currentRecordId}/history`} sx={{ pl: 4, color: '#72737E', '&.active': { bgcolor: '#F0F2F5', color: '#1A2A44' } }}>
                  <ListItemIcon><History sx={{ color: '#72737E' }} /></ListItemIcon>
                  <ListItemText primary="Milk History" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Collapse>
        {user?.role === 'Admin' && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/invite" sx={{ color: '#72737E', '&.active': { bgcolor: '#FAFAFA', color: '#1A2A44' } }}>
                <ListItemIcon><People sx={{ color: '#72737E' }} /></ListItemIcon>
                <ListItemText primary="Invite Viewer" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/settings" sx={{ color: '#72737E', '&.active': { bgcolor: '#FAFAFA', color: '#1A2A44' } }}>
                <ListItemIcon><Settings sx={{ color: '#72737E' }} /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>

      {/* User profile section at the bottom of the sidebar */}
      {user && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderTop: '1px solid #E0E0E0',
            bgcolor: '#FAFAFA'
          }}
        >
          <img
            src={imageUrl}
            alt="User Profile"
            style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10, border: '2px solid #72737E' }}
          />
          <Typography variant="body1" sx={{ color: '#1A2A44', fontWeight: 'medium',  }}>
            {user.fullName}
          </Typography>
     
        </Box>
      )}
    </Box>
  );
}

export default Sidebar;