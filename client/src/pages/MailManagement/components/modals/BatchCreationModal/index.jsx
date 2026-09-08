import React from 'react'
import {
	Box,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent
} from '@mui/material'
import { GeneratingCheckIcon, BatchIcon } from '../../../../../components/Icons'
import { styles } from '../../../styles'

export const BatchCreationModal = ({ open }) => {
	return (
		<Dialog
			open={open}
			// onClose={onClose}
			PaperProps={{
				sx: styles.dialogAlert
			}}
		>
			<Box sx={styles.dialogHeader}>
				<DialogTitle sx={styles.dialogTitle}></DialogTitle>
			</Box>
			<DialogContent sx={{ p: 0, mb: '50px' }}>
				<Box sx={styles.generatingCheckIconContainer}>
					<GeneratingCheckIcon />
					<Box sx={styles.pdfIconContainer}>
						<BatchIcon />
					</Box>
				</Box>
				<Typography
					sx={{ ...styles.dialogTitle, xs: { mb: '19px' }, mb: '30px' }}
					align="center"
				>
					Batch Creation...
				</Typography>
				<Typography
					sx={styles.dialogContent}
					color="text.secondary"
					align="center"
				>
					Your batch is being created. Please wait while we process the payment
					and generate the batch.
				</Typography>
			</DialogContent>
		</Dialog>
	)
}
