import React from 'react'
import { Box, Typography, Grid } from '@mui/material'
import {
	VerifiedUserOutlined,
	PaymentsOutlined,
	SavingsOutlined,
	AssessmentOutlined,
	PrintOutlined,
	TuneOutlined,
} from '@mui/icons-material'

const features = [
	{
		icon: <VerifiedUserOutlined />,
		title: 'Check Verification',
		desc: 'Security features, such as MICR encoding and watermarks, to prevent check fraud.',
	},
	{
		icon: <PaymentsOutlined />,
		title: 'Payment Tracking',
		desc: 'Track payments made through checks, including the amount, date, and payee.',
	},
	{
		icon: <SavingsOutlined />,
		title: 'Budgeting',
		desc: 'Allow budgeting to manage finances and stay on top of their spending.',
	},
	{
		icon: <AssessmentOutlined />,
		title: 'Reporting',
		desc: 'Get reports on check usage, payments made, and other financial data.',
	},
	{
		icon: <PrintOutlined />,
		title: 'Check Printing',
		desc: 'Print checks directly, on blank paper or pre-printed check stock.',
	},
	{
		icon: <TuneOutlined />,
		title: 'Check Customization',
		desc: 'Allow customization with logo, signature, and other relevant information.',
	},
]

const ComingSoon = () => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '100vh',
				backgroundColor: '#f5f7fa',
				px: 3,
				py: 6,
			}}
		>
			<Box
				sx={{
					backgroundColor: '#1e3a5f',
					borderRadius: '16px',
					p: { xs: 4, sm: 6 },
					textAlign: 'center',
					maxWidth: '600px',
					width: '100%',
					mb: 6,
				}}
			>
				<Typography
					sx={{
						fontSize: '12px',
						fontWeight: 600,
						color: '#e8a838',
						textTransform: 'uppercase',
						letterSpacing: '0.1em',
						mb: 2,
					}}
				>
					Coming Soon
				</Typography>
				<Typography
					sx={{
						fontSize: { xs: '24px', sm: '32px' },
						fontWeight: 700,
						color: '#ffffff',
						mb: 2,
						lineHeight: 1.3,
					}}
				>
					Write checks with confidence wherever you are
				</Typography>
				<Typography
					sx={{
						fontSize: '15px',
						color: '#cbd5e1',
						mb: 3,
					}}
				>
					We are currently working hard on this page. Subscribe & get notified!
				</Typography>
				<Box
					sx={{
						display: 'flex',
						maxWidth: '400px',
						mx: 'auto',
						gap: 1,
					}}
				>
					<input
						placeholder="Enter your email"
						type="email"
						style={{
							flex: 1,
							padding: '10px 16px',
							borderRadius: '8px',
							border: '1px solid rgba(255,255,255,0.2)',
							backgroundColor: 'rgba(255,255,255,0.1)',
							color: '#ffffff',
							fontSize: '14px',
							outline: 'none',
						}}
					/>
					<button
						style={{
							padding: '10px 20px',
							borderRadius: '8px',
							border: 'none',
							backgroundColor: '#e8a838',
							color: '#1a1a2e',
							fontWeight: 600,
							fontSize: '14px',
							cursor: 'pointer',
						}}
					>
						Notify Me
					</button>
				</Box>
			</Box>

			<Grid container spacing={3} sx={{ maxWidth: '900px' }}>
				{features.map((feature, index) => (
					<Grid item xs={12} sm={6} md={4} key={index}>
						<Box
							sx={{
								backgroundColor: '#ffffff',
								borderRadius: '12px',
								border: '1px solid #e2e8f0',
								p: 3,
								textAlign: 'center',
								height: '100%',
								boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
								transition: 'transform 0.2s ease',
								'&:hover': {
									transform: 'translateY(-2px)',
								},
							}}
						>
							<Box
								sx={{
									width: '48px',
									height: '48px',
									borderRadius: '12px',
									backgroundColor: 'rgba(30, 58, 95, 0.08)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									mx: 'auto',
									mb: 2,
									color: '#1e3a5f',
								}}
							>
								{feature.icon}
							</Box>
							<Typography
								sx={{
									fontSize: '15px',
									fontWeight: 600,
									color: '#1a1a2e',
									mb: 1,
								}}
							>
								{feature.title}
							</Typography>
							<Typography
								sx={{
									fontSize: '13px',
									color: '#64748b',
									lineHeight: 1.5,
								}}
							>
								{feature.desc}
							</Typography>
						</Box>
					</Grid>
				))}
			</Grid>
		</Box>
	)
}

export default ComingSoon
