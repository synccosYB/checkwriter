export const styles = {
	card: {
		minWidth: '150px',
		width: '100%',
		height: { xs: '100px', lg: '130px' },
		borderRadius: '12px',
		padding: { xs: '16px', md: '18px', lg: '24px 20px' },
		transition: 'transform 0.2s ease, box-shadow 0.2s ease',
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
		},
	},
	cardHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	title: {
		marginBottom: 0,
		fontSize: '12px',
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: '0.05em',
		opacity: 0.85,
	},
	iconButton: {
		marginTop: '-5px',
		opacity: 0.7,
		'&:hover': {
			opacity: 1,
		},
	},
	icon: {
		fontSize: '18px',
	},
	value: {
		fontWeight: '700',
		fontSize: { xs: '28px', md: '32px', lg: '40px' },
		lineHeight: 1.2,
		mt: '4px',
	},
}
