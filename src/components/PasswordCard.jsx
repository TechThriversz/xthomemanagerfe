import React from 'react';
import { Card, CardContent, Box, Typography, IconButton, Button, Chip, Divider, Collapse, Avatar, Tooltip } from '@mui/material';
import { 
    Visibility, 
    VisibilityOff, 
    Edit, 
    Delete, 
    ExpandMore, 
    ExpandLess, 
    Phone, 
    Email, 
    Security, 
    QuestionMark,
    AccountCircle,
    Key,
    ContentCopy,
    VpnKey,
    LockReset
} from '@mui/icons-material';

// Color array for the avatars and top border
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD', '#98D8C8'];

/**
 * A reusable component to display a row of information in a 2-column layout.
 * Left column: Icon + Label
 * Right column: Value + Action Buttons
 */
const DataRow = ({ icon, label, value, children, onCopy, sx = {} }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5, ...sx, borderBottom: '1px solid #f0f0f0' }}>
        {/* Left Column: Label */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexBasis: '35%', color: 'text.secondary' }}>
            {icon}
            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                {label}
            </Typography>
        </Box>
        
        {/* Right Column: Value & Actions */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
            <Typography 
                variant="body2" 
                sx={{ 
                    fontFamily: 'monospace', 
                    letterSpacing: 1.1, 
                    color: '#1A2A44', 
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mr: 1
                }}
            >
                {value}
            </Typography>
            
            <Box sx={{ display: 'flex', flexShrink: 0 }}>
                {/* Children holds custom buttons (like visibility toggle) */}
                {children} 
                {onCopy && (
                    <Tooltip title={`Copy ${label}`}>
                        <IconButton size="small" onClick={() => onCopy(value)}>
                            <ContentCopy fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    </Box>
);


export default function PasswordCard({ password, onEdit, onDelete, expanded, onToggleExpand, showPassword, onTogglePassword }) {
    const color = colors[password.id % colors.length];
    const accountInitial = (password.accountName || 'U')[0].toUpperCase();

    console.log("Rendering PasswordCard for:", password);

    // Helper to copy text to clipboard
    const handleCopyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        // You can add a Snackbar here for "Copied!" feedback
        console.log("Copied to clipboard:", text);
    };

    // Get the correct icon for 2FA
    const get2FAIcon = () => {
        switch (password.securityMethod) {
            case 'Phone': return <Phone fontSize="small" />;
            case 'Email': return <Email fontSize="small" />;
            default: return <Security fontSize="small" />;
        }
    };

        const getTextBefore = () => {
        switch (password.securityValue) {
            case 'Phone': return "PhoneNo:";
            case 'Email': return "Email:";
            default: return "Auth APP:";
        }
    };

    return (
        <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.07)', position: 'relative', overflow: 'hidden' }}>
            {/* Top color accent bar */}
            <Box sx={{ height: 6, bgcolor: color }} />

            <CardContent sx={{ p: 2, '&:last-child': { pb: 1 } }}>
                {/* --- HEADER --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, px: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: color, color: '#fff', fontWeight: 'bold' }}>
                            {accountInitial}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: '600', color: '#1A2A44', lineHeight: 1.3 }}>
                                {password.accountName || 'Untitled'}
                            </Typography>
                            {password.email && (
                                <Typography variant="body2" color="text.secondary">
                                    {password.email}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Box>
                        <Tooltip title="Edit">
                            <IconButton size="small" onClick={onEdit} sx={{ color: '#1A2A44' }}>
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" onClick={onDelete} sx={{ color: '#E53935' }}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* --- CORE INFO --- */}
                <Box sx={{ px: 1, mt: 2 }}>
                    <DataRow
                        icon={<AccountCircle fontSize="small" />}
                        label="Username"
                        value={password.username || 'Not set'}
                        onCopy={handleCopyToClipboard}
                    />
                    <DataRow
                        icon={<Key fontSize="small" />}
                        label="Password"
                        value={showPassword ? password.decryptedPassword || '••••••••' : '••••••••'}
                    >
                        {/* Custom children for actions */}
                        <Tooltip title={showPassword ? "Hide Password" : "Show Password"}>
                            <IconButton size="small" onClick={onTogglePassword} sx={{ mr: 0.5 }}>
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy Password">
                            <IconButton size="small" onClick={() => handleCopyToClipboard(password.decryptedPassword)}>
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </DataRow>
                </Box>
                
                {/* --- 2FA CHIP --- */}
                {password.securityMethod && (
                    <>
                        <Box sx={{ mt: 2, px: 1 }}>
                        <Chip
                            icon={get2FAIcon()}
                            label={`2FA via ${password.securityMethod}`}
                            size="small"
                            sx={{ bgcolor: '#E9F1FC', color: '#1A2A44', fontWeight: 500 }}
                        />
                    </Box>
                     <Box sx={{ mt: 2, px: 1 }}>
                        <p style={{fontSize:"12px"}}>{getTextBefore()} <span style={{fontWeight:"bold"}}>{password.securityValue}</span> </p>
                    </Box>
                    </>
                
                )}

                {/* --- EXPAND / COLLAPSE --- */}
                <Box sx={{ mt: 1 }}>
                    <Button
                        fullWidth
                        size="small"
                        endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                        onClick={onToggleExpand}
                        sx={{ textTransform: 'none', color: '#1A2A44', fontWeight: 600, py: 1 }}
                    >
                        {expanded ? 'Hide Extra Details' : 'Show Extra Details'}
                    </Button>
                </Box>

                {/* --- COLLAPSIBLE SECTION --- */}
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 1, pb: 0 }}>
                        {password.associatedPhone && (
                            <DataRow
                                icon={<Phone fontSize="small" />}
                                label="Phone"
                                value={password.associatedPhone}
                                onCopy={handleCopyToClipboard}
                            />
                        )}
                        {password.recoveryEmail && (
                            <DataRow
                                icon={<LockReset fontSize="small" />}
                                label="Recovery Email"
                                value={password.recoveryEmail}
                                onCopy={handleCopyToClipboard}
                            />
                        )}
                        {password.securityQuestions?.map((q, i) => (
                            <Box key={i} sx={{ my: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                                <DataRow
                                    icon={<QuestionMark fontSize="small" />}
                                    label={`Q${i + 1}`}
                                    value={q.question}
                                    sx={{ borderBottom: 'none', py: 0.5 }} // Remove border for stacked rows
                                />
                                <DataRow
                                    icon={<VpnKey fontSize="small" />}
                                    label="Answer"
                                    value={q.answer}
                                    onCopy={handleCopyToClipboard}
                                    sx={{ borderBottom: 'none', py: 0.5 }} // Remove border for stacked rows
                                />
                            </Box>
                        ))}
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}