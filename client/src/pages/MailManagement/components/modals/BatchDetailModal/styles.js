export const styles = {
	content: {
		display: 'flex',
		flexDirection: 'column',
		gap: '20px'
	},
	section: {
		display: 'flex',
		flexDirection: 'column'
	},
	sectionTitle: {
		fontSize: '20px',
		lineHeight: '24px',
		fontWeight: 600,
		color: '#111827'
	},
	description: {
		fontSize: '18px',
		lineHeight: '22px',
		color: '#000000DE'
	},
	checksCount: {
		fontSize: '14px',
		lineHeight: '18px',
		fontWeight: '600'
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
		mb: '20px',
		gap: '12px'
	},
	actionButtons: {
		display: 'flex',
		gap: '12px',
		marginLeft: 'auto'
	},
	actionButton: {
		color: '#000000CE',
		border: '1px solid #0000005A',
		backgroundColor: '#0000000D',
		fontSize: '12px',
		fontWeight: '600',
		svg: {
			stroke: '#000000'
		},
		'&:hover': {
			backgroundColor: '#0000001A',
			borderColor: '#000000'
		},
		'&:disabled': {
			color: '#0000001A',
			svg: {
				color: '#0000001A',
				stroke: '#0000001A'
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
		},
		'&:disabled': {
			backgroundColor: 'gray',
			color: 'white',
			cursor: 'not-allowed'
		}
	},
	blueText: {
		color: '#1e3a5f',
		display: 'inline'
	},
	tabContainer: {
		width: '100%',
		maxWidth: '1040px',
		borderBottom: '1px solid #777777',
		mb: 3
	},
	tabs: {
		width: 'auto', // Changed from 100% to auto to not force full width
		minHeight: 'unset',
		'& .MuiTabs-indicator': {
			backgroundColor: 'transparent'
		},
		'& .MuiTabs-flexContainer': {
			gap: '24px', // Space between tabs
			justifyContent: 'flex-start' // Align tabs to the left
		},
		'& .MuiTab-root': {
			textTransform: 'none',
			fontSize: { sm: '14px', xs: '12px' },
			lineHeight: { sm: '20px', xs: '16px' },
			padding: { sm: '10px 20px', xs: '4px 8px' }, // 20px padding on sides
			minWidth: 'unset',
			minHeight: 'unset',
			borderBottom: '2px solid transparent',
			'&.tab-all': {
				color: '#777777',
				'&.Mui-selected': {
					borderBottom: '2px solid #777777'
				}
			},
			'&.tab-submitted': {
				color: '#058205',
				'&.Mui-selected': {
					borderBottom: '2px solid #058205'
				}
			},
			'&.tab-processing': {
				color: '#EF6C00',
				'&.Mui-selected': {
					borderBottom: '2px solid #EF6C00'
				}
			},
			'&.tab-mailed': {
				color: '#1e3a5f',
				'&.Mui-selected': {
					borderBottom: '2px solid #1e3a5f'
				}
			},
			'&.tab-canceled': {
				color: '#F03D3E',
				'&.Mui-selected': {
					borderBottom: '2px solid #F03D3E'
				}
			}
		}
	}
}
