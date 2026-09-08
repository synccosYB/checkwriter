import { useState } from 'react'
import {
        Box,
        Typography,
        CircularProgress,
        Pagination,
        PaginationItem,
        Select,
        MenuItem,
        FormControl,
        InputLabel,
        Chip,
        IconButton,
        Tooltip,
        Link
} from '@mui/material'
import { useHistory } from 'react-router-dom'
import CancelIcon from '@mui/icons-material/Cancel'
import EditIcon from '@mui/icons-material/Edit'
import { CustomTable } from '../../../../components/table/CustomTable'
import useAllShipments from '../../../../API/admin/useAllShipments'
import { useAdminCancelShipment, useAdminUpdateShipment } from '../../../../API/admin/useAdminShipments'
import usePagination from '../../../../utils/hooks/usePagination'
import { formatUSD } from '../../../../utils/helper'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MailOutlineIcon from '@mui/icons-material/MailOutline'

const CANONICAL_STATUSES = ['Submitted', 'Processing', 'Mailed', 'Canceled', 'Error']

const STATUS_COLORS = {
        Submitted: '#058205',
        Processing: '#EF6C00',
        Mailed: '#1e3a5f',
        Canceled: '#f03d3e',
        Error: '#f03d3e'
}

const PROVIDER_COLORS = {
        lob: '#1976d2',
        ups: '#5B3D1E',
        fedex: '#4D148C'
}

const PROVIDER_LABELS = {
        lob: 'LOB',
        ups: 'UPS',
        fedex: 'FedEx'
}

export const ShipmentsAdminList = ({ provider: defaultProvider }) => {
        const history = useHistory()
        const { page, setPage, pageSize } = usePagination()
        const [statusFilter, setStatusFilter] = useState('')
        const [providerFilter, setProviderFilter] = useState(defaultProvider || '')
        const [editingId, setEditingId] = useState(null)
        const [editStatus, setEditStatus] = useState('')

        const { data: shipmentsData, isLoading } = useAllShipments({
                page,
                pageSize,
                status: statusFilter || undefined,
                provider: providerFilter || undefined
        })

        const { mutate: cancelShipment, isPending: isCanceling } = useAdminCancelShipment()
        const { mutate: updateShipment, isPending: isUpdating } = useAdminUpdateShipment()

        const lobRecords = shipmentsData?.data?.lob?.data || []
        const carrierRecords = shipmentsData?.data?.carriers?.data || []
        const lobTotal = shipmentsData?.data?.lob?.total || 0
        const carrierTotal = shipmentsData?.data?.carriers?.total || 0

        const allRecords = [
                ...lobRecords.map((r) => ({ ...r, _provider: 'lob' })),
                ...carrierRecords.map((r) => ({ ...r, _provider: r.carrier || 'carrier' }))
        ]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, pageSize)

        const totalCount = lobTotal + carrierTotal

        const handleCancel = (row) => {
                const provider = row._provider === 'lob' ? 'lob' : 'carrier'
                cancelShipment({ provider, recordId: row._id })
        }

        const handleStatusSave = (row) => {
                if (!editStatus || editStatus === row.status) {
                        setEditingId(null)
                        return
                }
                const provider = row._provider === 'lob' ? 'lob' : 'carrier'
                updateShipment(
                        { provider, recordId: row._id, status: editStatus },
                        { onSuccess: () => setEditingId(null) }
                )
        }

        const columns = [
                { id: 'provider', label: 'Provider', width: '100px' },
                { id: 'checkId', label: 'Check ID', width: '160px' },
                { id: 'status', label: 'Status', width: '160px' },
                { id: 'serviceLevel', label: 'Service', width: '180px' },
                { id: 'chargeAmount', label: 'Charge', width: '100px' },
                { id: 'trackingNumber', label: 'Tracking #', width: '160px' },
                { id: 'createdAt', label: 'Created', width: '120px' },
                { id: 'actions', label: 'Actions', width: '130px' }
        ]

        const renderCell = (row, column) => {
                switch (column.id) {
                        case 'provider':
                                return (
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                {row._provider === 'lob' ? (
                                                        <MailOutlineIcon sx={{ fontSize: 16, color: PROVIDER_COLORS.lob }} />
                                                ) : (
                                                        <LocalShippingIcon sx={{ fontSize: 16, color: PROVIDER_COLORS[row._provider] || '#555' }} />
                                                )}
                                                <Typography fontSize={13} color={PROVIDER_COLORS[row._provider] || '#555'} fontWeight={600}>
                                                        {PROVIDER_LABELS[row._provider] || row._provider?.toUpperCase()}
                                                </Typography>
                                        </Box>
                                )
                        case 'status':
                                if (editingId === row._id) {
                                        return (
                                                <Select
                                                        size="small"
                                                        value={editStatus}
                                                        onChange={(e) => setEditStatus(e.target.value)}
                                                        onBlur={() => handleStatusSave(row)}
                                                        autoFocus
                                                        sx={{ fontSize: 12, minWidth: 130 }}
                                                >
                                                        {CANONICAL_STATUSES.map((s) => (
                                                                <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
                                                                        {s}
                                                                </MenuItem>
                                                        ))}
                                                </Select>
                                        )
                                }
                                return (
                                        <Chip
                                                label={row.status}
                                                size="small"
                                                sx={{
                                                        color: STATUS_COLORS[row.status] || '#555',
                                                        backgroundColor: `${STATUS_COLORS[row.status] || '#555'}15`,
                                                        border: `1px solid ${STATUS_COLORS[row.status] || '#555'}`,
                                                        fontWeight: 600
                                                }}
                                        />
                                )
                        case 'serviceLevel':
                                return row.serviceLevelName || row.mailClass || row.serviceLevel || '-'
                        case 'chargeAmount':
                                return formatUSD(row.chargeAmount || 0)
                        case 'trackingNumber':
                                return row.trackingNumber ? (
                                        <Typography fontSize={12} fontFamily="monospace" color="#1976d2">
                                                {row.trackingNumber}
                                        </Typography>
                                ) : row.lobId ? (
                                        <Link
                                                component="button"
                                                variant="body2"
                                                onClick={() => history.push(`/dashboard/mail-tracking/${row.lobId}`)}
                                                sx={{ fontSize: 12, fontFamily: "monospace", textAlign: "left" }}
                                        >
                                                {row.lobId}
                                        </Link>
                                ) : '-'
                        case 'checkId':
                                return (
                                        <Typography fontSize={12} fontFamily="monospace" title={String(row.checkId)}>
                                                {String(row.checkId).slice(-8)}...
                                        </Typography>
                                )
                        case 'createdAt':
                                return new Date(row.createdAt).toLocaleDateString()
                        case 'actions': {
                                const isBusy = (isCanceling || isUpdating) && editingId === row._id
                                return (
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                {row.status !== 'Canceled' && (
                                                        <Tooltip title="Cancel shipment">
                                                                <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        disabled={isBusy}
                                                                        onClick={() => handleCancel(row)}
                                                                >
                                                                        {isBusy ? <CircularProgress size={14} /> : <CancelIcon sx={{ fontSize: 16 }} />}
                                                                </IconButton>
                                                        </Tooltip>
                                                )}
                                                {row.status !== 'Canceled' && (
                                                        <Tooltip title="Update status">
                                                                <IconButton
                                                                        size="small"
                                                                        color="primary"
                                                                        onClick={() => {
                                                                                setEditingId(row._id)
                                                                                setEditStatus(row.status || 'Processing')
                                                                        }}
                                                                >
                                                                        <EditIcon sx={{ fontSize: 16 }} />
                                                                </IconButton>
                                                        </Tooltip>
                                                )}
                                        </Box>
                                )
                        }
                        default:
                                return row[column.id] || '-'
                }
        }

        return (
                <Box>
                        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel>Provider</InputLabel>
                                        <Select
                                                value={providerFilter}
                                                label="Provider"
                                                onChange={(e) => {
                                                        setProviderFilter(e.target.value)
                                                        setPage(0)
                                                }}
                                        >
                                                <MenuItem value="">All Providers</MenuItem>
                                                <MenuItem value="lob">LOB</MenuItem>
                                                <MenuItem value="ups">UPS</MenuItem>
                                                <MenuItem value="fedex">FedEx</MenuItem>
                                        </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                                value={statusFilter}
                                                label="Status"
                                                onChange={(e) => {
                                                        setStatusFilter(e.target.value)
                                                        setPage(0)
                                                }}
                                        >
                                                <MenuItem value="">All Statuses</MenuItem>
                                                {CANONICAL_STATUSES.map((s) => (
                                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                                ))}
                                        </Select>
                                </FormControl>
                        </Box>

                        {isLoading ? (
                                <Box display="flex" justifyContent="center" my={8}>
                                        <CircularProgress size={50} />
                                </Box>
                        ) : allRecords.length === 0 ? (
                                <Box textAlign="center" py={6}>
                                        <Typography color="text.secondary">No shipment records found.</Typography>
                                </Box>
                        ) : (
                                <CustomTable
                                        columns={columns}
                                        data={allRecords}
                                        renderCell={renderCell}
                                        isCenteredCells={true}
                                />
                        )}

                        <Box display="flex" justifyContent="center" mt={2}>
                                <Pagination
                                        count={Math.ceil((totalCount || 1) / pageSize)}
                                        page={page + 1}
                                        onChange={(event, value) => setPage(value - 1)}
                                        renderItem={(item) => (
                                                <PaginationItem
                                                        slots={{
                                                                previous: () => 'Previous',
                                                                next: () => 'Next'
                                                        }}
                                                        {...item}
                                                />
                                        )}
                                />
                        </Box>
                </Box>
        )
}

export default ShipmentsAdminList
