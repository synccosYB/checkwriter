export const styles = {
	wrapper: {
		p: 2,
		width: '100%'
	},
	tabContainer: {
		borderBottom: 1,
		borderColor: '#E5E7EB',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		mb: '30px'
	},

	tabs: {
		'& .MuiTabs-indicator': {
			backgroundColor: '#1e3a5f'
		},
		'& .MuiTab-root': {
			textTransform: 'none',
			fontSize: '14px',
			lineHeight: '20px',
			color: '#6B7280',
			'&.Mui-selected': {
				color: '#1e3a5f'
			}
		}
	},
	helpButton: {
		padding: 0,
		'& .MuiSvgIcon-root': {
			width: '24px',
			height: '24px',
			color: '#6B7280'
		}
	},
	actionContainer: {
		display: 'flex',
		flexDirection: {
			sm: 'column',
			md: 'row'
		},
		justifyContent: 'space-between',
		alignItems: {
			md: 'center'
		},
		maxWidth: '1040px',
		ml: 3
	},
	searchField: {
		minWidth: {
			xs: 'calc(100% - 109px)',
			sm: '400px'
		},
		'& .MuiOutlinedInput-root': {
			height: { xs: '36px', sm: '40px' },
			backgroundColor: '#F9FAFB',
			'& fieldset': {
				borderColor: '#E5E7EB'
			},
			'&:hover fieldset': {
				borderColor: '#E5E7EB'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#E5E7EB',
				borderWidth: '1px'
			},
			'&.Mui-focused': {
				backgroundColor: '#F9FAFB'
			}
		},
		'& .MuiOutlinedInput-input': {
			padding: { xs: '6px 12px', sm: '8px 12px' },
			fontSize: { xs: '12px', sm: '14px' },
			lineHeight: { xs: '16px', sm: '20px' },
			'&::placeholder': {
				color: '#6B7280',
				opacity: 1
			}
		}
	},
	searchIcon: {
		color: '#6B7280',
		fontSize: { xs: '18px', sm: '24px' }
	},
	searchIconContainer: {
		ml: { xs: 0.5, sm: 1 }
	},
	nextButton: {
		height: '40px',
		fontSize: '14px',
		width: '87px',
		lineHeight: '17px',
		backgroundColor: '#1e3a5f',
		textTransform: 'none',
		color: '#fff',
		'&:hover': {
			backgroundColor: '#152d4a'
		}
	},
	/////////////////////table style////////////////////////
	tableWrapper: {
		p: 3,
		width: '100%'
	},

	menuPaper: {
		width: '240px',
		boxShadow:
			'0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)',
		mt: '4px',
		'& .MuiList-root': {
			padding: '8px 0'
		}
	},
	menuItem: {
		fontSize: '14px',
		lineHeight: '20px',
		padding: '10px 16px',
		height: '41px',
		'&:hover': {
			backgroundColor: '#F9FAFB'
		}
	},
	moreButton: {
		color: '#e2e8f0',
		padding: '8px',
		'&:hover': {
			backgroundColor: 'rgba(0, 0, 0, 0.04)'
		}
	},
	paginationContainer: {
		mt: '32px',
		display: 'flex',
		justifyContent: 'flex-end',
		maxWidth: '1040px',
		'& .MuiPagination-ul': {
			gap: 0
		}
	},
	paginationItem: {
		margin: 0,
		borderRadius: 0,
		border: '1px solid #E5E7EB',
		borderRight: 'none',
		padding: '14px 24px',
		height: '47px',
		display: 'flex',
		alignItems: 'center',
		background: '#FFFFFF',
		'&.MuiPaginationItem-root': {
			borderRadius: 0,
			margin: 0
		},
		'&.Mui-selected': {
			background: 'rgba(30, 58, 95, 0.1)',
			border: '1px solid #1e3a5f',
			borderRight: 'none',
			color: '#000',
			'&:hover': {
				background: 'rgba(30, 58, 95, 0.1)'
			}
		},
		'&:hover': {
			background: 'rgba(30, 58, 95, 0.05)'
		},
		'&:last-child': {
			borderRight: '1px solid #E5E7EB',
			'&.Mui-selected': {
				borderRight: '1px solid #1e3a5f'
			}
		}
	},
	pagination: {
		'& .MuiPagination-ul': {
			gap: 0
		}
	},

	/////////////////////dialog style////////////////////////
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
		mb: '24px'
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
		fontWeight: '600',
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
		pb: { xs: 5, sm: 6 },
		pt: { xs: 3, sm: 4 },
		gap: '12px',
		justifyContent: 'center'
	},
	cancelButton: {
		fontSize: '14px',
		lineHeight: '20px',
		height: '40px',
		width: '140px',
		color: '#000000DE',
		border: '1px solid #F5F5F5',
		textTransform: 'none',
		'&:hover': {
			backgroundColor: 'rgba(0, 0, 0, 0.04)'
		}
	},
	confirmButton: {
		fontSize: '14px',
		lineHeight: '20px',
		height: '40px',
		minWidth: '140px',
		textTransform: 'none',
		backgroundColor: '#1e3a5f',
		'&:hover': {
			backgroundColor: '#152d4a'
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
	},
	dialogTabs: {
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
		gap: '20px'
	},
	groupContainer: {
		display: 'flex',
		flexDirection: {
			xs: 'column',
			sm: 'row'
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
	tooltip: {
		marginRight: '-15px',
		bgcolor: '#181D27',
		fontSize: '12px',
		lineHeight: '16px',
		px: '12px',
		py: '8px',
		borderRadius: '8px',
		'& .MuiTooltip-arrow': {
			color: '#181D27',
			left: '-10px !important'
		}
	},
	errorContainer: {
		display: 'flex',
		gap: '8px'
	},
	errorAlertText: {
		color: '#F03D3E',
		fontSize: '14px',
		lineHeight: '16px',
		fontWeight: 500
	}
}
