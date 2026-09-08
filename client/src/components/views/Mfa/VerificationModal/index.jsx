/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import {
	Box,
	Typography,
	Button,
	Radio,
	RadioGroup,
	FormControlLabel,
	Divider,
	CircularProgress
} from '@mui/material'

import { styles } from './styles'
import PhoneInput from 'react-phone-input-2'
import { EmailIcon, GuardIcon, MarkIcon } from '../../../shared/Icons'
import { CustomDialog } from '../../../shared/dialog/CustomDialog'
import useMaskedMFaMethods from '../../../../API/validation/useMaskedMFaMethods'
import useSendValidationCode from '../../../../API/validation/useSendValidationCode'
import OTPInput from 'react-otp-input'
import Timer from '../../../shared/Timer'
import useVerifyVerificationCode from '../../../../API/validation/useVerifyVerificationCode'

export const VerificationModal = ({ open, onClose }) => {
	const { data: mfaData, isSuccess } = useMaskedMFaMethods()
	const { mutate: sendValidationCode, isPending: isSendingOtp } =
		useSendValidationCode()
	const {
		mutate: verifyOTP,
		isPending: isVerifyingOtp,
		error,
		reset: resetVerifyOTPState
	} = useVerifyVerificationCode()
	const [step, setStep] = useState(1)
	const [selectedMethod, setSelectedMethod] = useState({
		id: '',
		methodType: '',
		value: ''
	})
	const [verificationCode, setVerificationCode] = useState('')
	const [deliveryMethod, setDeliveryMethod] = useState('sms')
	const [isGlobalLoading, setIsGlobalLoading] = useState(true)

	const [enableResend, setEnableResend] = useState(false)

	const emails = mfaData?.methods?.emails || []
	const phones = mfaData?.methods?.phoneNumbers || []
	const apps = mfaData?.methods?.authenticatorApps || []
	const defaultMethodId = mfaData?.defaultMethodId || ''
	const defaultMethod = mfaData?.defaultMethod || ''

	function handleDefaultData() {
		if (defaultMethod && emails && apps && phones) {
			const dictionary = {
				email: { ...emails?.find((item) => item?._id === defaultMethodId) },
				phoneNumber: {
					...phones?.find((item) => item?._id === defaultMethodId)
				},
				authenticatorApp: {
					...apps?.find((item) => item?._id === defaultMethodId)
				}
			}

			const defaultData = dictionary[defaultMethod]

			const data = {
				id: defaultData?._id,
				methodType: defaultMethod,
				value: defaultData?.value
			}

			if (defaultMethod !== 'authenticatorApp') {
				const payload = {
					methodType: data.methodType,
					methodId: data.id,
					defaultDeliveryMethod:
						defaultData?.defaultDeliveryMethod || deliveryMethod
				}

				if (data.methodType !== 'phoneNumber') {
					delete payload.defaultDeliveryMethod
				}

				sendValidationCode(payload, {
					onSuccess: () => {
						setStep(2)
						setEnableResend(false)
						setIsGlobalLoading(false)
					}
				})
			} else {
				setIsGlobalLoading(false)
				setStep(2)
			}

			if (defaultData) {
				setSelectedMethod(data)

				setDeliveryMethod(defaultData?.defaultDeliveryMethod || 'sms')
			}
		}
	}

	useEffect(() => {
		if (isSuccess) handleDefaultData()
	}, [defaultMethod, emails, phones, apps, defaultMethodId, isSuccess])

	const handleContinue = () => {
		if (selectedMethod.methodType !== 'authenticatorApp') {
			const payload = {
				methodType: selectedMethod.methodType,
				methodId: selectedMethod.id,
				defaultDeliveryMethod: deliveryMethod
			}

			if (selectedMethod.methodType !== 'phoneNumber') {
				delete payload.defaultDeliveryMethod
			}

			sendValidationCode(payload, {
				onSuccess: () => {
					setStep(2)
					setEnableResend(false)
				}
			})
		} else setStep(2)
	}

	const handleBack = () => {
		setStep(1)
		setVerificationCode('')
		resetVerifyOTPState()
	}

	const handleResendCode = () => {
		handleContinue()
		setEnableResend(false)
		setVerificationCode('')
		resetVerifyOTPState()
	}

	const handleVerifyCode = (e) => {
		if (e) {
			e.preventDefault()
		}
		if (verificationCode.length === 6) {
			verifyOTP({
				methodType: selectedMethod.methodType,
				otp: verificationCode,
				methodId: selectedMethod.id
			})
		}
	}

	const renderMethodSelection = () => (
		<Box sx={styles.verifyMethodContent}>
			<RadioGroup
				value={JSON.stringify(selectedMethod)}
				onChange={(e) => setSelectedMethod(JSON.parse(e.target.value))}
			>
				<Box sx={styles.section}>
					<Typography sx={styles.sectionTitle}>
						Authenticator App Codes
					</Typography>
					<Box sx={styles.appListContainer}>
						{apps?.map((app) => (
							<FormControlLabel
								key={app._id}
								value={JSON.stringify({
									id: app?._id,
									methodType: 'authenticatorApp',
									value: app.value
								})}
								control={<Radio sx={styles.radio} />}
								label={
									<Box sx={styles.appInfo}>
										<GuardIcon />
										<Box sx={styles.appTextContainer}>
											<MarkIcon />
											<Typography sx={styles.appName}>{app.value}</Typography>
										</Box>
									</Box>
								}
							/>
						))}
					</Box>
				</Box>

				<Divider sx={styles.divider} />
				<Box sx={styles.section}>
					<Typography sx={styles.sectionTitle}>Email Verification</Typography>
					<Box sx={styles.emailListContainer}>
						{emails?.map((email) => (
							<FormControlLabel
								key={email.id}
								value={JSON.stringify({
									id: email?._id,
									methodType: 'email',
									value: email?.value
								})}
								control={<Radio sx={styles.radio} />}
								label={
									<Box sx={styles.methodLabel}>
										<EmailIcon />
										<Typography>{email?.value}</Typography>
										{email.default && (
											<Box sx={styles.appTextContainer}>
												<MarkIcon />
												<Typography sx={styles.appName}>Home Email</Typography>
											</Box>
										)}
									</Box>
								}
							/>
						))}
					</Box>
				</Box>

				<Divider sx={styles.divider} />

				<Box sx={styles.section}>
					<Typography sx={styles.sectionTitle}>Phone Verification</Typography>
					<Box sx={styles.phoneListContainer}>
						{phones?.map((phone) => (
							<FormControlLabel
								value={JSON.stringify({
									id: phone?._id,
									methodType: 'phoneNumber',
									value: phone?.value
								})}
								key={phone._id}
								control={<Radio sx={styles.radio} />}
								label={
									<Box sx={styles.phoneInfo}>
										<Box sx={styles.phoneFlag}>
											<PhoneInput
												country={'usa'}
												value={phone.value}
												disabled
												enableSearch={false}
												containerStyle={styles.flagContainer}
												inputStyle={styles.flagInput}
												buttonStyle={styles.flagButton}
												disableDropdown
												placeholder=""
												specialLabel=""
												preferredCountries={['us']}
											/>
										</Box>
										<Typography sx={styles.phoneNumber}>
											{phone.value}
										</Typography>
										{phone.default && (
											<Box sx={styles.appTextContainer}>
												<MarkIcon />
												<Typography sx={styles.appName}>
													Official Number
												</Typography>
											</Box>
										)}
									</Box>
								}
							/>
						))}
					</Box>
				</Box>
			</RadioGroup>
			{selectedMethod.methodType === 'phoneNumber' && (
				<Box sx={styles.section}>
					<Typography sx={styles.sectionTitle}>Delivery Method</Typography>

					<Typography sx={styles.setionDescription}>
						You'll receive a digit code via SMS or voice call. Make sure your
						phone is nearby.
					</Typography>

					<RadioGroup
						value={deliveryMethod}
						onChange={(e) => setDeliveryMethod(e.target.value)}
					>
						<Box sx={styles.deliveryGroup}>
							<FormControlLabel
								value="sms"
								control={<Radio sx={styles.radio} />}
								label="Text Message"
							/>
							<FormControlLabel
								value="call"
								control={<Radio sx={styles.radio} />}
								label="Phone Call"
							/>
						</Box>
					</RadioGroup>
				</Box>
			)}
		</Box>
	)

	const methodTitle = {
		email: 'Email',
		phoneNumber: 'Phone Number',
		authenticatorApp: 'Authenticator App'
	}

	const renderVerification = () => (
		<form onSubmit={handleVerifyCode}>
			<Typography sx={styles.description}>
				Your {methodTitle[selectedMethod?.methodType]} for verification is:
				&nbsp;
				{selectedMethod?.value}. Please check your messages and enter the
				verification code to proceed.
			</Typography>

			<Box sx={styles.verificationSection}>
				<Box sx={styles.codeInputContainer}>
					<OTPInput
						shouldAutoFocus
						value={verificationCode}
						onChange={setVerificationCode}
						numInputs={6}
						sx={styles.codeInput}
						renderInput={(props) => (
							<input
								{...props}
								className=""
								type="number"
								style={{
									marginRight: '8px',
									width: '40px',
									height: '40px',
									borderRadius: '8px',
									border: '1px solid rgba(206, 206, 206, 1)',
									fontSize: '24px',
									fontWeight: '400',
									lineHeight: '1',
									textAlign: 'center'
								}}
							/>
						)}
					/>
				</Box>

				<Typography sx={styles.error}>
					{error?.response?.data?.error?.developerMessage}
				</Typography>

				{selectedMethod.methodType !== 'authenticatorApp' && (
					<Box sx={styles.resendSection}>
						{!enableResend && (
							<Timer onTimerComplete={() => setEnableResend(true)} />
						)}
						<Typography
							disabled={!enableResend}
							onClick={enableResend ? handleResendCode : undefined}
							sx={{
								color: enableResend ? 'inherit' : 'rgba(0, 0, 0, 0.6)',
								cursor: enableResend ? 'pointer' : 'not-allowed',
								textDecoration: enableResend ? 'underline' : 'none',
								...styles.resendText
							}}
						>
							Resend Code
						</Typography>
					</Box>
				)}
			</Box>

			<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
				<Button onClick={handleBack} variant="outlined" sx={styles.cancelButton}>
					Change Verification Method
				</Button>
				<Button
					type="submit"
					variant="contained"
					disabled={verificationCode.length < 6}
					sx={styles.verifyButton}
					endIcon={isVerifyingOtp && <CircularProgress size={'14px'} />}
				>
					Verify Code
				</Button>
			</Box>
		</form>
	)

	return isGlobalLoading ? (
		<Box
			display={'flex'}
			justifyContent={'center'}
			alignItems={'center'}
			height={'100vh'}
		>
			<CircularProgress size={'200px'} />
		</Box>
	) : (
		<CustomDialog
			open={open}
			onClose={onClose}
			title={
				step === 1 ? 'Select a Verification Method' : 'Verify Your Identity'
			}
			content={step === 1 ? renderMethodSelection() : renderVerification()}
			actions={
				step === 1 ? (
					<>
						<Button onClick={onClose} sx={styles.cancelButton}>
							Cancel
						</Button>
						<Button
							onClick={handleContinue}
							sx={styles.continueButton}
							endIcon={isSendingOtp && <CircularProgress size={'14px'} />}
						>
							Continue
						</Button>
					</>
				) : null
			}
		/>
	)
}
