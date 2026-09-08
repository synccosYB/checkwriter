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
  useAdminPayees,
  useAdminPayeeUpdate,
  useAdminPayeeDelete
} from '../../../API/admin/useAdminPayees'

const columns = [
  { id: 'name', label: 'Payee Name', sortable: true, minWidth: 160 },
  { id: 'ownerName', label: 'Owner', sortable: true, minWidth: 120 },
  { id: 'organizationName', label: 'Organization', minWidth: 120 },
  { id: 'createdAt', label: 'Created', sortable: true, minWidth: 100 },
  { id: 'updatedAt', label: 'Last Updated', sortable: true, minWidth: 110 },
  { id: 'actions', label: 'Actions', minWidth: 90 }
]

const PayeesManagement = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const debouncedSearch = useDebounce(search, 500)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editPayee, setEditPayee] = useState(null)
  const [editForm, setEditForm] = useState({})

  const params = {
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    sortField: sortField || undefined,
    sortOrder: sortField ? sortOrder : undefined
  }

  const { data, isLoading, error } = useAdminPayees(params)
  const { mutate: updatePayee, isPending: isUpdating } = useAdminPayeeUpdate()
  const { mutate: deletePayee, isPending: isDeleting } = useAdminPayeeDelete()

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
    setEditPayee(row)
    setEditForm({ name: row.name || '' })
  }

  const handleSaveEdit = () => {
    updatePayee(
      { payeeId: editPayee._id, data: editForm },
      { onSuccess: () => setEditPayee(null) }
    )
  }

  const handleDelete = () => {
    deletePayee(
      { payeeId: deleteTarget._id },
      { onSuccess: () => setDeleteTarget(null) }
    )
  }

  const renderCell = (row, col) => {
    switch (col.id) {
      case 'ownerName':
        return row.ownerName || (row.userId ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() : '—')
      case 'organizationName':
        return row.organizationName || row.organizationId?.name || '—'
      case 'createdAt':
      case 'updatedAt':
        return formatDate(row[col.id])
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
      title="Payees Management"
      description="View and manage all payees across the platform. Search, edit, or delete payees."
    >
      <Box sx={adminStyles.toolbar}>
        <TextField
          value={search}
          placeholder="Search payees..."
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
        data={data?.data || data?.payees || []}
        renderCell={renderCell}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No payees found"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Payee"
        message={`Are you sure you want to delete payee "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

      {editPayee && (
        <CustomDialog
          open={!!editPayee}
          onClose={() => setEditPayee(null)}
          title="Edit Payee"
          content={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Payee Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                fullWidth
                size="small"
              />
            </Box>
          }
          actions={
            <>
              <Button onClick={() => setEditPayee(null)} variant="text">Cancel</Button>
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

export default PayeesManagement
