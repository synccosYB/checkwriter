export const styles = {
	pageContainer: {
		padding: {
			xs: '0px 16px',
			md: '0px 16px',
			lg: '0px 0px',
			xl: '0px 16px',
		},
	},
	pageHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: { md: 'space-between', xs: 'space-between' },
		marginBottom: '24px',
		paddingBottom: '16px',
		borderBottom: '1px solid #e2e8f0',
		marginTop: { xs: '24px', md: '20px', lg: '10px' },
		gap: { xs: '8px', md: '16px' },
	},
	title: {
		fontSize: '20px',
		lineHeight: '1',
		fontFamily: 'Inter',
		fontWeight: 600,
		mb: '0px',
		color: '#1a1a2e',
	},
	graphsContainer: {
		margin: '0 !important',
		marginTop: { xs: '24px !important', md: '16px !important', lg: '32px !important' },
		gap: '24px',
		flexWrap: { xs: 'wrap', md: 'nowrap' },
		width: '100% !important',
	},
	grraphItem: {
		display: 'flex',
		justifyContent: 'center',
		padding: '0 !important',
	},
}
