import {
        Box,
        Typography,
        useTheme,
        TextField,
        InputAdornment,
        Pagination,
        PaginationItem,
        Tooltip,
        Checkbox,
        CircularProgress,
        Tab,
        Tabs,
        Chip,
        Alert,
        Snackbar,
        Link
} from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { MailboxIcon } from '../../components/Icons'
import { styles } from './styles'
import { CustomButton } from '../../components/buttons/CustomButton'
import { CustomTable } from '../../components/table/CustomTable'
import useChecksToMail from '../../API/checks/useChecksToMail'
import useLOBRecords from '../../API/shipping/useLOBRecords'
import useUserCarrierShipments from '../../API/shipping/useUserCarrierShipments'
import usePagination from '../../utils/hooks/usePagination'
import { CancelMailModal } from './components/modals/CancelMailModal'
import { formatUSD } from '../../utils/helper'
import useCancelMailCheck from '../../API/checks/useCancelMailCheck'
import { shippingClient } from '../../API/shipping/shippingClient'

const STATUS_COLORS = {
        Processing: '#EF6C00',
        Submitted: '#058205',
        Mailed: '#1e3a5f',
        Canceled: '#f03d3e',
        Error: '#f03d3e',
}

const PROVIDER_COLORS = { lob: '#1976d2', ups: '#5B3D1E', fedex: '#4D148C' }
const PROVIDER_LABELS = { lob: 'LOB Mail', ups: 'UPS', fedex: 'FedEx' }

const LOBCarriersTab = () => {
        const history = useHistory()
        const { page: lobPage, pageSize } = usePagination()
        const { data: lobData, isLoading: lobLoading } = useLOBRecords({ page: lobPage, pageSize })
        const { data: carrierData, isLoading: carrierLoading } = useUserCarrierShipments({ page: 0, pageSize: 100 })

        const lobRecords = (lobData?.data?.data || lobData?.data || []).map((r) => ({ ...r, _provider: 'lob' }))
        const carrierRecords = (carrierData?.data?.data || carrierData?.data || []).map((r) => ({ ...r, _provider: r.carrier || 'carrier' }))

        const allRecords = [...lobRecords, ...carrierRecords].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )

        const isLoading = lobLoading || carrierLoading

        const getStatusColor = (status) => STATUS_COLORS[status] || '#555'

        const columns = [
                { id: 'provider', label: 'Provider', width: '140px' },
                { id: 'service', label: 'Service', width: '200px' },
                { id: 'status', label: 'Status', width: '150px' },
                { id: 'tracking', label: 'Tracking #', width: '220px' },
                { id: 'charge', label: 'Charged', width: '100px' },
                { id: 'date', label: 'Date', width: '120px' },
        ]

        const renderCell = (row, col) => {
                switch (col.id) {
                        case 'provider': {
                                const color = PROVIDER_COLORS[row._provider] || '#555'
                                const label = PROVIDER_LABELS[row._provider] || row._provider?.toUpperCase()
                                return (
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                {row._provider === 'lob'
                                                        ? <MailOutlineIcon sx={{ fontSize: 16, color }} />
                                                        : <LocalShippingIcon sx={{ fontSize: 16, color }} />}
                                                <Typography fontSize={13} color={color} fontWeight={600}>{label}</Typography>
                                        </Box>
                                )
                        }
                        case 'service':
                                return (
                                        <Typography fontSize={13}>
                                                {row.serviceLevelName || row.mailClass?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || row.serviceLevel || '-'}
                                        </Typography>
                                )
                        case 'status':
                                return (
                                        <Chip
                                                label={row.status}
                                                size="small"
                                                sx={{
                                                        color: getStatusColor(row.status),
                                                        backgroundColor: `${getStatusColor(row.status)}15`,
                                                        border: `1px solid ${getStatusColor(row.status)}`,
                                                        fontWeight: 600,
                                                        fontSize: 12,
                                                }}
                                        />
                                )
                        case 'tracking':
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
                                ) : (
                                        <Typography fontSize={12} color="text.secondary">Pending</Typography>
                                )
                        case 'charge':
                                return formatUSD(row.chargeAmount || 0)
                        case 'date':
                                return new Date(row.createdAt).toLocaleDateString()
                        default:
                                return row[col.id] || '-'
                }
        }

        if (isLoading) {
                return (
                        <Box display="flex" justifyContent="center" my={10}>
                                <CircularProgress size={50} />
                        </Box>
                )
        }

        if (allRecords.length === 0) {
                return (
                        <Box textAlign="center" py={8}>
                                <Typography color="text.secondary">No LOB or carrier shipments found.</Typography>
                        </Box>
                )
        }

        return (
                <CustomTable
                        columns={columns}
                        data={allRecords}
                        renderCell={renderCell}
                        isCenteredCells={true}
                />
        )
}

const AllMails = () => {
        const { page, setPage, pageSize } = usePagination()
        const { mutate: cancelMailChecks, isPending } = useCancelMailCheck()
        const { data, isLoading } = useChecksToMail({ page, pageSize: 10 })
        const [activeTab, setActiveTab] = useState(0)
        const [paymentAlert, setPaymentAlert] = useState(null)
        const finalizeCalledRef = useRef(false)
        const location = useLocation()
        const history = useHistory()

        useEffect(() => {
                const params = new URLSearchParams(location.search)
                const sessionId = params.get('session_id')
                const status = params.get('status')
                const provider = params.get('provider')

                if (!sessionId || finalizeCalledRef.current) return

                if (status === 'false') {
                        setPaymentAlert({ severity: 'warning', message: 'Payment was cancelled. No mail was sent.' })
                        history.replace('/dashboard/all-orders')
                        return
                }

                if (status === 'true' && (provider === 'lob' || provider === 'carrier')) {
                        finalizeCalledRef.current = true
                        const endpoint = provider === 'lob' ? '/lob/finalizePayment' : '/carrier-shipment/finalizePayment'
                        shippingClient.post(endpoint, { sessionId })
                                .then(() => {
                                        setPaymentAlert({ severity: 'success', message: 'Payment confirmed. Your mail has been submitted successfully.' })
                                        setActiveTab(1)
                                })
                                .catch(() => {
                                        setPaymentAlert({ severity: 'error', message: 'Payment was received but mail creation encountered an error. Please contact support.' })
                                })
                                .finally(() => {
                                        history.replace('/dashboard/all-orders')
                                })
                }
        }, [location.search, history])

        const checks = data?.data || []
        const theme = useTheme()
        const [openDialog, setOpenDialog] = useState(false)
        const [selectedChecks, setSelectedChecks] = useState([])
        const [isCheckedAll, setIsCheckedAll] = useState(false)

        useEffect(() => {
                if (checks.length > 0) {
                        setIsCheckedAll(selectedChecks.length === checks.length)
                }
        }, [selectedChecks, checks.length])

        const handleSelectAll = (event) => {
                const checked = event.target.checked
                setIsCheckedAll(checked)
                setSelectedChecks(checked ? checks : [])
        }

        const handleSelectCheck = (checkId) => {
                setSelectedChecks((prev) => {
                        const check = checks.find((c) => c._id === checkId)
                        const isSelected = prev.some((s) => s._id === checkId)
                        return isSelected ? prev.filter((s) => s._id !== checkId) : [...prev, check]
                })
        }

        const handleConfirmCancelMail = () => {
                cancelMailChecks(
                        { checkIds: selectedChecks.map((i) => i._id) },
                        {
                                onSuccess: () => {
                                        setOpenDialog(false)
                                        setSelectedChecks([])
                                }
                        }
                )
        }

        const getStatusColor = (status) => {
                switch (status) {
                        case 'Processing': return '#EF6C00'
                        case 'Submitted': return '#058205'
                        case 'Mailed': return '#1e3a5f'
                        case 'Canceled': return '#f03d3e'
                        default: return theme.palette.text.primary
                }
        }

        const renderHeaderCell = (column) => {
                if (column.id === 'selected') {
                        return (
                                <Checkbox
                                        checked={isCheckedAll}
                                        onChange={handleSelectAll}
                                        sx={styles.checkbox}
                                />
                        )
                }
                return column.label
        }

        const renderCell = (row, column) => {
                switch (column.id) {
                        case 'selected':
                                return (
                                        <Checkbox
                                                checked={selectedChecks.some((c) => c._id === row._id)}
                                                onChange={() => handleSelectCheck(row._id)}
                                                sx={styles.checkbox}
                                        />
                                )
                        case 'status':
                                return (
                                        <CustomButton
                                                size="small"
                                                variant="contained"
                                                sx={{
                                                        width: '200px',
                                                        color: getStatusColor(row.status),
                                                        backgroundColor: `${getStatusColor(row.status)}0D`,
                                                        border: `1px solid ${getStatusColor(row.status)}`,
                                                        '&:hover': {
                                                                backgroundColor: `${getStatusColor(row.status)}1A`,
                                                                border: `1px solid ${getStatusColor(row.status)}`
                                                        }
                                                }}
                                        >
                                                {row.status}
                                        </CustomButton>
                                )
                        case 'name': return row.payee.name
                        case 'amount': return formatUSD(row.check.amount)
                        case 'issuedDate': return new Date(row.check.issuedDate).toDateString()
                        case 'accountNickname': return row.bank.accountNickName
                        case 'checkNumber': return row.check.checkNumber
                        case 'tags': return (Array.isArray(row.check?.tags) ? row.check.tags : []).map((i) => i)
                        default: return row[column.id]
                }
        }

        return (
                <Box sx={styles.wrapper}>
                        <Typography sx={styles.title}>All Mails</Typography>
                        <Typography variant="body1" color="text.secondary" sx={styles.description}>
                                Below is the list of all mails.
                        </Typography>

                        <Tabs
                                value={activeTab}
                                onChange={(_, v) => setActiveTab(v)}
                                sx={{ borderBottom: '1px solid #e0e0e0', mb: 2 }}
                        >
                                <Tab label="PostGrid Mail" />
                                <Tab label="LOB & Carriers" icon={<LocalShippingIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                        </Tabs>

                        {activeTab === 0 && (
                                isLoading ? (
                                        <Box display="flex" justifyContent="center" my={20}>
                                                <CircularProgress size="60px" />
                                        </Box>
                                ) : (
                                        <>
                                                <Box sx={styles.actionContainer}>
                                                        <TextField
                                                                placeholder="Search"
                                                                sx={{ ...styles.searchField, visibility: 'hidden' }}
                                                                InputProps={{
                                                                        startAdornment: (
                                                                                <InputAdornment position="start" sx={styles.searchIconContainer}>
                                                                                        <SearchIcon sx={styles.searchIcon} />
                                                                                </InputAdornment>
                                                                        )
                                                                }}
                                                        />
                                                        <Box>
                                                                <Tooltip
                                                                        title={
                                                                                selectedChecks.some((c) => c.status !== 'Submitted')
                                                                                        ? "One of selected checks are mailed or in processing so they can't be canceled."
                                                                                        : ''
                                                                        }
                                                                        placement="bottom"
                                                                        arrow
                                                                        componentsProps={{
                                                                                tooltip: {
                                                                                        sx: {
                                                                                                bgcolor: '#181D27',
                                                                                                width: '150px',
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                justifyContent: 'center',
                                                                                                fontSize: '12px',
                                                                                                lineHeight: '16px',
                                                                                                padding: '12px 8px',
                                                                                                textAlign: 'center',
                                                                                                '& .MuiTooltip-arrow': { color: '#181D27' }
                                                                                        }
                                                                                }
                                                                        }}
                                                                >
                                                                        <Box sx={styles.actionButtons}>
                                                                                <CustomButton
                                                                                        variant="outlined"
                                                                                        startIcon={<MailboxIcon />}
                                                                                        disabled={
                                                                                                selectedChecks.length === 0 ||
                                                                                                selectedChecks.some((c) => c.status !== 'Submitted')
                                                                                        }
                                                                                        sx={styles.actionCancelButton}
                                                                                        onClick={() => setOpenDialog(true)}
                                                                                >
                                                                                        <Box>Cancel Mail</Box>
                                                                                </CustomButton>
                                                                        </Box>
                                                                </Tooltip>
                                                        </Box>
                                                </Box>

                                                <CustomTable
                                                        columns={[
                                                                { id: 'selected', label: '', width: '40px' },
                                                                { id: 'checkNumber', label: 'Check No.', width: '180px' },
                                                                { id: 'name', label: 'Payee Name', width: '220px' },
                                                                { id: 'amount', label: 'Amount', width: '200px' },
                                                                { id: 'issuedDate', label: 'Issued Date', width: '140px' },
                                                                { id: 'accountNickname', label: 'Account Nickname', width: '140px' },
                                                                { id: 'tags', label: 'Tags', width: '120px' },
                                                                { id: 'status', label: 'Status', width: '120px' }
                                                        ]}
                                                        data={checks}
                                                        renderCell={renderCell}
                                                        renderHeaderCell={renderHeaderCell}
                                                        isCenteredCells={true}
                                                />

                                                <Box sx={{ ...styles.paginationContainer, pointerEvents: isLoading ? 'none' : 'all' }}>
                                                        <Pagination
                                                                count={Math.ceil((data?.totalCount || 1) / pageSize)}
                                                                page={page + 1}
                                                                rowsPerPage={pageSize}
                                                                onChange={(_, value) => setPage(value - 1)}
                                                                renderItem={(item) => (
                                                                        <PaginationItem
                                                                                slots={{ previous: () => 'Previous', next: () => 'Next' }}
                                                                                {...item}
                                                                                sx={styles.paginationItem}
                                                                        />
                                                                )}
                                                                sx={styles.pagination}
                                                        />
                                                </Box>
                                        </>
                                )
                        )}

                        {activeTab === 1 && <LOBCarriersTab />}

                        <CancelMailModal
                                open={openDialog}
                                onClose={() => setOpenDialog(false)}
                                onConfirm={handleConfirmCancelMail}
                                checks={selectedChecks}
                                isLoading={isPending}
                        />

                        <Snackbar
                                open={!!paymentAlert}
                                autoHideDuration={6000}
                                onClose={() => setPaymentAlert(null)}
                                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        >
                                <Alert
                                        onClose={() => setPaymentAlert(null)}
                                        severity={paymentAlert?.severity || 'info'}
                                        sx={{ width: '100%' }}
                                >
                                        {paymentAlert?.message}
                                </Alert>
                        </Snackbar>
                </Box>
        )
}

export default AllMails
