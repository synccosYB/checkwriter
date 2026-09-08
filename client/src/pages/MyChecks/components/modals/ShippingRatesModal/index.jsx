import {
        Box,
        Typography,
        CircularProgress,
        Alert
} from '@mui/material'
import { useState, useEffect } from 'react'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { CustomDialog } from '../../../../../components/shared/dialog/CustomDialog'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import useGetShippingRates from '../../../../../API/shipping/useGetShippingRates'
import useAcceptLOBPayment from '../../../../../API/shipping/useAcceptLOBPayment'
import { formatUSD } from '../../../../../utils/helper'

const LOB_COLOR = '#1976d2'

const FIRST_CLASS_MAIL_CLASS = 'first_class'

export const ShippingRatesModal = ({ open, onClose, checks, addressFrom, addressTo }) => {
        const [selectedRate, setSelectedRate] = useState(null)

        const { mutate: getRates, data: ratesData, isPending: isLoadingRates } = useGetShippingRates()
        const { mutate: acceptLOBPayment, isPending: isLOBPaymentPending } = useAcceptLOBPayment()

        const rates = ratesData?.data?.rates || {}
        const providerErrors = ratesData?.data?.providerErrors || {}
        const lobRates = rates.lob || []

        const checkId = checks?.[0]?._id

        useEffect(() => {
                if (open && checkId) {
                        getRates({
                                checkId,
                                addressFrom,
                                addressTo,
                        })
                }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [open, checkId])

        useEffect(() => {
                if (!open) {
                        setSelectedRate(null)
                }
        }, [open])

        useEffect(() => {
                if (lobRates.length > 0 && !selectedRate) {
                        const firstClass = lobRates.find((r) => r.mailClass === FIRST_CLASS_MAIL_CLASS)
                        setSelectedRate(firstClass || lobRates[0])
                }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [lobRates])

        const handleConfirm = () => {
                if (!selectedRate) return

                const checksDetails = checks.map((check) => ({
                        checkId: check._id,
                        checkNumber: check.checkNumber,
                        payeeName: check.payee?.name || '',
                        mailClass: selectedRate.mailClass,
                        totalAmount: selectedRate.price,
                }))
                acceptLOBPayment(
                        { checksDetails },
                        {
                                onSuccess: (data) => {
                                        if (data?.data) {
                                                window.location.href = data.data
                                        } else {
                                                onClose()
                                        }
                                }
                        }
                )
        }

        const isLoading = isLoadingRates
        const isSubmitting = isLOBPaymentPending

        return (
                <CustomDialog
                        open={open}
                        onClose={onClose}
                        title="Select Mail Class"
                        maxWidth="sm"
                        fullWidth
                        modalIcon={<MailOutlineIcon fontSize="large" color="primary" />}
                        content={
                                <Box>
                                        {isLoading ? (
                                                <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                                                        <CircularProgress />
                                                        <Typography ml={2} color="text.secondary">
                                                                Fetching available rates...
                                                        </Typography>
                                                </Box>
                                        ) : lobRates.length === 0 ? (
                                                <Box>
                                                        {providerErrors.lob ? (
                                                                <Alert severity="error">
                                                                        <strong>Mail (LOB): </strong>{providerErrors.lob}
                                                                </Alert>
                                                        ) : (
                                                                <Alert severity="warning">
                                                                        No mailing options available. Please ensure the payee address is complete.
                                                                </Alert>
                                                        )}
                                                </Box>
                                        ) : (
                                                <Box>
                                                        <Typography variant="body2" color="text.secondary" mb={2}>
                                                                Choose a mail class for your check(s). Prices are flat-rate per check.
                                                        </Typography>

                                                        {lobRates.map((rate) => {
                                                                const isSelected = selectedRate?.mailClass === rate.mailClass
                                                                return (
                                                                        <Box
                                                                                key={rate.mailClass}
                                                                                onClick={() => setSelectedRate(rate)}
                                                                                sx={{
                                                                                        p: 1.5,
                                                                                        mb: 0.75,
                                                                                        borderRadius: 1,
                                                                                        border: `1px solid ${isSelected ? LOB_COLOR : '#e0e0e0'}`,
                                                                                        backgroundColor: isSelected ? `${LOB_COLOR}10` : '#fafafa',
                                                                                        cursor: 'pointer',
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between',
                                                                                        alignItems: 'center',
                                                                                        '&:hover': {
                                                                                                borderColor: LOB_COLOR,
                                                                                                backgroundColor: `${LOB_COLOR}08`
                                                                                        }
                                                                                }}
                                                                        >
                                                                                <Box>
                                                                                        <Typography fontWeight={500} fontSize={14}>
                                                                                                {rate.displayName}
                                                                                        </Typography>
                                                                                        <Typography fontSize={12} color="text.secondary">
                                                                                                Est. {rate.estimatedDays || '?'} business day(s)
                                                                                        </Typography>
                                                                                </Box>
                                                                                <Box textAlign="right">
                                                                                        <Typography fontWeight={700} color={LOB_COLOR}>
                                                                                                {formatUSD(rate.price)}
                                                                                        </Typography>
                                                                                        <Typography fontSize={11} color="text.secondary">
                                                                                                {rate.currency || 'USD'}
                                                                                        </Typography>
                                                                                </Box>
                                                                        </Box>
                                                                )
                                                        })}
                                                </Box>
                                        )}
                                </Box>
                        }
                        actions={
                                <Box display="flex" gap={1} justifyContent="flex-end" width="100%">
                                        <CustomButton variant="outlined" onClick={onClose} disabled={isSubmitting}>
                                                Cancel
                                        </CustomButton>
                                        <CustomButton
                                                variant="contained"
                                                onClick={handleConfirm}
                                                disabled={!selectedRate || isLoading || isSubmitting}
                                                startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
                                        >
                                                {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
                                        </CustomButton>
                                </Box>
                        }
                />
        )
}

export default ShippingRatesModal
