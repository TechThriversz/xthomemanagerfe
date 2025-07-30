import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { Dashboard, ListAlt, LocalDining, LocalAtm, Home, Settings, People, History } from '@mui/icons-material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

function Sidebar({ user, currentRecordId }) {
  const [openRecords, setOpenRecords] = useState(false);

  const handleClick = () => {
    setOpenRecords(!openRecords);
  };

  return (
    <Box sx={{ width: 250, bgcolor: '#1A2A44', color: '#FFF', height: '100vh', position: 'fixed', mt: 8 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/dashboard" sx={{ color: '#FFF', '&.active': { bgcolor: '#2E4057' } }}>
            <ListItemIcon><Dashboard sx={{ color: '#FFD700' }} /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleClick} sx={{ color: '#FFF' }}>
            <ListItemIcon><ListAlt sx={{ color: '#FFD700' }} /></ListItemIcon>
            <ListItemText primary="Records" />
            {openRecords ? <ExpandLess sx={{ color: '#FFD700' }} /> : <ExpandMore sx={{ color: '#FFD700' }} />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openRecords} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/records" sx={{ pl: 4, color: '#FFF', '&.active': { bgcolor: '#2E4057' } }}>
                <ListItemIcon><ListAlt sx={{ color: '#FFD700' }} /></ListItemIcon>
                <ListItemText primary="Records" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/milk" sx={{ pl: 4, color: '#FFF', '&.active': { bgcolor: '#2E4057' } }}>
                <ListItemIcon><LocalDining sx={{ color: '#FFD700' }} /></ListItemIcon>
                <ListItemText primary="Milk" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/rent" sx={{ pl: 4, color: '#FFF', '&.active': { bgcolor: '#2E4057' } }}>
                <ListItemIcon><Home sx={{ color: '#FFD700' }} /></ListItemIcon>
                <ListItemText primary="Rent" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/bills" sx={{ pl: 4, color: '#FFF', '&.active': { bgcolor: '#2E4057' } }}>
                <ListItemIcon><LocalAtm sx={{ color: '#FFD700' }} /></ListItemIcon>
                <ListItemText primary="Bills" />
              </ListItemButton>
            </ListItem>
            {currentRecordId && (
              <ListItem disablePadding>
                <ListItemButton component={NavLink} to={`/milk/${currentRecordId}/history`} sx={{ pl: 4, color: '#FFF', '&.active': { bgcolor: '#2E4057' } }}>
                  <ListItemIcon><History sx={{ color: '#FFD700' }} /></ListItemIcon>
                  <ListItemText primary="Milk History" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Collapse>
        {user?.role === 'Admin' && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/invite" sx={{ color: '#FFF', '&.active': { bgcolor: '#2E4057' } }}>
                <ListItemIcon><People sx={{ color: '#FFD700' }} /></ListItemIcon>
                <ListItemText primary="Invite Viewer" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/settings" sx={{ color: '#FFF', '&.active': { bgcolor: '#2E4057' } }}>
                <ListItemIcon><Settings sx={{ color: '#FFD700' }} /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
}

export default Sidebar;