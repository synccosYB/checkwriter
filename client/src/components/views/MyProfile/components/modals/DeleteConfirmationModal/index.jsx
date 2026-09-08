import { Box, Typography, Button, CircularProgress } from '@mui/material'
import { styles } from './styles'
import { CustomDialog } from '../../../../../shared/dialog/CustomDialog'

export const DeleteConfirmationModal = ({
	open,
	onClose,
	isLoading = false,
	onDelete
}) => {
	const handleDelete = () => {
		// Handle delete logic here
		onDelete()
	}

	return (
		<CustomDialog
			open={open}
			onClose={onClose}
			title="Delete Confirmation"
			content={
				<Box sx={styles.content}>
					<Box sx={styles.section}>
						<Typography sx={styles.sectionTitle}>
							Delete Multi-Factor Authentication Method
						</Typography>
						<Typography sx={styles.description}>
							Are you sure you want to delete this MFA method? This action
							cannot be undone.
						</Typography>
					</Box>
				</Box>
			}
			actions={
				<>
					<Button onClick={onClose} sx={styles.cancelButton}>
						Cancel
					</Button>
					<Button onClick={handleDelete} sx={styles.deleteButton}>
						Delete &nbsp;{isLoading && <CircularProgress size={'14px'} />}
					</Button>
				</>
			}
		/>
	)
}
