export const styles = {
	verifyMethodContent: {
		display: 'flex',
		flexDirection: 'column',
		padding: { xs: '8px 0px 16px', sm: '8px 0px 51px' }
	},
	section: {
		display: 'flex',
		flexDirection: 'column'
	},

	sectionTitle: {
		fontSize: '20px',
		lineHeight: '24px',
		fontWeight: 600,
		marginBottom: '18px',
		color: '#111827'
	},
	appListContainer: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	emailListContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		columnGap: '24px'
	},
	phoneListContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		columnGap: '24px',
		marginBottom: '24px'
	},

	appInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px'
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
		color: '#1e3a5f'
	},
	setionDescription: {
		marginTop: 0,
		marginBottom: '16px',
		fontSize: '18px',
		lineHeight: '22px',
		color: '#6B7280'
	},
	description: {
		fontSize: '18px',
		lineHeight: '22px',
		color: 'rgba(0, 0, 0, 0.6)',
		fontWeight: '500',
		textAlign: 'left'
	},
	methodLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		width: {
			xs: '100%'
		}
	},
	divider: {
		borderColor: '#aea3a3',
		margin: { xs: '12px 0', sm: '16px 0', md: '24px 0' }
	},
	deliveryGroup: {
		gap: { xs: '24px', sm: '32px' },
		display: 'flex'
	},

	radio: {
		color: '#D1D5DB',
		'&.Mui-checked': {
			color: '#1e3a5f'
		}
	},
	phoneFlag: {
		width: { xs: '20px', sm: '24px' },
		height: { xs: '20px', sm: '24px' },
		'& .special-label': {
			display: 'none'
		},
		'& .selected-flag': {
			width: { xs: '20px', sm: '24px' },
			height: { xs: '20px', sm: '24px' },
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
	phoneInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px'
	},
	flagContainer: {
		width: '24px',
		height: '24px'
	},

	flagInput: {
		width: { xs: '20px', sm: '24px' },
		height: { xs: '20px', sm: '24px' },
		display: 'none',
		border: 'none',
		pointerEvents: 'none',
		background: 'transparent',
		padding: '0',
		paddingLeft: '30px',
		margin: '0',
		fontSize: '20px',
		lineHeight: '24px',
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
		fontSize: { xs: '14px', sm: '16px' },
		lineHeight: { xs: '18px', sm: '20px' },
		color: 'rgba(0, 0, 0, 0.87)'
	},

	defaultTextStyle: {
		fontSize: '12px',
		lineHeight: '16px',
		color: '#058205',
		backgroundColor: 'rgba(5, 130, 5, 0.1)',
		padding: '10px 16px',
		borderRadius: '4px'
	},
	verificationSection: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		marginTop: { xs: '20px', sm: '24px' },
		width: '100%'
	},
	codeInputContainer: {
		display: 'flex',
		marginBottom: { xs: '8px', sm: '12px', md: '17px' },
		gap: '16px'
	},
	codeInput: {
		width: '40px !important',
		height: '40px !important',
		border: '1px solid rgba(206, 206, 206, 1)',
		borderRadius: '8px',
		textAlign: 'center',
		fontSize: '24px !important',
		fontWeight: '400 !important',
		lineHeight: '1',
		marginRight: '8px',
		'&:focus': {
			outline: 'none',
			borderColor: '#1e3a5f'
		}
	},
	resendSection: {
		marginTop: { xs: '8px', sm: '12px', md: '17px' },
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		marginBottom: { xs: '24px', sm: '30px', md: '40px' }
	},
	timer: {
		fontSize: '14px',
		lineHeight: '20px',
		color: '#6B7280'
	},
	resendText: {
		fontSize: '18px',
		lineHeight: '1.1',
		color: 'rgba(0, 0, 0, 0.6)'
	},
	resendActiveText: {
		fontSize: '18px !important',
		lineHeight: '22px',
		color: 'rgba(0, 0, 0, 0.6)',
		cursor: 'pointer',
		textDecoration: 'underline',
		textUnderlineOffset: '3px'
	},
	cancelButton: {
		height: '40px',
		padding: '0 16px',
		fontSize: '14px',
		fontWeight: '500',
		lineHeight: '20px',
		color: 'rgba(0, 0, 0, 0.87)',
		textTransform: 'none',
		borderRadius: '6px !important',
		border: '1px solid rgba(206, 206, 206, 1)'
	},
	continueButton: {
		height: '40px',
		padding: '0 16px',
		fontSize: '14px',
		lineHeight: '20px',
		backgroundColor: '#1e3a5f',
		color: '#fff',
		textTransform: 'none',
		borderRadius: '6px !important',
		'&:hover': {
			backgroundColor: '#1a3850'
		}
	},
	verifyButton: {
		height: '40px',
		padding: '0 16px',
		fontSize: '14px',
		fontWeight: '500',
		lineHeight: '20px',
		backgroundColor: '#1e3a5f',
		color: '#fff',
		borderRadius: '6px !important',
		textTransform: 'none',
		'&:hover': {
			backgroundColor: '#1a3850'
		},
		'&:disabled': {
			backgroundColor: 'gray',
			color: 'white',
			cursor: 'not-allowed'
		}
	},
	error: {
		color: '#B42318',
		fontSize: '14px',
		lineHeight: '20px',
		marginTop: '0px',
		marginBottom: '0'
	}
}
