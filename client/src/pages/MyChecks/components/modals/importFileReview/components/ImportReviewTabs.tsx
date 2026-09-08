import React from 'react'
import { Typography } from '@mui/material'
import Tabs from '../../../../../../components/shared/tabs'
import { ICheckImportRow } from '../../../../../../API/checkImports/useImportRows'
import { GridColDef } from '@mui/x-data-grid'
import ValidInvalidRowsTable from './ValidInvalidRowsTable'
import SubmittedRowsTable from './SubmittedRowsTable'
import SkippedRowsTable from './SkippedRowsTable'
import { ICheckImport } from '../../../../../../API/checkImports/useCheckImports'
import { styles } from './styles'

interface ImportReviewTabsProps {
	// Row data
	validRows: ICheckImportRow[]
	invalidRows: ICheckImportRow[]
	submittedRows: ICheckImportRow[]
	skippedRows: ICheckImportRow[]
	allRows: ICheckImportRow[]

	// Selection state
	selectedValid: number[]
	selectedSkipped: number[]

	// Filter state
	showValidRowsOnly: boolean
	showInvalidRowsOnly: boolean

	// Loading states
	isSubmittingRows: boolean
	isSavingRows: boolean

	// Import status
	selectedImport: ICheckImport

	// Styles
	modalStyles: any

	// Functions
	getDataGridColumns: (status: ICheckImportRow['state']) => GridColDef[]
	onValidRowsFilter: (checked: boolean) => void
	onInvalidRowsFilter: (checked: boolean) => void
	onSkipSelected: () => void
	onRestoreSelected: () => void
	onSubmit: () => void
}

const ImportReviewTabs: React.FC<ImportReviewTabsProps> = ({
	validRows,
	invalidRows,
	submittedRows,
	skippedRows,
	allRows,
	selectedValid,
	selectedSkipped,
	showValidRowsOnly,
	showInvalidRowsOnly,
	isSubmittingRows,
	isSavingRows,
	selectedImport,
	getDataGridColumns,
	onValidRowsFilter,
	onInvalidRowsFilter,
	onSkipSelected,
	onRestoreSelected,
	onSubmit
}) => {
	const tabsData = [
		{
			title: 'Valid/Invalid',
			titleNode: (
				<Typography color="#FF6A00" sx={styles.tabsTitle}>
					<span>
						Valid <i>({validRows.length})</i>
					</span>
					/
					<span style={{ color: '#F03D3E' }}>
						Invalid <i>({invalidRows.length})</i>
					</span>
				</Typography>
			),
			component: (
				<ValidInvalidRowsTable
					validRows={validRows}
					invalidRows={invalidRows}
					allRows={allRows}
					selectedValid={selectedValid}
					showValidRowsOnly={showValidRowsOnly}
					showInvalidRowsOnly={showInvalidRowsOnly}
					isSubmittingRows={isSubmittingRows}
					isSavingRows={isSavingRows}
					getDataGridColumns={getDataGridColumns}
					onValidRowsFilter={onValidRowsFilter}
					onInvalidRowsFilter={onInvalidRowsFilter}
					onSkipSelected={onSkipSelected}
					onSubmit={onSubmit}
				/>
			)
		},
		{
			title: 'Submitted',
			titleNode: (
				<Typography color="#058205" sx={styles.tabsTitle}>
					<span>
						Submitted <i>({submittedRows.length})</i>
					</span>
				</Typography>
			),
			component: (
				<SubmittedRowsTable
					submittedRows={submittedRows}
					getDataGridColumns={getDataGridColumns}
				/>
			)
		},
		{
			title: 'Skipped',
			titleNode: (
				<Typography color="#757575" sx={styles.tabsTitle}>
					<span>
						Skipped <i>({skippedRows.length})</i>
					</span>
				</Typography>
			),
			component: (
				<SkippedRowsTable
					skippedRows={skippedRows}
					selectedSkipped={selectedSkipped}
					getDataGridColumns={getDataGridColumns}
					onRestoreSelected={onRestoreSelected}
				/>
			)
		}
	]

	// Filter out tabs that should be hidden based on import status
	const visibleTabsData = tabsData.filter((tab) => {
		// Hide Valid/Invalid tab if import is completed and there are no valid/invalid rows
		if (tab.title === 'Valid/Invalid') {
			return !(
				selectedImport?.status === 'Completed' &&
				validRows.length + invalidRows.length === 0
			)
		}
		return true
	})

	return (
		<Tabs
			tabsPanelProps={{}}
			useQueryParam={false}
			tabsData={visibleTabsData}
			tabContentHeight="463px"
		/>
	)
}

export default ImportReviewTabs
