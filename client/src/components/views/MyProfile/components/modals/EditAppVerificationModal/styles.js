export const styles = {
	content: {
		display: 'flex',
		flexDirection: 'column',
		gap: '40px',
		marginTop: '40px'
	},
	section: {
		display: 'flex',
		flexDirection: 'column',
		gap: '12px'
	},
	sectionTitle: {
		fontSize: '20px',
		lineHeight: '24px',
		fontWeight: 600,
		color: '#111827'
	},
	description: {
		fontSize: '14px',
		lineHeight: '20px',
		color: '#6B7280'
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
	saveButton: {
		height: '40px',
		fontSize: '14px',
		lineHeight: '17px',
		backgroundColor: '#1e3a5f',
		color: '#fff',
		textTransform: 'none',
		'&:hover': {
			backgroundColor: '#1a3850'
		}
	},
	blueText: {
		color: '#1e3a5f',
		display: 'inline'
	}
}
