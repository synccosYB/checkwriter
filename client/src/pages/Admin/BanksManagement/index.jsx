import { useState, useCallback } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { AdminPageWrapper } from '../components/AdminPageWrapper'
import { AdminDataTable } from '../components/AdminDataTable'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CustomDialog } from '../../../components/dialog/CustomDialog'
import { CustomButton } from '../../../components/buttons/CustomButton'
import { adminStyles } from '../components/adminStyles'
import { useDebounce } from '../../../utils/hooks/useDebounce'
import {
  useAdminBanks,
  useAdminBankUpdate,
  useAdminBankDelete
} from '../../../API/admin/useAdminBanks'

const columns = [
  { id: 'bankName', label: 'Bank Name', sortable: true, minWidth: 140 },
  { id: 'maskedAccount', label: 'Account (Masked)', minWidth: 130 },
  { id: 'routingNumber', label: 'Routing', minWidth: 100 },
  { id: 'ownerName', label: 'Owner', sortable: true, minWidth: 120 },
  { id: 'organizationName', label: 'Organization', minWidth: 120 },
  { id: 'createdAt', label: 'Created', sortable: true, minWidth: 100 },
  { id: 'actions', label: 'Actions', minWidth: 90 }
]

const BanksManagement = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const debouncedSearch = useDebounce(search, 500)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editBank, setEditBank] = useState(null)
  const [editForm, setEditForm] = useState({})

  const params = {
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    sortField: sortField || undefined,
    sortOrder: sortField ? sortOrder : undefined
  }

  const { data, isLoading, error } = useAdminBanks(params)
  const { mutate: updateBank, isPending: isUpdating } = useAdminBankUpdate()
  const { mutate: deleteBank, isPending: isDeleting } = useAdminBankDelete()

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

  const maskAccount = (val) => {
    if (!val) return '—'
    const str = String(val)
    if (str.length <= 4) return `****${str}`
    return `****${str.slice(-4)}`
  }

  const handleEdit = (row) => {
    setEditBank(row)
    setEditForm({ bankName: row.bankName || row.nickname || '' })
  }

  const handleSaveEdit = () => {
    updateBank(
      { bankId: editBank._id, data: editForm },
      { onSuccess: () => setEditBank(null) }
    )
  }

  const handleDelete = () => {
    deleteBank(
      { bankId: deleteTarget._id },
      { onSuccess: () => setDeleteTarget(null) }
    )
  }

  const renderCell = (row, col) => {
    switch (col.id) {
      case 'bankName':
        return row.bankName || row.nickname || '—'
      case 'maskedAccount':
        return maskAccount(row.accountNumber || row.maskedAccount)
      case 'routingNumber':
        return row.routingNumber ? `****${String(row.routingNumber).slice(-4)}` : '—'
      case 'ownerName':
        return row.ownerName || (row.userId ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() : '—')
      case 'organizationName':
        return row.organizationName || row.organizationId?.name || '—'
      case 'createdAt':
        return formatDate(row.createdAt)
      case 'actions':
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={() => handleEdit(row)} title="Edit">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setDeleteTarget(row)} title="Delete" color="error">
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
      title="Banks Management"
      description="View and manage all bank accounts across the platform. Sensitive information is masked for security."
    >
      <Box sx={adminStyles.toolbar}>
        <TextField
          value={search}
          placeholder="Search banks..."
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          sx={adminStyles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon sx={{ color: '#6B7280' }} /></InputAdornment>
            )
          }}
        />
      </Box>

      <AdminDataTable
        columns={columns}
        data={data?.data || data?.banks || []}
        renderCell={renderCell}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No bank accounts found"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Bank Account"
        message={`Are you sure you want to delete bank "${deleteTarget?.bankName || deleteTarget?.nickname}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

      {editBank && (
        <CustomDialog
          open={!!editBank}
          onClose={() => setEditBank(null)}
          title="Edit Bank Account"
          content={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Bank Name / Nickname"
                value={editForm.bankName}
                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                fullWidth
                size="small"
              />
            </Box>
          }
          actions={
            <>
              <Button onClick={() => setEditBank(null)} variant="text">Cancel</Button>
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

export default BanksManagement
