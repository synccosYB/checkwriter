import React, { useState } from 'react'
import {
	Drawer,
	Box,
	Typography,
	IconButton,
	CircularProgress,
	Pagination,
	Divider,
	Chip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import useMessageHistory from '../../../../../API/admin/useMessageHistory'

const MessageHistoryDrawer = ({ open, onClose, user }) => {
	const [page, setPage] = useState(1)
	const pageSize = 10
	const { data, isLoading } = useMessageHistory(
		user?._id || null,
		page,
		pageSize
	)

	const messages = data?.messages || []
	const totalPages = data?.totalPages || 1

	const formatDate = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		if (isNaN(d.getTime())) return String(dateStr)
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: { width: { xs: '100%', sm: '480px' }, p: 0 }
			}}
		>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					px: 3,
					py: 2,
					borderBottom: '1px solid #E5E7EB'
				}}
			>
				<Box>
					<Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
						Email History
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{user?.firstName} {user?.lastName} ({user?.email})
					</Typography>
				</Box>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</Box>

			<Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
				{isLoading ? (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							py: 8
						}}
					>
						<CircularProgress size={32} />
					</Box>
				) : messages.length === 0 ? (
					<Box sx={{ textAlign: 'center', py: 8 }}>
						<Typography color="text.secondary">
							No emails have been sent to this user yet.
						</Typography>
					</Box>
				) : (
					<>
						{messages.map((msg, idx) => (
							<Box key={msg._id || idx}>
								<Box sx={{ py: 2 }}>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'flex-start',
											mb: 1
										}}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1, mr: 1 }}>
											<Typography
												sx={{
													fontWeight: 600,
													fontSize: '14px'
												}}
											>
												{msg.subject}
											</Typography>
											{msg.isMassEmail && (
												<Chip
													label="Mass Email"
													size="small"
													variant="outlined"
													sx={{
														fontSize: '10px',
														height: '20px',
														backgroundColor: '#ede9fe',
														color: '#6d28d9',
														borderColor: '#c4b5fd'
													}}
												/>
											)}
											{msg.status === 'failed' && (
												<Chip
													label="Failed"
													size="small"
													color="error"
													sx={{
														fontSize: '10px',
														height: '20px'
													}}
												/>
											)}
										</Box>
										<Typography
											sx={{
												fontSize: '12px',
												color: '#9CA3AF',
												whiteSpace: 'nowrap'
											}}
										>
											{formatDate(msg.createdAt)}
										</Typography>
									</Box>
									<Typography
										sx={{
											fontSize: '13px',
											color: '#6B7280',
											whiteSpace: 'pre-wrap',
											lineHeight: 1.5
										}}
									>
										{msg.body}
									</Typography>
									<Typography
										sx={{
											fontSize: '11px',
											color: '#9CA3AF',
											mt: 1
										}}
									>
										Sent to: {msg.recipientEmail}
									</Typography>
								</Box>
								{idx < messages.length - 1 && <Divider />}
							</Box>
						))}
						{totalPages > 1 && (
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									py: 2
								}}
							>
								<Pagination
									count={totalPages}
									page={page}
									onChange={(_, value) => setPage(value)}
									size="small"
								/>
							</Box>
						)}
					</>
				)}
			</Box>
		</Drawer>
	)
}

export default MessageHistoryDrawer
