import { GridRowId } from '@mui/x-data-grid'
import { GridApiCommunity } from '@mui/x-data-grid/internals'
import { ICheckImportRow } from '../../../../../API/checkImports/useImportRows'
import { Typography } from '@mui/material'

export const getCurrentRowIndex = ({
	api,
	id
}: {
	api: GridApiCommunity
	id: GridRowId
}) =>
	api.getRowIndexRelativeToVisibleRows(id) +
	api.state.pagination.paginationModel.page *
		api.state.pagination.paginationModel.pageSize

export const getErrorState = ({
	row,
	key
}: {
	key: 'payeeId' | 'checkNumber' | 'amount'
	row: ICheckImportRow
}) => {
	const isError = !!row.validationErrors[key]?.length
	const errorMessage = isError ? row?.validationErrors[key][0] : ''

	return { isError, errorMessage }
}

export const renderOriginalValue = ({
	value,
	modalStyles,
	status,
	textAlign
}: {
	value: any
	modalStyles: Record<string, any>
	status: ICheckImportRow['state']
	textAlign?: string
}) =>
	(status === 'valid' || status === 'invalid') && (
		<Typography sx={{ ...modalStyles.originalValue, textAlign: textAlign }}>
			{value}
		</Typography>
	)

export function getDuplicateCheckNumbersMap(rows: ICheckImportRow[]) {
	const numberMap = new Map<number, ICheckImportRow[]>()

	for (const row of rows) {
		const number = row.finalCheckNumber
		if (!number) continue

		const existing = numberMap.get(number) || []
		numberMap.set(number, [...existing, row])
	}

	const duplicates = new Set<number>()
	Array.from(numberMap.entries()).forEach(([number, groupedRows]) => {
		if (groupedRows.length > 1) {
			duplicates.add(number)
		}
	})

	return duplicates
}
