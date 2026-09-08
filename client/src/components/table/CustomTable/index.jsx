import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow
} from '@mui/material'
import { styles } from './styles'

export const CustomTable = ({
	columns,
	data,
	renderCell,
	currentUserId = '',
	uniqueIdentifier = '_id',
	renderHeaderCell = null,
	isCenteredCells = false,
	onClickRow = null,
	tableHight = 'auto'
}) => {
	const formatDate = (dateString) => {
		const date = new Date(dateString)
		if (isNaN(date)) {
			return dateString
		}
		const formattedDate = date.toLocaleDateString('en-CA')
		return formattedDate
	}
	return (
		<Paper sx={{ width: '100%', overflow: 'hidden' }}>
			<TableContainer
				sx={{
					...styles.container,
					maxHeight: tableHight,
					minHeight: tableHight
				}}
			>
				<Table stickyHeader aria-label="sticky table">
					<TableHead>
						<TableRow sx={styles.headerRow}>
							{columns.map((column) => (
								<TableCell
									key={`table-header-${column.id}`}
									width={column.width}
									align={isCenteredCells ? 'center' : 'left'}
									sx={styles.headerCell}
								>
									{renderHeaderCell ? renderHeaderCell(column) : column.label}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{data?.map((row) => (
							<TableRow
								align={isCenteredCells ? 'center' : 'left'}
								key={row[uniqueIdentifier] || row.id || row?._id}
								sx={{
									...styles.bodyRow,
									backgroundColor: ~row.id ? 'transparent' : '#F9FAFB'
								}}
								onClick={onClickRow ? () => onClickRow(row) : null}
							>
								{columns.map((column) => (
									<TableCell
										key={`${row._id}-${column.id}`}
										sx={styles.bodyCell}
										align={isCenteredCells ? 'center' : 'left'}
									>
										{column.id === 'createdAt' || column.id === 'lastLogin'
											? formatDate(row[column.id])
											: renderCell
											? renderCell(row, column, row.id === currentUserId)
											: row[column.id]}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Paper>
	)
}
