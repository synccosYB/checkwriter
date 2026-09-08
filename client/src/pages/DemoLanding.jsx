import { useEffect, useState } from 'react'
import { Box, CircularProgress, Typography, Button } from '@mui/material'
import useDemoLogin from '../API/auth/useDemoLogin'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { authColors, authPrimaryButtonSx } from '../styles/authStyles'

const DemoLanding = () => {
        const { mutate: demoLogin, isError, reset } = useDemoLogin()
        const [started, setStarted] = useState(false)

        useEffect(() => {
                if (!started) {
                        setStarted(true)
                        demoLogin()
                }
        }, [started, demoLogin])

        const handleRetry = () => {
                reset()
                setStarted(false)
        }

        return (
                <Box
                        sx={{
                                minHeight: '100vh',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(165deg, ${authColors.navy} 0%, ${authColors.navyLight} 60%, #234b7a 100%)`,
                                padding: { xs: '24px 16px', sm: '32px' },
                                position: 'relative',
                                overflow: 'hidden',
                        }}
                >
                        <Box
                                sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        opacity: 0.03,
                                        backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px),
                                                radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)`,
                                        backgroundSize: '40px 40px',
                                        pointerEvents: 'none',
                                }}
                        />

                        <Box
                                sx={{
                                        backgroundColor: '#fff',
                                        borderRadius: '20px',
                                        padding: { xs: '40px 32px', sm: '56px 64px' },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '24px',
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                                        minWidth: { xs: '280px', sm: '380px' },
                                        maxWidth: '440px',
                                        textAlign: 'center',
                                        position: 'relative',
                                        zIndex: 1,
                                }}
                        >
                                <Box
                                        sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: '14px',
                                                background: `linear-gradient(135deg, ${authColors.navy} 0%, ${authColors.navyLight} 100%)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                        }}
                                >
                                        <LockOutlinedIcon sx={{ color: authColors.accent, fontSize: 28 }} />
                                </Box>

                                <img
                                        src="/synccos-logo.png"
                                        alt="Synccos"
                                        style={{ height: '32px', objectFit: 'contain' }}
                                        onError={(e) => { e.target.style.display = 'none' }}
                                />

                                {isError ? (
                                        <>
                                                <Typography
                                                        sx={{
                                                                fontSize: '20px',
                                                                fontWeight: 700,
                                                                color: authColors.textPrimary,
                                                                letterSpacing: '-0.02em',
                                                        }}
                                                >
                                                        Something went wrong
                                                </Typography>
                                                <Typography
                                                        sx={{
                                                                fontSize: '15px',
                                                                color: authColors.textSecondary,
                                                                lineHeight: 1.5,
                                                        }}
                                                >
                                                        We couldn't start your demo session. Please try again.
                                                </Typography>
                                                <Button
                                                        variant="contained"
                                                        onClick={handleRetry}
                                                        sx={{
                                                                ...authPrimaryButtonSx,
                                                                width: 'auto',
                                                                px: 5,
                                                                mt: 1,
                                                        }}
                                                >
                                                        Try Again
                                                </Button>
                                        </>
                                ) : (
                                        <>
                                                <CircularProgress
                                                        size={44}
                                                        thickness={4}
                                                        sx={{ color: authColors.navyLight }}
                                                />
                                                <Box>
                                                        <Typography
                                                                sx={{
                                                                        fontSize: '22px',
                                                                        fontWeight: 700,
                                                                        color: authColors.textPrimary,
                                                                        mb: '6px',
                                                                        letterSpacing: '-0.02em',
                                                                }}
                                                        >
                                                                Setting up your demo
                                                        </Typography>
                                                        <Typography
                                                                sx={{
                                                                        fontSize: '15px',
                                                                        color: authColors.textSecondary,
                                                                        lineHeight: 1.5,
                                                                }}
                                                        >
                                                                Just a moment while we prepare your account...
                                                        </Typography>
                                                </Box>
                                        </>
                                )}
                        </Box>

                        <Typography
                                sx={{
                                        mt: 4,
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.5)',
                                        position: 'relative',
                                        zIndex: 1,
                                }}
                        >
                                Powered by Synccos
                        </Typography>
                </Box>
        )
}

export default DemoLanding
