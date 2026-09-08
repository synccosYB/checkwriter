export const styles = {
	button: {
		fontSize: '14px',
		lineHeight: '20px',
		height: { xs: '32px', sm: '40px' },
		textTransform: 'none',
		borderRadius: '8px !important',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px'
	},
	primaryVariant: {
		backgroundColor: '#1e3a5f',
		border: '1px solid #1e3a5f',
		color: '#FFFFFF',
		'&:hover': {
			backgroundColor: '#1a3850',
			border: '1px solid #1a3850'
		},
		'&:disabled': {
			backgroundColor: 'lightgray',
			border: '1px solid lightgray',
			color: '#FFFFFF',
			cursor: 'not-allowed'
		}
	},
	secondaryVariant: {
		backgroundColor: '#FFFFFF',
		border: '1px solid #1e3a5f',
		color: '#1e3a5f',
		'&:hover': {
			backgroundColor: '#FFFFFF',
			border: '1px solid #1e3a5f',
			color: '#1e3a5f'
		},
		'&:disabled': {
			backgroundColor: '#FFFFFF',
			border: '1px solid #1e3a5f',
			color: '#1e3a5f'
		}
	},
	errorVariant: {
		color: '#FF4D4F',
		backgroundColor: '#FF4D4F0D',
		border: '1px solid #FF4D4F',
		'&:hover': {
			backgroundColor: '#FF4D4F1A',
			border: '1px solid #FF4D4F'
		}
	},
	// warningVariant: {
	//   color: '#EF6C00',
	//   backgroundColor: 'rgba(239, 108, 0, 0.05)',
	//   border: '1px solid #EF6C00',
	//   '&:hover': {
	//     backgroundColor: 'rgba(239, 108, 0, 0.1)',
	//     border: '1px solid #EF6C00'
	//   }
	// },
	smallSize: {
		height: '28px',
		fontSize: '12px',
		lineHeight: '14.5px',
		padding: '4px 8px'
	},
	buttonIconText: {
		display: { xs: 'none', sm: 'block' }
	}
}
