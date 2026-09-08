import { Box, Typography, Divider } from '@mui/material'
import { adminStyles } from './adminStyles'

export const AdminPageWrapper = ({ title, description, children }) => {
  return (
    <Box sx={adminStyles.wrapper}>
      <Typography sx={adminStyles.title}>{title}</Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={adminStyles.description}>
          {description}
        </Typography>
      )}
      <Divider sx={{ mb: '24px' }} />
      {children}
    </Box>
  )
}
