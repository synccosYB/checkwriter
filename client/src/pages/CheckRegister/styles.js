export const styles = {
	addCheckButton: {
		height: '40px',
		backgroundColor: '#1e3a5f1A',
		border: '1px solid #e2e8f0',
		borderStyle: 'dashed',
		color: '#1e3a5f',
		borderRadius: '8px',
		textTransform: 'none',
		'&:hover': {
			backgroundColor: '#1e3a5f1A',
			borderColor: '#1e3a5f'
		}
	},

	popover: { top: '15px', left: '-25px' },
	list: {
		minWidth: '190px',
		padding: '0px 0px',
		margin: '0px 0px',
		borderRadius: '8px',
		border: '1px solid 1px solid rgba(30, 58, 95, 0.15)'
	},
	listItem: {
		justifyContent: 'start',
		alignItems: 'center',
		display: 'flex',
		gap: '10px',
		fontSize: '14px',
		fontWeight: '500',
		lineHeight: '1',
		padding: '15px 16px',
		'& .list-item-new:hover': {
			backgroundColor: 'rgba(30, 58, 95, 0.05)'
		}
	},
	listItemDeposit: {
		gap: '7px',
		padding: '15px 12px'
	},
	genericTableContainer: {
		position: 'relative',
		border: '1px solid #E0E0E0',
		borderRadius: '8px'
	},
	loadingOverlay: {
		position: 'absolute',
		top: 56,
		left: 0,
		right: 0,
		bottom: 0,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.6)',
		zIndex: 2
	},
	loadingMore: { textAlign: 'center', py: 1 },

	menuPaper: {
		// width: '146px',
		boxShadow:
			'0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)',
		mt: '4px',
		borderRadius: '8px',
		'& .MuiPaper-root': {
			marginTop: '0px',
			backgroundColor: '#fff',
			borderRadius: '10px',
			boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
			border: '1px solid rgba(30, 58, 95, 0.15)'
		},
		'& .MuiList-root': {
			padding: '0px 0',
			'& .MuiMenuItem-root:first-child': {
				backgroundColor: 'rgba(30, 58, 95, 0.1)'
			}
		}
	},
	menuItem: {
		fontSize: '14px',
		lineHeight: '20px',
		padding: '10px 16px',
		height: '41px',
		display: 'flex',
		alignItems: 'center',
		color: '#1e3a5f',
		gap: '8px',
		fontWeight: '500',
		'&:hover': {
			backgroundColor: 'rgba(30, 58, 95, 0.05)'
		}
	},
	bankSelect: {
		boxShadow: 'none',
		'.MuiOutlinedInput-notchedOutline': {
			border: 1,
			borderColor: 'rgba(30, 58, 95, 1)',
			borderRadius: '8px !important'
		},
		'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(30, 58, 95, 1)',
			border: 1
		},
		'& .MuiSelect-select': {
			paddingTop: '10px',
			paddingBottom: '10px',
			paddingLeft: '20px',
			paddingRight: '20px',
			display: 'flex',
			alignItems: 'center',
			border: 0,
			borderColor: '#fff',
			borderRadius: '10px !important',
			fontSize: '14px',
			fontWeight: '500',
			color: '#1e3a5f'
		},
		'& .MuiSelect-select:focus': {
			borderRadius: '10px !important'
		}
	},
	// Bank select specific styles
	bankDropdownMenu: {
		'& .MuiPaper-root': {
			marginTop: '2px',
			backgroundColor: '#fff',
			borderRadius: '10px',
			boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
			border: '1px solid rgba(30, 58, 95, 0.15)',
			fontSize: '14px',
			fontWeight: '500',
			color: '#1e3a5f'
		},
		'& .MuiList-root': {
			padding: '0px 0'
		}
	},
	bankMenuItem: {
		padding: '10px 16px',
		margin: '0px 0px',
		borderRadius: '0px',
		fontSize: '14px',
		fontWeight: '500',
		color: '#1e3a5f',
		'&:hover': {
			backgroundColor: 'rgba(30, 58, 95, 0.15)',
			color: '#058205'
		},
		'&.Mui-selected': {
			backgroundColor: 'rgba(30, 58, 95, 0.1)',
			'&:hover': {
				backgroundColor: 'rgba(30, 58, 95, 0.15)'
			}
		}
	},
	// AddTransactionModal styles
	addTransactionModal: {
		dialog: {
			'& .MuiDialog-paper': {
				borderRadius: '12px',
				width: { xs: '95%', sm: '760px' }
			},
			'& .MuiDialogContent-root': {
				padding: '0 !important'
			}
		},
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: '16px',
			padding: '0 !important'
		},
		label: {
			mb: '6px',
			fontSize: { xs: '16px', sm: '17px' },
			fontWeight: 600,
			color: '#1a1a2e'
		},
		description: {
			color: 'rgba(0, 0, 0, 0.6)',
			mb: 1,
			fontSize: '18px',
			fontWeight: '500',
			lineHeight: '1.2',
			marginBottom: '16px'
		},
		gridRow: {
			display: 'grid',
			gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
			gap: 2
		},
		textField: {
			'& .MuiInputBase-root': { height: { xs: 40, sm: 48 } },
			'& .MuiOutlinedInput-root': { borderRadius: '6px' }
		},
		autoField: {
			'& .MuiInputBase-root': { height: { xs: 40, sm: 48 } },
			'& .MuiOutlinedInput-root': { borderRadius: '6px' }
		},

		descriptionField: {
			'& .MuiOutlinedInput-root': {
				borderRadius: '8px'
			}
		},
		actionsContainer: {
			display: 'flex',
			justifyContent: 'flex-end',
			gap: 1
		},
		autocompleteOption: {
			display: 'flex',
			alignItems: 'center'
		},
		addIcon: {
			mr: 1,
			color: '#1e3a5f'
		}
	},
	actionsContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: '9px',
		marginTop: { xs: '-10px', md: '0px' }
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
			backgroundColor: '#152d4a'
		}
	}
}
