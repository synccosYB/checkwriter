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
import { EditUserIcon } from '../../../../../components/Icons'
import { styles } from '../../../styles'

interface UpdatePayeeNameModalProps {
	open: boolean
	onClose: () => void
	onOnlyThisRow: () => void
	onApplyToAll: () => void
	payeeName: string
	rowNumber?: string
}

export const UpdatePayeeNameModal: React.FC<UpdatePayeeNameModalProps> = ({
	open,
	onClose,
	onOnlyThisRow,
	onApplyToAll,
	payeeName
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
				<DialogTitle sx={styles.dialogTitle} />
				<IconButton onClick={onClose} sx={styles.dialogCloseButton}>
					<CloseIcon />
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 0 }}>
				<Box sx={styles.alertIconContainer}>
					<Box
						sx={{ ...styles.alertIconBorder, ...styles.alertIconBorderblue }}
					>
						<Box sx={{ ...styles.alertIconMain, ...styles.alertIconMainblue }}>
							<EditUserIcon color="#FFF" width="56px" height="56px" />
						</Box>
					</Box>
				</Box>
				<Typography
					sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }}
					align="center"
				>
					Update Payee Name?
				</Typography>
				<Typography
					sx={styles.dialogContent}
					color="text.secondary"
					align="center"
				>
					You've updated the payee name '{payeeName}' for one row. Do you want
					to apply this change to all rows with the same payee name, '
					{payeeName}'?
				</Typography>
			</DialogContent>
			<DialogActions sx={styles.deleteDialogActions}>
				<Button
					onClick={onOnlyThisRow}
					variant="outlined"
					sx={{ ...styles.cancelButton }}
				>
					Only This Row
				</Button>
				<Button
					onClick={onApplyToAll}
					variant="contained"
					sx={styles.confirmButton}
				>
					Apply To All
				</Button>
			</DialogActions>
		</Dialog>
	)
}
