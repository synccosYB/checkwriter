import React from 'react'
import { Box, Typography } from '@mui/material'
import { ICheckImportRow } from '../../../../../../API/checkImports/useImportRows'
import CustomDataGrid from '../CustomDataGrid'
import { GridColDef } from '@mui/x-data-grid'
import { styles as modalStyles } from '../styles'
import { styles } from './styles'

interface SubmittedRowsTableProps {
	submittedRows: ICheckImportRow[]
	getDataGridColumns: (status: ICheckImportRow['state']) => GridColDef[]
}

const SubmittedRowsTable: React.FC<SubmittedRowsTableProps> = ({
	submittedRows,
	getDataGridColumns
}) => {
	if (!submittedRows.length) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Typography color="text.secondary">
					No submitted rows to display
				</Typography>
			</Box>
		)
	}

	return (
		<Box>
			<Box sx={modalStyles.skippedRowsHeaderBox}>
				<Typography sx={modalStyles.validTitle}>Submitted Rows</Typography>
			</Box>
			<CustomDataGrid
				editMode="cell"
				density="comfortable"
				rows={submittedRows}
				columns={getDataGridColumns('submitted')}
				rowSelection={false}
				getRowId={(i) => i._id}
				pageSizeOptions={[50, 100]}
				sx={styles.datagridWrapper}
			/>
		</Box>
	)
}

export default SubmittedRowsTable
