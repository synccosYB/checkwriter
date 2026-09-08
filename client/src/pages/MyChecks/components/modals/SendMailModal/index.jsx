import {
        Box,
        Typography,
        Button,
        Checkbox,
        useTheme,
        CircularProgress,
        FormControl,
        RadioGroup,
        FormControlLabel,
        Radio,
        Link,
        TextField,
        IconButton,
        Collapse
} from '@mui/material'
import { useEffect, useState } from 'react'

import { styles } from './styles'
import { Link as RouterLink } from 'react-router-dom/cjs/react-router-dom.min'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import EditIcon from '@mui/icons-material/Edit'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { CustomDialog } from '../../../../../components/shared/dialog/CustomDialog'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { CustomTable } from '../../../../../components/table/CustomTable'
import useSubmitMailChecks from '../../../../../API/checks/useSubmitMailChecks'
import { formatUSD, getPaymentMethodIcon } from '../../../../../utils/helper'
import { CHECK_STATUS } from '../../../../../types/check.types'
import useMailedStatus from '../../../../../API/admin/useMailedStatus'
import dayjs from 'dayjs'
import useListPaymentMethods from '../../../../../API/users/useListPaymentMethods'
import useGenerateStripePortalLink from '../../../../../API/stripe/useGenerateStripePortalLink'
import useUserInfo from '../../../../../API/users/useUserInfo'

const US_STATES = [
        'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
        'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
        'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
        'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
        'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
        'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
        'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
        'Wisconsin','Wyoming'
]

const AddressEditor = ({ checkId, payeeAddress, payeeName, customAddresses, setCustomAddresses }) => {
        const [editing, setEditing] = useState(false)
        const current = customAddresses[checkId]
        const addr = current || payeeAddress || {}

        const displayAddr = [
                addr.name || payeeName || '',
                addr.addressLine1,
                addr.addressLine2,
                [addr.city, addr.state, addr.zip || addr.zipCode].filter(Boolean).join(', ')
        ].filter(Boolean).join(', ')

        const handleChange = (field, value) => {
                setCustomAddresses((prev) => ({
                        ...prev,
                        [checkId]: {
                                name: addr.name || payeeName || '',
                                addressLine1: addr.addressLine1 || '',
                                addressLine2: addr.addressLine2 || '',
                                city: addr.city || '',
                                state: addr.state || '',
                                zip: addr.zip || addr.zipCode || '',
                                country: addr.country || 'US',
                                ...prev[checkId],
                                [field]: value
                        }
                }))
        }

        const handleReset = () => {
                setCustomAddresses((prev) => {
                        const next = { ...prev }
                        delete next[checkId]
                        return next
                })
                setEditing(false)
        }

        return (
                <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography sx={{ fontSize: '13px', color: '#555', flex: 1 }}>
                                        {displayAddr || 'No address on file'}
                                </Typography>
                                <IconButton size="small" onClick={() => setEditing(!editing)} sx={{ color: '#1e3a5f' }}>
                                        <EditIcon fontSize="small" />
                                </IconButton>
                        </Box>
                        <Collapse in={editing}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, p: 1.5, borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #e5e7eb' }}>
                                        <TextField
                                                size="small"
                                                label="Recipient Name"
                                                value={current?.name ?? (payeeAddress?.name || payeeName || '')}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                fullWidth
                                        />
                                        <TextField
                                                size="small"
                                                label="Address Line 1"
                                                value={current?.addressLine1 ?? (payeeAddress?.addressLine1 || '')}
                                                onChange={(e) => handleChange('addressLine1', e.target.value)}
                                                fullWidth
                                        />
                                        <TextField
                                                size="small"
                                                label="Address Line 2"
                                                value={current?.addressLine2 ?? (payeeAddress?.addressLine2 || '')}
                                                onChange={(e) => handleChange('addressLine2', e.target.value)}
                                                fullWidth
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                <TextField
                                                        size="small"
                                                        label="City"
                                                        value={current?.city ?? (payeeAddress?.city || '')}
                                                        onChange={(e) => handleChange('city', e.target.value)}
                                                        sx={{ flex: 1 }}
                                                />
                                                <TextField
                                                        size="small"
                                                        label="State"
                                                        value={current?.state ?? (payeeAddress?.state || '')}
                                                        onChange={(e) => handleChange('state', e.target.value)}
                                                        sx={{ flex: 1 }}
                                                />
                                                <TextField
                                                        size="small"
                                                        label="ZIP"
                                                        value={current?.zip ?? (payeeAddress?.zip || payeeAddress?.zipCode || '')}
                                                        onChange={(e) => handleChange('zip', e.target.value)}
                                                        sx={{ width: '100px' }}
                                                />
                                        </Box>
                                        {current && (
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Button size="small" onClick={handleReset} sx={{ textTransform: 'none', fontSize: '12px' }}>
                                                                Reset to payee address
                                                        </Button>
                                                </Box>
                                        )}
                                </Box>
                        </Collapse>
                </Box>
        )
}

export const SendMailModal = ({ open, onClose, checks }) => {
        const { mutate: sendChecksToMail, isPending } = useSubmitMailChecks()
        const { data: paymentMethodsResponse } = useListPaymentMethods()
        const paymentMethods = paymentMethodsResponse?.paymentMethods || [];
        const { mutate, data } = useMailedStatus()
        const theme = useTheme()
        const [step, setStep] = useState(0)
        const [isCheckedAll, setIsCheckedAll] = useState(true)
        const [selectedChecks, setSelectedChecks] = useState(checks)
        const [totalChecks, setTotalChecks] = useState([])
        const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
        const [customAddresses, setCustomAddresses] = useState({})

        const { data:user } = useUserInfo()
        const { mutate: getStripeUrl } = useGenerateStripePortalLink()

        const userId = user?._id

        const nonSubmittedChecks = data?.alreadyRequested
                ? checks.filter(
                                (c) =>
                                        !data.alreadyRequested.some(
                                                (requestedCheck) => requestedCheck.checkId === c._id
                                        )
                  ).length
                : 0
        const handleSelectAll = (event) => {
                const checked = event.target.checked
                setIsCheckedAll(checked)

                if (checked) {
                        setSelectedChecks(totalChecks)
                } else {
                        setSelectedChecks([])
                }
        }

        useEffect(() => {
                if (paymentMethods && paymentMethods.length > 0) {
                        const defaultMethod =
                                paymentMethods.find((method) => method.isDefault) || paymentMethods[0]
                        setSelectedPaymentMethod(defaultMethod)
                }
        }, [paymentMethods])

        const handleSelectCheck = (checkId) => {
                if (!totalChecks) return
                setSelectedChecks((prev) => {
                        const check = totalChecks.find((c) => c._id === checkId)
                        const isSelected = prev.some(
                                (selectedCheck) => selectedCheck?._id === checkId
                        )

                        if (isSelected) {
                                return prev.filter((selectedCheck) => selectedCheck._id !== checkId)
                        } else {
                                return [...prev, check]
                        }
                })
        }

        useEffect(() => {
                if (!totalChecks) return
                if (totalChecks.length > 0) {
                        setIsCheckedAll(selectedChecks.length === totalChecks.length)
                }
        }, [selectedChecks, totalChecks])

        useEffect(() => {
                if (open) {
                        const checkIds = checks.map((check) => check._id)
                        mutate(
                                { checkIds: checkIds },
                                {
                                        onSuccess: (data) => {
                                                if (data.alreadyRequested.length > 0) {
                                                        const alreadyRequestChecks = checks.filter((check) => {
                                                                const checkId = check._id
                                                                const isAlreadyRequested = data.alreadyRequested.some(
                                                                        (requestedCheck) => requestedCheck.checkId === checkId
                                                                )
                                                                if (isAlreadyRequested) {
                                                                        return true
                                                                }
                                                                return false
                                                        })
                                                        setTotalChecks(alreadyRequestChecks)
                                                        setStep(0)
                                                } else {
                                                        setTotalChecks(checks)
                                                        setStep(1)
                                                }
                                        }
                                }
                        )
                }
        }, [checks, open, mutate])

        useEffect(() => {
                if (open) {
                        setSelectedChecks(totalChecks)
                }
        }, [open, totalChecks])

        const handleNext = () => {
                if (step === 0) {
                        setStep(1)
                        const newTotalChecks = checks.filter(
                                (c) =>
                                        c.status !== CHECK_STATUS.MAILED ||
                                        selectedChecks.find((s) => s._id === c._id)
                        )
                        setTotalChecks(newTotalChecks)
                        setIsCheckedAll(true)
                        setSelectedChecks(newTotalChecks)
                } else if (step === 1) {
                        for (const [checkId, addr] of Object.entries(customAddresses)) {
                                if (!addr.addressLine1?.trim() || !addr.city?.trim() || !addr.state?.trim() || !addr.zip?.toString().trim()) {
                                        return
                                }
                        }
                        setStep(2)
                } else {
                        const addrPayload = Object.keys(customAddresses).length > 0 ? customAddresses : undefined
                        sendChecksToMail(
                                {
                                        checkIds: selectedChecks?.map((i) => i._id),
                                        paymentMethodId: selectedPaymentMethod?.id,
                                        customAddresses: addrPayload
                                },
                                { onSuccess: () => onClose() }
                        )
                }
        }

        const getStatusColor = (status) => {
                switch (status) {
                        case 'Mailed':
                                return '#B31F0D'
                        case 'Submitted':
                                return '#058205'
                        case 'Printed':
                                return '#1e3a5f'
                        default:
                                return theme.palette.text.primary
                }
        }

        const renderHeaderCell = (column) => {
                switch (column.id) {
                        case 'selected':
                                return (
                                        <Checkbox
                                                checked={isCheckedAll}
                                                onChange={handleSelectAll}
                                                sx={styles.checkbox}
                                        />
                                )
                        default:
                                return column.label
                }
        }
        const renderCell = (row, column) => {
                if (row.no < 0) {
                        if (column.id === 'fee') {
                                return (
                                        <Box display={'flex'} justifyContent="center" width="100%" gap={1}>
                                                <Typography>Total: </Typography>
                                                <Typography sx={{ color: '#1e3a5f', fontWeight: '600' }}>
                                                        {formatUSD(row.fee)}
                                                </Typography>
                                        </Box>
                                )
                        } else if (column.id === 'amount') {
                                return (
                                        <Box display={'flex'} justifyContent="center" width="100%" gap={1}>
                                                <Typography>Total: </Typography>
                                                <Typography sx={{ color: '#1e3a5f', fontWeight: '600' }}>
                                                        {formatUSD(row.amount)}
                                                </Typography>
                                        </Box>
                                )
                        } else {
                                return null
                        }
                }
                switch (column.id) {
                        case 'mailedDate':
                                return dayjs(
                                        data?.alreadyRequested?.find((c) => c.checkId === row._id)?.requestedAt
                                ).format('MM/DD/YYYY')
                        case 'selected':
                                return (
                                        <Checkbox
                                                checked={selectedChecks.some((check) => check._id === row._id)}
                                                onChange={() => handleSelectCheck(row._id)}
                                                sx={styles.checkbox}
                                        />
                                )
                        case 'status':
                                return (
                                        <CustomButton
                                                size="small"
                                                sx={{
                                                        width: '100px',
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
                        case 'payee':
                                return <Box>{row?.payee.name}</Box>
                        case 'issuedDate':
                                return <Box>{new Date(row?.issuedDate).toDateString()}</Box>
                        case 'amount':
                                return <Box sx={{ textAlign: 'center' }}>{formatUSD(row.amount)}</Box>
                        case 'fee':
                                return <Box sx={{ width: '100%', textAlign: 'center' }}>$1.59</Box>
                        default:
                                return row[column.id]
                }
        }

        const handleOnClose = () => {
                setStep(0)
                setSelectedChecks([])
                setTotalChecks([])
                setIsCheckedAll(false)
                setCustomAddresses({})
                onClose()
        }

        const handleManageSubscription = () => {
                getStripeUrl(
                        { userId },
                        {
                                onSuccess: (data) => {
                                        window.location.replace(data?.url)
                                }
                        }
                )
        }

        const getStepTitle = () => {
                if (step === 0) return 'Check Already Mailed'
                if (step === 1) return 'Confirm Mailing Addresses'
                return 'Confirm Check Mailing'
        }

        const getStepIcon = () => {
                if (step === 0) return <WarningRoundedIcon fontSize="36px" color="warning" />
                if (step === 1) return <LocalShippingRoundedIcon fontSize="36px" color="primary" />
                return <CheckCircleRoundedIcon fontSize="36px" color="success" />
        }

        const renderAddressStep = () => (
                <Box sx={styles.section}>
                        <Typography sx={styles.description}>
                                Review the mailing address for each check. Click the edit icon to change the destination.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                {selectedChecks.map((check) => (
                                        <Box
                                                key={check._id}
                                                sx={{
                                                        p: 2,
                                                        borderRadius: '8px',
                                                        border: customAddresses[check._id] ? '1px solid #1e3a5f' : '1px solid #e5e7eb',
                                                        backgroundColor: customAddresses[check._id] ? 'rgba(30,58,95,0.03)' : '#fff'
                                                }}
                                        >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
                                                                Check #{check.checkNumber} — {check?.payee?.name}
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#1e3a5f' }}>
                                                                {formatUSD(check.amount)}
                                                        </Typography>
                                                </Box>
                                                {customAddresses[check._id] && (
                                                        <Typography sx={{ fontSize: '11px', color: '#1e3a5f', fontWeight: 500, mb: 0.5 }}>
                                                                Custom address
                                                        </Typography>
                                                )}
                                                <AddressEditor
                                                        checkId={check._id}
                                                        payeeAddress={check?.payee?.address}
                                                        payeeName={check?.payee?.name}
                                                        customAddresses={customAddresses}
                                                        setCustomAddresses={setCustomAddresses}
                                                />
                                        </Box>
                                ))}
                        </Box>
                </Box>
        )

        return (
                <CustomDialog
                        open={open}
                        onClose={handleOnClose}
                        sx={styles.mailModal}
                        title={getStepTitle()}
                        modalIcon={getStepIcon()}
                        size={'lg'}
                        content={
                                <Box sx={styles.content}>
                                        <Box sx={styles.section}>
                                                {step === 0 && (
                                                        <>
                                                                <Typography sx={styles.description}>
                                                                        This selected check was previously mailed. Mailing it again may result in duplicate charges.
                                                                </Typography>
                                                                <Box
                                                                        sx={{
                                                                                width: '100%',
                                                                                overflowX: 'auto',
                                                                                '& .MuiTableContainer-root': {
                                                                                        minWidth: { xs: '100%', sm: '600px' }
                                                                                }
                                                                        }}
                                                                >
                                                                        <CustomTable
                                                                                columns={[
                                                                                        {
                                                                                                id: 'selected',
                                                                                                label: '',
                                                                                                width: { xs: '30px', sm: '40px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'checkNumber',
                                                                                                label: 'Check No.',
                                                                                                width: { xs: '50px', sm: '60px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'payee',
                                                                                                label: 'Payee Name',
                                                                                                width: { xs: '100px', sm: '120px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'mailedDate',
                                                                                                label: 'Mailed Date',
                                                                                                width: { xs: '90px', sm: '100px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'status',
                                                                                                label: 'Status',
                                                                                                width: { xs: '60px', sm: '70px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'amount',
                                                                                                label: 'Check Amount',
                                                                                                width: { xs: '120px', sm: '120px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'fee',
                                                                                                label: 'Mailing Fee',
                                                                                                width: { xs: '100px', sm: '120px' }
                                                                                        }
                                                                                ]}
                                                                                data={totalChecks}
                                                                                renderCell={renderCell}
                                                                                renderHeaderCell={renderHeaderCell}
                                                                                isCenteredCells={true}
                                                                                sx={{
                                                                                        '& .MuiTableCell-root': {
                                                                                                padding: { xs: '8px 4px', sm: '16px' },
                                                                                                fontSize: { xs: '12px', sm: '14px' }
                                                                                        },
                                                                                        '& .MuiTableHead-root .MuiTableCell-root': {
                                                                                                fontWeight: { xs: '500', sm: '600' }
                                                                                        }
                                                                                }}
                                                                        />
                                                                </Box>
                                                                <Typography
                                                                        sx={{
                                                                                ...styles.description,
                                                                                fontSize: { xs: '12px', sm: '14px' },
                                                                                mt: { xs: 1, sm: 2 }
                                                                        }}
                                                                >
                                                                        * If you proceed, an additional mailing charge will be applied
                                                                </Typography>
                                                        </>
                                                )}

                                                {step === 1 && renderAddressStep()}

                                                {step === 2 && (
                                                        <>
                                                                <Typography sx={styles.description}>
                                                                        {`You have selected ${selectedChecks.length} check${selectedChecks.length !== 1 ? 's' : ''} for mailing.`}
                                                                </Typography>
                                                                <Box
                                                                        sx={{
                                                                                width: '100%',
                                                                                overflowX: 'auto',
                                                                                '& .MuiTableContainer-root': {
                                                                                        minWidth: { xs: '100%', sm: '600px' }
                                                                                }
                                                                        }}
                                                                >
                                                                        <CustomTable
                                                                                columns={[
                                                                                        {
                                                                                                id: 'selected',
                                                                                                label: '',
                                                                                                width: { xs: '30px', sm: '40px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'checkNumber',
                                                                                                label: 'Check No.',
                                                                                                width: { xs: '50px', sm: '60px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'payee',
                                                                                                label: 'Payee Name',
                                                                                                width: { xs: '100px', sm: '120px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'issuedDate',
                                                                                                label: 'Issued Date',
                                                                                                width: { xs: '90px', sm: '100px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'amount',
                                                                                                label: 'Check Amount',
                                                                                                width: { xs: '120px', sm: '120px' }
                                                                                        },
                                                                                        {
                                                                                                id: 'fee',
                                                                                                label: 'Mailing Fee',
                                                                                                width: { xs: '100px', sm: '120px' }
                                                                                        }
                                                                                ]}
                                                                                data={[
                                                                                        ...totalChecks,
                                                                                        {
                                                                                                id: -1,
                                                                                                no: -1,
                                                                                                fee: selectedChecks.length * 1.59,
                                                                                                amount: selectedChecks.reduce(
                                                                                                        (acc, check) => acc + check.amount,
                                                                                                        0
                                                                                                )
                                                                                        }
                                                                                ]}
                                                                                renderCell={renderCell}
                                                                                renderHeaderCell={renderHeaderCell}
                                                                                isCenteredCells={true}
                                                                                sx={{
                                                                                        '& .MuiTableCell-root': {
                                                                                                padding: { xs: '8px 4px', sm: '16px' },
                                                                                                fontSize: { xs: '12px', sm: '14px' }
                                                                                        },
                                                                                        '& .MuiTableHead-root .MuiTableCell-root': {
                                                                                                fontWeight: { xs: '500', sm: '600' }
                                                                                        }
                                                                                }}
                                                                        />
                                                                </Box>
                                                                <Typography
                                                                        sx={{
                                                                                ...styles.description,
                                                                                fontSize: { xs: '12px', sm: '14px' },
                                                                                mt: { xs: 1, sm: 2 }
                                                                        }}
                                                                >
                                                                        {`* ${
                                                                                !paymentMethods?.length
                                                                                        ? 'Please add a payment method from your account settings to proceed.'
                                                                                        : 'A mailing fee of $1.59 per check will be applied to your selected payment method.'
                                                                        }`}
                                                                </Typography>
                                                                {paymentMethods && paymentMethods.length ? (
                                                                        <Box
                                                                                sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}
                                                                        >
                                                                                <Box display="flex" justifyContent="space-between">
                                                                                        <Typography sx={{ fontWeight: 600, fontSize: '20px' }}>
                                                                                                Select Payment Method:
                                                                                        </Typography>
                                                                                        <Link
                                                                                                onClick={handleManageSubscription}
                                                                                                fontWeight={500}
                                                                                                sx={{cursor: 'pointer'}}
                                                                                        >
                                                                                                Manage Payment Methods
                                                                                        </Link>
                                                                                </Box>

                                                                                <FormControl component="fieldset" sx={{ width: '100%', mt: 1 }}>
                                                                                        <RadioGroup
                                                                                                value={selectedPaymentMethod?.id ?? ''}
                                                                                                onChange={(e) => {
                                                                                                        const next =
                                                                                                                paymentMethods.find((pm) => pm.id === e.target.value) ||
                                                                                                                null
                                                                                                        setSelectedPaymentMethod(next)
                                                                                                }}
                                                                                                aria-label="User payment method"
                                                                                        >
                                                                                                {paymentMethods.map((method) => (
                                                                                                        <FormControlLabel
                                                                                                                key={method.id}
                                                                                                                value={method.id}
                                                                                                                control={<Radio />}
                                                                                                                label={
                                                                                                                        <Box sx={styles.paymentContent}>
                                                                                                                                <Box sx={styles.paymentIcon}>
                                                                                                                                        <img
                                                                                                                                                src={getPaymentMethodIcon(method.brand)}
                                                                                                                                                alt={method.brand}
                                                                                                                                        />
                                                                                                                                </Box>
                                                                                                                                <Box>
                                                                                                                                        <Typography sx={styles.paymentMethodName}>
                                                                                                                                                {method.brand.charAt(0).toUpperCase() +
                                                                                                                                                        method.brand.slice(1)}{' '}
                                                                                                                                                ending in {method.last4}
                                                                                                                                        </Typography>
                                                                                                                                        <Typography sx={styles.paymentMethodDetail}>
                                                                                                                                                •••• •••• •••• {method.last4} • Exp:{' '}
                                                                                                                                                {method.exp_month}/{method.exp_year}
                                                                                                                                        </Typography>
                                                                                                                                </Box>
                                                                                                                        </Box>
                                                                                                                }
                                                                                                                sx={{
                                                                                                                        display: 'flex',
                                                                                                                        m: 0,
                                                                                                                        px: 2,
                                                                                                                        py: 1.5,
                                                                                                                        alignItems: 'center',
                                                                                                                        justifyContent: 'space-between',
                                                                                                                        width: '100%',
                                                                                                                        cursor: 'pointer',
                                                                                                                        mb: '12px',
                                                                                                                        borderRadius: '8px',
                                                                                                                        border:
                                                                                                                                selectedPaymentMethod?.id === method.id
                                                                                                                                        ? '1px solid #1e3a5f'
                                                                                                                                        : '1px solid rgba(0,0,0,0.12)',
                                                                                                                        '&:hover': {
                                                                                                                                backgroundColor:
                                                                                                                                        selectedPaymentMethod?.id === method.id
                                                                                                                                                ? 'rgba(32,68,100,0.10)'
                                                                                                                                                : 'rgba(0,0,0,0.02)'
                                                                                                                        },
                                                                                                                        '& .MuiFormControlLabel-label': { flex: 1 }
                                                                                                                }}
                                                                                                                labelPlacement="start"
                                                                                                        />
                                                                                                ))}
                                                                                        </RadioGroup>
                                                                                </FormControl>
                                                                        </Box>
                                                                ) : null}
                                                        </>
                                                )}
                                        </Box>
                                </Box>
                        }
                        actions={
                                <Box
                                        sx={{
                                                display: 'flex',
                                                gap: { xs: 1, sm: 2 },
                                                width: '100%',
                                                justifyContent: 'flex-end'
                                        }}
                                >
                                        {step === 2 && (
                                                <Button
                                                        onClick={() => setStep(1)}
                                                        sx={{
                                                                ...styles.cancelButton,
                                                                minWidth: { xs: '80px', sm: '100px' },
                                                                fontSize: { xs: '12px', sm: '14px' }
                                                        }}
                                                >
                                                        Back
                                                </Button>
                                        )}
                                        <Button
                                                onClick={handleOnClose}
                                                sx={{
                                                        ...styles.cancelButton,
                                                        minWidth: { xs: '80px', sm: '100px' },
                                                        fontSize: { xs: '12px', sm: '14px' }
                                                }}
                                        >
                                                Cancel
                                        </Button>
                                        <CustomButton
                                                onClick={handleNext}
                                                variant="filled"
                                                color="primary"
                                                sx={{
                                                        ...styles.nextButton,
                                                        minWidth: { xs: '80px', sm: '100px' },
                                                        fontSize: { xs: '12px', sm: '14px' }
                                                }}
                                                disabled={
                                                        step === 0
                                                                ? selectedChecks.length === 0 && nonSubmittedChecks === 0
                                                                : step === 2
                                                                ? selectedChecks.length === 0 || !paymentMethods?.length
                                                                : selectedChecks.length === 0
                                                }
                                                endIcon={isPending && <CircularProgress size={'14px'} />}
                                        >
                                                {step === 0 ? 'Continue' : step === 1 ? 'Next' : 'Confirm'}
                                        </CustomButton>
                                </Box>
                        }
                />
        )
}
