import {
	Box,
	Typography,
	Button,
	TextField,
	Checkbox,
	FormControlLabel,
	Radio,
	RadioGroup,
	CircularProgress
} from '@mui/material'
import { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

import { styles } from './styles'
import { maskPhone, validatePhone } from '../../../../../../utils/helper'
import { CustomDialog } from '../../../../../shared/dialog/CustomDialog'
import OTPInput from 'react-otp-input'
import useAddMfaMethod from '../../../../../../API/mfa/useAddMfaMethod'
import useSendVerificationOTP from '../../../../../../API/mfa/useSendVerificationOTP'
import useVerifyOtp from '../../../../../../API/mfa/useVerifyOtp'
import Timer from '../../../../../shared/Timer'
import useSetDefaultMfaMethod from '../../../../../../API/mfa/useSetDefaultMfaMethod'

export const AddPhoneVerificationModal = ({ open, onClose, isNew = false }) => {
	const { mutate: addMethod, isPending: isAddingMethod } = useAddMfaMethod()
	const { mutate: sendOtpToPhoneNumber, isPending: isSendingOTP } =
		useSendVerificationOTP()
	const {
		mutate: verifyOTP,
		isPending: isVerifyingOTP,
		error,
		reset: resetErrorState
	} = useVerifyOtp()
	const { mutate: setDefaultMfaMethod, isPending: isSettingDefault } =
		useSetDefaultMfaMethod()
	const [phone, setPhone] = useState('')
	const [phoneError, setPhoneError] = useState('')
	const [isDefault, setIsDefault] = useState(false)
	const [verificationSent, setVerificationSent] = useState(false)
	const [verificationCode, setVerificationCode] = useState('')

	const [verificationMethod, setVerificationMethod] = useState('sms')

	const [authId, setAuthId] = useState('')
	const [enableResend, setEnableResend] = useState(false)
	const [label, setLabel] = useState('')

	const isLoading =
		isAddingMethod || isSendingOTP || isVerifyingOTP || isSettingDefault

	const handlePhoneChange = (value) => {
		setPhone(value)
		setPhoneError(validatePhone(value))
	}

	const handleSendCode = (e) => {
		e.preventDefault()
		const error = validatePhone(phone)
		if (error) {
			setPhoneError(error)
			return
		}

		const payload = {
			methodType: 'phoneNumber',
			value: `+${phone}`,
			defaultDeliveryMethod: verificationMethod
		}

		sendOtpToPhoneNumber(payload, {
			onSuccess: (data) => {
				if (data?._id) setAuthId(data._id)
				setVerificationSent(true)

				setEnableResend(false)
			}
		})
	}

	const handleOtpVerification = (e) => {
		e.preventDefault()
		const payload = {
			otp: verificationCode,
			value: `+${phone}`,
			methodType: 'phoneNumber',
			authId,
			defaultDeliveryMethod: verificationMethod
		}

		verifyOTP(payload, {
			onSuccess: () => {
				addMethod(
					{ ...payload, label },
					{
						onSuccess: (data) => {
							if (isDefault && data?.methodId) {
								setDefaultMfaMethod(
									{
										methodType: 'phoneNumber',
										methodId: data?.methodId
									},
									{
										onSuccess: () => {
											setAuthId('')
											onClose()
										}
									}
								)
							} else {
								setAuthId('')
								onClose()
							}
						}
					}
				)
			}
		})
	}

	const handleResendCode = () => {
		resetErrorState()
		setVerificationCode('')

		const payload = {
			methodType: 'phoneNumber',
			value: `+${phone}`,
			defaultDeliveryMethod: verificationMethod,
			authId
		}

		sendOtpToPhoneNumber(payload, {
			onSuccess: (data) => {
				if (data?._id) setAuthId(data._id)
				setVerificationSent(true)

				setEnableResend(false)
			}
		})
	}

	return (
		<CustomDialog
			open={open}
			onClose={onClose}
			title={
				verificationSent
					? 'Enter the Verification Code'
					: isNew
					? 'Enter Your Phone Number'
					: 'Add Another Phone Number'
			}
			content={
				<Box sx={styles.content}>
					{!verificationSent ? (
						<form onSubmit={handleSendCode}>
							<Typography sx={styles.description}>
								Provide your phone number to receive a verification code. This
								is where we'll send a one-time code to confirm your identity.
							</Typography>

							<Box sx={styles.phoneInputSection}>
								<PhoneInput
									country={'us'}
									value={phone}
									onChange={handlePhoneChange}
									inputStyle={styles.phoneInputStyle}
									containerStyle={styles.phoneInputContainer}
									buttonStyle={styles.phoneInputButton}
									dropdownStyle={styles.phoneInputDropdown}
									specialLabel=""
									isValid={(value) => !validatePhone(value)}
								/>
								{phoneError && (
									<Typography sx={styles.errorText}>{phoneError}</Typography>
								)}
							</Box>

							<Box sx={styles.verificationMethodSection}>
								<Typography sx={styles.stepTitle}>Receive the Code</Typography>
								<Typography sx={styles.stepDescription}>
									You'll receive a 6-digit code via SMS or voice call. Make sure
									your phone is nearby.
								</Typography>
								<RadioGroup
									value={verificationMethod}
									onChange={(e) => setVerificationMethod(e.target.value)}
									row
									sx={styles.radioGroup}
								>
									<FormControlLabel
										value="sms"
										control={<Radio sx={styles.radio} />}
										label="Text Message"
										sx={styles.radioLabel}
									/>
									<FormControlLabel
										value="call"
										control={<Radio sx={styles.radio} />}
										label="Phone Call"
										sx={styles.radioLabel}
									/>
								</RadioGroup>
							</Box>

							<Box sx={styles.labelSection}>
								<Box sx={styles.labelHeader}>
									<Typography sx={styles.stepTitle}>
										Add a label for this authenticator
									</Typography>
								</Box>
								<Box sx={styles.descriptionContainer}>
									<Typography sx={styles.stepDescription}>
										Enter a label to help you recognize this authenticator
									</Typography>
									<Typography sx={styles.optionalText}>Optional</Typography>
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
									type={'submit'}
									variant="contained"
									sx={styles.verifyButton}
									disabled={!verificationSent && !!phoneError}
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
									Your phone number for verification is: {maskPhone(phone)}.
									Please check your messages and enter the verification code to
									proceed.
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
									sx={styles.verifyButton}
									disabled={!verificationSent && !!phoneError}
									endIcon={isLoading && <CircularProgress size={'14px'} />}
								>
									Verify
								</Button>
							</Box>
						</form>
					)}
				</Box>
			}
		/>
	)
}
