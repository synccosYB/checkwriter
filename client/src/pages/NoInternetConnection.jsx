import React from 'react'
import { useHistory } from 'react-router'
import { Box, Typography } from '@mui/material'
import ButtonComponent from '../components/shared/ButtonComponent'
import noInternetImg from '../assets/images/noInternetImg.png'

const NoInternetConnection = () => {
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
					src={noInternetImg}
					alt="no-internet"
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
					No Internet Connection
				</Typography>
				<Typography
					sx={{
						fontSize: '15px',
						color: '#64748b',
						mb: 3,
						lineHeight: 1.6,
					}}
				>
					Please check your connection and try again.
				</Typography>
				<ButtonComponent
					text={'Return to Home'}
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

export default NoInternetConnection
