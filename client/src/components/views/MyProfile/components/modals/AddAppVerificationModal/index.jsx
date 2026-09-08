import {
	Box,
	Typography,
	Button,
	TextField,
	Checkbox,
	FormControlLabel,
	CircularProgress,
	Tooltip
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useEffect, useState } from 'react'
import { CustomDialog } from '../../../../../shared/dialog/CustomDialog/index'

import { styles } from './styles'
import OTPInput from 'react-otp-input'
import useSendVerificationOTP from '../../../../../../API/mfa/useSendVerificationOTP'
import { useSelector } from 'react-redux'
import useVerifyOtp from '../../../../../../API/mfa/useVerifyOtp'
import useAddMfaMethod from '../../../../../../API/mfa/useAddMfaMethod'
import useSetDefaultMfaMethod from '../../../../../../API/mfa/useSetDefaultMfaMethod'
import useUserInfo from '../../../../../../API/users/useUserInfo'

const steps = [
	{
		number: 1,
		title: 'Scan QR Code',
		description:
			'Scan the QR code below to manually enter the secret key into your authenticator app.'
	},
	{
		number: 2,
		title: 'Get Verification Code',
		description: 'Enter the 6-digit code you see in your authenticator app.'
	},
	{
		number: 3,
		title: 'Add a label for this authenticator',
		description: 'Enter a label to help you recognize this authenticator.',
		required: true
	}
]

export const AddAppVerificationModal = ({ open, onClose }) => {
	const { data: userData } = useUserInfo()
	const { mutate: generateQrCode, isPending, data } = useSendVerificationOTP()
	const { mutate: verifyOTP, isPending: isVerifyingOTP, error } = useVerifyOtp()
	const { mutate: addMethod, isPending: isAddingMethod } = useAddMfaMethod()
	const { mutate: setDefaultMfaMethod } = useSetDefaultMfaMethod()
	const [verificationCode, setVerificationCode] = useState('')
	const [isDefault, setIsDefault] = useState(false)
	const [qrCode, setQrCode] = useState('')
	const [label, setLabel] = useState('')
	const [authId, setAuthId] = useState('')
	const [isCopied, setIsCopied] = useState(false)

	const email = userData?.email

	useEffect(() => {
		generateQrCode(
			{ methodType: 'authenticatorApp', value: email },
			{
				onSuccess: (data) => {
					if (data?._id) setAuthId(data._id)
					if (data?.qrCode) setQrCode(data.qrCode)
				}
			}
		)
	}, [userData, email, generateQrCode])

	const handleVerifyOTP = (e) => {
		e.preventDefault()
		const payload = {
			methodType: 'authenticatorApp',
			value: label,
			otp: verificationCode,
			authId
		}
		verifyOTP(payload, {
			onSuccess: () => {
				addMethod(payload, {
					onSuccess: (data) => {
						if (isDefault && data?.methodId)
							setDefaultMfaMethod(
								{
									methodType: 'authenticatorApp',
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
				})
			}
		})
	}

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(data?.secret)
			setIsCopied(true)
			setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	return (
		<CustomDialog
			open={open}
			onClose={onClose}
			title="Setup Authenticator App"
			content={
				<form onSubmit={handleVerifyOTP}>
					<Box sx={styles.content}>
						<Typography sx={styles.description}>
							Each time you log in, in addition to your password, you'll use an
							authenticator app to generate a non-time code.
						</Typography>

						{isPending ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
								<CircularProgress />
							</Box>
						) : (
							<Box>
								{steps.map((step) => (
									<Box key={step.number} sx={styles.stepContainer}>
										<Box sx={styles.stepHeader}>
											<Typography sx={styles.stepTag}>
												Step {step.number}
											</Typography>
											<Typography sx={styles.stepTitle}>
												{step.title}
											</Typography>
										</Box>
										<Box sx={styles.descriptionContainer}>
											<Typography sx={styles.stepDescription}>
												{step.description}
											</Typography>
											{step.required && (
												<Typography sx={styles.requiredText}>
													This is required
												</Typography>
											)}
										</Box>

										{step.number === 1 && (
											<Box sx={styles.qrSection}>
												<Box sx={styles.qrContainer}>
													{qrCode && <img src={qrCode} alt="qrCode" />}
												</Box>

												<Box sx={styles.secretKeyContainer}>
													<Typography sx={styles.cantSeeText}>
														Can't See QR Code?
													</Typography>
													<Typography sx={styles.enterKeyText}>
														Enter this secret key instead:
													</Typography>
													<Typography sx={styles.secretKey}>
														{data?.secret}
													</Typography>
													<Tooltip title={isCopied ? 'Copied' : 'Copy'}>
														<Button
															startIcon={<ContentCopyIcon />}
															onClick={handleCopyCode}
															sx={styles.copyButton}
														>
															{isCopied ? 'Copied' : 'Copy Code'}
														</Button>
													</Tooltip>
												</Box>
											</Box>
										)}

										{step.number === 2 && (
											<>
												<Box sx={styles.verificationSection}>
													<Typography sx={styles.verificationLabel}>
														Enter verification code
													</Typography>
													<Box sx={styles.codeInputContainer}>
														<OTPInput
															value={verificationCode}
															onChange={setVerificationCode}
															numInputs={6}
															className="d-flex align-items-center justify-content-between mb-5"
															renderInput={(props) => (
																<input
																	{...props}
																	className="otpInput fs-3 text-black mb-5"
																	type="number"
																	style={{
																		...styles.codeInput,
																		marginRight: '10px'
																	}}
																/>
															)}
														/>
													</Box>
												</Box>
												<Box>
													<Typography sx={styles.error}>
														{error?.response?.data?.error}
													</Typography>
												</Box>
											</>
										)}

										{step.number === 3 && (
											<Box sx={styles.labelSection}>
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
										)}
									</Box>
								))}
							</Box>
						)}
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
							disabled={!label.length || !verificationCode.length}
							variant="contained"
							sx={styles.verifyButton}
							endIcon={
								(isVerifyingOTP || isAddingMethod) && (
									<CircularProgress size={'14px'} />
								)
							}
						>
							Verify
						</Button>
					</Box>
				</form>
			}
		/>
	)
}
