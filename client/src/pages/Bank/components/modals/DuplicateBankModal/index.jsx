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

import { WarningIcon } from '../../../../../components/Icons'
import { styles } from '../styles'

export const DuplicateBankModal = ({ open, onClose, onConfirm }) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: styles.dialog
			}}
		>
			<Box sx={styles.dialogHeader}>
				<DialogTitle sx={styles.dialogTitle}></DialogTitle>
				<IconButton onClick={onClose} sx={styles.dialogCloseButton}>
					<CloseIcon />
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 0 }}>
				<Box sx={styles.alertIconContainer}>
					<Box sx={styles.alertIconBorder}>
						<Box sx={styles.alertIconMain}>
							<WarningIcon />
						</Box>
					</Box>
				</Box>
				<Typography
					sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }}
					align="center"
				>
					Duplicate Bank Account Detected
				</Typography>
				<Typography
					sx={styles.dialogContent}
					color="text.secondary"
					align="center"
				>
					A bank account with these details already exists in the system. Please
					use different account information
				</Typography>
			</DialogContent>
			<DialogActions sx={styles.deleteDialogActions}>
				<Button onClick={onClose} variant="outlined" sx={styles.cancelButton}>
					Cancel
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					sx={styles.confirmButton}
				>
					View Existing Account
				</Button>
			</DialogActions>
		</Dialog>
	)
}
