import React from 'react'
import {
	Box,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { DownloadCheckIcon, UnsavedIcon } from '../../../../../components/Icons'
import { styles } from '../../../styles'
import { CustomButton } from '../../../../../components/buttons/CustomButton'

export const BatchSuccesswithErrorsModal = ({
	open,
	onClose,
	onConfirm,
	failed,
	success,
	onViewErrors
}) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: styles.dialogAlert
			}}
		>
			<Box sx={styles.dialogHeaderAlert}>
				<DialogTitle sx={styles.dialogTitle}></DialogTitle>
				<IconButton onClick={onClose} sx={styles.dialogCloseButton}>
					<CloseIcon />
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 0 }}>
				<Box sx={styles.alertIconContainer}>
					<Box sx={styles.alertSuccessIconBorder}>
						<Box sx={styles.alertSuccessIconMain}>
							<DownloadCheckIcon />
						</Box>
					</Box>

					<Box sx={{ ...styles.alertFailedIconBorder, ml: '-28px' }}>
						<Box sx={styles.alertFailedIconMain}>
							<UnsavedIcon color="#FFF" />
						</Box>
					</Box>
				</Box>
				<Typography sx={{ ...styles.dialogTitle, mb: '24px' }} align="center">
					Batch Created with Errors
				</Typography>
				<Typography
					sx={{ ...styles.dialogContent, mb: '24px' }}
					color="text.secondary"
					align="center"
				>
					The batch was created with successful checks and failed checks. You
					can view your list of batch.
				</Typography>

				<Box sx={styles.statusContainer}>
					<Box sx={styles.statusData}>
						<DownloadCheckIcon width={20} height={20} color="#058205" />
						<Typography>
							Successful checks:{' '}
							<span
								style={{
									fontWeight: '700',
									fontSize: '20px',
									color: '#000000DE'
								}}
							>
								{success.length}
							</span>
						</Typography>
					</Box>
					<Box sx={styles.statusData}>
						<UnsavedIcon width={20} height={20} color="#F03D3E" />
						<Typography>
							Failed checks:{' '}
							<span
								style={{
									fontWeight: '700',
									fontSize: '20px',
									color: '#000000DE'
								}}
							>
								{failed.length}
							</span>
						</Typography>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions sx={styles.alertActionsContainer}>
				<Button
					onClick={onViewErrors}
					variant="outlined"
					sx={styles.cancelButton}
				>
					View Errors
				</Button>
				<CustomButton variant="outlined" color="primary" onClick={onConfirm}>
					View Batch
				</CustomButton>
			</DialogActions>
		</Dialog>
	)
}
