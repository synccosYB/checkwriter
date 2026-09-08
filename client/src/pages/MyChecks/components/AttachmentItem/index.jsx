import React from 'react'
import { styles } from '../../styles'
import { Box, Typography } from '@mui/material'
import { formatFileSize, getFileIcon } from '../../utils/fileUtils'

export const AttachmentItem = ({ attachment }) => {
  return (
    <Box
      sx={styles.attachmentMenuItem}
    >
      <Box sx={styles.attachmentIconContainer}>
        {getFileIcon(attachment, { size: '16px' })}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '12px', color: '#00000099' }}>{attachment.filename}</Typography>
        <Typography sx={{ fontSize: '10px', color: '#00000099' }}>
          {attachment.description || formatFileSize(attachment.size || 0)}
        </Typography>
      </Box>
    </Box>
  )
}
