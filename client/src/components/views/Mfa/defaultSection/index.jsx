import React from 'react'
import {
	Box,
	CircularProgress,
	Divider,
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
	Typography
} from '@mui/material'
import ButtonComponent from '../../../shared/ButtonComponent'

function DefaultVerificationSection({
	methodType,
	defaultValue,
	onSendVerificationCode,
	isLoading,
	onChooseAnotherMethod,
	selectedMedhod,
	defaultMethodId,
	onSelectedMethod
}) {
	return (
		<Box>
			<Typography>
				We have Detected You have Enabled 2 Factor Atthentication, Cick on
				button to send OTP to your{' '}
				{methodType === 'email' ? 'email' : 'Phone Number'}
			</Typography>
			<Divider sx={{ my: 3 }} />
			<Box>
				<FormControl>
					<FormLabel id="demo-radio-buttons-group-label">
						Default Method
					</FormLabel>
					<RadioGroup
						aria-labelledby="demo-radio-buttons-group-label"
						defaultValue="female"
						name="radio-buttons-group"
						onChange={() => {
							onSelectedMethod({
								methodId: defaultMethodId,
								methodType: methodType
							})
						}}
					>
						<FormControlLabel
							value="female"
							control={<Radio />}
							label={defaultValue}
							checked={selectedMedhod?.methodId === defaultMethodId}
						/>
					</RadioGroup>
				</FormControl>
			</Box>
			<Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
				<ButtonComponent
					text="Choose Another Method"
					onClick={onChooseAnotherMethod}
				/>

				<ButtonComponent
					disabled={selectedMedhod?.methodId !== defaultMethodId}
					variant="dark"
					text={
						<Typography color={'white'}>
							Send Verification Code{' '}
							{isLoading && <CircularProgress size={'14px'} />}
						</Typography>
					}
					onClick={onSendVerificationCode}
				/>
			</Box>
		</Box>
	)
}

export default DefaultVerificationSection
