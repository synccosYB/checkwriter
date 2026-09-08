import React from 'react'
import { Box, Typography } from '@mui/material'
import { styles } from '../../../MyChecks/styles'
import { formatFileSize, getFileIcon } from '../../../MyChecks/utils/fileUtils'

interface Attachment {
	id?: string
	filename: string
	size?: number
	description?: string
	type?: string
	url?: string
}

interface AttachmentItemProps {
	attachment: Attachment
}

export const AttachmentItem: React.FC<AttachmentItemProps> = ({
	attachment
}) => {
	return (
		<Box sx={styles.attachmentMenuItem}>
			<Box sx={styles.attachmentIconContainer}>
				{getFileIcon(attachment) as any}
			</Box>
			<Box>
				<Typography sx={{ fontSize: '12px', color: '#00000099' }}>
					{attachment.filename}
				</Typography>
				<Typography sx={{ fontSize: '10px', color: '#00000099' }}>
					{attachment.description || formatFileSize(attachment.size || 0)}
				</Typography>
			</Box>
		</Box>
	)
}

export default AttachmentItem
