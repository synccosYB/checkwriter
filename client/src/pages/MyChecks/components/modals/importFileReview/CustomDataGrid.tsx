import * as React from 'react'
import { DataGrid, DataGridProps } from '@mui/x-data-grid'
import { Box } from '@mui/material'

interface Props<T extends object> extends DataGridProps<T> {
	isEditable?: boolean
	status?: string
}

export default function CustomDataGrid<T extends object>({
	columns = [],
	status,
	rows,
	isEditable,
	...rest
}: Props<T>) {
	return (
		<Box sx={{ height: 350, width: '100%', mb: 0 }}>
			<DataGrid rows={rows} columns={columns} {...rest} />
		</Box>
	)
}
