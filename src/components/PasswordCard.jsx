// src/components/PasswordCard.jsx
import { Card, CardContent, Box, Typography, IconButton,Button, Chip, Divider, Collapse } from '@mui/material';
import { Visibility, VisibilityOff, Edit, Delete, ExpandMore, ExpandLess, Phone, Email, Security, QuestionMark } from '@mui/icons-material';

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD', '#98D8C8'];

export default function PasswordCard({ password, onEdit, onDelete, expanded, onToggleExpand, showPassword, onTogglePassword }) {
  const color = colors[password.id % colors.length];

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'visible' }}>
      <Box sx={{ height: 8, bgcolor: color, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
      <CardContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
              Account Name: {password.accountName || 'Untitled'}
            </Typography>
            {password.email && (
              <Typography variant="body2" color="text.secondary">
                Email: {password.email}
              </Typography>
            )}
          </Box>
          <Box>
            <IconButton size="small" onClick={onEdit}><Edit fontSize="small" /></IconButton>
            <IconButton size="small" onClick={onDelete}><Delete fontSize="small" /></IconButton>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {password.username && <Chip label={`Username: ${password.username}`} size="small" />}
          {password.securityMethod && (
            <Chip
              icon={password.securityMethod === 'Phone' ? <Phone fontSize="small" /> : password.securityMethod === 'Email' ? <Email fontSize="small" /> : <Security fontSize="small" />}
              label={`2FA: ${password.securityMethod}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1A2A44' }}>
            Password:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
              {showPassword ? password.decryptedPassword || '••••••••' : '••••••••'}
            </Typography>
            <IconButton size="small" onClick={onTogglePassword}>
              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Button
            fullWidth
            size="small"
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            onClick={onToggleExpand}
            sx={{ textTransform: 'none', color: '#1A2A44' }}
          >
            {expanded ? 'Hide' : 'Show'} More Details
          </Button>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            {password.associatedPhone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Phone fontSize="small" /> Phone: {password.associatedPhone}
              </Box>
            )}
            {password.recoveryEmail && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email fontSize="small" /> Recovery: {password.recoveryEmail}
              </Box>
            )}
            {password.securityQuestions?.map((q, i) => (
              <Box key={i} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QuestionMark fontSize="small" /> {q.question}
                </Box>
                <Typography variant="body2" sx={{ ml: 3, fontFamily: 'monospace' }}>
                  {q.answer}
                </Typography>
              </Box>
            ))}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}