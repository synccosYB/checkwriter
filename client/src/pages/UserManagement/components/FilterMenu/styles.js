export const styles = {
	menuItem: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		minWidth: { xs: 'auto', md: '200px' },
		width: { xs: '155px', md: 'auto' },
		fontSize: { xs: '12px', sm: '14px', md: '16px' },
		minHeight: { xs: '32px', sm: '40px', md: '48px' },
		whiteSpace: 'normal',
		'&:hover': {
			backgroundColor: '#1e3a5f1A',
			color: '#1e3a5f'
		}
	},
	subMenu: {
		position: 'absolute',
		left: '100%',
		top: 0,
		minWidth: { xs: 'auto', md: '200px' },
		width: { xs: '155px', md: 'auto' },
		backgroundColor: 'white',
		boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
		borderRadius: '4px',
		zIndex: 1300
	},
	issueddatepaper: {
		minWidth: { xs: '330px', md: '360px' },
		width: { xs: '330px', md: 'auto' },
		'& .MuiPaper-elevation': {
			minWidth: { xs: 'auto', md: '200px' },
			width: { xs: '330px', md: 'auto' },
			marginLeft: '0'
		}
	},
	subMenuItem: {
		p: 0,
		minHeight: { xs: '32px', sm: '40px', md: '48px' },
		fontSize: { xs: '12px', sm: '14px', md: '16px' },
		'&:hover': {
			backgroundColor: '#1e3a5f1A',
			color: '#1e3a5f'
		}
	},
	dateSubMenuItem: {
		py: { xs: 0.5, md: 1 },
		px: { xs: 1, sm: 2 },
		display: 'flex',
		minHeight: { xs: '32px', sm: '40px', md: '48px' },
		justifyContent: 'space-between',
		alignItems: 'center',
		'&:hover': {
			backgroundColor: '#1e3a5f1A',
			color: '#1e3a5f'
		}
	},
	searchField: {
		minWidth: {
			xs: '100px',
			sm: '190px'
		},

		'& .MuiOutlinedInput-root': {
			height: { xs: '32px', sm: '40px' },
			backgroundColor: '#F9FAFB',
			borderRadius: '8px',
			mb: '8px',
			'& fieldset': {
				borderColor: '#e2e8f0'
			},
			'&:hover fieldset': {
				borderColor: '#e2e8f0'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#e2e8f0',
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
	checkbox: {
		borderRadius: '4px',
		padding: { xs: '0px 5px', md: '0px 5px 0 0 ' }
	},
	subMenuItemText: {
		fontSize: { xs: '12px', sm: '14px', md: '16px' },
		whiteSpace: 'normal',
		'& .MuiTypography-body1': {
			fontSize: { xs: '12px', sm: '14px', md: '16px' },
			whiteSpace: 'normal'
		}
	},
	dateRangeTitle: {
		fontSize: { xs: '14px', md: '16px' },
		fontWeight: '600',
		color: '#000000DE'
	},
	divider: {
		backgroundColor: '#e2e8f0',
		margin: '8px 0'
	},
	dateRangeText: {
		fontSize: { xs: '12px', sm: '14px', md: '16px' },
		fontWeight: '600'
	},
	dateRange: {
		fontSize: { xs: '12px', sm: '14px', md: '16px' }
	},
	customDateContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: '24px',
		mt: 1,
		mb: 2
	},
	datePicker: {
		'& .MuiOutlinedInput-root': {
			height: { xs: '32px', sm: '40px' },
			width: { xs: '140px', md: '160px' },
			backgroundColor: '#F9FAFB',
			borderRadius: '8px',
			'& fieldset': {
				borderColor: '#e2e8f0'
			},
			'&:hover fieldset': {
				borderColor: '#e2e8f0'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#e2e8f0',
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
			height: '40px !important'
		}
	}
}
