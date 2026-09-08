export const styles = {
	container: {
		borderRadius: '12px',
		border: '1px solid',
		borderColor: 'divider',
		backgroundColor: '#ffffff',
		padding: {
			xs: '16px',
			md: '20px',
			lg: '24px',
		},
		width: '100%',
		boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		mb: 2,
	},
	title: {
		fontSize: {
			xs: '16px',
			lg: '18px',
		},
		fontWeight: 600,
		lineHeight: '1.25',
		color: '#1a1a2e',
	},
	viewAll: {
		cursor: 'pointer',
		'& p': {
			fontSize: '13px',
			color: '#1e3a5f',
			fontWeight: '600',
			display: 'flex',
			alignItems: 'center',
			gap: '4px',
			'&:hover': {
				color: '#152d4a',
			},
		},
	},
	tableContainer: {
		width: '100%',
	},
}
