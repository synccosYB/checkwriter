import { useState } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { AdminPageWrapper } from '../components/AdminPageWrapper'
import { AdminDataTable } from '../components/AdminDataTable'
import { StatusChip } from '../components/StatusChip'
import { adminStyles } from '../components/adminStyles'
import { useDebounce } from '../../../utils/hooks/useDebounce'
import { useAdminCharges, useProcessRefund } from '../../../API/admin/useAdminRefunds'
import { formatUSD } from '../../../utils/helper'
import { useQuery } from '@tanstack/react-query'
import { adminClient } from '../../../API/admin/adminClient'

const columns = [
  { id: 'created', label: 'Date', minWidth: 100 },
  { id: 'description', label: 'Description', minWidth: 150 },
  { id: 'amount', label: 'Amount', minWidth: 100 },
  { id: 'amountRefunded', label: 'Refunded', minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'actions', label: 'Actions', minWidth: 100 }
]

const getChargeStatus = (charge) => {
  if (charge.refunded) return 'Refunded'
  if (charge.amountRefunded > 0) return 'Partially Refunded'
  return charge.status
}

const RefundsManagement = () => {
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [refundDialog, setRefundDialog] = useState({ open: false, charge: null })
  const [refundType, setRefundType] = useState('full')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const debouncedSearch = useDebounce(userSearch, 500)

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return { users: [] }
      return await adminClient.get('/users', {
        search: debouncedSearch,
        pageSize: 10,
        pageNumber: 1
      })
    },
    enabled: debouncedSearch?.length >= 2,
    keepPreviousData: true
  })

  const { data: chargesData, isLoading: chargesLoading, error: chargesError } = useAdminCharges(
    selectedUser?._id
  )

  const processRefund = useProcessRefund()

  const formatDate = (val) => {
    if (!val) return '—'
    try {
      return new Date(val).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return String(val)
    }
  }

  const handleOpenRefund = (charge) => {
    setRefundDialog({ open: true, charge })
    setRefundType('full')
    setRefundAmount('')
    setRefundReason('')
    setErrorMsg('')
  }

  const handleCloseRefund = () => {
    setRefundDialog({ open: false, charge: null })
    setRefundType('full')
    setRefundAmount('')
    setRefundReason('')
    setConfirmOpen(false)
  }

  const handleRefundSubmit = () => {
    if (!refundReason.trim()) {
      setErrorMsg('Refund reason is required')
      return
    }
    if (refundType === 'partial') {
      const amt = parseFloat(refundAmount)
      const maxRefundable = refundDialog.charge.amount - refundDialog.charge.amountRefunded
      if (!amt || amt <= 0) {
        setErrorMsg('Please enter a valid refund amount')
        return
      }
      if (amt > maxRefundable) {
        setErrorMsg(`Amount cannot exceed ${formatUSD(maxRefundable)}`)
        return
      }
    }
    setErrorMsg('')
    setConfirmOpen(true)
  }

  const handleConfirmRefund = async () => {
    const charge = refundDialog.charge
    try {
      const payload = {
        chargeId: charge.id,
        reason: refundReason,
        userId: selectedUser._id
      }
      if (refundType === 'partial') {
        payload.amount = parseFloat(refundAmount)
      }
      await processRefund.mutateAsync(payload)
      setSuccessMsg('Refund processed successfully')
      handleCloseRefund()
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to process refund')
      setConfirmOpen(false)
    }
  }

  const renderCell = (row, col) => {
    switch (col.id) {
      case 'created':
        return formatDate(row.created)
      case 'amount':
        return formatUSD(row.amount)
      case 'amountRefunded':
        return row.amountRefunded > 0 ? formatUSD(row.amountRefunded) : '—'
      case 'description':
        return row.description || '—'
      case 'status': {
        const status = getChargeStatus(row)
        return <StatusChip status={status} label={status} />
      }
      case 'actions': {
        const maxRefundable = row.amount - row.amountRefunded
        if (row.refunded || maxRefundable <= 0 || row.status !== 'succeeded') {
          return <Typography variant="body2" color="text.secondary">—</Typography>
        }
        return (
          <Button
            size="small"
            variant="outlined"
            color="warning"
            onClick={() => handleOpenRefund(row)}
            sx={{ fontSize: '12px', textTransform: 'none' }}
          >
            Refund
          </Button>
        )
      }
      default:
        return row[col.id] ?? '—'
    }
  }

  const userOptions = usersData?.users || usersData?.data || []

  return (
    <AdminPageWrapper
      title="Refunds"
      description="Search for a user and manage refunds for their Stripe charges."
    >
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      <Box sx={adminStyles.toolbar}>
        <Box sx={adminStyles.filterRow}>
          <Autocomplete
            sx={{ minWidth: 350 }}
            options={userOptions}
            getOptionLabel={(option) =>
              `${option.firstName || ''} ${option.lastName || ''} (${option.email || ''})`.trim()
            }
            isOptionEqualToValue={(option, value) => option._id === value._id}
            loading={usersLoading}
            onInputChange={(_, value) => setUserSearch(value)}
            onChange={(_, value) => {
              setSelectedUser(value)
              setSuccessMsg('')
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search user by name or email..."
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#6B7280' }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  )
                }}
              />
            )}
          />
        </Box>
      </Box>

      {selectedUser && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing charges for: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email})
          </Typography>
        </Box>
      )}

      {selectedUser && (
        <AdminDataTable
          columns={columns}
          data={chargesData?.charges || []}
          renderCell={renderCell}
          isLoading={chargesLoading}
          error={chargesError}
          page={1}
          totalPages={1}
          emptyMessage="No charges found for this user"
        />
      )}

      <Dialog
        open={refundDialog.open}
        onClose={handleCloseRefund}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Process Refund</DialogTitle>
        <DialogContent>
          {refundDialog.charge && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Charge: {refundDialog.charge.description || 'N/A'} — {formatUSD(refundDialog.charge.amount)}
                {refundDialog.charge.amountRefunded > 0 && (
                  <> (already refunded: {formatUSD(refundDialog.charge.amountRefunded)})</>
                )}
              </Typography>

              <RadioGroup
                value={refundType}
                onChange={(e) => setRefundType(e.target.value)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="full"
                  control={<Radio size="small" />}
                  label={`Full refund (${formatUSD(refundDialog.charge.amount - refundDialog.charge.amountRefunded)})`}
                />
                <FormControlLabel
                  value="partial"
                  control={<Radio size="small" />}
                  label="Partial refund"
                />
              </RadioGroup>

              {refundType === 'partial' && (
                <TextField
                  label="Refund Amount ($)"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  inputProps={{
                    min: 0.01,
                    max: refundDialog.charge.amount - refundDialog.charge.amountRefunded,
                    step: 0.01
                  }}
                />
              )}

              <TextField
                label="Reason for refund"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                fullWidth
                multiline
                rows={3}
                size="small"
                required
              />

              {errorMsg && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errorMsg}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseRefund} disabled={processRefund.isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleRefundSubmit}
            disabled={processRefund.isPending}
          >
            Process Refund
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Refund</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to refund{' '}
            <strong>
              {refundType === 'full'
                ? formatUSD((refundDialog.charge?.amount || 0) - (refundDialog.charge?.amountRefunded || 0))
                : formatUSD(parseFloat(refundAmount) || 0)}
            </strong>{' '}
            to {selectedUser?.firstName} {selectedUser?.lastName}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={processRefund.isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmRefund}
            disabled={processRefund.isPending}
            endIcon={processRefund.isPending ? <CircularProgress size={14} /> : null}
          >
            Confirm Refund
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageWrapper>
  )
}

export default RefundsManagement
