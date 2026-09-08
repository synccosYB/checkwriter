import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
  Typography,
  CircularProgress,
  Pagination,
  PaginationItem,
  Alert
} from '@mui/material'
import { adminStyles } from './adminStyles'

export const AdminDataTable = ({
  columns,
  data,
  renderCell,
  isLoading,
  error,
  page = 1,
  totalPages = 1,
  onPageChange,
  sortField,
  sortOrder,
  onSort,
  emptyMessage = 'No records found',
  maxHeight = '65vh'
}) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error?.message || 'Failed to load data. Please try again.'}
      </Alert>
    )
  }

  return (
    <Box>
      <Paper sx={adminStyles.tableContainer}>
        <TableContainer sx={{ maxHeight }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{
                      fontWeight: 600,
                      fontSize: '12px',
                      color: '#6B7280',
                      backgroundColor: '#F9FAFB',
                      whiteSpace: 'nowrap',
                      width: col.width || 'auto',
                      minWidth: col.minWidth || 'auto'
                    }}
                  >
                    {col.sortable && onSort ? (
                      <TableSortLabel
                        active={sortField === col.id}
                        direction={sortField === col.id ? sortOrder : 'asc'}
                        onClick={() => onSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : !data?.length ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">{emptyMessage}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow
                    key={row._id || row.id || idx}
                    sx={{
                      '&:hover': { backgroundColor: '#F9FAFB' },
                      '&:last-child td': { borderBottom: 0 }
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={`${row._id || idx}-${col.id}`}
                        sx={{ fontSize: '13px', py: 1.5 }}
                      >
                        {renderCell ? renderCell(row, col) : row[col.id] ?? '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {totalPages > 1 && onPageChange && (
        <Box sx={adminStyles.paginationContainer}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, val) => onPageChange(val)}
            renderItem={(item) => (
              <PaginationItem {...item} sx={adminStyles.paginationItem} />
            )}
          />
        </Box>
      )}
    </Box>
  )
}
