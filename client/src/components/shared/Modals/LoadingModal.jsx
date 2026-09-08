import React from 'react'
import {
	Box,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent
} from '@mui/material'
import { styles } from './styles'

const LoadingModal = ({
	open,
	icon,
	overlayIcon,
	title,
	description,
	logo
}) => {
	return (
		<Dialog
			open={open}
			PaperProps={{
				sx: styles.dialog
			}}
		>
			<Box sx={styles.dialogHeader}>
				<DialogTitle sx={styles.dialogTitle}></DialogTitle>
			</Box>
			<DialogContent sx={{ p: 0, mb: '50px' }}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '140px',
						mb: '16px',
						position: 'relative'
					}}
				>
					{icon && icon}
					{overlayIcon && (
						<Box
							sx={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)'
							}}
						>
							{overlayIcon}
						</Box>
					)}
				</Box>
				{logo && (
					<Box sx={{ display: 'flex', justifyContent: 'center', mb: '12px' }}>
						{logo}
					</Box>
				)}
				{title && (
					<Typography
						sx={{
							...styles.dialogTitle,
							mb: { xs: '19px', sm: '30px' }
						}}
						align="center"
					>
						{title}
					</Typography>
				)}
				{description && (
					<Typography
						sx={styles.dialogContent}
						color="text.secondary"
						align="center"
					>
						{description}
					</Typography>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default LoadingModal
