export const styles = {
	wrapper: {
		width: '100%',
		maxWidth: '672px',
		mx: 'auto',
		px: '20px',
		pt: '20px',
		pb: '10px',
		bgcolor: '#F5F5F5',
		borderRadius: 3
	},
	container: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative'
	},
	padContainer: {
		width: '100%',
		height: '150px',
		position: 'relative'
	},
	uploadContainer: {
		width: '100%',
		height: '150px',
		backgroundColor: '#F5F5F5',
		cursor: 'pointer',
		position: 'absolute',
		top: 0,
		left: 0,
		zIndex: 10,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		transition: 'all 0.2s ease-in-out',
		'&:hover': {
			backgroundColor: '#F0F4F8'
		}
	},
	buttonContainer: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	buttonGroup: {
		display: 'flex'
	},
	button: {
		textTransform: 'none'
	},
	downloadButton: {
		backgroundColor: '#1e3a5f',
		textTransform: 'none',
		color: '#fff',
		position: 'absolute',
		top: 0,
		right: 0,
		height: '30px',
		fontSize: '12px',
		display: 'flex',
		gap: 1,
		'&:disabled': {
			backgroundColor: '#1e3a5f99',
			color: '#fff'
		},
		textTransform: 'none',
		'&:hover': {
			backgroundColor: '#1a3850'
		}
	},
	tabContainer: {
		display: 'flex',
		gap: 1,
		mb: 2
	},
	tabButton: {
		fontSize: '12px',
		width: '78px',
		height: '28px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		cursor: 'pointer',
		border: '1px solid #1e3a5f',
		borderRadius: '8px !important',
		color: '#1e3a5f',
		textTransform: 'none'
	},
	tooltip: {
		bgcolor: '#181D27',
		fontSize: '12px',
		lineHeight: '16px',
		px: '12px',
		py: '8px',
		borderRadius: '8px',
		'& .MuiTooltip-arrow': {
			color: '#181D27'
		}
	},
	modalContainer: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		bgcolor: 'background.paper',
		boxShadow: 24,
		px: 3,
		pt: 3,
		pb: 2,
		borderRadius: 2,
		width: '90%',
		maxWidth: '600px'
	},
	canvasContainer: {
		position: 'relative'
	},
	canvas: {
		width: '100%',
		height: '150px',
		backgroundColor: '#F5F5F5',
		borderRadius: '8px',
		cursor: 'crosshair'
	},
	undoButton: {
		position: 'absolute',
		top: 8,
		right: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		'&:hover': {
			backgroundColor: 'rgba(255, 255, 255, 0.9)'
		}
	},
	modalActions: {
		mt: 2,
		display: 'flex',
		justifyContent: 'flex-end',
		gap: 2
	}
}
