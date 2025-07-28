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
    <Box sx={{ width: 250, bgcolor: '#2E8B57', color: '#FFF', height: '100vh', position: 'fixed', mt: 8 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/dashboard" sx={{ color: '#FFF' }}>
            <ListItemIcon><Dashboard sx={{ color: '#FFF' }} /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleClick} sx={{ color: '#FFF' }}>
            <ListItemIcon><ListAlt sx={{ color: '#FFF' }} /></ListItemIcon>
            <ListItemText primary="Records" />
            {openRecords ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openRecords} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/records" sx={{ pl: 4, color: '#FFF' }}>
                <ListItemIcon><ListAlt sx={{ color: '#FFF' }} /></ListItemIcon>
                <ListItemText primary="Records" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/milk" sx={{ pl: 4, color: '#FFF' }}>
                <ListItemIcon><LocalDining sx={{ color: '#FFF' }} /></ListItemIcon>
                <ListItemText primary="Milk" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/rent" sx={{ pl: 4, color: '#FFF' }}>
                <ListItemIcon><Home sx={{ color: '#FFF' }} /></ListItemIcon>
                <ListItemText primary="Rent" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/bills" sx={{ pl: 4, color: '#FFF' }}>
                <ListItemIcon><LocalAtm sx={{ color: '#FFF' }} /></ListItemIcon>
                <ListItemText primary="Bills" />
              </ListItemButton>
            </ListItem>
            {currentRecordId && (
              <ListItem disablePadding>
                <ListItemButton component={NavLink} to={`/milk/${currentRecordId}/history`} sx={{ pl: 4, color: '#FFF' }}>
                  <ListItemIcon><History sx={{ color: '#FFF' }} /></ListItemIcon>
                  <ListItemText primary="Milk History" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Collapse>
        {user?.role === 'Admin' && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/invite" sx={{ color: '#FFF' }}>
                <ListItemIcon><People sx={{ color: '#FFF' }} /></ListItemIcon>
                <ListItemText primary="Invite Viewer" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/settings" sx={{ color: '#FFF' }}>
                <ListItemIcon><Settings sx={{ color: '#FFF' }} /></ListItemIcon>
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