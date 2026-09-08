import { Chip } from '@mui/material'

const STATUS_COLORS = {
  active: { bg: '#E8F5E9', color: '#2E7D32' },
  inactive: { bg: '#FFEBEE', color: '#C62828' },
  connected: { bg: '#E8F5E9', color: '#2E7D32' },
  disconnected: { bg: '#FFF3E0', color: '#E65100' },
  pending: { bg: '#FFF8E1', color: '#F57F17' },
  completed: { bg: '#E8F5E9', color: '#2E7D32' },
  failed: { bg: '#FFEBEE', color: '#C62828' },
  succeeded: { bg: '#E8F5E9', color: '#2E7D32' },
  running: { bg: '#E3F2FD', color: '#1565C0' },
  voided: { bg: '#EFEBE9', color: '#5D4037' },
  mailed: { bg: '#E3F2FD', color: '#1565C0' },
  submitted: { bg: '#E8F5E9', color: '#2E7D32' },
  processing: { bg: '#FFF3E0', color: '#E65100' },
  canceled: { bg: '#FFEBEE', color: '#C62828' },
  error: { bg: '#FFEBEE', color: '#C62828' },
  success: { bg: '#E8F5E9', color: '#2E7D32' },
  draft: { bg: '#F5F5F5', color: '#616161' },
  created: { bg: '#E3F2FD', color: '#1565C0' },
  updated: { bg: '#FFF8E1', color: '#F57F17' },
  deleted: { bg: '#FFEBEE', color: '#C62828' }
}

export const StatusChip = ({ status, label }) => {
  const key = (status || '').toLowerCase()
  const colors = STATUS_COLORS[key] || { bg: '#F5F5F5', color: '#616161' }

  return (
    <Chip
      label={label || status || '—'}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: '11px',
        height: '24px',
        textTransform: 'capitalize'
      }}
    />
  )
}
