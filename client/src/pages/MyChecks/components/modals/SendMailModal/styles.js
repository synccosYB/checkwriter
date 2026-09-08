export const styles = {
	content: {
		display: 'flex',
		flexDirection: 'column',
		gap: '40px'
	},
	mailModal: {
		'& .MuiDialog-paper': {
			width: '100%',
			minWidth: { xs: '90%', sm: '80%', md: '600px', lg: '760px' },
			maxWidth: { xs: '90%', sm: '80%', md: '700px', lg: '900px' },
			padding: { xs: '16px', md: '24px' }
		}
	},
	section: {
		display: 'flex',
		flexDirection: 'column',
		gap: '12px'
	},
	sectionTitle: {
		fontSize: { xs: '16px', sm: '20px' },
		lineHeight: '24px',
		fontWeight: 600,
		color: '#111827'
	},
	description: {
		fontSize: '16px',
		lineHeight: '20px',
		color: '#000000DE'
	},
	input: {
		'& .MuiOutlinedInput-root': {
			height: '40px',
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
	cancelButton: {
		height: '40px',
		fontSize: '14px',
		lineHeight: '17px',
		textTransform: 'none'
	},
	nextButton: {
		height: '40px',
		fontSize: '14px',
		lineHeight: '17px',
		backgroundColor: '#1e3a5f',
		color: '#fff',
		textTransform: 'none',
		'&:hover': {
			backgroundColor: '#152d4a'
		}
	},
	blueText: {
		color: '#1e3a5f',
		display: 'inline'
	},
	paymentContent: {
		display: 'flex',
		alignItems: 'center',
		columnGap: '8px'
	},
	paymentIcon: {
		position: 'relative',
		width: '48px',
		height: '48px',
		img: {
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			objectFit: 'contain'
		}
	},
	paymentMethodName: {
		fontWeight: 600,
		fontSize: '18px',
		color: '#000000DE'
	},
	paymentMethodDetail: {
		color: '#00000099',
		fontWeight: 400,
		fontSize: '12px'
	}
}
