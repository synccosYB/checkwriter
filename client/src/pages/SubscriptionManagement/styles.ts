import { styled } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

export const PageContainer = styled('div')(({ theme }) => ({
        padding: theme.spacing(3),
        [theme.breakpoints.up('md')]: {
                padding: theme.spacing(4),      
        },
        [theme.breakpoints.down('md')]: {
                marginTop:'75px',       
        }
}))

export const CardBox = styled(Box)(({ theme }) => ({
        border: `1px solid #e2e8f0`,
        borderRadius: 12,
        padding: '24px',
        boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
}))

export const CardHeaderRow = styled('div')(({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
}))

export const Badge = styled('span')(({ theme }) => ({
        fontSize: 12,
        fontWeight: 500,
        padding: '8.5px 20px',
        borderRadius: '6px',
        background:
                '#1e3a5f1A',
        border: `1px solid #1e3a5f`
}))

export const PriceRow = styled('div')(() => ({
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6
}))

export const Label = styled(Typography)(({ theme }) => ({
        fontWeight: 600,
        color: theme.palette.text.secondary,
}))

export const ValueMuted = styled(Typography)(({ theme }) => ({
        color: theme.palette.text.primary,
        fontWeight: 600
}))

export const MutedText = styled(Typography)(({ theme }) => ({
        color: '#64748b',
        fontSize: 16,
        fontWeight: 500,
        marginTop:8
}))

export const PMIconWrap = styled('div')(() => ({
        display: 'flex',
        alignItems: 'center',
}))

export const ConfirmationModalDesc = styled(Typography)(({ theme }) => ({
        color: '#64748b',
        fontSize: 16,
        fontWeight: 500,
}))