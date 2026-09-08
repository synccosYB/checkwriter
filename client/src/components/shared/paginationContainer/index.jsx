import { Box, TablePagination } from '@mui/material'
import React from 'react'

function PaginationContainer({
	children,
	totalPageCount,
	pageSize,
	onPageChange,
	page,
	onPageSizeChange
}) {
	return (
		<Box>
			<Box>{children}</Box>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
				<TablePagination
					align="center"
					className="generic-table-pagination"
					count={totalPageCount || '10'}
					rowsPerPage={pageSize}
					onPageChange={(_, page) => onPageChange(page)}
					onRowsPerPageChange={(event) => {
						onPageSizeChange(parseInt(event.target.value, 10))
						onPageChange(0)
					}}
					page={page}
					rowsPerPageOptions={[5, 10, 15, 20, 25, 30, 35, 40, 45, 50]}
				/>
			</Box>
		</Box>
	)
}

export default PaginationContainer
