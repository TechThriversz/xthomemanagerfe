// src/components/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Collapse, Typography, IconButton, Divider 
} from '@mui/material';
import { 
  Dashboard, ListAlt, LocalDining, LocalAtm, Home, Settings, People, 
  FolderShared, MedicalInformation, FamilyRestroom,  ExpandLess, ExpandMore, LockOutlined,HealthAndSafetyOutlined, GroupOutlined
} from '@mui/icons-material';
import { CONFIG } from '../../config';

function Sidebar({ user, currentRecordId }) {
  const [openRecords, setOpenRecords] = useState(false);
  const { R2_BASE_URL, DUMMY_IMAGE_URL } = CONFIG;
  const imageUrl = user?.imagePath 
    ? `${R2_BASE_URL}/${user.imagePath.replace(/\\/g, '/')}` 
    : DUMMY_IMAGE_URL;

  return (
    <Box className="sidebar-layout">
      <List sx={{ paddingTop: 0 }}>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/dashboard">
            <ListItemIcon><Dashboard /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => setOpenRecords(!openRecords)}>
            <ListItemIcon><ListAlt /></ListItemIcon>
            <ListItemText primary="Records" />
            {openRecords ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openRecords} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/records" sx={{ pl: 4 }}>
                <ListItemIcon><ListAlt /></ListItemIcon>
                <ListItemText primary="All Records" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/milk" sx={{ pl: 4 }}>
                <ListItemIcon><LocalDining /></ListItemIcon>
                <ListItemText primary="Milk" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/rent" sx={{ pl: 4 }}>
                <ListItemIcon><Home /></ListItemIcon>
                <ListItemText primary="Rent" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/bills" sx={{ pl: 4 }}>
                <ListItemIcon><LocalAtm /></ListItemIcon>
                <ListItemText primary="Bills" />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/invited-records">
            <ListItemIcon><FolderShared /></ListItemIcon>
            <ListItemText primary="Invited Records" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/invite">
            <ListItemIcon><People /></ListItemIcon>
            <ListItemText primary="Invite Viewer" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        {/* FIXED ICONS */}
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/add-password">
            <ListItemIcon><LockOutlined sx={{ color: '#FF6B6B' }} /></ListItemIcon>
            <ListItemText primary="Add Password" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/add-family">
            <ListItemIcon><GroupOutlined sx={{ color: '#4ECDC4' }} /></ListItemIcon>
            <ListItemText primary="Add Family Member" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/medical-records">
            <ListItemIcon><HealthAndSafetyOutlined sx={{ color: '#45B7D1' }} /></ListItemIcon>
            <ListItemText primary="Medical Records" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/settings">
            <ListItemIcon><Settings /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>

      {user && (
        <Box sx={{ p: 2, borderTop: '1px solid #E0E0E0', bgcolor: '#FAFAFA' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={imageUrl} 
              alt="Profile" 
              style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }} 
            />
            <Box sx={{textAlign:'left'}}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
                {user.fullName || user.email}
              </Typography>
              <Typography variant="caption" sx={{  color: '#666', fontWeight: '500' }}>
                {user.role || 'User'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Sidebar;