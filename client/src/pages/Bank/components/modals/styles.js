export const styles = {
	dialog: {
		width: {
			xs: '100%',
			sm: '685px'
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
		pt: { xs: 2, sm: 3 },
		mb: {xs: '12px', sm: '24px'}
	},
	dialogTitle: {
		fontSize: {
			xs: '24px',
			sm: '32px'
		},
		lineHeight: {
			xs: '28px',
			sm: '36px'
		},
		p: 0,
		m: 0
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
		mt: '32px',
		gap: '12px'
	},
	deleteDialogActions: {
		pb: { xs: 2, sm: 3 },
		mt: '32px',
		gap: '12px',
		justifyContent: 'center'
	},
	cancelButton: {
		fontSize: '14px',
		lineHeight: '20px',
		height: '40px',
		width: '100px',
		color: '#1e3a5f',
		textTransform: 'none',
		// border: 'none',
		'&:hover': {
			// border: 'none',
			backgroundColor: 'rgba(0, 0, 0, 0.04)'
		}
	},
	confirmButton: {
		fontSize: '14px',
		lineHeight: '20px',
		height: '40px',
		minWidth: '100px',
		textTransform: 'none',
		backgroundColor: '#1e3a5f',
		'&:hover': {
			backgroundColor: '#152d4a'
		}
	},
	deleteIconContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '120px',
		mb: '16px'
	},
	deleteIconBorder: {
		width: '120px',
		height: '120px',
		backgroundColor: '#F03D3E1D',
		borderRadius: '50%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	deleteIconMain: {
		width: '100px',
		height: '100px',
		backgroundColor: '#F03D3E',
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

	tabs: {
		pt: 3,
		pb: 2,
		'& .MuiTabs-indicator': {
			backgroundColor: '#1e3a5f'
		},
		'& .MuiTab-root': {
			textTransform: 'none',
			fontSize: '14px',
			lineHeight: '20px',
			color: '#6B7280',
			width: '50%',
			'&.Mui-selected': {
				color: '#1e3a5f'
			}
		}
	},
	formContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: {
			xs:'16px',
			sm:'20px'
		}
	},
	groupContainer: {
		display: 'flex',
		flexDirection:{
			xs:'column',
			sm:'row'
		},
		gap: '20px'
	},
	inputGroup: {
		display: 'flex',
		flex: 1,
		flexDirection: 'column',
		gap: '8px'
	},
	labelContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	labelIcon: {
		color: '#e2e8f0',
		'& .MuiSvgIcon-root': {
			width: '15px',
			height: '15px'
		}
	},
	inputLabel: {
		fontSize: '14px',
		fontWeight: 600,
		color: '#000000DE'
	},
	input: {
		'& .MuiOutlinedInput-root': {
			height: '48px',
			'& fieldset': {
				borderColor: '#e2e8f0'
			},
			'&:hover fieldset': {
				borderColor: '#e2e8f0'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#1e3a5f'
			}
		}
	},
	select: {
		height: '48px',
		backgroundColor: '#fff',
		'& .MuiSelect-select': {
			padding: '12px 16px',
			fontSize: '14px',
			lineHeight: '20px',
			color: '#000000DE'
		},
		'& .MuiSvgIcon-root': {
			color: '#000000DE'
		}
	},
	errorText: {
		fontSize: '12px',
		lineHeight: '16px',
		color: '#DC2626',
		marginTop: '-4px'
	},
	radioGroup: {
		marginLeft: '2px',
		gap: '15%',
		display: 'flex'
	},
	radioItem: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		flex: 1
	},
	signatureContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: '12px'
	},
	signatureLabelContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	signatureLabel: {
		fontSize: '18px',
		fontWeight: 600,
		color: '#000000DE'
	},
	switch: {
		'& .MuiSwitch-switchBase': {
			color: '#D1D5DB',
			'&.Mui-checked': {
				color: '#1e3a5f'
			}
		},
		'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
			backgroundColor: '#1e3a5f'
		}
	},
	alertIconContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '120px',
		mb: '16px'
	},
	alertIconBorder: {
		width: '120px',
		height: '120px',
		backgroundColor: '#F03D3E1D',
		borderRadius: '50%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	alertIconMain: {
		width: '100px',
		height: '100px',
		backgroundColor: '#F03D3E',
		borderRadius: '50%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		'& .MuiSvgIcon-root': {
			color: '#fff',
			width: '50px',
			height: '50px'
		}
	}
}
