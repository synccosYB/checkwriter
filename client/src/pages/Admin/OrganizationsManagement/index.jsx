import { useState, useCallback } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  Typography,
  Collapse,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { AdminPageWrapper } from '../components/AdminPageWrapper'
import { AdminDataTable } from '../components/AdminDataTable'
import { StatusChip } from '../components/StatusChip'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CustomDialog } from '../../../components/dialog/CustomDialog'
import { CustomButton } from '../../../components/buttons/CustomButton'
import { adminStyles } from '../components/adminStyles'
import { useDebounce } from '../../../utils/hooks/useDebounce'
import {
  useAdminOrganizations,
  useAdminOrganizationUpdate,
  useAdminOrganizationDelete
} from '../../../API/admin/useAdminOrganizations'

const columns = [
  { id: 'name', label: 'Name', sortable: true, minWidth: 160 },
  { id: 'memberCount', label: 'Members', sortable: true, minWidth: 80 },
  { id: 'ownerName', label: 'Owner / Primary Contact', sortable: true, minWidth: 140 },
  { id: 'createdAt', label: 'Created', sortable: true, minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 90 },
  { id: 'members', label: 'View Members', minWidth: 110 },
  { id: 'actions', label: 'Actions', minWidth: 90 }
]

const OrganizationsManagement = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const debouncedSearch = useDebounce(search, 500)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editOrg, setEditOrg] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [expandedRow, setExpandedRow] = useState(null)

  const params = {
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    sortField: sortField || undefined,
    sortOrder: sortField ? sortOrder : undefined
  }

  const { data, isLoading, error } = useAdminOrganizations(params)
  const { mutate: updateOrg, isPending: isUpdating } = useAdminOrganizationUpdate()
  const { mutate: deleteOrg, isPending: isDeleting } = useAdminOrganizationDelete()

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
    setEditOrg(row)
    setEditForm({ name: row.name || '' })
  }

  const handleSaveEdit = () => {
    updateOrg(
      { orgId: editOrg._id, data: editForm },
      { onSuccess: () => setEditOrg(null) }
    )
  }

  const handleDelete = () => {
    deleteOrg(
      { orgId: deleteTarget._id },
      { onSuccess: () => setDeleteTarget(null) }
    )
  }

  const renderCell = (row, col) => {
    switch (col.id) {
      case 'memberCount':
        return row.memberCount ?? row.members?.length ?? 0
      case 'ownerName':
        return row.ownerName || (row.ownerId ? `${row.ownerId.firstName || ''} ${row.ownerId.lastName || ''}`.trim() : '—')
      case 'createdAt':
        return formatDate(row.createdAt)
      case 'status':
        return <StatusChip status={row.status || 'Active'} />
      case 'members':
        const memberList = row.members || []
        return (
          <Box>
            <Button
              size="small"
              onClick={() => setExpandedRow(expandedRow === row._id ? null : row._id)}
              endIcon={expandedRow === row._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ textTransform: 'none', fontSize: '12px', color: '#204464' }}
            >
              {memberList.length} member{memberList.length !== 1 ? 's' : ''}
            </Button>
            <Collapse in={expandedRow === row._id}>
              <List dense sx={{ pl: 1 }}>
                {memberList.length > 0 ? memberList.map((m, i) => (
                  <ListItem key={i} sx={{ py: 0 }}>
                    <ListItemText
                      primary={m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email}
                      primaryTypographyProps={{ fontSize: '11px' }}
                    />
                  </ListItem>
                )) : (
                  <Typography variant="caption" color="text.secondary">No members</Typography>
                )}
              </List>
            </Collapse>
          </Box>
        )
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
      title="Organizations Management"
      description="View and manage all organizations across the platform. Edit details, view members, or delete organizations."
    >
      <Box sx={adminStyles.toolbar}>
        <TextField
          value={search}
          placeholder="Search organizations..."
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
        data={data?.data || data?.organizations || []}
        renderCell={renderCell}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No organizations found"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Organization"
        message={`Are you sure you want to delete organization "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

      {editOrg && (
        <CustomDialog
          open={!!editOrg}
          onClose={() => setEditOrg(null)}
          title="Edit Organization"
          content={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Organization Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                fullWidth
                size="small"
              />
            </Box>
          }
          actions={
            <>
              <Button onClick={() => setEditOrg(null)} variant="text">Cancel</Button>
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

export default OrganizationsManagement
