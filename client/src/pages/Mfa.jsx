import React from 'react'
import { Box, Typography } from '@mui/material'
import { VerificationModal } from '../components/views/Mfa/VerificationModal'
import { authColors } from '../styles/authStyles'

function Mfa() {
	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				background: `linear-gradient(165deg, ${authColors.navy} 0%, ${authColors.navyLight} 60%, #234b7a 100%)`,
				padding: { xs: '24px 16px', sm: '32px' },
			}}
		>
			<VerificationModal open={true} onClose={() => {}} />
			<Typography
				sx={{
					mt: 3,
					fontSize: '12px',
					color: 'rgba(255,255,255,0.5)',
				}}
			>
				Powered by Synccos
			</Typography>
		</Box>
	)
}

export default Mfa
