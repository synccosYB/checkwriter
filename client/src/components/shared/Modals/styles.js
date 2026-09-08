export const styles = {
	dialog: {
		width: {
			xs: '100%',
			sm: '607px'
		},
		maxWidth: '685px',
		minHeight: '252px',
		borderRadius: '12px',
		m: { xs: 2, sm: 0 }
	},
	dialogHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		px: { xs: 2, sm: 3 },
		pt: { xs: 2, sm: 3 }
	},
	alertIconMain: {
		width: '100px',
		height: '100px',
		borderRadius: '50%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		'& .MuiSvgIcon-root': {
			color: '#fff',
			width: '50px',
			height: '50px'
		}
	},
	dialogTitle: {
		fontSize: {
			xs: '24px',
			sm: '30px'
		},
		lineHeight: '1.1',
		p: 0,
		m: 0,
		fontWeight: '600',
		marginBottom: { xs: '16px', md: '24px' }
	},
	dialogCloseButton: {
		p: 0,
		color: '#1e3a5f',
		'& .MuiSvgIcon-root': {
			width: {
				xs: '20px',
				sm: '24px'
			},
			height: {
				xs: '20px',
				sm: '24px'
			}
		}
	},
	dialogContent: {
		px: { xs: 2, sm: 3 },
		fontWeight: '500',
		fontSize: {
			xs: '14px',
			sm: '18px'
		},
		lineHeight: {
			xs: '20px',
			sm: '24px'
		}
	},
	dialogActions: {
		p: { xs: 2, sm: 3 },
		gap: '12px'
	},
	deleteDialogActions: {
		pb: { xs: '24px', sm: '40px' },
		pt: { xs: '16px', sm: '24px' },
		gap: '12px',
		justifyContent: 'center'
	},
	cancelButton: {
		fontSize: '14px',
		lineHeight: '20px',
		height: '40px',
		minWidth: '100px',
		color: '#000000DE',
		border: 'none',
		textTransform: 'none',
		'&:hover': {
			border: 'none',
			backgroundColor: 'rgba(0, 0, 0, 0.04)'
		}
	},
	confirmButton: {
		fontSize: '14px',
		lineHeight: '20px',
		height: '40px',
		textTransform: 'none',
		borderRadius: '6px !important',
		backgroundColor: '#1e3a5f',
		'&:hover': {
			backgroundColor: '#1a3850'
		}
	}
}
