import React, { useEffect, useState } from 'react'
import { CustomDialog } from '../../../../../components/dialog/CustomDialog'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import {
	Box,
	Button,
	CircularProgress,
	InputAdornment,
	TextField,
	Typography
} from '@mui/material'
import { styles } from '../../../styles'

import useUpdateSubscriptionPrice from '../../../../../API/admin/useUpdateSubscriptionPrice'

export const MonthlyPriceModal = ({ open, onClose, user }) => {
	const { mutate: updateSubscriptionPrice, isPending } =
		useUpdateSubscriptionPrice()
	const [price, setPrice] = useState(+user?.subscriptionInfo?.price)
	const [error, setError] = useState('')

	useEffect(() => {
		setPrice(+user?.subscriptionInfo?.price)
	}, [user])

	const handleSave = () => {
		updateSubscriptionPrice(
			{ userId: user?._id, price },
			{
				onSuccess: () => {
					onClose()
				},
				onError: (error) => {
					const message = error?.response?.data?.error
					setError(message)
				}
			}
		)
	}

	return (
		<CustomDialog
			open={open}
			onClose={onClose}
			width={685}
			title={user?.monthlyPrice ? 'Update Monthly price' : 'Add Monthly price'}
			content={
				<Box>
					<Typography sx={styles.lable}>Subscription Price</Typography>
					<TextField
						fullWidth
						name="amount"
						placeholder="Amount"
						value={price}
						onChange={(e) => {
							const value = e.target.value.replace(/[^0-9.]/g, '')
							if (/^\d*\.?\d*$/.test(value)) {
								setPrice(value)
							}
						}}
						onBlur={(e) => {
							const formattedValue = e.target.value
							setPrice(formattedValue)
						}}
						sx={styles.input}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">$</InputAdornment>
							),
							inputMode: 'decimal',
							pattern: '[0-9]*\\.?[0-9]*'
						}}
					/>
					{error && (
						<Box>
							<Typography color={'red'}>{error}</Typography>
						</Box>
					)}
				</Box>
			}
			actions={
				<>
					<Button onClick={onClose} variant="outlined" sx={styles.cancelButton}>
						Cancel
					</Button>
					<CustomButton
						disabled={isPending}
						variant="outlined"
						color="primary"
						onClick={handleSave}
						endIcon={isPending && <CircularProgress size={'14px'} />}
					>
						Save Edit
					</CustomButton>
				</>
			}
		/>
	)
}
