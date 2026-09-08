import { useState, useCallback } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Collapse,
  IconButton,
  Paper
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { AdminPageWrapper } from '../components/AdminPageWrapper'
import { AdminDataTable } from '../components/AdminDataTable'
import { StatusChip } from '../components/StatusChip'
import { adminStyles } from '../components/adminStyles'
import { useDebounce } from '../../../utils/hooks/useDebounce'
import { useAdminAuditLogs } from '../../../API/admin/useAdminAuditLogs'

const ENTITY_TYPES = ['All', 'User', 'Check', 'Bank', 'Payee', 'Organization', 'Transaction', 'Setting']
const ACTION_TYPES = ['All', 'Created', 'Updated', 'Deleted', 'Login', 'Logout', 'Voided']

const columns = [
  { id: 'timestamp', label: 'Timestamp', sortable: true, minWidth: 150 },
  { id: 'actorName', label: 'Actor', sortable: true, minWidth: 120 },
  { id: 'action', label: 'Action', minWidth: 90 },
  { id: 'entityType', label: 'Entity Type', minWidth: 100 },
  { id: 'entityId', label: 'Entity ID', minWidth: 100 },
  { id: 'targetLabel', label: 'Target', minWidth: 120 },
  { id: 'details', label: 'Details', minWidth: 80 }
]

const DiffView = ({ oldValue, newValue }) => {
  const renderJson = (obj) => {
    if (!obj) return <Typography variant="caption" color="text.secondary">—</Typography>
    try {
      const parsed = typeof obj === 'string' ? JSON.parse(obj) : obj
      return (
        <pre style={{
          fontSize: '11px',
          backgroundColor: '#F8FAFC',
          padding: '8px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '200px',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )
    } catch {
      return <Typography variant="caption">{String(obj)}</Typography>
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" fontWeight={600} color="error.main">Old Value</Typography>
        {renderJson(oldValue)}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" fontWeight={600} color="success.main">New Value</Typography>
        {renderJson(newValue)}
      </Box>
    </Box>
  )
}

const AuditLogs = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [entityType, setEntityType] = useState('All')
  const [actionType, setActionType] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortField, setSortField] = useState('timestamp')
  const [sortOrder, setSortOrder] = useState('desc')
  const [expandedRow, setExpandedRow] = useState(null)
  const debouncedSearch = useDebounce(search, 500)

  const params = {
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    entityType: entityType !== 'All' ? entityType : undefined,
    actionType: actionType !== 'All' ? actionType : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortField: sortField || undefined,
    sortOrder: sortField ? sortOrder : undefined
  }

  const { data, isLoading, error } = useAdminAuditLogs(params)

  const handleSort = useCallback((field) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
        return field
      }
      setSortOrder('desc')
      return field
    })
  }, [])

  const formatTimestamp = (val) => {
    if (!val) return '—'
    try {
      const d = new Date(val)
      return d.toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    } catch { return String(val) }
  }

  const renderCell = (row, col) => {
    switch (col.id) {
      case 'timestamp':
        return formatTimestamp(row.timestamp || row.createdAt)
      case 'actorName':
        return row.actorName || (row.userId ? `${row.userId.firstName || ''} ${row.userId.lastName || ''}`.trim() : '—')
      case 'action':
        return <StatusChip status={row.action} label={row.action} />
      case 'entityType':
        return row.entityType || '—'
      case 'entityId':
        return (
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
            {row.entityId ? String(row.entityId).slice(-8) : '—'}
          </Typography>
        )
      case 'targetLabel':
        return row.targetLabel || row.description || '—'
      case 'details':
        const hasChanges = row.oldValue || row.newValue || row.changes
        return hasChanges ? (
          <Box>
            <IconButton
              size="small"
              onClick={() => setExpandedRow(expandedRow === row._id ? null : row._id)}
            >
              {expandedRow === row._id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
            <Collapse in={expandedRow === row._id}>
              <Paper sx={{ p: 1, mt: 1, maxWidth: 500 }} variant="outlined">
                <DiffView oldValue={row.oldValue || row.changes?.old} newValue={row.newValue || row.changes?.new} />
              </Paper>
            </Collapse>
          </Box>
        ) : '—'
      default:
        return row[col.id] ?? '—'
    }
  }

  return (
    <AdminPageWrapper
      title="Audit Logs"
      description="Review all system audit logs. Track changes, user actions, and entity modifications across the platform."
    >
      <Box sx={adminStyles.toolbar}>
        <Box sx={adminStyles.filterRow}>
          <TextField
            value={search}
            placeholder="Search logs..."
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            sx={adminStyles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon sx={{ color: '#6B7280' }} /></InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Entity Type</InputLabel>
            <Select
              value={entityType}
              label="Entity Type"
              onChange={(e) => { setEntityType(e.target.value); setPage(1) }}
            >
              {ENTITY_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={actionType}
              label="Action"
              onChange={(e) => { setActionType(e.target.value); setPage(1) }}
            >
              {ACTION_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
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
        data={data?.data || data?.logs || []}
        renderCell={renderCell}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No audit logs found"
      />
    </AdminPageWrapper>
  )
}

export default AuditLogs
