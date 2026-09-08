import React from 'react'
import {
	Box,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	CircularProgress,
	Divider
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { DeleteIcon } from '../../../../../components/Icons'
import { styles } from '../styles'

export const DeleteModal = ({
	open,
	onClose,
	onConfirm,
	isLoading,
	errorMessage
}) => {
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
				<Box sx={styles.deleteIconContainer}>
					<Box sx={styles.deleteIconBorder}>
						<Box sx={styles.deleteIconMain}>
							<DeleteIcon />
						</Box>
					</Box>
				</Box>
				<Typography
					sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }}
					align="center"
				>
					Permanent Account Deletion
				</Typography>
				<Typography sx={styles.dialogContent} align="center">
					Are you sure you want to permanently delete this bank account? This
					action cannot be undone, and all related information will be deleted.
				</Typography>

				{errorMessage && (
					<Box width="100%">
						<Divider
							sx={{ width: '50%', my: 1, mx: 'auto', backgroundColor: 'gray' }}
						/>
						<Typography
							sx={styles.dialogContent}
							textAlign={'center'}
							variant="subtitle2"
							color={'red'}
						>
							{errorMessage}
						</Typography>
					</Box>
				)}
			</DialogContent>
			<DialogActions sx={styles.deleteDialogActions}>
				<Button onClick={onClose} variant="outlined" sx={styles.cancelButton}>
					Cancel
				</Button>
				<Button
					disabled={isLoading}
					onClick={onConfirm}
					variant="contained"
					sx={styles.confirmButton}
				>
					{isLoading ? 'Deleting ... ' : 'Delete'}
					{isLoading && <CircularProgress size={'14px'} />}
				</Button>
			</DialogActions>
		</Dialog>
	)
}
