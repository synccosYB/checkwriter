export const styles = {
	actionMenuPaper: {
		'& .MuiPaper-root': {
			minWidth: { xs: '130px', sm: '150px' },
			borderRadius: '8px',
			border: '1px solid #F5F5F5',
			boxShadow: '0px 4px 10px 0px #0000001A'
		}
	},
	actionMenuItem: {
		fontSize: { xs: '12px', sm: '14px' },
		fontWeight: 500,
		lineHeight: '1.2',
		minHeight: '30px',
		'& .MuiMenuItem-root': {
			padding: '8px 12px'
		}
	},
	actionMenuItemText: {
		fontSize: { xs: '12px', sm: '14px' },
		fontWeight: 500,
		lineHeight: '1.2',
		color: 'rgba(0, 0, 0, 0.87)',
		ml: 1
	},
	bankSection: {
		background: 'rgba(249, 250, 251, 1)',
		border: '1px solid rgba(238, 240, 242, 1)',
		borderRadius: { xs: '8px', md: '12px' },
		padding: { xs: '10px 12px', md: '13px 16px' },
		mb: { xs: '8px', md: '10px' },
		display: 'flex',
		alignItems: { xs: 'flex-start', sm: 'center' },
		justifyContent: 'space-between',
		flexDirection: { xs: 'column', sm: 'row' },
		gap: { xs: '12px', sm: '0' }
	},
	bankName: {
		display: 'flex',
		alignItems: 'center',
		fontWeight: 500,
		fontSize: { xs: '16px', sm: '18px', md: '20px' },
		color: 'rgba(0, 0, 0, 0.6)'
	},
	bankNameText: {
		fontSize: { xs: '16px', sm: '18px', md: '20px' },
		fontWeight: 500,
		lineHeight: '1.2',
		color: 'rgba(0, 0, 0, 0.6)'
	},
	editIcon: {
		ml: { xs: '4px', md: '6px' },
		color: 'rgba(30, 58, 95, 1)',
		fontSize: { xs: '16px', sm: '18px', md: '20px' }
	},
	progressBox: {
		background: '#fff',
		borderRadius: { xs: '6px', md: '8px' },
		p: { xs: '12px', md: '16px' },
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end',
		maxWidth: { xs: '100%', sm: '420px', lg: '503px' },
		width: '100%',
		border: '1px solid rgba(206, 206, 206, 1)'
	},
	progressBar: {
		width: '100%',
		mb: { xs: '10px', md: '12px' },
		height: { xs: '8px', md: '12px' }
	},
	progressLegend: {
		display: 'flex',
		alignItems: 'center',
		gap: { xs: '6px', sm: '8px', md: '10px' },
		width: '100%',
		justifyContent: 'space-between',
		flexWrap: { xs: 'wrap', sm: 'nowrap' }
	},
	legendItem: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: { xs: '3px', md: '6px' },
		minWidth: { xs: 'auto', sm: '80px' }
	},
	legendDot: (color: string, border?: string) => ({
		width: { xs: '8px', md: '10px' },
		height: { xs: '8px', md: '10px' },
		borderRadius: '50%',
		background: color,
		border: border || undefined,
		flexShrink: 0
	}),
	legendText: {
		color: 'rgba(0, 0, 0, 0.6)',
		ml: 0,
		fontSize: { xs: '10px', sm: '11px', md: '12px' },
		fontWeight: 500,
		lineHeight: '1.2',
		letterSpacing: '0'
	},
	validTitle: {
		fontSize: { xs: '16px', sm: '20px', md: '24px' },
		fontWeight: 600,
		lineHeight: '1.2',
		letterSpacing: '0',
		color: 'rgba(0, 0, 0, 0.87)'
	},
	filterSubmitBox: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		mb: { xs: '10px', md: '12px' },
		flexDirection: { xs: 'column', sm: 'row' },
		gap: { xs: '12px', sm: '0' }
	},
	filterSubmitBoxRight: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: { xs: 'space-between', sm: 'flex-end' },
		gap: { xs: '6px', sm: '12px', md: '24px' },
		flexDirection: { xs: 'row-reverse', sm: 'row' },
		width: { xs: '100%', sm: 'auto' }
	},
	filterCheckboxInner: {
		display: 'flex',
		alignItems: 'center',
		gap: { xs: '4px', md: '8px' },
		flexDirection: { xs: 'row' }
	},
	filterCheckboxInnerInner: {
		display: 'flex',
		alignItems: 'center',
		gap: { xs: '4px', md: '8px' }
	},
	filterCheckboxText: {
		fontSize: { xs: '11px', sm: '13px', md: '14px' },
		fontWeight: 500,
		lineHeight: '1.2',
		color: 'rgba(30, 58, 95, 1)'
	},
	filterCheckbox: {
		padding: '0px !important',
		'& .MuiSvgIcon-root': {
			fontSize: { xs: 20, sm: 22, md: 23 }
		}
	},
	filterSubmitButton: {
		fontSize: { xs: '11px', sm: '12px', md: '14px' },
		fontWeight: 500,
		lineHeight: '1.2',
		color: 'rgba(255, 255, 255, 1)',
		px: { xs: '10px', sm: '12px', md: '16px' },
		py: { xs: '6px', sm: '8px', md: '10px' },
		borderRadius: { xs: '4px important ', md: '6px !important' },
		background: 'rgba(30, 58, 95, 1)',
		letterSpacing: '0',
		textTransform: 'none',
		minWidth: { xs: '80px', sm: 'auto' },
		'&:hover': {
			background: 'rgba(32, 68, 100, 0.9)'
		}
	},
	skipButton: {
		fontSize: { xs: '10px', sm: '12px', md: '14px' },
		fontWeight: 500,
		lineHeight: '1.2',
		color: 'rgba(30, 58, 95, 1)',
		px: { xs: '6px', sm: '12px', md: '15px' },
		py: { xs: '4px', sm: '8px', md: '9px' },
		borderRadius: { xs: '4px', md: '6px' },
		textTransform: 'none',
		minWidth: { xs: '80px', sm: 'auto' }
	},
	filterSubmitButtonSpan: {
		fontSize: { xs: '7px', sm: '8px', md: '10px' },
		fontWeight: 500,
		lineHeight: '1.2',
		letterSpacing: '0',
		paddingLeft: { xs: '2px', md: '3px' },
		color: 'rgba(255, 255, 255, 1)'
	},
	payNameTableCell: {
		width: { xs: '120px', sm: '140px', md: '150px' },
		maxWidth: { xs: '120px', sm: '140px', md: '150px' },
		minWidth: { xs: '120px', sm: '140px', md: '150px' }
	},
	payeeDropdown: {
		width: '100%',
		maxWidth: { xs: 120, sm: 140, md: 150 },
		minWidth: { xs: 120, sm: 140, md: 150 },
		'& .MuiInputBase-root': {
			padding: '0px 0px',
			fontSize: { xs: '10px', sm: '11px', md: '12px' }
		},
		'& .MuiSelect-select': {
			padding: '0px 0px',
			border: 'none',
			fontSize: { xs: '10px', sm: '11px', md: '12px' }
		},
		'& .MuiSvgIcon-root': {
			color: '#000000DE',
			fontSize: { xs: '16px', sm: '18px', md: '20px' }
		},
		'& .MuiOutlinedInput-notchedOutline': {
			border: 'none'
		},
		'&:hover .MuiOutlinedInput-notchedOutline': {
			border: 'none'
		}
	},
	skippedRowsHeaderBox: {
		flexDirection: 'row',
		mb: { xs: '14px', md: '16px' },
		minHeight: '36px',
		display: 'flex',
		alignItems: 'center'
	},
	// Table styles
	tableContainer: {
		border: '1px solid #E5E7EB',
		borderRadius: { xs: '6px', md: '8px' },
		mb: { xs: '16px', md: '24px' },
		maxHeight: 'unset', // ⛔️ remove height limitation

		'& .MuiTable-root': {
			minWidth: { xs: '600px', md: 'auto' }
		},

		'& .MuiTableCell-root': {
			borderBottom: '1px solid #F3F4F6',
			padding: { xs: '2px 4px', sm: '8px 12px', md: '8px 16px' },
			fontSize: { xs: '10px', sm: '11px', md: '12px' },
			whiteSpace: 'nowrap'
		},
		'& thead': {
			'& .MuiTableRow-root': {
				backgroundColor: 'rgba(249, 250, 251, 1)'
			},
			'& .MuiTableCell-root': {
				backgroundColor: 'rgba(249, 250, 251, 1)',
				fontWeight: 700,
				fontSize: { xs: '11px', sm: '12px', md: '14px' },
				color: '#374151',
				borderBottom: '1px solid #E5E7EB',
				padding: { xs: '6px 4px', sm: '10px 12px', md: '12px 16px' },
				lineHeight: '1.2',
				position: 'sticky',
				top: 0,
				zIndex: 1,
				'&:first-of-type': {
					borderTopLeftRadius: { xs: '6px', md: '8px' }
				},
				'&:last-of-type': {
					borderTopRightRadius: { xs: '6px', md: '8px' }
				}
			}
		},
		'& .MuiTableBody': {
			backgroundColor: '#FFFFFF',
			'& .MuiTableRow-root': {
				backgroundColor: '#FFFFFF',
				'&:hover': {
					backgroundColor: '#F9FAFB'
				}
			},
			'& .MuiTableCell-root': {
				fontSize: { xs: '10px', sm: '11px', md: '12px' },
				backgroundColor: '#FFFFFF',
				padding: { xs: '4px 8px', sm: '6px 12px', md: '8px 16px' }
			}
		}
	},
	tableCell: {
		fontSize: { xs: '10px', sm: '11px', md: '12px' },
		padding: { xs: '4px 8px', sm: '6px 12px', md: '0px 16px' }
	},
	editableCell: {
		cursor: 'pointer'
	},
	tableCheckbox: {
		'& .MuiSvgIcon-root': {
			fontSize: { xs: 16, sm: 18, md: 19 }
		}
	},
	nonEditableCell: {
		cursor: 'default'
	},
	cellContent: {
		display: 'flex',
		alignItems: 'center'
	},
	inputField: {
		border: '1px solid #ccc',
		borderRadius: { xs: '3px', md: '4px' },
		padding: { xs: '2px 4px', md: '4px 6px' },
		fontSize: { xs: '10px', sm: '11px', md: '12px' }
	},
	amountInput: {
		width: { xs: 60, sm: 70, md: 80 }
	},
	memoInput: {
		width: { xs: 80, sm: 100, md: 120 }
	},
	invoiceInput: {
		width: { xs: 50, sm: 55, md: 60 }
	},
	invalidText: {
		color: 'red',
		fontSize: { xs: '10px', sm: '11px', md: '12px' }
	},
	infoIcon: {
		color: 'red',

		fontSize: { xs: 12, sm: 13, md: 14 },
		cursor: 'pointer'
	},
	payeeText: {
		fontSize: { xs: '10px', sm: '11px', md: '12px' },
		fontWeight: 500
	},
	dropdownArrow: {
		fontSize: { xs: 14, sm: 16, md: 18 },
		ml: 0.5
	},
	actionsCell: {
		display: 'flex',
		alignItems: 'center',
		gap: { xs: 1, sm: 2, md: 3 },
		fontSize: { xs: '10px', sm: '11px', md: '12px' }
	},
	tooltip: {
		backgroundColor: '#333',
		color: '#fff',
		fontSize: { xs: '10px', sm: '11px', md: '12px' },
		padding: { xs: '6px 8px', md: '8px 12px' },
		borderRadius: { xs: 3, md: 4 }
	},
	addPayeeModalContainer: {
		p: { xs: 2, sm: 2.5, md: 3 }
	},
	addPayeeModalHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		mb: { xs: 2, md: 3 }
	},
	addPayeeModalTitle: {
		fontWeight: 700,
		fontSize: { xs: '18px', sm: '22px', md: '28px' }
	},
	addPayeeModalLabel: {
		fontWeight: 600,
		fontSize: { xs: '14px', sm: '16px', md: '18px' },
		mb: 1
	},
	addPayeeModalInput: {
		width: '100%',
		fontSize: { xs: '12px', sm: '13px', md: '14px' },
		border: '1px solid #E5E7EB',
		borderRadius: { xs: '4px', md: '6px' },
		padding: { xs: '6px 10px', md: '8px 12px' },
		marginBottom: { xs: '20px', sm: '24px', md: '32px' },
		outline: 'none'
	},
	addPayeeModalActions: {
		display: 'flex',
		justifyContent: 'flex-end',
		gap: { xs: 1.2, md: 2 },
		flexDirection: { xs: 'row' }
	},
	addPayeeModalCancelBtn: {
		minWidth: { xs: '80px', md: '100px' },
		height: { xs: '30px', sm: '32px', md: '40px' },
		borderRadius: { xs: '6px', md: '8px' },
		fontWeight: 500,
		fontSize: { xs: '12px', sm: '12px', md: '14px' },
		color: 'rgba(30, 58, 95, 1)',
		background: '#fff',
		border: '1px solid rgba(245, 245, 245, 1)',
		textTransform: 'none'
	},
	addPayeeModalSaveBtn: {
		minWidth: { xs: '80px', md: '100px' },
		height: { xs: '30px', sm: '32px', md: '40px' },
		borderRadius: { xs: '6px', md: '8px' },
		fontWeight: 500,
		fontSize: { xs: '12px', sm: '12px', md: '14px' },
		background: '#1e3a5f',
		textTransform: 'none'
	},
	// Dual value cell styles for original/editable values
	dualValueCell: {
		display: 'flex',
		flexDirection: 'column',
		gap: { xs: '2px', md: '4px' },
		p: { xs: '0px 6px', md: '0px 8px' }
	},
	originalValue: {
		fontSize: { xs: '8px', sm: '9px', md: '10px' },
		fontWeight: 400,
		lineHeight: 1.2,
		color: 'rgba(0, 0, 0, 0.6)'
	},
	editedValue: {
		fontSize: { xs: '10px', sm: '11px', md: '12px' },
		fontWeight: 400,
		lineHeight: 1.8,
		color: 'rgba(0, 0, 0, 0.87)',
		textOverflow: 'ellipsis',
		maxWidth: '150px',
		overflow: 'hidden'
	},
	editableValueContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: { xs: '2px', md: '4px' },
		padding: '0'
	},
	editableInput: {
		border: '1px solid #D1D5DB',
		borderRadius: { xs: '3px', md: '4px' },
		padding: { xs: '0px 6px', md: '0px 8px' },
		fontSize: { xs: '10px', sm: '11px', md: '12px' },
		fontWeight: '700',
		color: 'rgba(30, 58, 95, 1)',
		outline: 'none',
		height: { xs: '22px' },
		backgroundColor: '#FFFFFF',
		'&:focus': {
			borderColor: '#3B82F6',
			boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.1)'
		}
	},
	editableInputAmount: {
		width: { xs: '55px', sm: '100%' }
	},
	editableInputPayee: {
		width: { xs: '100px', sm: '110px', md: '120px' }
	},
	editableInputMemo: {
		width: { xs: '80px', sm: '90px', md: '120px' }
	},
	editableInputInvoice: {
		width: { xs: '65px', sm: '70px', md: '80px' }
	},
	editableInputCheckNo: {
		width: { xs: '50px', sm: '55px', md: '60px' }
	},
	editableSelect: {
		minWidth: { xs: '100px', sm: '110px', md: '120px' },
		fontSize: { xs: '10px', sm: '11px', md: '12px' },
		'& .MuiOutlinedInput-root': {
			height: { xs: '20px', sm: '22px', md: '22px' },
			fontSize: { xs: '10px', sm: '10px', md: '10px' }
		},
		'& .MuiSelect-select': {
			padding: { xs: '3px 6px', md: '4px 8px' },
			fontSize: { xs: '10px', sm: '11px', md: '12px' },
			fontWeight: 400,
			color: '#1F2937'
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: '#D1D5DB',
			borderRadius: { xs: '3px', md: '4px' }
		},
		'&:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: '#9CA3AF'
		},
		'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#3B82F6'
		}
	},
	payeeSelect: {
		minWidth: { xs: '80px', sm: '160px', md: '150px' },
		height: { xs: '21px', sm: '20px', md: '20px' },
		backgroundColor: '#fff',
		border: 'none',
		'& .MuiInputBase-input': {
			borderRadius: 1,
			position: 'relative',
			backgroundColor: '#fff',
			border: '1px solid #ced4da',
			fontSize: '12px',
			padding: '0px 6px',
			height: { xs: '21px', sm: '20px', md: '20px' }
		},
		'& fieldset': {
			border: 'none'
		},

		'& .MuiSelect-select': {
			// padding: { xs: '3px 12px', sm: '4px 14px', md: '4px 16px' },
			fontSize: { xs: '10px', sm: '12px', md: '14px' },
			lineHeight: { xs: '14px', sm: '16px', md: '20px' },
			color: '#000000DE'
			// borderBottom: '1px solid #e2e8f0'
		},
		'& .MuiTypography-body1': {
			padding: { xs: '0px 6px', md: '2px 8px' }
		},
		'& .MuiSvgIcon-root': {
			color: '#000000DE',
			fontSize: { xs: '16px', sm: '18px', md: '20px' }
		},
		'& .MuiOutlinedInput-notchedOutline': {
			border: 'none'
		},
		'&:hover .MuiOutlinedInput-notchedOutline': {
			border: 'none'
		}
	},
	addNewMenuItem: {
		color: 'rgba(30, 58, 95, 1)',
		fontWeight: 500,
		fontSize: { xs: '10px', sm: '11px', md: '12px' },
		borderTop: '1px solid #eee',
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		pb: '0px'
	},
	addNewMenuItemPlusIcon: {
		fontSize: { xs: 14, sm: 15, md: 16 },
		fontWeight: 400,
		lineHeight: 1,
		marginRight: 0
	},
	// Mobile-specific section headers
	sectionHeader: {
		fontSize: { xs: '14px', sm: '16px', md: '18px' },
		fontWeight: 600,
		color: 'rgba(0, 0, 0, 0.87)',
		mb: { xs: '8px', md: '12px' }
	},
	// Mobile dialog styles
	dialogTitle: {
		fontSize: {
			xs: '24px',
			sm: '30px'
		},
		lineHeight: '1.1',
		p: 0,
		m: 0,
		fontWeight: '600',
		marginBottom: { xs: '0px', md: '16px' }
	},
	dynamicTitle: {
		maxWidth: { xs: '140px', sm: 'inherit', md: 'inherit' },
		textOverflow: 'ellipsis',
		overflow: 'hidden',
		mb: '0px !important'
	},
	dialogPaper: {
		margin: { xs: '16px', sm: '32px' },
		maxHeight: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 34px)' },
		width: { xs: 'calc(100% - 32px)', sm: 'auto' }
	},
	dialogContent: {
		padding: { xs: ' 16px', sm: '20px', md: '0px 24px' }
	},
	dialogActions: {
		padding: { xs: '16px', sm: '20px', md: '24px' },
		paddingTop: { xs: '12px', sm: '14px', md: '16px' },
		paddingBottom: { xs: '12px', sm: '14px', md: '16px' },
		gap: { xs: '8px', md: '12px' },
		flexDirection: { xs: 'column', sm: 'row' }
	},
	dialogActionButton: {
		fontSize: { xs: '12px', sm: '13px', md: '14px' },
		padding: { xs: '8px 16px', md: '10px 20px' },
		minWidth: { xs: '100%', sm: '100px' },
		height: { xs: '36px', md: '40px' }
	}
}
