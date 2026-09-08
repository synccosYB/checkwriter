import React from 'react'
import { Box, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'

import appLogoDark from '../../assets/images/app-logo-dark.png'
import AuthRoutes from '../../routes/AuthRoutes'
import { authColors } from '../../styles/authStyles'

const AuthLayout = () => {
        return (
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                        <Box
                                sx={{
                                        display: { xs: 'none', md: 'flex' },
                                        width: '42%',
                                        minWidth: '380px',
                                        maxWidth: '520px',
                                        background: `linear-gradient(165deg, ${authColors.navy} 0%, ${authColors.navyLight} 60%, #234b7a 100%)`,
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        padding: '48px 40px',
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
                                                opacity: 0.04,
                                                backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px),
                                                        radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)`,
                                                backgroundSize: '40px 40px',
                                                pointerEvents: 'none',
                                        }}
                                />

                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                        <Box sx={{ mb: 6 }}>
                                                <img
                                                        src={appLogoDark}
                                                        alt="Synccos"
                                                        style={{
                                                                height: '36px',
                                                                width: 'auto',
                                                                objectFit: 'contain',
                                                                filter: 'brightness(0) invert(1)',
                                                        }}
                                                        onError={(e) => {
                                                                e.target.style.display = 'none'
                                                        }}
                                                />
                                        </Box>

                                        <Typography
                                                sx={{
                                                        color: '#fff',
                                                        fontSize: '28px',
                                                        fontWeight: 700,
                                                        lineHeight: 1.3,
                                                        letterSpacing: '-0.02em',
                                                        mb: 2,
                                                }}
                                        >
                                                Professional Check{'\n'}Management,{' '}
                                                <Box component="span" sx={{ color: authColors.accent }}>
                                                        Simplified
                                                </Box>
                                        </Typography>
                                        <Typography
                                                sx={{
                                                        color: 'rgba(255,255,255,0.65)',
                                                        fontSize: '15px',
                                                        lineHeight: 1.6,
                                                        maxWidth: '340px',
                                                }}
                                        >
                                                Streamline your financial operations with enterprise-grade check writing and management tools.
                                        </Typography>
                                </Box>

                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', mb: 5 }}>
                                                {[
                                                        {
                                                                icon: <LockOutlinedIcon sx={{ fontSize: 20, color: authColors.accent }} />,
                                                                title: 'Bank-Level Security',
                                                                desc: 'Enterprise encryption and fraud prevention',
                                                        },
                                                        {
                                                                icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 20, color: authColors.accent }} />,
                                                                title: 'Compliance Ready',
                                                                desc: 'Built for financial regulations',
                                                        },
                                                        {
                                                                icon: <SpeedOutlinedIcon sx={{ fontSize: 20, color: authColors.accent }} />,
                                                                title: 'Fast Processing',
                                                                desc: 'Generate checks in seconds',
                                                        },
                                                ].map((item, i) => (
                                                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                                                <Box
                                                                        sx={{
                                                                                width: 36,
                                                                                height: 36,
                                                                                borderRadius: '8px',
                                                                                backgroundColor: `${authColors.accent}1f`,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                flexShrink: 0,
                                                                        }}
                                                                >
                                                                        {item.icon}
                                                                </Box>
                                                                <Box>
                                                                        <Typography
                                                                                sx={{
                                                                                        color: '#fff',
                                                                                        fontSize: '14px',
                                                                                        fontWeight: 600,
                                                                                        mb: '2px',
                                                                                }}
                                                                        >
                                                                                {item.title}
                                                                        </Typography>
                                                                        <Typography
                                                                                sx={{
                                                                                        color: 'rgba(255,255,255,0.5)',
                                                                                        fontSize: '13px',
                                                                                }}
                                                                        >
                                                                                {item.desc}
                                                                        </Typography>
                                                                </Box>
                                                        </Box>
                                                ))}
                                        </Box>

                                        <Box
                                                sx={{
                                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                                        pt: 3,
                                                }}
                                        >
                                                <Typography
                                                        sx={{
                                                                color: 'rgba(255,255,255,0.4)',
                                                                fontSize: '12px',
                                                        }}
                                                >
                                                        Trusted by businesses nationwide
                                                </Typography>
                                        </Box>
                                </Box>
                        </Box>

                        <Box
                                sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: '100vh',
                                        backgroundColor: authColors.background,
                                }}
                        >
                                <Box
                                        sx={{
                                                display: { xs: 'flex', md: 'none' },
                                                padding: '20px 24px',
                                                justifyContent: 'center',
                                        }}
                                >
                                        <img
                                                src={appLogoDark}
                                                alt="Synccos"
                                                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                                                onError={(e) => {
                                                        e.target.style.display = 'none'
                                                }}
                                        />
                                </Box>

                                <Box
                                        sx={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: { xs: '24px 16px', sm: '32px 24px', md: '40px 48px' },
                                                overflowY: 'auto',
                                        }}
                                >
                                        <Box sx={{ width: '100%', maxWidth: '480px' }}>
                                                <AuthRoutes />
                                        </Box>
                                </Box>
                        </Box>
                </Box>
        )
}

export default AuthLayout
