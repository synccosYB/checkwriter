import React from 'react'
import {
	Box,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { DownloadCheckIcon } from '../../../../../components/Icons'
import { styles } from '../../../styles'
import { CustomButton } from '../../../../../components/buttons/CustomButton'

export const BatchCreateSuccessfullyModal = ({ open, onClose, onConfirm }) => {
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
				</Box>
				<Typography sx={{ ...styles.dialogTitle, mb: '24px' }} align="center">
					Batch Created Successfully
				</Typography>
				<Typography
					sx={styles.dialogContent}
					color="text.secondary"
					align="center"
				>
					Your batch has been created successfully. You can now review the batch
					details or proceed with the next task.
				</Typography>
			</DialogContent>
			<DialogActions sx={styles.alertActionsContainer}>
				<CustomButton variant="outlined" color="primary" onClick={onConfirm}>
					View Batch
				</CustomButton>
			</DialogActions>
		</Dialog>
	)
}
