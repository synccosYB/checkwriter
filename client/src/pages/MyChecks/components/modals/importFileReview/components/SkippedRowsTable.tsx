import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import { ICheckImportRow } from '../../../../../../API/checkImports/useImportRows'
import CustomDataGrid from '../CustomDataGrid'
import { GridColDef } from '@mui/x-data-grid'
import { styles as modalStyles } from '../styles'
import { styles } from './styles'

interface SkippedRowsTableProps {
	skippedRows: ICheckImportRow[]
	selectedSkipped: number[]
	getDataGridColumns: (status: ICheckImportRow['state']) => GridColDef[]
	onRestoreSelected: () => void
}

const SkippedRowsTable: React.FC<SkippedRowsTableProps> = ({
	skippedRows,
	selectedSkipped,
	getDataGridColumns,
	onRestoreSelected
}) => {
	if (!skippedRows.length) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Typography color="text.secondary">
					No skipped rows to display
				</Typography>
			</Box>
		)
	}

	return (
		<Box>
			<Box sx={modalStyles.skippedRowsHeaderBox}>
				<Typography sx={modalStyles.validTitle}>Skipped Rows</Typography>
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0 }}>
					{selectedSkipped.length > 0 && (
						<Button
							variant="outlined"
							color="primary"
							onClick={onRestoreSelected}
							sx={modalStyles.skipButton}
							startIcon={<FileDownloadOutlinedIcon />}
						>
							Restore Rows
						</Button>
					)}
				</Box>
			</Box>

			<CustomDataGrid
				editMode="cell"
				density="comfortable"
				rows={skippedRows}
				columns={getDataGridColumns('skipped')}
				getRowId={(i) => i._id}
				pageSizeOptions={[50, 100]}
				isRowSelectable={() => true}
				sx={styles.datagridWrapper}
			/>
		</Box>
	)
}

export default SkippedRowsTable
