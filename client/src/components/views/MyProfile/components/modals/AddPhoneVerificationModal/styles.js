export const styles = {
	content: {
		display: 'flex',
		flexDirection: 'column'
	},
	description: {
		fontSize: { xs: '16px', sm: '18px' },
		lineHeight: { xs: '20px', sm: '22px' },
		color: '#6B7280',
		marginTop: '16px',
		marginBottom: '24px'
	},
	phoneInputSection: {
		marginBottom: '24px',
		'& .special-label': {
			display: 'none'
		}
	},
	phoneInputStyle: {
		width: { sm: '320px', md: '480px' },
		height: '48px',
		fontSize: '16px',
		paddingLeft: '68px',
		border: '1px solid #E5E7EB',
		borderRadius: '8px',
		'&:focus': {
			border: '1px solid #1e3a5f',
			boxShadow: 'none'
		}
	},
	phoneInputContainer: {
		maxWidth: '360px',
		marginLeft: '2px',
		marginRight: 'auto'
	},
	phoneInputButton: {
		marginRight: 'auto',
		border: 'none',
		borderRight: '1px solid #E5E7EB',
		borderRadius: '8px 0 0 8px',
		backgroundColor: 'transparent',
		'&:hover': {
			backgroundColor: 'transparent'
		}
	},
	phoneInputDropdown: {
		width: '300px',
		margin: '0',
		padding: '0',
		borderRadius: '8px',
		border: '1px solid #E5E7EB',
		boxShadow:
			'0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)'
	},
	errorText: {
		fontSize: '12px',
		lineHeight: '16px',
		color: '#DC2626',
		marginTop: '4px'
	},
	radioGroup: {
		marginLeft: '2px',
		marginTop: '20px',
		gap: '15%'
	},
	verificationMethodSection: {
		marginBottom: '24px'
	},

	stepTitle: {
		fontSize: '20px',
		lineHeight: '24px',
		color: '#111827',
		fontWeight: 600,
		marginBottom: '12px'
	},
	labelSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: { xs: '4px', sm: '4px' }
	},
	labelHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px'
	},
	optionalText: {
		fontSize: { xs: '16px', sm: '18px' },
		lineHeight: { xs: '20px', sm: '22px' },
		color: '#1e3a5f',
		textDecoration: 'underline'
	},
	descriptionContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		marginBottom: '12px'
	},
	stepDescription: {
		fontSize: { xs: '16px', sm: '18px' },
		lineHeight: { xs: '20px', sm: '22px' },
		color: '#6B7280'
	},
	labelInput: {
		'& .MuiOutlinedInput-root': {
			height: { xs: '40px', sm: '48px' },
			width: { xs: '100%', sm: '480px' },
			fontSize: { xs: '16px', sm: '18px' },
			lineHeight: { xs: '36px', sm: '44px' },
			'& fieldset': {
				borderColor: '#E5E7EB'
			},
			'&:hover fieldset': {
				borderColor: '#E5E7EB'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#1e3a5f'
			}
		}
	},
	checkbox: {
		color: '#1e3a5f',
		'&.Mui-checked': {
			color: '#1e3a5f'
		}
	},
	checkboxLabel: {
		'& .MuiTypography-root': {
			fontSize: { xs: '12px', sm: '14px' },
			lineHeight: { xs: '16px', sm: '20px' },
			color: '#6B7280'
		}
	},
	verificationSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: { xs: '16px', sm: '24px' },
		marginTop: '8px'
	},
	codeInputContainer: {
		display: 'flex',
		gap: { xs: '6px', sm: '8px' }
	},
	codeInput: {
		width: { xs: '32px', sm: '40px' },
		height: { xs: '32px', sm: '40px' },
		borderRadius: '8px',
		border: '1px solid #E5E7EB',
		textAlign: 'center',
		fontSize: { xs: '16px', sm: '18px' },
		'&:focus': {
			outline: 'none',
			borderColor: '#1e3a5f'
		}
	},
	resendSection: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px'
	},
	timer: {
		fontSize: '14px',
		lineHeight: '20px',
		color: '#6B7280'
	},
	resendText: {
		fontSize: '14px',
		lineHeight: '20px',
		color: '#6B7280'
	},
	resendActiveText: {
		fontSize: '14px',
		lineHeight: '20px',
		color: '#1e3a5f',
		textDecoration: 'underline',
		cursor: 'pointer'
	},
	cancelButton: {
		height: '40px',
		fontSize: '14px',
		lineHeight: '17px',
		textTransform: 'none'
	},
	verifyButton: {
		height: '40px',
		fontSize: '14px',
		lineHeight: '17px',
		backgroundColor: '#1e3a5f',
		textTransform: 'none',
		'&:hover': {
			backgroundColor: '#1a3850'
		}
	},
	error: {
		color: '#B42318',
		fontSize: '14px',
		lineHeight: '20px',
		marginTop: '8px',
		marginBottom: '32px'
	}
}
