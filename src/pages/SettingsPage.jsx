// src/pages/SettingsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Avatar, IconButton, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert
} from '@mui/material';
import { PhotoCamera, WarningAmber } from '@mui/icons-material';
import { useSettings } from '../hooks/useSettings';
import { useUser } from '../hooks/useUser';
import { updateUser, requestAccountDeletion, cancelDeletion } from '../services/api';
import { toast } from 'react-toastify';
import { CONFIG } from '../../config';

import currencies from '../data/currencies.json';
import countries from '../data/countries.json';
import dateFormats from '../data/dateFormats.json';

function SettingsPage({ user, setUser }) {
  const { settings: apiSettings, update: saveSettingsToApi, loading: settingsLoading } = useSettings();
  const { refreshUser } = useUser();
  const [localSettings, setLocalSettings] = useState({});
  const [profile, setProfile] = useState({ fullName: '', phoneNumber: '', gender: '', dateOfBirth: '', password: '', image: null });
  const [imagePreview, setImagePreview] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);
  const [submittingDeletion, setSubmittingDeletion] = useState(false);
  const [submittingCancel, setSubmittingCancel] = useState(false);
   const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

  const calculateTimeLeft = useCallback((scheduledTimeStr) => {
    if (!scheduledTimeStr) {
      setTimeLeft({ hours: 0, minutes: 0 });
      return;
    }

    const scheduledTime = new Date(scheduledTimeStr).getTime();
    const now = new Date().getTime();
    const msDifference = scheduledTime - now;

    if (msDifference <= 0) {
 
      setTimeLeft({ hours: 0, minutes: 0 });
      return;
    }

    // 1. Convert milliseconds to total seconds
    let totalSeconds = Math.floor(msDifference / 1000);

    // 2. Calculate hours
    const hoursLeft = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600; // Remaining seconds after extracting hours

    // 3. Calculate minutes (Math.ceil ensures partial minutes show up as 1 minute)
    let minutesLeft = Math.ceil(totalSeconds / 60);

    let finalHours = hoursLeft;
    let finalMinutes = minutesLeft;

    // 4. Handle roll-over: if minutes is 60, it means an hour has passed
    if (finalMinutes === 60) {
  
      finalHours += 1;
      finalMinutes = 0;
    }

    setTimeLeft({ hours: finalHours, minutes: finalMinutes });
  }, []);

  // Sync API → localSettings
  useEffect(() => {
    if (apiSettings) {
      setLocalSettings({
        currency: apiSettings.currency || 'PKR',
        country: apiSettings.country || 'Pakistan',
        decimalPlaces: apiSettings.decimalPlaces ?? 0,
        dateFormat: apiSettings.dateFormat || 'dd/MM/yyyy',
        weightUnit: apiSettings.weightUnit || 'kg',
        milkRatePerLiter: apiSettings.milkRatePerLiter || 0
      });
    }

    if (user) {
      setProfile({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        password: '',
        image: null
      });
      setImagePreview(user.imagePath ? `${CONFIG.R2_BASE_URL}/${user.imagePath}` : CONFIG.DUMMY_IMAGE_URL);

      // Check if deletion already requested
      if (user.deletionRequestStatus === 'Pending' || user.deleteRequestPendingOrApproved === "Pending" || user.deleteRequestPendingOrApproved === "Approved") {
        setDeletionSubmitted(true);
      }
    }
  
  }, [apiSettings, user]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await saveSettingsToApi(localSettings);
      toast.success('Settings saved!');
    } catch {
      // Handled in hook
    } finally {
      setSavingSettings(false);
    }
  };

    useEffect(() => {
    let intervalId;
    const scheduledTimeStr = user?.deletionScheduledAt;
 

    if (scheduledTimeStr) {
     
        calculateTimeLeft(scheduledTimeStr);
        intervalId = setInterval(() => {
            calculateTimeLeft(scheduledTimeStr);
        }, 60000); 
        return () => clearInterval(intervalId);
    } else {
        setTimeLeft({ hours: 0, minutes: 0 });
    }
    
    // Recalculate if the scheduled time changes
  }, [user?.deletionScheduleAt, calculateTimeLeft]); 

  const handleProfileSave = async () => {
    setSavingProfile(true);
    const formData = new FormData();
    formData.append('fullName', profile.fullName);
    if (profile.phoneNumber) formData.append('phoneNumber', profile.phoneNumber);
    if (profile.password) formData.append('password', profile.password);
    if (profile.gender) formData.append('gender', profile.gender);
    if (profile.dateOfBirth) formData.append('dateOfBirth', profile.dateOfBirth);
    if (profile.image) formData.append('image', profile.image);

    try {
      const res = await updateUser(user.id, formData);
      setUser(res.data);
      toast.success('Profile updated!');
      setProfile(prev => ({ ...prev, password: '', image: null }));
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRequestDeletion = async () => {
    setSubmittingDeletion(true);
    try {
      await requestAccountDeletion();
      setDeletionSubmitted(true);
      setDeletionModalOpen(false);
      var refreshedUser = await refreshUser(); 
      console.log("Refreshed user after deletion request:", refreshedUser);
      toast.success('Deletion request sent to admin.');
    } catch (err) {
   
      const errorMessage = err.response?.data?.message || 'Failed to send request';
      toast.error(errorMessage);
    } finally {
      setSubmittingDeletion(false);
    }
  };


const handleCancleDeletion = async () => {
    setSubmittingCancel(true);
    try {
        await cancelDeletion(); 
        setDeletionSubmitted(false);
        setCancelModalOpen(false);
        toast.success('Cancellation request submitted!');
        
    } catch (err) {
     
        let errorMessage = 'Failed to send request.'; 
        if (err.response && err.response.data) {
            errorMessage = err.response.data.message || err.response.data;
        } 
        console.error("Error cancelling deletion:", err); 
        toast.error(errorMessage);
        
    } finally {
        setSubmittingCancel(false);
    }
};

  const daysLeft = user?.proEndDate
    ? Math.ceil((new Date(user.proEndDate) - new Date()) / 86400000)
    : 0;


  if (settingsLoading) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;
  }
const isDeletionPending = deletionSubmitted && (timeLeft.hours > 0 || timeLeft.minutes > 0);
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ color: '#1A2A44', fontWeight: 'bold' }}>
        Settings
      </Typography>

      {user?.isPro && (
        <Box sx={{ bgcolor: '#e3f2fd', p: 3, borderRadius: 2, textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#1A2A44' }}>
            You are on <strong style={{ color: '#4CAF50' }}>XT Home Manager PRO</strong>
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
            {daysLeft} days left
          </Typography>
          <Typography color="text.secondary">
            Expires: {new Date(user.proEndDate).toLocaleDateString('en-GB')}
          </Typography>
        </Box>
      )}

      {/* GENERAL SETTINGS */}
      <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 1, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1A2A44', fontWeight: 'bold' }}>
          General Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={localSettings.currency || 'PKR'}
                onChange={e => setLocalSettings({ ...localSettings, currency: e.target.value })}
                label="Currency"
              >
                {currencies.map(c => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.symbol} {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={localSettings.country || 'Pakistan'}
                onChange={e => setLocalSettings({ ...localSettings, country: e.target.value })}
                label="Country"
              >
                {countries.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Decimal Places</InputLabel>
              <Select
                value={localSettings.decimalPlaces ?? 0}
                onChange={e => setLocalSettings({ ...localSettings, decimalPlaces: e.target.value })}
                label="Decimal Places"
              >
                {[0,1,2,3].map(n => (
                  <MenuItem key={n} value={n}>{n} decimal{n > 1 ? 's' : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Date Format</InputLabel>
              <Select
                value={localSettings.dateFormat || 'dd/MM/yyyy'}
                onChange={e => setLocalSettings({ ...localSettings, dateFormat: e.target.value })}
                label="Date Format"
              >
                {dateFormats.map(d => (
                  <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Weight Unit</InputLabel>
              <Select
                value={localSettings.weightUnit || 'kg'}
                onChange={e => setLocalSettings({ ...localSettings, weightUnit: e.target.value })}
                label="Weight Unit"
              >
                <MenuItem value="kg">Kilograms (kg)</MenuItem>
                <MenuItem value="lbs">Pounds (lbs)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Milk Rate Per Liter"
              type="number"
              fullWidth
              value={localSettings.milkRatePerLiter || 0}
              onChange={e => setLocalSettings({ ...localSettings, milkRatePerLiter: e.target.value })}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={savingSettings}
            sx={{ bgcolor: '#1A2A44', borderRadius: 50, px: 4 }}
          >
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      {/* PROFILE */}
      <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1A2A44', fontWeight: 'bold' }}>
          Profile
        </Typography>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <input accept="image/*" type="file" id="profile-img" style={{ display: 'none' }} onChange={e => {
            const file = e.target.files[0];
            if (file) {
              setProfile({ ...profile, image: file });
              setImagePreview(URL.createObjectURL(file));
            }
          }} />
          <label htmlFor="profile-img">
            <IconButton component="span">
              <Avatar src={imagePreview} sx={{ width: 100, height: 100, border: '3px solid #1A2A44' }}>
                <PhotoCamera />
              </Avatar>
            </IconButton>
          </label>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click to change photo
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField label="Full Name" fullWidth value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField label="Phone Number" fullWidth value={profile.phoneNumber} onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })} />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })} label="Gender">
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField label="Date of Birth" type="date" fullWidth InputLabelProps={{ shrink: true }} value={profile.dateOfBirth} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })} />
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <TextField label="New Password" type="password" fullWidth value={profile.password} onChange={e => setProfile({ ...profile, password: e.target.value })} placeholder="Leave blank to keep current" />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button
            variant="contained"
            onClick={handleProfileSave}
            disabled={savingProfile}
            sx={{ bgcolor: '#1A2A44', borderRadius: 50, px: 4 }}
          >
            {savingProfile ? 'Updating...' : 'Update Profile'}
          </Button>
        </Box>
      </Box>

      {(savingSettings || savingProfile) && (
        <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 3 }} />
      )}

      {/* ACCOUNT DELETION — ONLY FOR NON-ADMIN USERS */}
      {user?.role !== 'Admin' && (
        <Box sx={{ bgcolor: 'white', p: 4, mb: 6, borderRadius: 2, boxShadow: 1, mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#1A2A44', fontWeight: 'bold' }}>
            Danger Zone
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Once you delete your account, there is no going back. All your data will be permanently removed.
          </Typography>

          {deletionSubmitted ? (
            <>
            {user.deletionRequestStatus === 'Pending' ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <strong>Request Submitted</strong> — Your account deletion request has been sent to the admin. You will be notified once approved.
            </Alert>
           ) : user.deleteRequestPendingOrApproved === 'Pending' ? (
               <>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <strong>Request Submitted</strong> — Your account deletion request has been sent to the admin and pending to approve. 
              You can cancel the request before admin approval.
            </Alert>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => setCancelModalOpen(true)}
              sx={{ borderRadius: 50, px: 4, mt:2 }}
            >
             Cancel Deletion
            </Button>
            
            </>

           ) : user.deleteRequestPendingOrApproved === 'Approved' ? (
         <>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <strong>Deletion Approved</strong> — Your account deletion request has been approved by the admin and you have 
            {isDeletionPending && (
              <strong style={{ marginLeft: '8px' }}>
                {String(timeLeft.hours).padStart(2, '0')} hours and {String(timeLeft.minutes).padStart(2, '0')} minutes &nbsp; 
              </strong>
            )} 
             time to cancel. If you change your mind, please contact the admin immediately to cancel the deletion.
          </Alert>
          <Button
            variant="outlined"
            color="warning"
            onClick={() => setCancelModalOpen(true)}
            sx={{ borderRadius: 50, px: 4, mt: 2 }}
          >
            Cancel Deletion
          </Button>
          
        </>
          
           ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <strong>Request Submitted</strong> — Your account deletion request has been sent to the admin. You will be notified once approved.
            </Alert>
           )
          
           }
            </>
        
        
          ) : (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeletionModalOpen(true)}
              sx={{ borderRadius: 50, px: 4 }}
            >
              Request Account Deletion
            </Button>
          )}
        </Box>
      )}

      {/* BEAUTIFUL CONFIRMATION MODAL */}
      <Dialog
        open={deletionModalOpen}
        onClose={() => !submittingDeletion && setDeletionModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#D32F2F', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
          <WarningAmber sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto' }} />
          Confirm Account Deletion
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            You are about to request <strong>permanent deletion</strong> of your account.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This action <strong>cannot be undone</strong>. All your data including:
          </Typography>
          <Box component="ul" sx={{ pl: 3, my: 2 }}>
            <li>Personal profile</li>
            <li>Records, bills, milk entries</li>
            <li>Family members & medical records</li>
            <li>PRO subscription status</li>
          </Box>
          <Typography variant="body2" color="error" fontWeight="bold">
            The admin will review your request. Once approved, you’ll have 24 hours to cancel.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setDeletionModalOpen(false)}
            disabled={submittingDeletion}
            sx={{ borderRadius: 50, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRequestDeletion}
            disabled={submittingDeletion}
            sx={{ borderRadius: 50, px: 4 }}
          >
            {submittingDeletion ? 'Submitting...' : 'Yes, Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CANCEL DELETION CONFIRMATION MODAL */}
       <Dialog
        open={cancelModalOpen}
        onClose={() => !submittingCancel && setCancelModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#ad9d05ff', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
          <WarningAmber sx={{ fontSize: 40, mb: 1, display: 'block', mx: 'auto' }} />
          Confirm Account Deletion Cancellation
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            You are about to request <strong>cancellation of your account deletion</strong>.
          </Typography>
          <Typography variant="body2" color="black" fontWeight="bold">
            The admin will review your cancellation request. Once approved, your account deletion will be cancelled. You'll retain all your data and access and will be notified once the cancellation is processed via email.  
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setCancelModalOpen(false)}
            disabled={submittingCancel}
            sx={{ borderRadius: 50, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleCancleDeletion}
            disabled={submittingDeletion}
            sx={{ borderRadius: 50, px: 4 }}
          >
            {submittingCancel ? 'Submitting...' : 'Yes, Cancel Deletion'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SettingsPage;