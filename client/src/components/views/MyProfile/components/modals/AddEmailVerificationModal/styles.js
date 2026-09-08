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
		marginBottom: { xs: '20px', sm: '26px' }
	},
	emailInput: {
		'& .MuiOutlinedInput-root': {
			height: { xs: '40px', sm: '48px' },
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
		},
		marginBottom: '24px'
	},
	labelSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: { xs: '12px', sm: '16px' }
	},
	labelHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px'
	},
	stepTitle: {
		fontSize: { xs: '18px', sm: '20px' },
		lineHeight: { xs: '22px', sm: '24px' },
		color: '#111827',
		fontWeight: 500
	},
	optionalText: {
		fontSize: '14px',
		lineHeight: '20px',
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
		color: 'black',
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
