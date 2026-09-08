export const styles = {
	container: {
		width: '100%',
		backgroundColor: '#1e3a5f',
		display: 'flex',
		alignItems: 'center',
		justifyContent: {xs: 'space-between', sm: 'center'},
		position: 'fixed',
		px: { xs: '12px', sm: '16px' },
		height: '56px',
		zIndex: 10000,
		top: 0
	},
	message: {
		color: '#ffffff',
		fontWeight: 600,
		width: {xs: '50%', sm: '100%'},
		fontSize: { xs: '14px', sm: '16px', md: '20px' },
		lineHeight: { xs: '20px', sm: '24px' },
		textAlign: {xs: 'left', sm: 'center'}
	},
	exitButton: {
		position: 'absolute',
		right: { xs: '12px', sm: '16px' },
		width: { xs: '44px', sm: '54px' },
		height: '27px',
		backgroundColor: '#FFFFFF',
		color: '#000000',
		fontSize: '12px',
		textTransform: 'none',
		'&:hover': {
			backgroundColor: '#D1D5DB'
		},
		'& .MuiButton-root': {
			borderRadius: '8px !important'
		}
	}
}
