export const styles = {
	tabsTitle: {
		fontSize: { xs: '12px', sm: '15px' },
		padding: '0',
		display: 'flex',
		flex: { xs: '1', sm: '0 0 auto' },
		gap: 1,
		'& span': {
			display: 'flex',
			flexDirection: { xs: 'column', sm: 'row' },
			alignItems: 'center',
			gap: { xs: 0, sm: 0.5 },
			width: '100%'
		},
		'& i': {
			fontStyle: 'normal',
			fontSize: { xs: '8px', sm: '10px' }
		}
	},
	modalWrapper: {
		'& .MuiDialog-paper': {
			width: '550px',
			borderRadius: '12px',
			zIndex: 1400
		}
	},
	modalTitle: {
		fontSize: {
			xs: '20px',
			sm: '24px'
		},
		lineHeight: '1.1',
		p: 0,
		m: 0,
		fontWeight: '600',
		marginBottom: { xs: '10px', md: '12px' },
		textAlign: 'center'
	},
	dialogContent: {
		px: { xs: 2, sm: 4 },
		fontWeight: '400',
		fontSize: {
			xs: '12px',
			sm: '14px'
		},
		lineHeight: {
			xs: '1.2',
			sm: '1.4'
		},
		textAlign: 'center',
		color: 'rgba(0, 0, 0, 0.6)'
	},
	datagridWrapper: {
		marginTop: '0px',
		// Table header
		'& .MuiDataGrid-columnHeaders': {
			maxHeight: '40px !important',
			minHeight: '40px !important',
			backgroundColor: 'rgba(249, 250, 251, 1)'
		},
		'& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeadersInner': {
			lineHeight: '1 !important'
		},
		'& .customHeaderCell': {
			height: 'auto !important'
		},
		'& .MuiDataGrid-columnHeaderTitle': {
			fontSize: '12px',
			fontWeight: '600',
			lineHeight: '1 !important'
		},
		// Table body
		'& .MuiDataGrid-row': {
			minHeight: '50px !important',
			maxHeight: '50px !important',
			backgroundColor: '#fff'
		},
		'& .MuiDataGrid-cell': {
			minHeight: '50px !important',
			maxHeight: '50px !important',
			fontSize: '12px',
			fontWeight: '400',
			lineHeight: '1 !important'
		},
		// Paggination of table
		'& .MuiDataGrid-footerContainer': {
			backgroundColor: 'rgba(249, 250, 251, 1)',
			minHeight: '38px !important',
			maxHeight: '38px !important',
			borderBottomLeftRadius: '8px',
			borderBottomRightRadius: '8px'
		},
		'& .MuiDataGrid-footerContainer .MuiTablePagination-toolbar': {
			minHeight: '38px !important',
			maxHeight: '38px !important'
		},
		'& .MuiDataGrid-footerContainer .MuiTablePagination-toolbar p': {
			margin: '0 !important'
		},
		'& .MuiDataGrid-footerContainer .MuiTablePagination-input': {
			border: '1px solid rgb(227, 225, 225)',
			borderRadius: '4px',
			fontSize: '12px'
		},
		'& .MuiDataGrid-footerContainer .MuiTablePagination-displayedRows': {
			fontWeight: '700',
			fontSize: '12px'
		},
		'& .MuiDataGrid-footerContainer .MuiTablePagination-selectLabel': {
			fontWeight: '600',
			fontSize: '12px'
		}
	}
}
