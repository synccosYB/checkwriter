import React from 'react'
import { useHistory } from 'react-router'
import { Box, Typography } from '@mui/material'
import notFoundImg from '../assets/images/notFoundImg.png'
import ButtonComponent from '../components/shared/ButtonComponent'

const NotFound = () => {
	const history = useHistory()

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				height: '100vh',
				backgroundColor: '#f5f7fa',
				px: 3,
			}}
		>
			<Box
				sx={{
					backgroundColor: '#ffffff',
					borderRadius: '16px',
					border: '1px solid #e2e8f0',
					boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
					p: { xs: 4, sm: 6 },
					textAlign: 'center',
					maxWidth: '480px',
					width: '100%',
				}}
			>
				<img
					src={notFoundImg}
					alt="not-found"
					style={{ maxWidth: '160px', marginBottom: '24px', opacity: 0.85 }}
				/>
				<Typography
					sx={{
						fontSize: '24px',
						fontWeight: 600,
						color: '#1a1a2e',
						mb: 1,
					}}
				>
					Page Not Found
				</Typography>
				<Typography
					sx={{
						fontSize: '15px',
						color: '#64748b',
						mb: 3,
						lineHeight: 1.6,
					}}
				>
					The page you were looking for couldn't be found.
				</Typography>
				<ButtonComponent
					text={'Return to Dashboard'}
					variant="dark"
					type="button"
					click={() => {
						history.push('/dashboard/main')
					}}
				/>
			</Box>
		</Box>
	)
}

export default NotFound
