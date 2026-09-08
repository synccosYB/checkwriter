import {
        Box,
        Typography,
        Button,
        TextField,
        InputAdornment,
        IconButton,
        CircularProgress
} from '@mui/material'
import { useState } from 'react'

import { styles } from './styles'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { maskEmail } from '../../../../../../utils/helper'
import { CustomDialog } from '../../../../../shared/dialog/CustomDialog'
import useVerifyVerificationCode from '../../../../../../API/validation/useVerifyVerificationCode'
import OTPInput from 'react-otp-input'
import Timer from '../../../../../shared/Timer'
import useUpdatePassword from '../../../../../../API/auth/useUpdatePassword'

export const AddPasswordModal = ({
        open,
        onClose,
        isNew,
        emailInfo,
        onResendCode
}) => {
        const {
                mutate: verifyOTP,
                isPending: isVerifyingOtp,
                error,
                reset: resetVerifyOTPState
        } = useVerifyVerificationCode()

        const {
                mutate: updatePAssword,
                isPending: isUpdatingPassword,
                error: updatePasswordError
        } = useUpdatePassword()

        const [isEmailVerified, setIsEmailVerified] = useState(false)
        const [verificationCode, setVerificationCode] = useState('')
        const [newPassword, setNewPassword] = useState('')
        const [confirmPassword, setConfirmPassword] = useState('')
        const [currentPassword, setCurrentPassword] = useState(
                isNew ? 'OLD PASSWORD' : ''
        )
        const [showPassword, setShowPassword] = useState(false)
        const [showCurrentPassword, setShowCurrentPassword] = useState(false)
        const [enableResend, setEnableResend] = useState(false)

        const email = emailInfo?.email

        const handleResendCode = () => {
                onResendCode()
                setEnableResend(false)
                setVerificationCode('')
                resetVerifyOTPState()
        }

        const handleTogglePassword = () => {
                if (showPassword === null || showPassword === undefined) return
                setShowPassword(!showPassword)
        }

        const handleToggleCurrentPassword = () => {
                setShowCurrentPassword(!showCurrentPassword)
        }

        const handleNewPasswordChange = (e) => {
                setNewPassword(e.target.value)
        }

        const handleConfirmPasswordChange = (e) => {
                setConfirmPassword(e.target.value)
        }

        const handleCurrentPasswordChange = (e) => {
                setCurrentPassword(e.target.value)
        }

        const validatePassword = (password = '') => {
                return [
                        {
                                isValid: password.length >= 8,
                                errorText: 'Must be at least 8 characters long'
                        }, // Length requirement
                        {
                                isValid:
                                        /[A-Z]/.test(password) && // At least 1 uppercase
                                        /[a-z]/.test(password) && // At least 1 lowercase
                                        /\d/.test(password),
                                errorText:
                                        'Include at least 1 uppercase letter & 1 lowercase letter & One number'
                        }, // At least 1 number
                        {
                                isValid: /[!@#$%^&*]/.test(password),
                                errorText: 'Include at least 1 special character (!@#$%^&*)'
                        } // At least 1 special character
                ]
        }

        const handleVerifyCode = (e) => {
                if (e) {
                        e.preventDefault()
                }

                if (verificationCode.length === 6) {
                        verifyOTP(
                                {
                                        methodType: 'email',
                                        otp: verificationCode,
                                        methodId: emailInfo?.id
                                },
                                {
                                        onSuccess: () => {
                                                setIsEmailVerified(true)
                                        }
                                }
                        )
                }
        }

        const handleUpdatePassword = (e) => {
                e.preventDefault()
                updatePAssword(
                        { email, newPassword, oldPassword: currentPassword },
                        {
                                onSuccess: () => {
                                        onClose()
                                }
                        }
                )
        }

        const renderVerification = () => {
                return (
                        <form onSubmit={handleVerifyCode}>
                                <Typography sx={styles.description}>
                                        Your email for verification is: {maskEmail(email)}. Please check your
                                        inbox and enter the verification code to proceed.
                                </Typography>

                                <Box sx={styles.verificationSection}>
                                        <Box sx={styles.codeInputContainer}>
                                                <OTPInput
                                                        shouldAutoFocus
                                                        value={verificationCode}
                                                        onChange={setVerificationCode}
                                                        numInputs={6}
                                                        className="d-flex align-items-center justify-content-between mb-5"
                                                        renderInput={(props) => (
                                                                <input
                                                                        {...props}
                                                                        className="otpInput fs-3 text-black mb-5"
                                                                        type="number"
                                                                        style={{ ...styles.codeInput, marginRight: '10px' }}
                                                                />
                                                        )}
                                                />
                                        </Box>
                                        <Typography sx={styles.error}>
                                                {error?.response?.data?.error?.developerMessage}
                                        </Typography>
                                        <Box sx={styles.resendSection}>
                                                {!enableResend && (
                                                        <Timer onTimerComplete={() => setEnableResend(true)} />
                                                )}
                                                <Typography
                                                        disabled={!enableResend}
                                                        onClick={enableResend ? handleResendCode : undefined}
                                                        sx={{
                                                                color: enableResend ? 'inherit' : 'lightgray',
                                                                cursor: enableResend ? 'pointer' : 'not-allowed',
                                                                textDecoration: enableResend ? 'underline' : 'none',
                                                                ...styles.resendText
                                                        }}
                                                >
                                                        Resend Code
                                                </Typography>
                                        </Box>
                                </Box>
                                <Box
                                        sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}
                                >
                                        <Button onClick={onClose} sx={styles.cancelButton}>
                                                Cancel
                                        </Button>
                                        <Button
                                                type="submit"
                                                variant="contained"
                                                sx={styles.verifyButton}
                                                disabled={verificationCode.length < 6}
                                                endIcon={isVerifyingOtp && <CircularProgress size={'14px'} />}
                                        >
                                                Verify Code
                                        </Button>
                                </Box>
                        </form>
                )
        }

        const renderChangePassword = () => {
                return (
                        <form onSubmit={handleUpdatePassword}>
                                <Box>
                                        <Typography sx={styles.description}>
                                                {isNew
                                                        ? 'Create a secure password for your account.'
                                                        : "You'll need to enter your current password before setting a new one."}
                                        </Typography>

                                        <Box sx={styles.labelSection}>
                                                {!isNew && (
                                                        <>
                                                                <Typography sx={styles.stepTitle}>Current Password</Typography>
                                                                <TextField
                                                                        fullWidth
                                                                        placeholder="Enter your current password"
                                                                        type={showCurrentPassword ? 'text' : 'password'} // Toggle password visibility
                                                                        value={currentPassword}
                                                                        onChange={handleCurrentPasswordChange}
                                                                        sx={{ ...styles.passwordInput }}
                                                                        InputProps={{
                                                                                endAdornment: (
                                                                                        <InputAdornment position="end">
                                                                                                <IconButton
                                                                                                        onClick={handleToggleCurrentPassword}
                                                                                                        edge="end"
                                                                                                >
                                                                                                        {showCurrentPassword ? (
                                                                                                                <VisibilityOff />
                                                                                                        ) : (
                                                                                                                <Visibility />
                                                                                                        )}
                                                                                                </IconButton>
                                                                                        </InputAdornment>
                                                                                )
                                                                        }}
                                                                        error={
                                                                                !!updatePasswordError?.response?.data?.error?.userMessage
                                                                        }
                                                                        helperText={
                                                                                updatePasswordError?.response?.data?.error?.userMessage
                                                                        }
                                                                />
                                                        </>
                                                )}

                                                <Typography sx={styles.stepTitle}>Enter New Password</Typography>
                                                <TextField
                                                        fullWidth
                                                        placeholder="Enter New password"
                                                        type={showPassword ? 'text' : 'password'} // Toggle password visibility
                                                        value={newPassword}
                                                        onChange={handleNewPasswordChange}
                                                        sx={styles.passwordInput}
                                                        InputProps={{
                                                                endAdornment: (
                                                                        <InputAdornment position="end">
                                                                                <IconButton onClick={handleTogglePassword} edge="end">
                                                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                                </IconButton>
                                                                        </InputAdornment>
                                                                )
                                                        }}
                                                        error={currentPassword && currentPassword === newPassword}
                                                        helperText={
                                                                currentPassword && currentPassword === newPassword
                                                                        ? 'The new password must be different from the old password.'
                                                                        : ''
                                                        }
                                                />

                                                <Typography sx={styles.stepTitle}>Confirm New Password</Typography>
                                                <TextField
                                                        fullWidth
                                                        placeholder="Confirm new password"
                                                        type={showPassword ? 'text' : 'password'} // Toggle password visibility
                                                        value={confirmPassword}
                                                        onChange={handleConfirmPasswordChange}
                                                        error={!!confirmPassword && confirmPassword !== newPassword}
                                                        helperText={
                                                                confirmPassword && confirmPassword !== newPassword
                                                                        ? 'Password and Confirm Password do not match.'
                                                                        : ''
                                                        }
                                                        sx={styles.passwordInput}
                                                        InputProps={{
                                                                endAdornment: (
                                                                        <InputAdornment position="end">
                                                                                <IconButton onClick={handleTogglePassword} edge="end">
                                                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                                </IconButton>
                                                                        </InputAdornment>
                                                                )
                                                        }}
                                                />
                                                {validatePassword(newPassword).map(
                                                        ({ isValid, errorText }, index) => (
                                                                <Box
                                                                        sx={{
                                                                                ...styles.errorTestContainer,
                                                                                color: isValid ? '#00CF72' : '#F03D3E'
                                                                        }}
                                                                        key={index}
                                                                >
                                                                        <CheckCircleRoundedIcon />
                                                                        <Typography>{errorText}</Typography>
                                                                </Box>
                                                        )
                                                )}
                                        </Box>
                                        <Box
                                                sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}
                                        >
                                                <Button onClick={onClose} sx={styles.cancelButton}>
                                                        Cancel
                                                </Button>
                                                <Button
                                                        type="submit"
                                                        disabled={isUpdatingPassword}
                                                        variant="contained"
                                                        sx={styles.verifyButton}
                                                        endIcon={isUpdatingPassword && <CircularProgress size={'14px'} />}
                                                >
                                                        {isNew ? 'Create Password Password' : 'Change Password'}
                                                </Button>
                                        </Box>
                                </Box>
                        </form>
                )
        }

        return (
                <CustomDialog
                        open={open}
                        onClose={onClose}
                        title={
                                !isEmailVerified
                                        ? 'Verify Your Email'
                                        : isNew
                                        ? 'Set Your Password'
                                        : 'Change Your Password'
                        }
                        content={
                                <Box sx={styles.content}>
                                        {isEmailVerified ? renderChangePassword() : renderVerification()}
                                </Box>
                        }
                />
        )
}
