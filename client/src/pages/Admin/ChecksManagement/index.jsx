import { useState, useCallback } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import DeleteIcon from '@mui/icons-material/Delete'
import { AdminPageWrapper } from '../components/AdminPageWrapper'
import { AdminDataTable } from '../components/AdminDataTable'
import { StatusChip } from '../components/StatusChip'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CustomDialog } from '../../../components/dialog/CustomDialog'
import { CustomButton } from '../../../components/buttons/CustomButton'
import { adminStyles } from '../components/adminStyles'
import { useDebounce } from '../../../utils/hooks/useDebounce'
import {
  useAdminChecks,
  useAdminCheckUpdate,
  useAdminCheckVoid,
  useAdminCheckDelete
} from '../../../API/admin/useAdminChecks'
import { formatUSD } from '../../../utils/helper'

const STATUS_OPTIONS = ['All', 'Draft', 'Created', 'Mailed', 'Voided', 'Canceled']

const columns = [
  { id: 'checkNumber', label: 'Check #', sortable: true, minWidth: 80 },
  { id: 'payeeName', label: 'Payee', sortable: true, minWidth: 120 },
  { id: 'amount', label: 'Amount', sortable: true, minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 90 },
  { id: 'date', label: 'Date', sortable: true, minWidth: 100 },
  { id: 'ownerName', label: 'Owner', minWidth: 120 },
  { id: 'organizationName', label: 'Organization', minWidth: 120 },
  { id: 'bankName', label: 'Bank Account', minWidth: 120 },
  { id: 'mailingStatus', label: 'Mailing', minWidth: 90 },
  { id: 'actions', label: 'Actions', minWidth: 100 }
]

const ChecksManagement = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const debouncedSearch = useDebounce(search, 500)

  const [confirmAction, setConfirmAction] = useState(null)
  const [editCheck, setEditCheck] = useState(null)
  const [editForm, setEditForm] = useState({})

  const params = {
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'All' ? statusFilter : undefined,
    sortField: sortField || undefined,
    sortOrder: sortField ? sortOrder : undefined
  }

  const { data, isLoading, error } = useAdminChecks(params)
  const { mutate: updateCheck, isPending: isUpdating } = useAdminCheckUpdate()
  const { mutate: voidCheck, isPending: isVoiding } = useAdminCheckVoid()
  const { mutate: deleteCheck, isPending: isDeleting } = useAdminCheckDelete()

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

  const handleEdit = (row) => {
    setEditCheck(row)
    setEditForm({
      checkNumber: row.checkNumber || '',
      amount: row.amount || '',
      memo: row.memo || ''
    })
  }

  const handleSaveEdit = () => {
    updateCheck(
      { checkId: editCheck._id, data: editForm },
      { onSuccess: () => setEditCheck(null) }
    )
  }

  const handleConfirmAction = () => {
    if (!confirmAction) return
    const { type, row } = confirmAction
    if (type === 'void') {
      voidCheck({ checkId: row._id }, { onSuccess: () => setConfirmAction(null) })
    } else if (type === 'delete') {
      deleteCheck({ checkId: row._id }, { onSuccess: () => setConfirmAction(null) })
    }
  }

  const renderCell = (row, col) => {
    switch (col.id) {
      case 'amount':
        return formatUSD(row.amount)
      case 'status':
        return <StatusChip status={row.status} />
      case 'date':
        return formatDate(row.date || row.createdAt)
      case 'mailingStatus':
        return row.mailingStatus ? <StatusChip status={row.mailingStatus} /> : '—'
      case 'ownerName':
        return row.ownerName || row.userId?.firstName ? `${row.userId?.firstName || ''} ${row.userId?.lastName || ''}`.trim() : '—'
      case 'organizationName':
        return row.organizationName || row.organizationId?.name || '—'
      case 'bankName':
        return row.bankName || row.bankAccountId?.bankName || '—'
      case 'payeeName':
        return row.payeeName || row.payeeId?.name || '—'
      case 'actions':
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={() => handleEdit(row)} title="Edit">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setConfirmAction({ type: 'void', row })} title="Void">
              <BlockIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setConfirmAction({ type: 'delete', row })} title="Delete" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )
      default:
        return row[col.id] ?? '—'
    }
  }

  return (
    <AdminPageWrapper
      title="Checks Management"
      description="View and manage all checks across the platform. Search, filter, edit, void, or delete checks."
    >
      <Box sx={adminStyles.toolbar}>
        <Box sx={adminStyles.filterRow}>
          <TextField
            value={search}
            placeholder="Search checks..."
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            sx={adminStyles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon sx={{ color: '#6B7280' }} /></InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <AdminDataTable
        columns={columns}
        data={data?.data || data?.checks || []}
        renderCell={renderCell}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No checks found"
      />

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={confirmAction?.type === 'void' ? 'Void Check' : 'Delete Check'}
        message={
          confirmAction?.type === 'void'
            ? `Are you sure you want to void check #${confirmAction?.row?.checkNumber}? This action cannot be undone.`
            : `Are you sure you want to delete check #${confirmAction?.row?.checkNumber}? This action cannot be undone.`
        }
        confirmLabel={confirmAction?.type === 'void' ? 'Void' : 'Delete'}
        isLoading={isVoiding || isDeleting}
      />

      {editCheck && (
        <CustomDialog
          open={!!editCheck}
          onClose={() => setEditCheck(null)}
          title="Edit Check"
          content={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Check Number"
                value={editForm.checkNumber}
                onChange={(e) => setEditForm({ ...editForm, checkNumber: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Amount"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                fullWidth
                size="small"
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
              <TextField
                label="Memo"
                value={editForm.memo}
                onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            </Box>
          }
          actions={
            <>
              <Button onClick={() => setEditCheck(null)} variant="text">Cancel</Button>
              <CustomButton
                variant="outlined"
                color="primary"
                onClick={handleSaveEdit}
                disabled={isUpdating}
                endIcon={isUpdating ? <CircularProgress size={14} /> : null}
              >
                Save
              </CustomButton>
            </>
          }
        />
      )}
    </AdminPageWrapper>
  )
}

export default ChecksManagement
