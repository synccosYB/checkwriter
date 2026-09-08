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
import {styles} from './styles'

const renderContent = (node, DefaultComp, defaultProps) => {
	if (node == null || node === false) return null

	if (typeof node === 'string' || typeof node === 'number') {
		return <DefaultComp {...defaultProps}>{node}</DefaultComp>
	}

	if (React.isValidElement(node)) {
		const merged = {
			...defaultProps,
			...node.props,
			sx: { ...(defaultProps?.sx || {}), ...(node.props?.sx || {}) },
			align: node.props?.align ?? defaultProps?.align
		}
		return React.cloneElement(node, merged)
	}

	return <>{node}</>
}

const ConfirmationModal = ({
	open,
	onClose,
	onConfirm,
	icon,
	title,
	description,
	confirmLabel,
	cancelLabel,
	hideCancel
}) => {
	return (
		<Dialog open={open} onClose={onClose} PaperProps={{ sx: styles.dialog }}>
			<Box sx={styles.dialogHeader}>
				<DialogTitle sx={styles.dialogTitle} />
				<IconButton onClick={onClose} sx={styles.dialogCloseButton}>
					<CloseIcon />
				</IconButton>
			</Box>

			<DialogContent sx={{ p: 0 }}>
				<Box >
					<Box
						sx={styles.alertIconBorder}
						display={'flex'}
						justifyContent={'center'}
						alignItems={'center'}
						mb={5}
					>
						<Box sx={styles.alertIconMain}>{icon}</Box>
					</Box>
				</Box>

				{renderContent(title, Typography, {
					sx: {
						...styles.dialogTitle,
						mb: { xs: '19px', sm: '30px' }
					},
					align: 'center'
				})}

				{renderContent(description, Typography, {
					sx: styles.dialogContent,
					color: 'text.secondary',
					align: 'center'
				})}
			</DialogContent>

			<DialogActions sx={styles.deleteDialogActions}>
				{!hideCancel && (
					<Button onClick={onClose} variant="outlined" sx={styles.cancelButton}>
						{cancelLabel || 'Cancel'}
					</Button>
				)}
				<Button
					onClick={onConfirm}
					variant="contained"
					sx={styles.confirmButton}
				>
					{confirmLabel || 'Confirm'}
				</Button>
			</DialogActions>
		</Dialog>
	)
}


export default ConfirmationModal
