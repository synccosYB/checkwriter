import React, { useState } from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	IconButton,
	Box,
	Typography,
	CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import useSendSupportEmail from '../../../../../API/admin/useSendSupportEmail'

const SendEmailModal = ({ open, onClose, user }) => {
	const [subject, setSubject] = useState('')
	const [body, setBody] = useState('')
	const { mutate: sendEmail, isPending } = useSendSupportEmail()

	const handleSend = () => {
		if (!subject.trim() || !body.trim()) return
		sendEmail(
			{ userId: user._id, subject: subject.trim(), body: body.trim() },
			{
				onSuccess: () => {
					setSubject('')
					setBody('')
					onClose()
				}
			}
		)
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: { borderRadius: '12px' }
			}}
		>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					px: 3,
					pt: 2
				}}
			>
				<DialogTitle sx={{ p: 0, fontSize: '20px', fontWeight: 600 }}>
					Send Support Email
				</DialogTitle>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</Box>
			<DialogContent sx={{ px: 3, pt: 2 }}>
				<Box sx={{ mb: 2 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
						To
					</Typography>
					<TextField
						fullWidth
						size="small"
						value={user?.email || ''}
						disabled
						sx={{
							'& .MuiOutlinedInput-root': {
								backgroundColor: '#F9FAFB'
							}
						}}
					/>
				</Box>
				<Box sx={{ mb: 2 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
						Subject
					</Typography>
					<TextField
						fullWidth
						size="small"
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="Enter email subject"
					/>
				</Box>
				<Box>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
						Message
					</Typography>
					<TextField
						fullWidth
						multiline
						rows={6}
						value={body}
						onChange={(e) => setBody(e.target.value)}
						placeholder="Write your message here..."
					/>
				</Box>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
				<Button
					onClick={onClose}
					variant="outlined"
					sx={{
						textTransform: 'none',
						borderColor: '#E5E7EB',
						color: '#374151',
						'&:hover': { borderColor: '#D1D5DB' }
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSend}
					variant="contained"
					disabled={isPending || !subject.trim() || !body.trim()}
					sx={{
						textTransform: 'none',
						backgroundColor: '#204464',
						'&:hover': { backgroundColor: '#1a3850' }
					}}
					endIcon={isPending ? <CircularProgress size={14} color="inherit" /> : null}
				>
					Send Email
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default SendEmailModal
