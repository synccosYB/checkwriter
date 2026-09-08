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
import {
	ClearedCheckIcon,
	DeleteIcon,
	VoiceIcon,
	UnsavedIcon,
	DownloadCheckIcon
} from '../../../../../components/Icons'
import { styles } from '../../../styles'

interface CheckData {
	no?: string
	[key: string]: any
}

interface AlertModalProps {
	open: boolean
	onClose: () => void
	onConfirm: () => void
	icon?: React.ReactNode
	title?: string
	description?: string
	confirmLabel?: string
	cancelLabel?: string
	hideCancel?: boolean
	type?:
		| 'delete'
		| 'void'
		| 'cleared'
		| 'unsaved'
		| 'delete_attachment'
		| 'downloadCheck'
		| 'discard_changes'
		| 'deactivate_payee'
		| 'activate_payee'
	checkData?: CheckData
}

export const AlertModal: React.FC<AlertModalProps> = ({
	open,
	onClose,
	onConfirm,
	icon,
	title,
	description,
	confirmLabel,
	cancelLabel,
	hideCancel,
	type,
	checkData
}) => {
	const getDefaultTitle = (): string => {
		switch (type) {
			case 'delete':
				return 'Confirm Deletion?'
			case 'void':
				return 'Void This Check?'
			case 'cleared':
				return 'Change to Cleared?'
			case 'unsaved':
				return 'Unsaved Changes'
			case 'delete_attachment':
				return 'Delete Attachment?'
			case 'discard_changes':
				return 'Discard Changes'
			default:
				return 'Check Generated Successfully'
			case 'deactivate_payee':
				return 'Deactivate Payee?'
			case 'activate_payee':
				return 'Activate Payee?'
		}
	}

	const getDefaultDescription = (): string => {
		switch (type) {
			case 'delete':
				return `Are you sure you want to delete this check no. ${checkData?.no} which is Draft?`
			case 'void':
				return 'Are you sure you want to void this check? This action cannot be undone and will mark the check as invalid.'
			case 'cleared':
				return 'The check status is currently Submitted. Are you sure you want to update it to Cleared?'
			case 'unsaved':
				return 'You have unsaved changes. If you exit now, any entered data will be lost.'
			case 'delete_attachment':
				return 'Are you sure you want to delete this file? This action cannot be undone.'
			default:
				return 'Your check is successfully generated. Now you can view or download your check.'
			case 'discard_changes':
				return 'Are you sure you want tp close the model? Your  details won’t be saved.'
			case 'deactivate_payee':
				return 'Are you sure you want to deactivate this payee? They will no longer appear as active but their details will remain saved.'
			case 'activate_payee':
				return 'Are you sure you want to activate this payee? They will now be available for use in transactions.'
		}
	}

	const getDefaultConfirmLabel = (): string => {
		switch (type) {
			case 'delete':
			case 'delete_attachment':
				return 'Delete'
			case 'void':
				return 'Void Check'
			case 'cleared':
				return 'Confirm Change'
			case 'unsaved':
				return 'Discard Changes'
			default:
				return 'Download Check'
		}
	}

	const renderIcon = (): React.ReactNode => {
		if (icon) return icon

		switch (type) {
			case 'delete':
			case 'delete_attachment':
				return <DeleteIcon />
			case 'void':
				return <VoiceIcon width="56px" height="56px" color="#FFF" />
			case 'cleared':
				return <ClearedCheckIcon />
			case 'downloadCheck':
				return <DownloadCheckIcon />
			default:
				return <UnsavedIcon color="white" />
		}
	}

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
						sx={
							type === 'activate_payee'
								? {
										width: '120px',
										height: '120px',
										backgroundColor: 'transparent',
										borderRadius: '50%',
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center'
								  }
								: styles.alertIconBorder
						}
					>
						<Box
							sx={
								type === 'activate_payee'
									? {
											width: 'auto',
											height: 'auto',
											backgroundColor: 'transparent',
											borderRadius: '0',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center'
									  }
									: styles.alertIconMain
							}
						>
							{renderIcon()}
						</Box>
					</Box>
				</Box>
				<Typography
					sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }}
					align="center"
				>
					{title || getDefaultTitle()}
				</Typography>
				<Typography
					sx={styles.dialogContent}
					color="text.secondary"
					align="center"
				>
					{description || getDefaultDescription()}
				</Typography>
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
					{confirmLabel || getDefaultConfirmLabel()}
				</Button>
			</DialogActions>
		</Dialog>
	)
}
