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

import { styles } from './styles'
import { LogoutIcon } from '../shared/Icons'

export const LogoutModal = ({
	timer,
	open,
	onClose,
	handleLogout,
	handleSignInAgain
}) => {
	return (
		<Dialog
			open={open}
			onClose={(event, reason) => {
				if (reason !== 'backdropClick') {
					onClose(event, reason)
				}
			}}
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
				<Box sx={styles.iconContainer}>
					<Box sx={styles.iconBorder}>
						<Box sx={styles.iconMain}>
							{timer > 0 ? (
								<Typography
									sx={{
										color: '#fff',
										fontSize: '57px',
										fontWeight: 'bold'
									}}
								>
									{timer}
								</Typography>
							) : (
								<LogoutIcon width="57px" height="57px" />
							)}
						</Box>
					</Box>
				</Box>
				<Typography
					sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }}
					align="center"
				>
					{timer > 0
						? "You're about to be logged out"
						: "You've been logged out"}
				</Typography>
				<Typography
					sx={styles.dialogContent}
					color="text.secondary"
					align="center"
				>
					{timer > 0
						? "You've been inactive for a while. For your security, you’ll be logged out."
						: "You've been inactive for a while. For your security, you've been logged out."}
				</Typography>
			</DialogContent>
			<DialogActions sx={styles.dialogActions}>
				{!timer && (
					<Button
						onClick={handleSignInAgain}
						variant="contained"
						sx={styles.primaryButton}
					>
						Sign In Again
					</Button>
				)}
			</DialogActions>
		</Dialog>
	)
}
