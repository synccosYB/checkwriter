import React from 'react'
import Tabs from '../components/shared/tabs'
import GeneralSettings from '../components/views/MyProfile/generalSettings'
import { Box, Tooltip, Typography } from '@mui/material'
import { HelpOutlineOutlined } from '@mui/icons-material'
import NewSecuritySettings from '../components/views/MyProfile/components/SecuritySettings/index'

const MyProfile = () => {
	return (
		<Box sx={{ position: 'relative', px: { xs: 2, md: 0 } }}>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 1,
				}}
			>
				<Typography
					sx={{
						fontSize: { xs: '18px', sm: '20px' },
						fontWeight: 600,
						color: '#1a1a2e',
					}}
				>
					My Profile
				</Typography>
				<ToolTip />
			</Box>
			<Tabs
				tabsData={[
					{ title: 'General Settings', component: <GeneralSettings /> },
					{
						title: 'Security Settings',
						component: <NewSecuritySettings />,
					},
				]}
			/>
		</Box>
	)
}

export default MyProfile

const ToolTip = () => (
	<Tooltip
		title={
			<span>
				Please contact at{' '}
				<a
					href="mailto:support@synccos.com"
					target="blank"
					rel="no-referrer"
					style={{ color: '#ffffff', fontWeight: 600 }}
				>
					support@synccos.com
				</a>{' '}
				for queries and support
			</span>
		}
	>
		<HelpOutlineOutlined sx={{ color: '#64748b', fontSize: '20px', cursor: 'pointer' }} />
	</Tooltip>
)
