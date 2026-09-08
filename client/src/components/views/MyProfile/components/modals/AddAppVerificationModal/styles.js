export const styles = {
	content: {
		display: 'flex',
		flexDirection: 'column'
	},
	description: {
		fontSize: { xs: '16px', sm: '18px' },
		lineHeight: { xs: '18px', sm: '20px' },
		color: '#6B7280',
		marginTop: '10px',
		marginBottom: { xs: '12px', sm: '16px' }
	},
	stepContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: { xs: '6px', sm: '8px' },
		'& + &': {
			marginTop: { xs: '10px', sm: '12px' }
		}
	},
	stepHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: { xs: '6px', sm: '8px' }
	},
	stepTag: {
		backgroundColor: 'rgba(30, 58, 95, 0.1)',
		border: '1px solid #1e3a5f',
		borderRadius: '16px',
		padding: { xs: '2px 8px', sm: '4px 12px' },
		fontSize: { xs: '12px', sm: '14px' },
		lineHeight: { xs: '14px', sm: '16px' },
		color: '#1e3a5f'
	},
	stepTitle: {
		fontSize: { xs: '14px', sm: '18px' },
		lineHeight: { xs: '18px', sm: '20px' },
		color: '#111827',
		fontWeight: 500
	},
	descriptionContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		marginBottom: '8px'
	},
	stepDescription: {
		fontSize: { xs: '14px', sm: '16px' },
		lineHeight: { xs: '18px', sm: '20px' },
		color: '#6B7280'
	},

	requiredText: {
		fontSize: '12px',
		lineHeight: '16px',
		color: '#1e3a5f',
		textDecoration: 'underline'
	},
	qrContainer: {
		width: { xs: '160px', sm: '194px' },
		height: { xs: '160px', sm: '194px' },
		backgroundColor: '#FFFFFF',
		border: '1px solid #E5E7EB',
		borderRadius: '8px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		alignSelf: { xs: 'center', sm: 'flex-start' }
	},
	qrSection: {
		display: 'flex',
		flexDirection: 'row',
		gap: { xs: '16px', sm: '24px' },
		backgroundColor: '#F9FAFB',
		padding: { xs: '6px', sm: '6px' },
		borderRadius: '8px'
	},
	secretKeyContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: { xs: '6px', sm: '8px' },
		flex: 1,
		justifyContent: 'center'
	},
	cantSeeText: {
		fontSize: { xs: '12px', sm: '14px' },
		lineHeight: { xs: '16px', sm: '20px' },
		fontWeight: 500,
		color: '#111827'
	},

	enterKeyText: {
		fontSize: { xs: '12px', sm: '14px' },
		lineHeight: { xs: '16px', sm: '20px' },
		color: '#6B7280'
	},
	secretKey: {
		wordBreak: 'break-word',
		fontSize: { xs: '12px', sm: '14px' },
		lineHeight: { xs: '16px', sm: '20px' },
		color: '#111827',
		fontFamily: 'monospace',
		letterSpacing: '0.1em',
		border: '1px solid #E5E7EB',
		borderRadius: '6px',
		padding: { xs: '2px 10px', sm: '4px 12px' },
		backgroundColor: 'transparent'
	},
	copyButton: {
		fontSize: '12px',
		lineHeight: '16px',
		color: '#1e3a5f',
		padding: '2px 8px',
		alignSelf: 'flex-start',
		backgroundColor: '#FFFFFF',
		border: '1px solid #E5E7EB',
		borderRadius: '6px',

		'&:hover': {
			backgroundColor: '#FFFFFF',
			borderColor: '#1e3a5f'
		}
	},
	verificationSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: { xs: '8px', sm: '12px' }
	},
	verificationLabel: {
		fontSize: '14px',
		lineHeight: '18px',
		color: '#6B7280'
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
	labelSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: { xs: '12px', sm: '16px' }
	},
	labelInput: {
		'& .MuiOutlinedInput-root': {
			height: { xs: '32px', sm: '36px' },
			width: { xs: '100%', sm: '480px' },
			fontSize: { xs: '12px', sm: '16px' },
			lineHeight: { xs: '16px', sm: '20px' },

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
	cancelButton: {
		height: '40px',
		fontSize: '14px',
		lineHeight: '17px',
		textTransform: 'none'
	},
	verifyButton: {
		height: '30px',
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
