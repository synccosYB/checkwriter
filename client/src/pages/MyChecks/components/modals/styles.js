export const styles = {
	subTitle: {
		fontSize: { xs: '14px', sm: '18px' },
		fontWeight: '500',
		lineHeight: '100%',
		marginBottom: { xs: '20px', sm: '24px' }
	},
	addEditBlankContainer: {
		borderRadius: '12px',
		border: '1px solid #e2e8f0',
		padding: { xs: '12px', sm: '20px' },
		display: 'flex',
		flexDirection: 'column'
	},
	checkTitle: {
		fontSize: '20px',
		color: '#000000DE',
		fontWeight: '600'
	},
	checkSubTitle: {
		fontSize: '16px',
		color: '#00000099',
		fontWeight: '500'
	},

	radioGroup: {
		display: 'flex',
		gap: '12px',
		ml: '-10px'
	},

	radioItem: {
		display: 'flex',
		alignItems: 'center'
	},

	radioLabel: {
		fontSize: '16px',
		color: '#00000099',
		fontWeight: '600'
	},
	bankCheckNumberFieldContainer: {
		display: 'flex',
		flexDirection: { xs: 'column', sm: 'row' },
		gap: { xs: '0px', sm: '20px' },
		mb: '24px'
	},
	balankItemLabel: {
		fontSize: '18px',
		color: '#000000DE',
		fontWeight: '600',
		mb: '12px'
	},
	select: {
		width: '300px',
		height: '40px',
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
		marginTop: '4px'
	},
	checkNumberFieldContainer: {
		width: { sm: '50%' }
	},
	input: {
		'& .MuiOutlinedInput-root': {
			height: '40px',
			backgroundColor: '#fff',

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
	actionsContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: '9px'
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
	createCheckSubTitle: {
		marginBottom: { xs: '20px', sm: '24px' },
		fontSize: { xs: '14px', sm: '18px' }
	}
}
