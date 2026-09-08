import React, { useEffect, useState } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../redux/snackbarState'
import { fetchGroups, fetchTags } from '../utils/helper'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import useVerifyAuthOtp from '../API/verify/useVerifyAuthOtp'
import useSignup from '../API/auth/useSignup'
import useGoogleSignup from '../API/auth/useGoogleSignup'
import OTPInput from 'react-otp-input'
import Timer from '../components/shared/Timer'
import useSendAuthOtp from '../API/verify/useSendAuthOtp'
import {
        authPrimaryButtonSx,
        authCardSx,
        authPageTitleSx,
        authPageSubtitleSx,
        authColors,
} from '../styles/authStyles'

const OTPVerify = () => {
        const history = useHistory()
        const dispatch = useDispatch()

        const {
                mutate: verifyAuthOtp,
                isPending: isVerifying,
                error
        } = useVerifyAuthOtp()
        const { mutate: signup, isPending: isSigningUp } = useSignup()
        const { mutate: googleSignUp, isPending } = useGoogleSignup()
        const { mutate: sendOtp, isPending: isResending } = useSendAuthOtp()

        const [verificationCode, setVerificationCode] = useState('')

        const [enableResend, setEnableResend] = useState(false)

        const isLoading = isVerifying || isSigningUp || isPending

        const location = useLocation()
        const [formValues, setformValues] = useState(null)

        const mode = location?.state?.mode || 'standard'

        useEffect(() => {
                if (location?.state?.values) {
                        setformValues({ ...location?.state?.values })
                } else {
                        history.push('/auth/sign-up')
                }
        }, [location, history])

        const handleSubmit = async (event) => {
                event.preventDefault()

                if (verificationCode.length !== 6) {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        severity: 'warning',
                                        message: 'OTP must be 6 digits.'
                                })
                        )
                        return false
                }

                verifyAuthOtp(
                        {
                                email: formValues?.email.toLowerCase(),
                                otp: verificationCode
                        },
                        {
                                onSuccess: () => {
                                        if (mode === 'google') {
                                                googleSignUp({
                                                        ...formValues,
                                                        googleAuthToken: location.state.authData?.googleAuthToken
                                                })
                                        } else userSignUP(formValues)
                                }
                        }
                )
        }

        const userSignUP = async (values) => {
                if (values.password !== values.confirmPassword) {
                        dispatch(
                                updateSnackbar({
                                        open: true,
                                        severity: 'warning',
                                        message: 'Password Mismatch.'
                                })
                        )
                        return false
                }

                const body = { ...values, email: values.email.toLowerCase() }
                delete body.confirmPassword

                signup(body, {
                        onSuccess: () => {
                                fetchTags(dispatch)
                                fetchGroups(dispatch)
                        }
                })
        }

        const handleResendCode = () => {
                sendOtp(
                        { email: formValues?.email },
                        {
                                onSuccess: () => {
                                        setEnableResend(false)
                                }
                        }
                )
        }

        return (
                <Box sx={authCardSx}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography sx={authPageTitleSx}>
                                        Enter Verification Code
                                </Typography>
                                <Typography sx={authPageSubtitleSx}>
                                        We sent a verification code to{' '}
                                        <Box component="span" sx={{ fontWeight: 600, color: authColors.textPrimary }}>
                                                {formValues?.email}
                                        </Box>
                                        . Please enter the code below to continue.
                                </Typography>
                        </Box>

                        <form onSubmit={handleSubmit}>
                                <Box
                                        sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                mb: 3,
                                        }}
                                >
                                        <OTPInput
                                                shouldAutoFocus
                                                value={verificationCode}
                                                onChange={setVerificationCode}
                                                numInputs={6}
                                                renderInput={(props) => (
                                                        <input
                                                                {...props}
                                                                type="number"
                                                                style={{
                                                                        width: '48px',
                                                                        height: '54px',
                                                                        marginRight: '8px',
                                                                        borderRadius: '10px',
                                                                        border: `2px solid ${authColors.border}`,
                                                                        fontSize: '22px',
                                                                        fontWeight: 600,
                                                                        textAlign: 'center',
                                                                        color: authColors.textPrimary,
                                                                        outline: 'none',
                                                                        transition: 'border-color 0.2s ease',
                                                                        backgroundColor: '#fff',
                                                                }}
                                                                onFocus={(e) => {
                                                                        e.target.style.borderColor = authColors.navyLight
                                                                }}
                                                                onBlur={(e) => {
                                                                        e.target.style.borderColor = authColors.border
                                                                }}
                                                        />
                                                )}
                                        />
                                </Box>

                                {error?.response?.data?.error?.developerMessage && (
                                        <Typography
                                                sx={{
                                                        color: authColors.error,
                                                        fontSize: '13px',
                                                        textAlign: 'center',
                                                        mb: 2,
                                                }}
                                        >
                                                {error?.response?.data?.error?.developerMessage}
                                        </Typography>
                                )}

                                <Box
                                        sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1,
                                                mb: 3,
                                        }}
                                >
                                        {!enableResend && (
                                                <Timer onTimerComplete={() => setEnableResend(true)} />
                                        )}
                                        <Typography
                                                disabled={!enableResend}
                                                onClick={enableResend ? handleResendCode : undefined}
                                                sx={{
                                                        color: enableResend ? authColors.navyLight : authColors.textMuted,
                                                        cursor: enableResend ? 'pointer' : 'not-allowed',
                                                        textDecoration: enableResend ? 'underline' : 'none',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                }}
                                        >
                                                Resend Code {isResending && <CircularProgress size={'12px'} />}
                                        </Typography>
                                </Box>

                                <Button
                                        type="submit"
                                        disabled={verificationCode.length < 6 || isLoading}
                                        sx={authPrimaryButtonSx}
                                        endIcon={isLoading && <CircularProgress size={'14px'} sx={{ color: '#fff' }} />}
                                >
                                        Verify Code
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
                                        to="/auth/sign-up"
                                        style={{
                                                color: authColors.navyLight,
                                                textDecoration: 'none',
                                                fontWeight: 600,
                                        }}
                                >
                                        Sign Up
                                </Link>
                        </Typography>
                </Box>
        )
}

export default OTPVerify
