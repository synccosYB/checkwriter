import React from 'react'
import {
	Box,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	Divider
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { UnsavedIcon } from '../../../../../components/Icons'
import { styles } from '../../../styles'
import { CustomButton } from '../../../../../components/buttons/CustomButton'

export const BatchFailedModal = ({ open, onClose, onConfirm, error }) => {
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
					<Box sx={styles.alertFailedIconBorder}>
						<Box sx={styles.alertFailedIconMain}>
							<UnsavedIcon color="#FFF" />
						</Box>
					</Box>
				</Box>
				<Typography sx={{ ...styles.dialogTitle, mb: '24px' }} align="center">
					Batch Creation Failed
				</Typography>
				<Typography
					sx={styles.dialogContent}
					color="text.secondary"
					align="center"
				>
					All checks in this batch have failed. No batch has been created.
					Please review the details and try again.
				</Typography>
				<Divider sx={{ my: 2 }} />
				{error && (
					<Typography
						sx={{ ...styles.dialogContent, color: 'red' }}
						align="center"
					>
						{error}
					</Typography>
				)}
			</DialogContent>
			<DialogActions sx={styles.alertActionsContainer}>
				<CustomButton variant="outlined" color="primary" onClick={onConfirm}>
					View Errors
				</CustomButton>
			</DialogActions>
		</Dialog>
	)
}
