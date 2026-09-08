import { useState, useCallback } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  Typography
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { AdminPageWrapper } from '../components/AdminPageWrapper'
import { AdminDataTable } from '../components/AdminDataTable'
import { StatusChip } from '../components/StatusChip'
import { adminStyles } from '../components/adminStyles'
import { useDebounce } from '../../../utils/hooks/useDebounce'
import { useAdminTransactions } from '../../../API/admin/useAdminTransactions'
import { formatUSD } from '../../../utils/helper'

const columns = [
  { id: 'date', label: 'Date', sortable: true, minWidth: 100 },
  { id: 'type', label: 'Type', minWidth: 90 },
  { id: 'amount', label: 'Amount', sortable: true, minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 90 },
  { id: 'ownerName', label: 'Owner', sortable: true, minWidth: 120 },
  { id: 'organizationName', label: 'Organization', minWidth: 120 },
  { id: 'relatedEntity', label: 'Related Entity', minWidth: 120 },
  { id: 'referenceId', label: 'Reference ID', minWidth: 120 }
]

const TransactionsManagement = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const params = {
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortField: sortField || undefined,
    sortOrder: sortField ? sortOrder : undefined
  }

  const { data, isLoading, error } = useAdminTransactions(params)

  const handleSort = useCallback((field) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
        return field
      }
      setSortOrder('asc')
      return field
    })
  }, [])


  const formatDate = (val) => {
    if (!val) return '—'
    try {
      return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    } catch { return String(val) }
  }

  const renderCell = (row, col) => {
    switch (col.id) {
      case 'date':
        return formatDate(row.date || row.transactionDate || row.createdAt)
      case 'amount':
        return formatUSD(row.amount)
      case 'status':
        return <StatusChip status={row.status} />
      case 'type':
        return <StatusChip status={row.type} label={row.type} />
      case 'ownerName':
        return row.ownerName || (row.userId ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() : '—')
      case 'organizationName':
        return row.organizationName || row.organizationId?.name || '—'
      case 'relatedEntity':
        return row.relatedEntity || row.entityType || '—'
      case 'referenceId':
        return row.referenceId || row.externalId || '—'
      default:
        return row[col.id] ?? '—'
    }
  }

  return (
    <AdminPageWrapper
      title="Transactions"
      description="View all transactions across the platform. This is a read-only view for auditing and investigation."
    >
      <Box sx={adminStyles.readOnlyBanner}>
        <VisibilityIcon sx={{ color: '#64748B', fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary">
          Read-only view — transactions cannot be edited or deleted from this page.
        </Typography>
      </Box>

      <Box sx={adminStyles.toolbar}>
        <Box sx={adminStyles.filterRow}>
          <TextField
            value={search}
            placeholder="Search transactions..."
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            sx={adminStyles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon sx={{ color: '#6B7280' }} /></InputAdornment>
              )
            }}
          />
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Box>

      <AdminDataTable
        columns={columns}
        data={data?.data || data?.transactions || []}
        renderCell={renderCell}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No transactions found"
      />
    </AdminPageWrapper>
  )
}

export default TransactionsManagement
