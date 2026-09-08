import React from 'react'

function usePagination() {
	const [page, setPage] = React.useState(0)
	const [pageSize, setPageSize] = React.useState(10)

	return { page: page, setPage, pageSize, setPageSize }
}

export default usePagination
