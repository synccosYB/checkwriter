export const styles = {
	paper: {
		width: {
			xs: '100%',
			lg: '685px'
		},
		maxWidth: { xs: '100%', sm: '685px', lg: '685px' },
		minWidth: { xs: 'auto', lg: '685px' },
		// minHeight: '252px',

		borderRadius: '12px',
		padding: { xs: '16px', sm: '24px 30px' },
		m: { xs: 2, md: 0 }
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		mb: { xs: '17px', sm: '32px' }
	},
	title: {
		fontSize: { xs: '20px', sm: '30px' },
		lineHeight: 1,
		fontWeight: 600,
		color: 'rgba(0, 0, 0, 0.87)',
		p: 0,
		m: 0
	},
	closeButton: {
		p: 0,
		color: '#1e3a5f',
		'& .MuiSvgIcon-root': {
			width: { xs: '20px', sm: '24px' },
			height: { xs: '20px', sm: '24px' }
		}
	},
	content: {
		p: 0
	},
	actions: {
		p: 0,
		gap: '12px'
	}
}
