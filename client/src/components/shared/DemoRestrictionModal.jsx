import React from 'react'
import {
        Dialog,
        DialogTitle,
        DialogContent,
        DialogActions,
        Button,
        Typography,
        Box
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { MyCookies } from '../../utils/cookies/Cookies'

const DemoRestrictionModal = ({ open, onClose }) => {
        const handleStartTrial = () => {
                onClose()
                MyCookies.removeAll()
                window.location.href = '/auth/sign-up'
        }

        return (
                <Dialog
                        open={open}
                        onClose={onClose}
                        maxWidth="xs"
                        fullWidth
                        PaperProps={{
                                sx: {
                                        borderRadius: '16px',
                                        padding: '8px'
                                }
                        }}
                >
                        <DialogTitle sx={{ textAlign: 'center', pb: 0, pt: 3 }}>
                                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                        <Box
                                                sx={{
                                                        width: 56,
                                                        height: 56,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #1e3a5f 0%, #31527f 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mb: 1
                                                }}
                                        >
                                                <LockOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={700} color="#1A1A2E">
                                                Demo Account Limitation
                                        </Typography>
                                </Box>
                        </DialogTitle>

                        <DialogContent sx={{ textAlign: 'center', pt: 2, pb: 1 }}>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                        This feature is not available in demo mode.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                        Start a free trial to unlock bank management, subscriptions, payment
                                        links, QuickBooks integration, and check mailing — with no commitment
                                        required.
                                </Typography>
                        </DialogContent>

                        <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 3, pt: 1 }}>
                                <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={handleStartTrial}
                                        sx={{
                                                background: 'linear-gradient(90deg, #1e3a5f 4%, #31527f 100%)',
                                                borderRadius: '10px',
                                                height: '44px',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '15px',
                                                '&:hover': {
                                                        background: 'linear-gradient(90deg, #5a2e99 4%, #9e3fb0 100%)'
                                                }
                                        }}
                                >
                                        Start Free Trial
                                </Button>
                                <Button
                                        variant="text"
                                        fullWidth
                                        onClick={onClose}
                                        sx={{
                                                borderRadius: '10px',
                                                height: '40px',
                                                textTransform: 'none',
                                                color: '#6C757D',
                                                fontSize: '14px'
                                        }}
                                >
                                        Continue Exploring Demo
                                </Button>
                        </DialogActions>
                </Dialog>
        )
}

export default DemoRestrictionModal
