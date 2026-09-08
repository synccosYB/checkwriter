import React from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Checkbox
} from '@mui/material'
import {
	CheckBoxCheckedIcon,
	CheckBoxUncheckedIcon
} from '../../../../../components/Icons'

interface Column {
	id: string
	label: string
	width?: string
	align?: 'right' | 'left' | 'center'
}

interface SimpleImportTableProps<T = any> {
	columns: Column[]
	data: T[]
	selectedRows?: number[]
	handleSelectRow?: (idx: number) => void
	handleSelectAllRows?: (checked: boolean) => void
	renderCell?: (row: T, column: Column, rowIndex: number) => React.ReactNode
	renderHeaderCell?: (column: Column) => React.ReactNode
	onClickRow?: (row: T, rowIndex: number) => void
	modalStyles: { [key: string]: any }
	showSelection?: boolean
}

const SimpleImportTable: React.FC<SimpleImportTableProps<any>> = ({
	columns,
	data,
	selectedRows = [],
	handleSelectRow,
	handleSelectAllRows,
	renderCell,
	renderHeaderCell,
	onClickRow,
	modalStyles,
	showSelection = true
}) => {
	// Helper for select all checkbox
	const allSelected = data.length > 0 && selectedRows.length === data.length
	const someSelected =
		selectedRows.length > 0 && selectedRows.length < data.length

	return (
		<TableContainer sx={modalStyles.tableContainer}>
			<Table stickyHeader aria-label="sticky table">
				<TableHead>
					<TableRow>
						{/* Selection checkbox */}
						{showSelection && handleSelectRow && handleSelectAllRows ? (
							<TableCell padding="checkbox">
								<Checkbox
									checked={allSelected}
									indeterminate={someSelected}
									onChange={(e) => handleSelectAllRows(e.target.checked)}
									icon={<CheckBoxUncheckedIcon />}
									indeterminateIcon={<CheckBoxUncheckedIcon />}
									checkedIcon={<CheckBoxCheckedIcon />}
									sx={{ py: '0px' }}
								/>
							</TableCell>
						) : showSelection ? (
							<TableCell padding="checkbox" />
						) : null}

						{columns.map((column) => (
							<TableCell
								key={column.id}
								width={column.width}
								align={column.align || 'left'}
							>
								{renderHeaderCell ? renderHeaderCell(column) : column.label}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{data.map((row, rowIndex) => (
						<TableRow
							key={rowIndex}
							onClick={onClickRow ? () => onClickRow(row, rowIndex) : undefined}
							hover={!!onClickRow}
							style={onClickRow ? { cursor: 'pointer' } : undefined}
						>
							{/* Row selection checkbox */}
							{showSelection && handleSelectRow && handleSelectAllRows ? (
								<TableCell padding="checkbox">
									<Checkbox
										checked={selectedRows.includes(rowIndex)}
										onChange={() => handleSelectRow(rowIndex)}
										sx={modalStyles.tableCheckbox}
										icon={<CheckBoxUncheckedIcon />}
										checkedIcon={<CheckBoxCheckedIcon />}
									/>
								</TableCell>
							) : showSelection ? (
								<TableCell padding="checkbox" />
							) : null}

							{columns.map((column) => (
								<TableCell
									key={`${rowIndex}-${column.id}`}
									sx={modalStyles.tableCell}
									align={column.align || 'left'}
								>
									{renderCell
										? renderCell(row, column, rowIndex)
										: (row as any)[column.id]}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

export default SimpleImportTable
