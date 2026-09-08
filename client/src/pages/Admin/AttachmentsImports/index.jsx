import { useState } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  Typography
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { AdminPageWrapper } from '../components/AdminPageWrapper'
import { AdminDataTable } from '../components/AdminDataTable'
import { StatusChip } from '../components/StatusChip'
import { adminStyles } from '../components/adminStyles'
import Tabs from '../../../components/shared/tabs'
import { useDebounce } from '../../../utils/hooks/useDebounce'
import { useAdminAttachments } from '../../../API/admin/useAdminAttachments'
import { useAdminImports } from '../../../API/admin/useAdminImports'

const attachmentColumns = [
  { id: 'fileName', label: 'File Name', sortable: true, minWidth: 160 },
  { id: 'ownerName', label: 'Owner', minWidth: 120 },
  { id: 'organizationName', label: 'Organization', minWidth: 120 },
  { id: 'entityType', label: 'Entity Type', minWidth: 100 },
  { id: 'fileType', label: 'File Type', minWidth: 80 },
  { id: 'createdAt', label: 'Created', sortable: true, minWidth: 100 }
]

const importColumns = [
  { id: 'sessionId', label: 'Session ID', minWidth: 120 },
  { id: 'ownerName', label: 'Owner', minWidth: 120 },
  { id: 'organizationName', label: 'Organization', minWidth: 120 },
  { id: 'rowCount', label: 'Total Rows', sortable: true, minWidth: 90 },
  { id: 'successCount', label: 'Success', minWidth: 80 },
  { id: 'failureCount', label: 'Failures', minWidth: 80 },
  { id: 'validationStatus', label: 'Status', minWidth: 90 },
  { id: 'createdAt', label: 'Created', sortable: true, minWidth: 100 }
]

const formatDate = (val) => {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch { return String(val) }
}

const AttachmentsTab = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 500)

  const params = {
    page,
    pageSize: 20,
    search: debouncedSearch || undefined
  }

  const { data, isLoading, error } = useAdminAttachments(params)

  const renderCell = (row, col) => {
    switch (col.id) {
      case 'ownerName':
        return row.ownerName || (row.userId ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() : '—')
      case 'organizationName':
        return row.organizationName || row.organizationId?.name || '—'
      case 'createdAt':
        return formatDate(row.createdAt)
      case 'fileType':
        return row.fileType || row.mimeType || row.contentType || '—'
      case 'entityType':
        return row.entityType || '—'
      case 'fileName':
        return row.fileName || row.originalName || row.name || '—'
      default:
        return row[col.id] ?? '—'
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={adminStyles.toolbar}>
        <TextField
          value={search}
          placeholder="Search attachments..."
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
        columns={attachmentColumns}
        data={data?.data || data?.attachments || []}
        renderCell={renderCell}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        emptyMessage="No attachments found"
      />
    </Box>
  )
}

const ImportsTab = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 500)

  const params = {
    page,
    pageSize: 20,
    search: debouncedSearch || undefined
  }

  const { data, isLoading, error } = useAdminImports(params)

  const renderCell = (row, col) => {
    switch (col.id) {
      case 'sessionId':
        return (
          <Typography variant="caption" fontFamily="monospace" fontSize="11px">
            {row.sessionId || row._id || '—'}
          </Typography>
        )
      case 'ownerName':
        return row.ownerName || (row.userId ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() : '—')
      case 'organizationName':
        return row.organizationName || row.organizationId?.name || '—'
      case 'rowCount':
        return row.rowCount ?? row.totalRows ?? '—'
      case 'successCount':
        return (
          <Typography variant="caption" color="success.main" fontWeight={600}>
            {row.successCount ?? row.successRows ?? '—'}
          </Typography>
        )
      case 'failureCount':
        return (
          <Typography variant="caption" color="error.main" fontWeight={600}>
            {row.failureCount ?? row.failedRows ?? '—'}
          </Typography>
        )
      case 'validationStatus':
        return <StatusChip status={row.validationStatus || row.status} />
      case 'createdAt':
        return formatDate(row.createdAt)
      default:
        return row[col.id] ?? '—'
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={adminStyles.toolbar}>
        <TextField
          value={search}
          placeholder="Search imports..."
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
        columns={importColumns}
        data={data?.data || data?.imports || []}
        renderCell={renderCell}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        emptyMessage="No import sessions found"
      />
    </Box>
  )
}

const AttachmentsImports = () => {
  return (
    <AdminPageWrapper
      title="Attachments & Imports"
      description="Browse all file attachments and import sessions across the platform."
    >
      <Tabs
        tabsData={[
          {
            title: 'Attachments',
            component: <AttachmentsTab />
          },
          {
            title: 'Import History',
            component: <ImportsTab />
          }
        ]}
        useQueryParam={false}
      />
    </AdminPageWrapper>
  )
}

export default AttachmentsImports
