import React from 'react'
import {
	Modal,
	Button,
	Typography,
	Box,
	IconButton,
	Divider
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { subscriptionAPI } from '../../../API/UserAPI'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../../redux/snackbarState'
import { MyCookies } from '../../../utils/cookies/Cookies'
import store from '../../../redux/store'

const SubscriptionErrorModal = ({ open, onClose, onContinueLimited }) => {
	const dispatch = useDispatch()
	const accessToken = MyCookies.get(MyCookies.KEYS.ACCESS_TOKEN)
	const handleSubscribe = async () => {
		try {
			const res = await subscriptionAPI(false, accessToken)
			const { data } = res
			if (data?.stripeCheckoutUrl) {
				window.open(data.stripeCheckoutUrl, '_blank')
				onClose()
			}
		} catch (err) {
			console.error('err', err)
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Error while opening checkout.',
					severity: 'error'
				})
			)
		}
	}

	const globalStates = store.getState();

	return (
		<Modal
			open={open}
			onClose={onClose}
			aria-labelledby="subscription-error-modal"
			aria-describedby="subscription-error-description"
		>
			<Box
				sx={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: 450,
					bgcolor: 'background.paper',
					borderRadius: 3,
					boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
					overflow: 'hidden'
				}}
			>
				{/* Header */}
				<Box
					sx={{
						position: 'relative',
						bgcolor: '#1e3a5f',
						py: 4,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						color: 'white'
					}}
				>
					<IconButton
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: 'white'
						}}
						onClick={onClose}
					>
						<CloseIcon />
					</IconButton>
					<WorkspacePremiumIcon sx={{ fontSize: 48, mb: 2 }} />
					<Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
						Premium Feature
					</Typography>
				</Box>

				{/* Content */}
				<Box sx={{ p: 4 }}>

					{
						globalStates.snackbarState.message && <Typography
							variant="body1" fontWeight={500}
							sx={{ mb: 1, textAlign: 'center', color: '#666' }}
						>
							{globalStates.snackbarState.message}
						</Typography>
					}
					<Typography
						variant="body1"
						sx={{ mb: 3, textAlign: 'center', color: '#666' }}
					>
						This feature is available exclusively for our premium subscribers.
						Upgrade your account to unlock all features and enhance your check
						writing experience.
					</Typography>

					<Divider sx={{ my: 3 }} />

					{/* Buttons */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						<Button
							variant="contained"
							onClick={handleSubscribe}
							fullWidth
							sx={{
								py: 1.5,
								background: 'linear-gradient(90deg, #1e3a5f 4%, #31527f 100%)',
								color: 'white',
								fontWeight: 600,
								'&:hover': {
									background: 'linear-gradient(90deg, #5c33a1 4%, #9c45ae 100%)'
								},
								boxShadow: '0 4px 12px rgba(105, 59, 170, 0.2)'
							}}
						>
							Upgrade Now
						</Button>
						<Button
							variant="text"
							onClick={onContinueLimited}
							sx={{
								color: '#666',
								'&:hover': {
									background: 'rgba(102, 102, 102, 0.08)'
								}
							}}
						>
							Continue with Limited Access
						</Button>
					</Box>
				</Box>
			</Box>
		</Modal>
	)
}

export default SubscriptionErrorModal
