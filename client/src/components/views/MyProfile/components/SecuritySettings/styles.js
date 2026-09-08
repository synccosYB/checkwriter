export const styles = {
	container: {
		mt: 2,
		p: 2,
		border: '1px solid #E5E7EB',
		borderRadius: '8px'
	},
	mfaHeaderContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		mb: 1
	},
	mfaContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		mb: 1
	},
	mfaDescription: {
		fontSize: '14px',
		lineHeight: '18px',
		color: '#000',
		opacity: '0.6'
	},
	mfaTitle: {
		fontSize: '16px',
		lineHeight: '24px',
		fontWeight: 600,
		color: '#111827'
	},
	rightSection: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px'
	},
	switch: {
		'& .MuiSwitch-switchBase.Mui-checked': {
			color: '#1e3a5f',
			'&:hover': {
				backgroundColor: 'rgba(30, 58, 95, 0.04)'
			}
		},
		'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
			backgroundColor: '#1e3a5f'
		}
	},
	authListContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: 0
	},
	divider: {
		borderBottom: '1px solid #E5E7EB'
	},
	appListContainer: {
		marginBottom: '24px',
		display: 'flex',
		flexDirection: 'column',
		gap: '16px'
	},
	appRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: '36px',
		borderRadius: '12px'
	},
	appInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px'
	},
	appTextContainer: {
		display: 'flex',
		gap: '4px',
		alignItems: 'center',
		border: '1px solid #1e3a5f',
		borderRadius: '4px',
		padding: '7px 8px'
	},

	appName: {
		fontSize: '10px',
		lineHeight: '10px',
		color: '#1e3a5f',
		fontWeight: 500
	},
	appMeta: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px'
	},
	appLabel: {
		fontSize: '14px',
		lineHeight: '20px',
		color: '#6B7280'
	},
	defaultBadge: {
		fontSize: '12px',
		lineHeight: '16px',
		color: '#1e3a5f',
		backgroundColor: 'rgba(30, 58, 95, 0.1)',
		padding: '2px 8px',
		borderRadius: '16px'
	},
	moreButton: {
		color: '#6B7280',
		padding: '8px',
		'&:hover': {
			backgroundColor: 'rgba(0, 0, 0, 0.04)'
		}
	},
	emailRow: {
		display: 'flex',
		justifyContent: 'space-between',
		height: '24px',
		marginY: '12px',
		alignItems: 'center'
	},
	emailInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: { xs: '2px', sm: '12px' },
		'& > .react-tel-input': {
			marginRight: '4px'
		}
	},
	emailName: {
		fontSize: '16px',
		lineHeight: '20px',
		color: '#6B7280'
	},
	phoneFlag: {
		width: { xs: '160px', sm: '200px' },
		height: '24px',
		'& .special-label': {
			display: 'none'
		},
		'& .selected-flag': {
			width: '24px',
			height: '24px',
			padding: 0,
			backgroundColor: 'transparent !important'
		},
		'& .flag': {
			transform: 'scale(0.75)'
		},
		'& input': {
			fontSize: '20px',
			lineHeight: '24px',
			color: '#6B7280'
		}
	},
	flagContainer: {
		width: { xs: '160px', sm: '200px' },
		height: '24px'
	},
	flagInput: {
		width: { sm: '100px', md: '200px' },
		height: '24px',
		border: 'none',
		pointerEvents: 'none',
		background: 'transparent',
		padding: '0',
		paddingLeft: '30px',
		margin: '0',
		fontSize: '16px',
		lineHeight: '20px',
		color: '#6B7280'
	},
	flagButton: {
		border: 'none',
		backgroundColor: 'transparent',
		padding: '0',
		margin: '0',
		width: '24px',
		height: '24px',
		'&:hover': {
			backgroundColor: 'transparent'
		}
	},
	phoneNumber: {
		fontSize: '16px',
		lineHeight: '20px',
		color: '#6B7280'
	},
	defaultTextStyle: {
		fontSize: { xs: '10px', sm: '12px' },
		lineHeight: { xs: '14px', sm: '16px' },
		color: '#058205',
		backgroundColor: 'rgba(5, 130, 5, 0.1)',
		padding: { xs: '10px 4px', md: '10px 16px' },
		borderRadius: '4px'
	},
	menuPaper: {
		width: '240px',
		boxShadow:
			'0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)',
		mt: '4px',
		'& .MuiList-root': {
			padding: '8px 0'
		}
	},
	menuItem: {
		fontSize: '14px',
		lineHeight: '20px',
		padding: '10px 16px',
		height: '41px',
		'&:hover': {
			backgroundColor: '#F9FAFB'
		}
	},
	addButton: {
		height: '40px',
		color: '#6B7280',
		border: '1px solid #E5E7EB',
		textTransform: 'none',
		fontSize: '14px',
		lineHeight: '20px',
		'&:hover': {
			border: '1px solid #E5E7EB',
			backgroundColor: '#F9FAFB'
		}
	}
}
