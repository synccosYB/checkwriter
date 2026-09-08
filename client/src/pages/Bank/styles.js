export const styles = {
	wrapper: {
		p: 2,
		width: '100%'
	},
	tabContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		mb: '30px'
	},

	tabs: {
		'& .MuiTabs-indicator': {
			backgroundColor: '#1e3a5f'
		},
		'& .MuiTab-root': {
			textTransform: 'none',
			fontSize: '14px',
			lineHeight: '20px',
			color: '#6B7280',
			'&.Mui-selected': {
				color: '#1e3a5f'
			}
		}
	},
	helpButton: {
		padding: 0,
		'& .MuiSvgIcon-root': {
			width: '24px',
			height: '24px',
			color: '#6B7280'
		}
	},
	actionContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		mx: 3
	},
	searchField: {
		minWidth: {
			xs: 'calc(100% - 109px)',
			sm: '400px'
		},
		'& .MuiOutlinedInput-root': {
			height: { xs: '36px', sm: '40px' },
			backgroundColor: '#F9FAFB',
			'& fieldset': {
				borderColor: '#E5E7EB'
			},
			'&:hover fieldset': {
				borderColor: '#E5E7EB'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#E5E7EB',
				borderWidth: '1px'
			},
			'&.Mui-focused': {
				backgroundColor: '#F9FAFB'
			}
		},
		'& .MuiOutlinedInput-input': {
			padding: { xs: '6px 12px', sm: '8px 12px' },
			fontSize: { xs: '12px', sm: '14px' },
			lineHeight: { xs: '16px', sm: '20px' },
			'&::placeholder': {
				color: '#6B7280',
				opacity: 1
			}
		}
	},
	searchIcon: {
		color: '#6B7280',
		fontSize: { xs: '18px', sm: '24px' }
	},
	searchIconContainer: {
		ml: { xs: 0.5, sm: 1 }
	},
	nextButton: {
		height: '40px',
		fontSize: '14px',
		width: '87px',
		lineHeight: '17px',
		backgroundColor: '#1e3a5f',
		textTransform: 'none',
		color: '#fff',
		'&:hover': {
			backgroundColor: '#152d4a'
		}
	}
}
