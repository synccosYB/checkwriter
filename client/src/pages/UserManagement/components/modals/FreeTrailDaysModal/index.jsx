import React, { useEffect, useState } from 'react'
import { CustomDialog } from '../../../../../components/dialog/CustomDialog'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import {
        Box,
        Button,
        TextField,
        Typography,
        Popover,
        CircularProgress
} from '@mui/material'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format, addDays, differenceInDays } from 'date-fns'
import { styles } from '../../../styles'
import { getDaysUntilExpiration } from '../../../../../utils/helper'
import useUpdateTrialEndDate from '../../../../../API/admin/useUpdateTrialEndDate'

export const FreeTrailDaysModal = ({ open, onClose, user }) => {
        const { mutate: updateTrialEndDate, isPending } = useUpdateTrialEndDate()
        const [freeTrailDays, setFreeTrailDays] = useState(
                user?.subscriptionInfo?.trialEndsAt
                        ? getDaysUntilExpiration(user?.subscriptionInfo?.trialEndsAt)
                        : ''
        )
        const [endDate, setEndDate] = useState(null)
        const [anchorEl, setAnchorEl] = useState(null)

        const [error, setError] = useState('')

        useEffect(() => {
                setFreeTrailDays(
                        user?.subscriptionInfo?.trialEndsAt
                                ? getDaysUntilExpiration(user?.subscriptionInfo?.trialEndsAt)
                                : ''
                )
                // If user has free trial days, calculate the end date
                if (user?.subscriptionInfo?.trialEndsAt) {
                        setEndDate(
                                addDays(
                                        new Date(),
                                        getDaysUntilExpiration(user?.subscriptionInfo?.trialEndsAt)
                                )
                        )
                }
        }, [user])

        // Update end date when free trial days change
        const handleDaysChange = (e) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                setFreeTrailDays(value)

                if (value && !isNaN(parseInt(value))) {
                        const days = parseInt(value)
                        setEndDate(addDays(new Date(), days))
                } else {
                        setEndDate(null)
                }
        }

        // Update free trial days when end date changes
        const handleDateChange = (newDate) => {
                if (newDate) {
                        newDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                }
                setEndDate(newDate)

                if (newDate) {
                        let today = new Date()
                        today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                        const daysDiff = differenceInDays(newDate, today)
                        setFreeTrailDays(daysDiff > 0 ? daysDiff.toString() : '0')
                }

                handleDateClose()
        }

        const handleSave = () => {
                updateTrialEndDate(
                        {
                                userId: user._id,
                                trialEndDate: new Date(endDate).toISOString()
                        },
                        {
                                onSuccess: () => {
                                        onClose()
                                },
                                onError: (error) => {
                                        const data = error?.response?.data
                                        if (data?.code === 'NO_STRIPE_CUSTOMER') {
                                                setError(
                                                        "This user doesn't have a Stripe account yet, so a free trial can't be set up for them. They need to sign up for a plan first."
                                                )
                                        } else {
                                                setError(
                                                        data?.error ||
                                                                'Something went wrong while updating the trial. Please try again.'
                                                )
                                        }
                                }
                        }
                )
        }

        const handleDateClick = (event) => {
                setAnchorEl(event.currentTarget)
        }

        const handleDateClose = () => {
                setAnchorEl(null)
        }

        const openDatePicker = Boolean(anchorEl)

        return (
                <CustomDialog
                        open={open}
                        onClose={onClose}
                        width={685}
                        title={
                                user?.freeTrailDays ? 'Edit Free Trail Days' : 'Add Free Trail Days'
                        }
                        content={
                                <Box>
                                        <Typography sx={styles.lable}>Free Trail days</Typography>
                                        <TextField
                                                fullWidth
                                                name="days"
                                                placeholder="Days"
                                                value={freeTrailDays}
                                                onChange={handleDaysChange}
                                                type="text"
                                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                                sx={{ ...styles.input, width: '300px', mb: 1 }}
                                        />

                                        <Typography sx={{ color: '#00000099', display: 'flex', gap: 1 }}>
                                                End
                                                <Typography
                                                        onClick={handleDateClick}
                                                        sx={{
                                                                textDecorationLine: 'underline',
                                                                fontWeight: '600',
                                                                color: '#1e3a5f',
                                                                cursor: 'pointer'
                                                        }}
                                                >
                                                        {endDate ? format(endDate, 'MMM dd, yyyy') : 'Date'}
                                                </Typography>
                                        </Typography>

                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <Popover
                                                        open={openDatePicker}
                                                        anchorEl={anchorEl}
                                                        onClose={handleDateClose}
                                                        anchorOrigin={{
                                                                vertical: 'bottom',
                                                                horizontal: 'left'
                                                        }}
                                                        transformOrigin={{
                                                                vertical: 'top',
                                                                horizontal: 'left'
                                                        }}
                                                >
                                                        <StaticDatePicker
                                                                displayStaticWrapperAs="desktop"
                                                                value={endDate}
                                                                onChange={handleDateChange}
                                                                renderInput={() => null}
                                                                minDate={new Date()}
                                                        />
                                                </Popover>
                                        </LocalizationProvider>
                                        {error && (
                                                <Box>
                                                        <Typography color={'red'}>{error}</Typography>
                                                </Box>
                                        )}
                                </Box>
                        }
                        actions={
                                <>
                                        <Button onClick={onClose} variant="outlined" sx={styles.cancelButton}>
                                                Cancel
                                        </Button>
                                        <CustomButton
                                                disabled={isPending}
                                                variant="outlined"
                                                color="primary"
                                                onClick={handleSave}
                                                endIcon={isPending && <CircularProgress size={'14px'} />}
                                        >
                                                Save Edit
                                        </CustomButton>
                                </>
                        }
                />
        )
}
