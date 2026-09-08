import React from 'react'
import { TablePagination } from '@material-ui/core'

const Pagination = ({ totalCount, limit, page, changeLimit, changeOffset }) => {
	return (
		<TablePagination
			className="generic-table-pagination"
			rowsPerPageOptions={[10]}
			component="div"
			count={totalCount}
			rowsPerPage={limit}
			page={page}
			onChangePage={changeOffset}
			onChangeRowsPerPage={changeLimit}
		/>
	)
}

export default Pagination
