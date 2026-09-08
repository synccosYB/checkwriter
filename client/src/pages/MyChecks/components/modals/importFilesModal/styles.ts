export const styles = {
	dragDropTitle: {
		mb: 1,
		color: 'rgba(0, 0, 0, 0.87)',
		fontWeight: 600,
		fontSize: { xs: '16px', sm: '18px' }
	},
	dragDropSubtitle: {
		color: 'rgba(0, 0, 0, 0.8)',
		mb: 2,
		fontSize: { xs: '14px', sm: '16px' }
	},
	dragDropDot: {
		fontSize: { xs: '20px', sm: '26px' },
		display: 'inline-block',
		verticalAlign: 'middle',
		lineHeight: '1'
	},
	dragDropInfoText: {
		color: '#00000099',
		mb: '12px',
		fontSize: { xs: '14px', sm: '16px' }
	},
	// ProgressBar styles
	progressBarContainer: {
		display: 'flex',
		alignItems: 'center'
	},
	progressBar: {
		position: 'relative',
		width: { xs: 80, sm: 100 },
		height: { xs: 12, sm: 16 },
		borderRadius: 32,
		overflow: 'hidden',
		display: 'flex',
		bgcolor: '#E0E0E0'
	},
	progressBarText: {
		position: 'absolute',
		left: { xs: 6, sm: 10 },
		top: '50%',
		transform: 'translateY(-50%)',
		color: '#fff',
		fontWeight: 600,
		fontSize: { xs: '7px', sm: '8px' }
	},
	// Status chip styles
	statusChip: (
		color: string,
		border: string,
		textColor: string,
		disabled: boolean
	) => ({
		display: 'inline-block',
		px: { xs: 1.5, sm: 2 },
		py: 0.5,
		borderRadius: '5px',
		border,
		color: textColor,
		fontWeight: 400,
		fontSize: { xs: '10px', sm: '12px' },
		opacity: disabled ? 0.7 : 1,
		pointerEvents: 'none',
		textAlign: 'center',
		minWidth: { xs: 70, sm: 90 },
		background: 'transparent'
	}),
	// File name cell styles
	fileNameCell: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: { xs: 0.5, sm: 1 }
	},
	fileNameText: {
		whiteSpace: 'nowrap',
		fontSize: { xs: '11px', sm: '12px' }
	},
	// Date cell styles
	dateCell: {
		width: '100%',
		textAlign: 'center',
		fontSize: { xs: '11px', sm: '12px' }
	},
	// Action cell styles
	actionCell: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: { xs: 0.5, sm: 1 }
	},
	actionButton: {
		borderColor: '#1e3a5f',
		color: '#1e3a5f',
		fontWeight: 400,
		borderRadius: '5px !important',
		fontSize: { xs: '10px', sm: '11px' },
		minWidth: { xs: '75px', sm: '85px' },
		height: { xs: '24px', sm: '27px' },
		padding: { xs: '0 8px', sm: '0 10px' },
		textTransform: 'none'
	},
	alertModalIcon: {
		width: 60,
		height: 60,
		color: '#fff',
		display: 'block',
		margin: '0 auto'
	},
	actionMenuPaper: {
		'& .MuiPaper-root': {
			minWidth: { xs: '130px', sm: '150px' },
			borderRadius: '8px',
			border: '1px solid #F5F5F5',
			boxShadow: '0px 4px 10px 0px #0000001A'
		}
	},
	// Upload box styles
	uploadBox: {
		border: '2px dashed #1e3a5f',
		borderRadius: '8px',
		backgroundColor: '#F9FAFB',
		padding: { xs: '24px', sm: '32px' },
		textAlign: 'center',
		cursor: 'pointer',
		transition: 'all 0.2s ease-in-out'
	},
	uploadContent: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: { xs: 1.5, sm: 2 }
	},
	dragging: {
		borderColor: '#3EA5F9',
		backgroundColor: '#F0F9FF'
	},
	uploadIcon: {
		fontSize: { xs: 36, sm: 48 },
		color: '#1e3a5f'
	},
	uploadText: {
		fontSize: { xs: '16px', sm: '18px' },
		fontWeight: 600,
		color: 'rgba(0, 0, 0, 0.87)'
	},
	uploadSubtext: {
		fontSize: { xs: '14px', sm: '16px' },
		color: 'rgba(0, 0, 0, 0.8)'
	},
	uploadButton: {
		borderColor: '#1e3a5f',
		color: '#1e3a5f',
		fontSize: { xs: '12px', sm: '14px' },
		padding: { xs: '6px 16px', sm: '8px 20px' },
		'&:hover': {
			borderColor: '#1e3a5f',
			backgroundColor: 'rgba(30, 58, 95, 0.04)'
		}
	},
	uploadHint: {
		fontSize: { xs: '12px', sm: '14px' },
		color: 'rgba(0, 0, 0, 0.6)'
	},
	// Status styles
	statusCell: {
		display: 'flex',
		alignItems: 'center',
		gap: 1
	},
	statusDot: (status: string) => ({
		width: { xs: 6, sm: 8 },
		height: { xs: 6, sm: 8 },
		borderRadius: '50%',
		backgroundColor:
			status === 'Completed'
				? '#058205'
				: status === 'Canceled'
				? '#F03D3E'
				: '#BDBDBD'
	}),
	statusText: {
		fontSize: { xs: '11px', sm: '12px' },
		color: 'rgba(0, 0, 0, 0.87)'
	},
	attachmentDragDrop: {
		borderRadius: '8px',
		padding: { xs: '16px', sm: '24px' },
		minHeight: { xs: '160px', sm: '200px' },
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		transition: 'all 0.2s ease',
		marginBottom: { xs: '16px', sm: '24px' },
		cursor: 'pointer'
	},
	importFilesTabs: {
		pb: 2,
		'& .MuiTabs-indicator': {
			backgroundColor: '#1e3a5f',
			height: '1px'
		},
		'& .MuiTabs-flexContainer': {
			gap: { xs: '8px', sm: '16px' },
			borderBottom: '1px solid #e2e8f0'
		},
		'& .MuiTab-root': {
			textTransform: 'none',
			fontSize: { xs: '12px', sm: '14px' },
			color: '#6B7280',
			fontWeight: 500,
			lineHeight: '1',
			minWidth: { xs: 'auto', sm: '120px' },
			padding: { xs: '8px 12px', sm: '12px 16px' }
		}
	},
	// Mobile Card Layout Styles
	mobileCardContainer: {
		display: { xs: 'block', md: 'none' }
	},
	desktopTableContainer: {
		display: { xs: 'none', md: 'block' }
	},
	fileCard: {
		border: '1px solid #E0E0E0',
		borderRadius: '8px',
		padding: '16px',
		marginBottom: '12px',
		backgroundColor: '#fff'
	},
	fileCardHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: '12px'
	},
	fileCardTitle: {
		display: 'flex',
		alignItems: 'center',
		gap: 1,
		flex: 1
	},
	fileCardActions: {
		display: 'flex',
		alignItems: 'center',
		gap: 0.5
	},
	fileCardBody: {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px'
	},
	fileCardRow: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	fileCardLabel: {
		fontSize: '12px',
		color: '#666',
		fontWeight: 500
	},
	fileCardValue: {
		fontSize: '12px',
		color: '#333'
	},
	progressContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: 1
	},
	mobileActionButton: {
		borderColor: '#1e3a5f',
		color: '#1e3a5f',
		fontWeight: 400,
		borderRadius: '5px',
		fontSize: '10px',
		minWidth: '70px',
		height: '24px',
		padding: '0 8px',
		textTransform: 'none'
	},
	mobileMoreButton: {
		padding: '4px',
		minWidth: 'auto',
		'& .MuiSvgIcon-root': {
			fontSize: '18px'
		}
	}
}
