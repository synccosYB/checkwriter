import React, { useEffect, useState } from 'react'
import {
        Box,
        Typography,
        Button,
        TextField,
        InputAdornment,
        IconButton
} from '@mui/material'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../redux/snackbarState'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import {
        authInputSx,
        authPrimaryButtonSx,
        authCardSx,
        authPageTitleSx,
        authPageSubtitleSx,
        authColors,
} from '../styles/authStyles'

const isNew = false

const NewPassword = () => {
        const history = useHistory()

        const location = useLocation()
        const dispatch = useDispatch()

        const [newPassword, setNewPassword] = useState('')
        const [confirmPassword, setConfirmPassword] = useState('')
        const [showPassword, setShowPassword] = useState(false)

        useEffect(() => {
                if (!location.search) {
                        history.push('/auth/login')
                }
        }, [history, location])

        const searchParams = new URLSearchParams(location?.search)
        const token = searchParams?.get('token') ? searchParams.get('token') : ''

        const onSubmit = async (e) => {
                e.preventDefault()
                try {
                        const response = await fetch(
                                `${process.env.REACT_APP_BASE_URL}/auth/reset-password`,
                                {
                                        method: 'POST',
                                        headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `${token}`
                                        },
                                        body: JSON.stringify({ password: newPassword, confirmPassword })
                                }
                        )

                        const data = await response.json()

                        if (!response.ok) {
                                throw new Error(data?.error?.message || 'Unable to update password.')
                        }

                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        severity: 'success',
                                        message: 'Password updated successfully.'
                                })
                        )

                        history.push('/auth/login')
                } catch (error) {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        severity: 'error',
                                        message: 'Unable to update password.'
                                })
                        )
                }
        }

        const handleTogglePassword = () => {
                setShowPassword(!showPassword)
        }

        const validatePassword = (password = '') => {
                return [
                        {
                                isValid: password.length >= 8,
                                errorText: 'Must be at least 8 characters long'
                        },
                        {
                                isValid:
                                        /[A-Z]/.test(password) &&
                                        /[a-z]/.test(password) &&
                                        /\d/.test(password),
                                errorText:
                                        'Include at least 1 uppercase letter & 1 lowercase letter & One number'
                        },
                        {
                                isValid: /[!@#$%^&*]/.test(password),
                                errorText: 'Include at least 1 special character (!@#$%^&*)'
                        }
                ]
        }

        const handleNewPasswordChange = (e) => {
                setNewPassword(e.target.value)
        }

        const handleConfirmPasswordChange = (e) => {
                setConfirmPassword(e.target.value)
        }

        return (
                <Box sx={authCardSx}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography sx={authPageTitleSx}>
                                        Set New Password
                                </Typography>
                                <Typography sx={authPageSubtitleSx}>
                                        {!isNew
                                                ? 'Create a secure password for your account.'
                                                : "You'll need to enter your current password before setting a new one."}
                                </Typography>
                        </Box>

                        <form onSubmit={onSubmit}>
                                <Box sx={{ mb: 2.5 }}>
                                        <Typography
                                                sx={{
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        color: authColors.textPrimary,
                                                        mb: 1,
                                                }}
                                        >
                                                New Password
                                        </Typography>
                                        <TextField
                                                fullWidth
                                                placeholder="Enter new password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={handleNewPasswordChange}
                                                sx={authInputSx}
                                                InputProps={{
                                                        endAdornment: (
                                                                <InputAdornment position="end">
                                                                        <IconButton
                                                                                onClick={handleTogglePassword}
                                                                                edge="end"
                                                                                sx={{ color: authColors.textMuted }}
                                                                        >
                                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                        </IconButton>
                                                                </InputAdornment>
                                                        )
                                                }}
                                        />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                        <Typography
                                                sx={{
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        color: authColors.textPrimary,
                                                        mb: 1,
                                                }}
                                        >
                                                Confirm New Password
                                        </Typography>
                                        <TextField
                                                fullWidth
                                                placeholder="Confirm new password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={handleConfirmPasswordChange}
                                                error={!!confirmPassword && confirmPassword !== newPassword}
                                                helperText={
                                                        confirmPassword && confirmPassword !== newPassword
                                                                ? 'Password and Confirm Password do not match.'
                                                                : ''
                                                }
                                                sx={authInputSx}
                                                InputProps={{
                                                        endAdornment: (
                                                                <InputAdornment position="end">
                                                                        <IconButton
                                                                                onClick={handleTogglePassword}
                                                                                edge="end"
                                                                                sx={{ color: authColors.textMuted }}
                                                                        >
                                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                        </IconButton>
                                                                </InputAdornment>
                                                        )
                                                }}
                                        />
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                        {validatePassword(newPassword).map(
                                                ({ isValid, errorText }, index) => (
                                                        <Box
                                                                sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        mb: 0.5,
                                                                        color: isValid ? authColors.success : authColors.error,
                                                                }}
                                                                key={index}
                                                        >
                                                                <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                                                                <Typography sx={{ fontSize: '13px' }}>{errorText}</Typography>
                                                        </Box>
                                                )
                                        )}
                                </Box>

                                <Button type="submit" sx={authPrimaryButtonSx}>
                                        {isNew ? 'Create Password' : 'Reset Password'}
                                </Button>
                        </form>

                        <Typography
                                sx={{
                                        textAlign: 'center',
                                        mt: 4,
                                        fontSize: '14px',
                                        color: authColors.textSecondary,
                                }}
                        >
                                Back to{' '}
                                <Link
                                        to="/auth/login"
                                        style={{
                                                color: authColors.navyLight,
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                        }}
                                >
                                        Sign In
                                </Link>
                        </Typography>
                </Box>
        )
}

export default NewPassword
