import { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { AdminPageWrapper } from '../components/AdminPageWrapper'
import { AdminDataTable } from '../components/AdminDataTable'
import { StatusChip } from '../components/StatusChip'
import { adminStyles } from '../components/adminStyles'
import {
  useAdminScheduledJobRuns,
  useAdminScheduledJobRunsSummary,
  useAdminScheduledJobNames
} from '../../../API/admin/useAdminScheduledJobRuns'

const STATUSES = ['All', 'running', 'succeeded', 'failed']

const columns = [
  { id: 'jobName', label: 'Job', minWidth: 200 },
  { id: 'status', label: 'Status', minWidth: 110 },
  { id: 'startedAt', label: 'Started', minWidth: 170 },
  { id: 'duration', label: 'Duration', minWidth: 110 },
  { id: 'runKey', label: 'Run Key', minWidth: 160 },
  { id: 'error', label: 'Error', minWidth: 120 }
]

const formatTimestamp = (val) => {
  if (!val) return '—'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return String(val)
  }
}

const formatRelative = (val) => {
  if (!val) return 'never'
  const d = new Date(val)
  if (isNaN(d.getTime())) return 'never'
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 0) return 'just now'
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 48) return `${hr}h ago`
  const days = Math.floor(hr / 24)
  return `${days}d ago`
}

const formatDuration = (ms) => {
  if (ms === null || ms === undefined) return '—'
  if (ms < 0) return '—'
  if (ms < 1000) return `${ms}ms`
  const s = ms / 1000
  if (s < 60) return `${s.toFixed(1)}s`
  const min = Math.floor(s / 60)
  const remSec = Math.floor(s % 60)
  return `${min}m ${remSec}s`
}

const SummaryCard = ({ item }) => {
  const lastSuccessText = item.lastSuccessStartedAt
    ? `${formatTimestamp(item.lastSuccessStartedAt)} (${formatRelative(item.lastSuccessStartedAt)})`
    : 'No successful run on record'

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
          {item.jobName}
        </Typography>
        <StatusChip status={item.lastStatus} label={item.lastStatus || 'unknown'} />
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Last successful run
        </Typography>
        <Tooltip title={lastSuccessText} placement="top">
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: item.lastSuccessStartedAt ? 'text.primary' : 'error.main'
            }}
          >
            {item.lastSuccessStartedAt
              ? formatRelative(item.lastSuccessStartedAt)
              : 'never'}
          </Typography>
        </Tooltip>
      </Box>
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Last run
        </Typography>
        <Typography variant="body2">
          {formatRelative(item.lastStartedAt)}
        </Typography>
      </Box>
      {item.lastStatus === 'failed' && item.lastErrorMessage && (
        <Tooltip title={item.lastErrorMessage} placement="top">
          <Typography
            variant="caption"
            color="error.main"
            sx={{
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {item.lastErrorMessage}
          </Typography>
        </Tooltip>
      )}
    </Paper>
  )
}

const ScheduledJobRuns = () => {
  const [page, setPage] = useState(1)
  const [jobName, setJobName] = useState('All')
  const [status, setStatus] = useState('All')
  const [expandedRow, setExpandedRow] = useState(null)

  const params = useMemo(() => {
    const p = { page, pageSize: 25 }
    if (jobName && jobName !== 'All') p.jobName = jobName
    if (status && status !== 'All') p.status = status
    return p
  }, [page, jobName, status])

  const { data: runsData, isLoading, error } = useAdminScheduledJobRuns(params)
  const { data: summaryData, isLoading: summaryLoading } =
    useAdminScheduledJobRunsSummary()
  const { data: jobNamesData } = useAdminScheduledJobNames()

  const summary = summaryData?.data || []
  const jobNameOptions = useMemo(() => {
    const fromApi = jobNamesData?.data || []
    const fromSummary = summary.map((s) => s.jobName)
    const unique = Array.from(new Set([...fromApi, ...fromSummary]))
    unique.sort()
    return ['All', ...unique]
  }, [jobNamesData, summary])

  const renderCell = (row, col) => {
    switch (col.id) {
      case 'jobName':
        return (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.jobName}
          </Typography>
        )
      case 'status':
        return <StatusChip status={row.status} label={row.status} />
      case 'startedAt':
        return formatTimestamp(row.startedAt)
      case 'duration':
        return formatDuration(row.durationMs)
      case 'runKey':
        return (
          <Tooltip title={row.runKey || ''} placement="top">
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                fontSize: '11px',
                maxWidth: 160,
                display: 'inline-block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {row.runKey || '—'}
            </Typography>
          </Tooltip>
        )
      case 'error':
        if (!row.errorMessage) return '—'
        return (
          <Box>
            <IconButton
              size="small"
              onClick={() =>
                setExpandedRow(expandedRow === row._id ? null : row._id)
              }
            >
              {expandedRow === row._id ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </IconButton>
            <Collapse in={expandedRow === row._id}>
              <Paper
                variant="outlined"
                sx={{ p: 1, mt: 1, maxWidth: 400, backgroundColor: '#FEF2F2' }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#B91C1C',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '11px'
                  }}
                >
                  {row.errorMessage}
                </Typography>
              </Paper>
            </Collapse>
          </Box>
        )
      default:
        return row[col.id] ?? '—'
    }
  }

  return (
    <AdminPageWrapper
      title="Scheduled Job Runs"
      description="Monitor invocations of HTTP-triggered scheduled jobs. Confirm cron cadence, spot missed runs, and inspect failures."
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          Last successful run per job
        </Typography>
        {summaryLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading summary…
          </Typography>
        ) : summary.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No scheduled job runs recorded yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {summary.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.jobName}>
                <SummaryCard item={item} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box sx={adminStyles.toolbar}>
        <Box sx={adminStyles.filterRow}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Job</InputLabel>
            <Select
              value={jobName}
              label="Job"
              onChange={(e) => {
                setJobName(e.target.value)
                setPage(1)
              }}
            >
              {jobNameOptions.map((j) => (
                <MenuItem key={j} value={j}>
                  {j}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <AdminDataTable
        columns={columns}
        data={runsData?.data || []}
        renderCell={renderCell}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={runsData?.pagination?.totalPages || 1}
        onPageChange={setPage}
        emptyMessage="No scheduled job runs match these filters"
      />
    </AdminPageWrapper>
  )
}

export default ScheduledJobRuns
