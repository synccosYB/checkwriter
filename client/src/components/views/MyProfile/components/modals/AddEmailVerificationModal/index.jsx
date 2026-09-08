import {
	Box,
	Typography,
	Button,
	TextField,
	Checkbox,
	FormControlLabel,
	CircularProgress
} from '@mui/material'
import { useState } from 'react'
import OTPInput from 'react-otp-input'
import { styles } from './styles'
import { maskEmail, validateEmail } from '../../../../../../utils/helper'
import { CustomDialog } from '../../../../../shared/dialog/CustomDialog'
import useAddMfaMethod from '../../../../../../API/mfa/useAddMfaMethod'
import useSendVerificationOTP from '../../../../../../API/mfa/useSendVerificationOTP'
import useVerifyOtp from '../../../../../../API/mfa/useVerifyOtp'
import Timer from '../../../../../shared/Timer'
import useSetDefaultMfaMethod from '../../../../../../API/mfa/useSetDefaultMfaMethod'

export const AddEmailVerificationModal = ({ open, onClose, isNew = false }) => {
	const { mutate: addMethod, isPending: isAddingMethod } = useAddMfaMethod()
	const { mutate: sendOtpToEmail, isPending: isSendingOTP } =
		useSendVerificationOTP()
	const {
		mutate: verifyOTP,
		isPending: isVerifyingOTP,
		error,
		reset: resetErrorState
	} = useVerifyOtp()
	const { mutate: setDefaultMfaMethod, isPending: isSettingDefault } =
		useSetDefaultMfaMethod()
	const [email, setEmail] = useState('')
	const [emailError, setEmailError] = useState('')
	const [isDefault, setIsDefault] = useState(false)
	const [verificationSent, setVerificationSent] = useState(false)
	const [verificationCode, setVerificationCode] = useState('')
	const [label, setLabel] = useState('')

	const [authId, setAuthId] = useState('')
	const [enableResend, setEnableResend] = useState(false)

	const isLoading =
		isAddingMethod || isSendingOTP || isVerifyingOTP || isSettingDefault

	const handleEmailChange = (e) => {
		const newEmail = e.target.value
		setEmail(newEmail)
		setEmailError(validateEmail(newEmail))
	}

	const handleSendCode = (e) => {
		e.preventDefault()
		const error = validateEmail(email)
		if (error) {
			setEmailError(error)
			return
		}
		sendOtpToEmail(
			{ methodType: 'email', value: email },
			{
				onSuccess: (data) => {
					if (data?._id) setAuthId(data._id)
					setVerificationSent(true)

					setEnableResend(false)
				}
			}
		)
	}

	const handleOtpVerification = (e) => {
		e.preventDefault()
		verifyOTP(
			{
				otp: verificationCode,
				value: email,
				methodType: 'email',
				authId
			},
			{
				onSuccess: () => {
					addMethod(
						{
							methodType: 'email',
							value: email,
							defaultDeliveryMethod: 'sms',
							authId,
							label
						},
						{
							onSuccess: (data) => {
								if (isDefault && data?.methodId)
									setDefaultMfaMethod(
										{
											methodType: 'email',
											methodId: data?.methodId
										},
										{
											onSuccess: () => {
												setAuthId('')
												onClose()
											}
										}
									)
								else {
									setAuthId('')
									onClose()
								}
							}
						}
					)
				}
			}
		)
	}

	const handleResendCode = () => {
		resetErrorState()
		setVerificationCode('')
		sendOtpToEmail(
			{ methodType: 'email', value: email, authId },
			{
				onSuccess: (data) => {
					if (data?._id) setAuthId(data._id)
					setVerificationSent(true)
					setEnableResend(false)
				}
			}
		)
	}

	return (
		<CustomDialog
			open={open}
			onClose={onClose}
			title={
				verificationSent
					? 'Enter the Verification Code'
					: isNew
					? 'Verify your Email Address'
					: 'Add Another Email Address'
			}
			content={
				<Box sx={styles.content}>
					{!verificationSent ? (
						<form onSubmit={handleSendCode}>
							<Typography sx={styles.description}>
								We will send a one-time code to your registered email address.
								Make sure you have access to it
							</Typography>

							<TextField
								fullWidth
								placeholder="Enter your email address"
								value={email}
								onChange={handleEmailChange}
								error={!!emailError}
								helperText={emailError}
								sx={styles.emailInput}
							/>

							<Box sx={styles.labelSection}>
								<Box sx={styles.labelHeader}>
									<Typography sx={styles.stepTitle}>
										Add a label for this authenticator
									</Typography>
									<Typography sx={styles.optionalText}>Optional</Typography>
								</Box>
								<Box sx={styles.descriptionContainer}>
									<Typography sx={styles.stepDescription}>
										Enter a label to help you recognize this authenticator
									</Typography>
								</Box>
								<TextField
									fullWidth
									placeholder="Enter a label for this authenticator"
									sx={styles.labelInput}
									value={label}
									onChange={({ target: { value } }) => setLabel(value)}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={isDefault}
											onChange={(e) => setIsDefault(e.target.checked)}
											sx={styles.checkbox}
										/>
									}
									label="Make it default method"
									sx={styles.checkboxLabel}
								/>
							</Box>
							<Box
								display={'flex'}
								justifyContent={'flex-end'}
								alignItems={'center'}
								gap={3}
							>
								<Button onClick={onClose} sx={styles.cancelButton}>
									Cancel
								</Button>
								<Button
									type="submit"
									variant="contained"
									sx={styles.verifyButton}
									disabled={!verificationSent && !!emailError}
									endIcon={isLoading && <CircularProgress size={'14px'} />}
								>
									Send Verification Code
								</Button>
							</Box>
						</form>
					) : (
						<form onSubmit={handleOtpVerification}>
							<Box>
								<Typography sx={styles.description}>
									Your email for verification is: {maskEmail(email)}. Please
									check your inbox and enter the verification code to proceed.
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
									<Box>
										<Typography sx={styles.error}>
											{error?.response?.data?.error}
										</Typography>
									</Box>
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
									display={'flex'}
									justifyContent={'flex-end'}
									alignItems={'center'}
									gap={3}
								>
									<Button onClick={onClose} sx={styles.cancelButton}>
										Cancel
									</Button>
									<Button
										type="submit"
										variant="contained"
										onClick={handleOtpVerification}
										sx={styles.verifyButton}
										disabled={!verificationSent && !!emailError}
										endIcon={isLoading && <CircularProgress size={'14px'} />}
									>
										Verify
									</Button>
								</Box>
							</Box>
						</form>
					)}
				</Box>
			}
		/>
	)
}
