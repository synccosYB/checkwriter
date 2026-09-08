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
	selectContainer: {
		display: 'flex',
		flexDirection: 'row-reverse',
	},
	formControl: {
		minWidth: 120,
	},
	select: {
		'& .MuiSelect-select': {
			fontSize: '13px',
			minHeight: 'auto',
			padding: '7px 14px',
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: '#e2e8f0',
		},
		'&:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: '#cbd5e1',
		},
	},
	menuItem: {
		fontSize: '13px',
		'&:hover': {
			backgroundColor: 'rgba(30, 58, 95, 0.06)',
		},
		'&.Mui-selected': {
			backgroundColor: 'rgba(30, 58, 95, 0.08)',
			'&:hover': {
				backgroundColor: 'rgba(30, 58, 95, 0.12)',
			},
		},
	},
	menuProps: {
		'MuiMenuItem-root': {
			'& .Mui-selected': {
				background: 'rgba(30, 58, 95, 0.08)',
			},
			'& .Mui-focused': {
				background: 'rgba(30, 58, 95, 0.04)',
			},
		},
	},
}
