import React from 'react'
import { Box, Dialog, DialogContent, Typography } from '@mui/material'
import { GeneratingCheckIcon } from '../../../../../../components/Icons'
import { styles as GLobalStyles } from '../../../../styles'
import { styles } from './styles'
import { ImportIcon } from '../../../../../../components/Icons'

interface ImportsLoadingModalProps {
	openModal: boolean
}

const ImportsLoadingModal: React.FC<ImportsLoadingModalProps> = ({
	openModal
}) => {
	return (
		<Dialog
			open={openModal}
			maxWidth="sm"
			fullWidth
			sx={{
				...styles.modalWrapper
			}}
		>
			<DialogContent sx={{ p: '40px', mb: '00px' }}>
				<Box sx={GLobalStyles.generatingCheckIconContainer}>
					<GeneratingCheckIcon />
					<Box sx={GLobalStyles.pdfIconContainer}>
						<ImportIcon width="60px" height="60px" />
					</Box>
				</Box>
				<Typography sx={styles.modalTitle}>
					Fetching check import preview...
				</Typography>
				<Typography sx={styles.dialogContent}>
					Please wait while we fetch your check import preview. This may take a
					few seconds.
				</Typography>
			</DialogContent>
		</Dialog>
	)
}

export default ImportsLoadingModal
