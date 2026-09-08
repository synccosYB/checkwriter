import {
	Box,
	CircularProgress,
	Divider,
	FormControl,
	FormControlLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	Typography
} from '@mui/material'
import React from 'react'
import ButtonComponent from '../../../shared/ButtonComponent'
import { styles } from '../../MyProfile/securitySettings/styles'

function OtherVerificationMethods({
	data,
	defaultMethodId,
	isLoading,
	onSelectedMethod,
	selectedMedhod,
	onSendVerificationCode,
	onGoBack
}) {
	const methods = data.methods

	return (
		<Box>
			<Box>
				<Typography variant="h6">Emails</Typography>
				{methods?.emails?.map(({ _id, value }) => (
					<SingleVerificationItem
						key={_id}
						method={{ _id, value }}
						methodType={'email'}
						onSelect={onSelectedMethod}
						selectedMedhod={selectedMedhod}
						isDefault={_id === defaultMethodId}
						isLoading={isLoading}
					/>
				))}
			</Box>
			<Divider sx={{ mb: 3 }} />
			<Box>
				<Typography variant="h6">Phone Numbers</Typography>
				{methods?.phoneNumbers?.map(({ _id, value, defaultDeliveryMethod }) => (
					<SingleVerificationItem
						key={_id}
						method={{ _id, value, defaultDeliveryMethod }}
						methodType={'phoneNumber'}
						onSelect={onSelectedMethod}
						selectedMedhod={selectedMedhod}
						isDefault={_id === defaultMethodId}
						isLoading={isLoading}
					/>
				))}
			</Box>
			<Divider sx={{ mb: 3 }} />
			<Box>
				<Typography variant="h6">Authenticator Apps</Typography>
				{methods.authenticatorApps.map(({ _id, value }) => (
					<SingleVerificationItem
						key={_id}
						method={{ _id, value }}
						methodType={'authenticatorApp'}
						onSelect={onSelectedMethod}
						selectedMedhod={selectedMedhod}
						isDefault={_id === defaultMethodId}
						isLoading={isLoading}
					/>
				))}
			</Box>
			<Divider sx={{ mb: 3 }} />
			<Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
				<ButtonComponent text="Go back" onClick={onGoBack} />
			</Box>
		</Box>
	)
}

export default OtherVerificationMethods

const SingleVerificationItem = ({
	method,
	onSelect,
	methodType,
	selectedMedhod,
	isDefault,
	isLoading
}) => {
	return (
		<Box className="d-flex align-items-center justify-content-between mb-4">
			<Box className="d-flex align-items-center">
				<Box>
					<Box display={'flex'} alignItems={'center'} gap={2}>
						<FormControl>
							<RadioGroup
								aria-labelledby="demo-radio-buttons-group-label"
								defaultValue="female"
								name="radio-buttons-group"
								onChange={() =>
									onSelect({
										methodId: method._id,
										methodType,
										defaultDeliveryMethod: method.defaultDeliveryMethod
									})
								}
							>
								<FormControlLabel
									value={method.value}
									control={<Radio />}
									label={
										<Typography>
											{method.value} &nbsp;
											{isDefault && (
												<span
													style={{
														backgroundColor: '#ACE1AF',
														padding: '5px',
														borderRadius: '10px',
														fontSize: '12px'
													}}
												>
													default
												</span>
											)}
											&nbsp;
											{isLoading && selectedMedhod?.methodId === method._id && (
												<CircularProgress size={14} />
											)}
										</Typography>
									}
									checked={selectedMedhod?.methodId === method._id}
								/>
							</RadioGroup>
						</FormControl>

						{methodType === 'phoneNumber' && (
							<Box
								display={'flex'}
								gap={1}
								alignItems={'center'}
								mb={2}
								justifyContent={'center'}
							>
								<Typography>Delivery Method:</Typography>
								<Select
									sx={styles.selectStyles}
									name="defaultDeliveryMethod"
									labelId="demo-simple-select-helper-label"
									id="demo-simple-select-helper"
									defaultValue={method.defaultDeliveryMethod}
									onChange={({ target: { value } }) =>
										onSelect({
											methodId: method._id,
											methodType,
											defaultDeliveryMethod: value
										})
									}
								>
									<MenuItem value={'sms'}>Sms</MenuItem>
									<MenuItem value={'call'}>Call</MenuItem>
								</Select>
							</Box>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
