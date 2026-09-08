import React from 'react'
import {
	Table,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Checkbox,
	TableBody,
	Box
} from '@mui/material'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import {
	CheckBoxCheckedIcon,
	CheckBoxUncheckedIcon
} from '../../../../../components/Icons'

export interface Column {
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

const ROW_HEIGHT = 55 // adjust based on your design

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
	const allSelected = data.length > 0 && selectedRows.length === data.length
	const someSelected =
		selectedRows.length > 0 && selectedRows.length < data.length

	const OuterElement = React.forwardRef<HTMLTableSectionElement, any>(
		(props, ref) => <TableBody ref={ref} {...props} />
	)
	OuterElement.displayName = 'VirtualTableBody'

	return (
		<TableContainer
			sx={{
				...modalStyles?.tableContainer
			}}
		>
			{/* Sticky header inside actual Table */}
			<Table stickyHeader>
				<TableHead>
					<TableRow>
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
								sx={{
									width: `${column.width} !important`
								}}
								key={column.id}
								// width={column.width || '180px'}
								align={column.align || 'left'}
							>
								{renderHeaderCell ? renderHeaderCell(column) : column.label}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
			</Table>

			{/* Virtualized rows rendered *outside* the <Table> */}
			<Box sx={{ width: '100%' }}>
				<AutoSizer style={{ height: '300px' }}>
					{({ height, width }) => (
						<List
							height={height}
							itemCount={data.length}
							itemSize={ROW_HEIGHT}
							width={width}
							itemData={data}
							layout="vertical"
							overscanCount={20}
						>
							{({ index, style, data }) => {
								const row = data[index]
								return (
									<div style={{ ...style }}>
										<Table>
											<TableBody>
												<TableRow
													hover={!!onClickRow}
													onClick={
														onClickRow
															? () => onClickRow(row, index)
															: undefined
													}
												>
													{showSelection &&
													handleSelectRow &&
													handleSelectAllRows ? (
														<TableCell padding="checkbox">
															<Checkbox
																checked={selectedRows.includes(index)}
																onChange={() => handleSelectRow(index)}
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
															key={`${index}-${column.id}`}
															sx={{
																...modalStyles.tableCell
															}}
															align={column.align || 'left'}
															width={column.width || '180px'}
														>
															{renderCell
																? renderCell(row, column, index)
																: row[column.id]}
														</TableCell>
													))}
												</TableRow>
											</TableBody>
										</Table>
									</div>
								)
							}}
						</List>
					)}
				</AutoSizer>
			</Box>
		</TableContainer>
	)
}

export default SimpleImportTable
