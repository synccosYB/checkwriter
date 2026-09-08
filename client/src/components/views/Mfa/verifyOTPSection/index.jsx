import React, { useState } from 'react'
import OTPInput from 'react-otp-input'
import ButtonComponent from '../../../shared/ButtonComponent'
import {
	Box,
	CircularProgress,
	MenuItem,
	Select,
	Typography
} from '@mui/material'
import useVerifyVerificationCode from '../../../../API/validation/useVerifyVerificationCode'
import Timer from '../../../shared/Timer'
import { styles } from '../../MyProfile/securitySettings/styles'

function VerifyOTPSection({
	methodType,
	onChooseAnotherMethod,
	userId,
	method,
	defaultValue,
	onResendOTP,
	onSelect,
	onSelectedMethod
}) {
	const { mutate: verifyOTP, isPending } = useVerifyVerificationCode()

	const [otp, setOtp] = useState('')
	const [enableResend, setEnableResend] = useState(false)

	const handleVerifyOTP = () => {
		verifyOTP({ methodType, otp, userId, methodId: method.methodId })
	}

	return (
		<Box>
			<Box mb={3} textAlign={'center'}>
				<Typography>An OTP has been sent to {defaultValue}</Typography>
				<Typography>Enter the 6-digit code to verify your identity</Typography>
			</Box>
			<OTPInput
				value={otp}
				onChange={setOtp}
				numInputs={6}
				className="d-flex align-items-center justify-content-between mb-5"
				renderInput={(props) => (
					<input
						{...props}
						className="otpInput fs-3 text-black mb-5"
						type="number"
					/>
				)}
				containerStyle={{
					justifyContent: 'space-between'
				}}
			/>
			{methodType === 'phoneNumber' && (
				<Box
					display={'flex'}
					justifyContent={'center'}
					alignItems={'center'}
					gap={2}
					mb={3}
				>
					<Typography>Delivery Method:</Typography>
					<Select
						disabled={!enableResend}
						sx={styles.selectStyles}
						name="defaultDeliveryMethod"
						labelId="demo-simple-select-helper-label"
						id="demo-simple-select-helper"
						defaultValue={method.defaultDeliveryMethod}
						onChange={({ target: { value } }) => {
							onSelectedMethod((prev) => ({
								...prev,
								defaultDeliveryMethod: value
							}))
							setEnableResend(false)
						}}
					>
						<MenuItem value={'sms'}>Sms</MenuItem>
						<MenuItem value={'call'}>Call</MenuItem>
					</Select>
				</Box>
			)}

			<Box>
				<Box>
					{!enableResend && (
						<Timer onTimerComplete={() => setEnableResend(true)} />
					)}
					<Typography
						role="button"
						disabled={!enableResend}
						onClick={() => {
							if (enableResend) {
								onResendOTP()
								setEnableResend(false)
							}
						}}
						sx={{
							color: enableResend ? 'inherit' : 'lightgray',
							cursor: enableResend ? 'pointer' : 'text'
						}}
					>
						Resend Verification Code
					</Typography>
				</Box>
			</Box>
			<Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
				<ButtonComponent
					text="Choose another method"
					onClick={onChooseAnotherMethod}
				/>
				<ButtonComponent
					variant="dark"
					text={
						<Typography color={'white'}>
							Verify
							{isPending && <CircularProgress size={'14px'} />}
						</Typography>
					}
					onClick={handleVerifyOTP}
				/>
			</Box>
		</Box>
	)
}

export default VerifyOTPSection
