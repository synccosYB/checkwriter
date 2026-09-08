import React from 'react'
import noDataImg from '../../assets/images/no-data-img.png'
import ButtonComponent from '../shared/ButtonComponent'
import { AddOutlined } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'

const NoDataFound = ({ head, text, click, needBtn, btnText }) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				py: 8,
				px: 3,
			}}
		>
			<Box sx={{ mb: 3, opacity: 0.8 }}>
				<img src={noDataImg} alt="" style={{ maxWidth: '120px' }} />
			</Box>
			<Typography
				sx={{
					fontSize: '18px',
					fontWeight: 600,
					color: '#1a1a2e',
					mb: 1,
				}}
			>
				{head}
			</Typography>
			<Typography
				sx={{
					fontSize: '14px',
					color: '#64748b',
					mb: 3,
					textAlign: 'center',
					maxWidth: '400px',
				}}
			>
				{text}
			</Typography>
			{needBtn ? (
				<ButtonComponent
					text={btnText}
					variant="dark"
					type="button"
					click={click}
					icon={<AddOutlined />}
				/>
			) : null}
		</Box>
	)
}

export default NoDataFound
