import React, { useState, useCallback } from 'react'
import {
        Box,
        Typography,
        TextField,
        Select,
        MenuItem,
        Radio,
        Switch,
        Tooltip,
        Icon,
        Paper,
        List,
        ListItemButton,
        ListItemText,
        CircularProgress,
        InputAdornment,
        ClickAwayListener
} from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { styles } from '../../styles'
import { SignaturePad } from '../../../../../../components/signaturePad/index'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import useUserInfo from '../../../../../../API/users/useUserInfo'
import { BankAutoFillContext, useAutoFillContext } from '../../../context/BankAutoFillContext'

export const accountTypes = [
        {
                key: 'Checking account',
                value: 'CHECKING'
        },
        {
                key: 'Savings account',
                value: 'SAVINGS'
        },
        {
                key: 'Money market account',
                value: 'MONEY MARKET'
        },
        {
                key: 'Certificate of deposit (CD)',
                value: 'CERTIFICATE OF DEPOSIT'
        },
        {
                key: 'Business account',
                value: 'BUSINESS'
        },
        {
                key: 'Joint account',
                value: 'JOINT'
        },
        {
                key: 'Trust account',
                value: 'TRUST'
        }
]

const getInitialValues = (bankData, defaultSignature) => {
        return {
                bankName: bankData?.bankName || '',
                accountName: bankData?.accountNickName || '',
                accountNumber: bankData?.accountNumber || '',
                bankRoutingNumber: bankData?.bankRoutingNumber || '',
                confirmRoutingNumber: bankData?.bankRoutingNumber || '',
                confirmAccountNumber: bankData?.accountNumber || '',
                accountNickName: bankData?.accountNickName || '',
                accountType: bankData?.accountType || '',
                country: 'USA',
                bankAddress1: bankData?.bankAddress1 || '',
                bankCity: bankData?.bankCity || '',
                bankState: bankData?.bankState || '',
                bankZip: bankData?.bankZip || '',
                bankPhone: bankData?.bankPhone || '',
                bankPreferences: {
                        checkNoGeneration: bankData?.bankPreferences?.checkNoGeneration,
                        defaultCheckNumberLength:
                                bankData?.bankPreferences?.defaultCheckNumberLength || 6,
                        defaultCheckStartNumber:
                                bankData?.bankPreferences?.defaultCheckStartNumber || '',
                        lastUsedCheckNumber: bankData?.bankPreferences?.lastUsedCheckNumber || '',
                        signatureUrl:
                                bankData?.bankPreferences?.signatureUrl || defaultSignature || '',
                        signatureEnabled: bankData?.bankPreferences?.signatureEnabled || false
                }
        }
}

const BankLogoDisplay = ({ logoUrl }) => {
        const [imgError, setImgError] = useState(false)

        if (!logoUrl || imgError) {
                return (
                        <Box sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '8px',
                                backgroundColor: '#F3F4F6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                        }}>
                                <AccountBalanceIcon sx={{ color: '#9CA3AF', fontSize: 24 }} />
                        </Box>
                )
        }

        return (
                <Box
                        component="img"
                        src={logoUrl}
                        alt="Bank logo"
                        onError={() => setImgError(true)}
                        sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '8px',
                                objectFit: 'contain',
                                flexShrink: 0,
                        }}
                />
        )
}

const BankNameAutocomplete = ({ value, onChange, onBlur, error, helperText }) => {
        const { searchResults, isSearching, searchError, handleSelectBank, setSearchTerm, searchTerm } = useAutoFillContext()
        const [showDropdown, setShowDropdown] = useState(false)

        const handleInputChange = useCallback((e) => {
                const val = e.target.value
                onChange(e)
                setSearchTerm(val)
                setShowDropdown(val.length >= 2)
        }, [onChange, setSearchTerm])

        const handleSelect = useCallback((bank) => {
                handleSelectBank(bank)
                setShowDropdown(false)
        }, [handleSelectBank])

        return (
                <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
                        <Box sx={{ position: 'relative' }}>
                                <TextField
                                        fullWidth
                                        name="bankName"
                                        placeholder="JP Morgan Chase"
                                        value={value}
                                        onChange={handleInputChange}
                                        onBlur={onBlur}
                                        onFocus={() => {
                                                if (searchTerm.length >= 2 && searchResults.length > 0) {
                                                        setShowDropdown(true)
                                                }
                                        }}
                                        error={error}
                                        helperText={helperText}
                                        sx={styles.input}
                                        InputProps={{
                                                endAdornment: isSearching ? (
                                                        <InputAdornment position="end">
                                                                <CircularProgress size={18} />
                                                        </InputAdornment>
                                                ) : null
                                        }}
                                />
                                {showDropdown && searchResults.length > 0 && (
                                        <Paper sx={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                zIndex: 1300,
                                                maxHeight: 240,
                                                overflow: 'auto',
                                                mt: 0.5,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                borderRadius: '8px',
                                        }}>
                                                <List dense disablePadding>
                                                        {searchResults.map((bank, idx) => (
                                                                <ListItemButton
                                                                        key={`${bank.routingNumber}-${idx}`}
                                                                        onClick={() => handleSelect(bank)}
                                                                        sx={{ py: 1, px: 2 }}
                                                                >
                                                                        <ListItemText
                                                                                primary={bank.bankName}
                                                                                secondary={
                                                                                        [bank.routingNumber, bank.city, bank.state]
                                                                                                .filter(Boolean)
                                                                                                .join(' \u00B7 ')
                                                                                }
                                                                                primaryTypographyProps={{ fontSize: '14px', fontWeight: 500 }}
                                                                                secondaryTypographyProps={{ fontSize: '12px', color: '#6B7280' }}
                                                                        />
                                                                </ListItemButton>
                                                        ))}
                                                </List>
                                        </Paper>
                                )}
                                {searchError && searchTerm.length >= 2 && (
                                        <Typography sx={{ fontSize: '12px', color: '#6B7280', mt: 0.5 }}>
                                                Unable to search banks. Please enter the bank name manually.
                                        </Typography>
                                )}
                        </Box>
                </ClickAwayListener>
        )
}

const FormContent = ({ values, errors, touched, handleChange, handleBlur, setFieldValue, apiErrors, signature }) => {
        const { isLookingUp, notFound, lookupError, bankLogoUrl } = useAutoFillContext()

        return (
                <Box sx={styles.formContainer}>
                        <Box sx={styles.groupContainer}>
                                <Box sx={styles.inputGroup}>
                                        <Typography sx={styles.inputLabel}>
                                                Routing Number*
                                        </Typography>
                                        <TextField
                                                fullWidth
                                                name="bankRoutingNumber"
                                                placeholder="Routing Number"
                                                value={values.bankRoutingNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={
                                                        touched.bankRoutingNumber && !!errors.bankRoutingNumber
                                                }
                                                helperText={
                                                        touched.bankRoutingNumber && errors.bankRoutingNumber
                                                }
                                                sx={styles.input}
                                                InputProps={{
                                                        endAdornment: isLookingUp ? (
                                                                <InputAdornment position="end">
                                                                        <CircularProgress size={18} />
                                                                </InputAdornment>
                                                        ) : null
                                                }}
                                        />
                                        {notFound && !lookupError && (
                                                <Typography sx={{ fontSize: '12px', color: '#6B7280', mt: 0.5 }}>
                                                        No bank found for this routing number. Please fill in the details manually.
                                                </Typography>
                                        )}
                                        {lookupError && (
                                                <Typography sx={{ fontSize: '12px', color: '#6B7280', mt: 0.5 }}>
                                                        Unable to look up bank details. Please fill in the details manually.
                                                </Typography>
                                        )}
                                </Box>
                                <Box sx={styles.inputGroup}>
                                        <Typography sx={styles.inputLabel}>
                                                Confirm Routing Number*
                                        </Typography>
                                        <TextField
                                                fullWidth
                                                name="confirmRoutingNumber"
                                                placeholder="Confirm Routing Number"
                                                value={values.confirmRoutingNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={
                                                        touched.confirmRoutingNumber &&
                                                        !!errors.confirmRoutingNumber
                                                }
                                                helperText={
                                                        touched.confirmRoutingNumber &&
                                                        errors.confirmRoutingNumber
                                                }
                                                sx={styles.input}
                                        />
                                </Box>
                        </Box>

                        <Box sx={styles.groupContainer}>
                                <Box sx={styles.inputGroup}>
                                        <Box sx={styles.labelContainer}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <BankLogoDisplay logoUrl={bankLogoUrl} />
                                                        <Typography sx={styles.inputLabel}>Bank Name*</Typography>
                                                </Box>
                                                <Tooltip
                                                        title="Enter the official name of the bank as it should appear on printed checks."
                                                        placement="top-end"
                                                        arrow
                                                        componentsProps={{
                                                                tooltip: {
                                                                        sx: {
                                                                                marginRight: '-15px',
                                                                                bgcolor: '#181D27',
                                                                                fontSize: '12px',
                                                                                lineHeight: '16px',
                                                                                padding: '12px 8px',
                                                                                borderRadius: '8px',
                                                                                '& .MuiTooltip-arrow': {
                                                                                        color: '#181D27',
                                                                                        left: '-10px !important'
                                                                                }
                                                                        }
                                                                },
                                                                popper: {
                                                                        sx: {
                                                                                marginBottom: '8px !important'
                                                                        }
                                                                }
                                                        }}
                                                >
                                                        <Box sx={styles.labelIcon}>
                                                                <HelpOutlineIcon />
                                                        </Box>
                                                </Tooltip>
                                        </Box>
                                        <BankNameAutocomplete
                                                value={values.bankName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.bankName && !!errors.bankName}
                                                helperText={touched.bankName && errors.bankName}
                                        />
                                </Box>
                                <Box sx={styles.inputGroup}>
                                        <Typography sx={styles.inputLabel}>
                                                Select Account Type*
                                        </Typography>

                                        <Select
                                                fullWidth
                                                name="accountType"
                                                value={
                                                        accountTypes.find((i) => i.value === values.accountType)
                                                                ?.value || ''
                                                }
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.accountType && !!errors.accountType}
                                                sx={styles.select}
                                        >
                                                {accountTypes.map((item) => (
                                                        <MenuItem key={item.value} value={item.value}>
                                                                {item.key}
                                                        </MenuItem>
                                                ))}
                                        </Select>
                                        {touched.accountType && errors.accountType && (
                                                <Typography color="error" sx={styles.errorText}>
                                                        {errors.accountType}
                                                </Typography>
                                        )}
                                </Box>
                        </Box>

                        <Box sx={styles.groupContainer}>
                                <Box sx={styles.inputGroup}>
                                        <Typography sx={styles.inputLabel}>
                                                Bank Address
                                        </Typography>
                                        <TextField
                                                fullWidth
                                                name="bankAddress1"
                                                placeholder="Street Address"
                                                value={values.bankAddress1}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                sx={styles.input}
                                        />
                                </Box>
                                <Box sx={styles.inputGroup}>
                                        <Typography sx={styles.inputLabel}>
                                                City
                                        </Typography>
                                        <TextField
                                                fullWidth
                                                name="bankCity"
                                                placeholder="City"
                                                value={values.bankCity}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                sx={styles.input}
                                        />
                                </Box>
                        </Box>

                        <Box sx={styles.groupContainer}>
                                <Box sx={styles.inputGroup}>
                                        <Typography sx={styles.inputLabel}>
                                                State
                                        </Typography>
                                        <TextField
                                                fullWidth
                                                name="bankState"
                                                placeholder="State"
                                                value={values.bankState}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                sx={styles.input}
                                        />
                                </Box>
                                <Box sx={styles.inputGroup}>
                                        <Typography sx={styles.inputLabel}>
                                                ZIP Code
                                        </Typography>
                                        <TextField
                                                fullWidth
                                                name="bankZip"
                                                placeholder="ZIP Code"
                                                value={values.bankZip}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                sx={styles.input}
                                        />
                                </Box>
                        </Box>

                        <Box sx={styles.groupContainer}>
                                <Box sx={styles.inputGroup}>
                                        <Typography sx={styles.inputLabel}>
                                                Account Number*
                                        </Typography>
                                        <TextField
                                                fullWidth
                                                name="accountNumber"
                                                placeholder="Account Number"
                                                value={values.accountNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.accountNumber && !!errors.accountNumber}
                                                helperText={touched.accountNumber && errors.accountNumber}
                                                sx={styles.input}
                                        />
                                </Box>
                                <Box sx={styles.inputGroup}>
                                        <Typography sx={styles.inputLabel}>
                                                Confirm Account Number*
                                        </Typography>
                                        <TextField
                                                fullWidth
                                                name="confirmAccountNumber"
                                                placeholder="Confirm Account Number"
                                                value={values.confirmAccountNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={
                                                        touched.confirmAccountNumber &&
                                                        !!errors.confirmAccountNumber
                                                }
                                                helperText={
                                                        touched.confirmAccountNumber &&
                                                        errors.confirmAccountNumber
                                                }
                                                sx={styles.input}
                                        />
                                </Box>
                        </Box>

                        <Box sx={styles.inputGroup}>
                                <Box sx={styles.labelContainer}>
                                        <Typography sx={styles.inputLabel}>
                                                Account Nickname*
                                        </Typography>
                                        <Tooltip
                                                title="Enter a custom name for this bank account. This nickname is for your reference only and will not appear on printed checks."
                                                placement="top-end"
                                                arrow
                                                componentsProps={{
                                                        tooltip: {
                                                                sx: {
                                                                        marginRight: '-15px',
                                                                        bgcolor: '#181D27',
                                                                        fontSize: '12px',
                                                                        lineHeight: '16px',
                                                                        padding: '12px 8px',
                                                                        borderRadius: '8px',
                                                                        '& .MuiTooltip-arrow': {
                                                                                color: '#181D27',
                                                                                left: '-10px !important'
                                                                        }
                                                                }
                                                        },
                                                        popper: {
                                                                sx: {
                                                                        marginBottom: '8px !important'
                                                                }
                                                        }
                                                }}
                                        >
                                                <Box sx={styles.labelIcon}>
                                                        <HelpOutlineIcon />
                                                </Box>
                                        </Tooltip>
                                </Box>
                                <TextField
                                        fullWidth
                                        name="accountNickName"
                                        placeholder="My Chase Account"
                                        value={values.accountNickName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.accountNickName && !!errors.accountNickName}
                                        helperText={touched.accountNickName && errors.accountNickName}
                                        sx={styles.input}
                                />
                        </Box>
                        {apiErrors?.reason && (
                                <Box my={3}>
                                        <Typography color={'red'} textAlign={'center'}>
                                                {apiErrors?.reason}
                                        </Typography>
                                </Box>
                        )}
                        <Typography sx={styles.inputLabel}>Preferences</Typography>
                        <Typography color="text.secondary">
                                Change Your Checkwriting Preferences here.
                        </Typography>

                        <Box sx={styles.inputGroup}>
                                <Typography sx={styles.inputLabel}>
                                        Check No. generation
                                </Typography>
                                <Box sx={styles.radioGroup}>
                                        <Box sx={styles.radioItem}>
                                                <Radio
                                                        name="bankPreferences.checkNoGeneration"
                                                        value="manual"
                                                        checked={
                                                                values.bankPreferences.checkNoGeneration === 'manual'
                                                        }
                                                        onChange={handleChange}
                                                        sx={styles.radio}
                                                />
                                                <Typography sx={styles.radioLabel}>Manual</Typography>
                                        </Box>
                                        <Box sx={styles.radioItem}>
                                                <Radio
                                                        name="bankPreferences.checkNoGeneration"
                                                        value="auto"
                                                        checked={
                                                                values.bankPreferences.checkNoGeneration === 'auto'
                                                        }
                                                        onChange={handleChange}
                                                        sx={styles.radio}
                                                />
                                                <Typography sx={styles.radioLabel}>Auto</Typography>
                                        </Box>
                                </Box>
                        </Box>

                        <Box sx={styles.groupContainer}>
                                <Box sx={styles.inputGroup}>
                                        <Box sx={styles.labelContainer}>
                                                <Typography sx={styles.inputLabel}>
                                                        Length of check number
                                                </Typography>
                                                <Tooltip
                                                        title="Choose the number of digits for check numbers. Shorter numbers will be padded with zeros."
                                                        placement="top-end"
                                                        arrow
                                                        componentsProps={{
                                                                tooltip: {
                                                                        sx: {
                                                                                marginRight: '-15px',
                                                                                bgcolor: '#181D27',
                                                                                fontSize: '12px',
                                                                                lineHeight: '16px',
                                                                                padding: '12px 8px',
                                                                                borderRadius: '8px',
                                                                                '& .MuiTooltip-arrow': {
                                                                                        color: '#181D27',
                                                                                        left: '-10px !important'
                                                                                }
                                                                        }
                                                                },
                                                                popper: {
                                                                        sx: {
                                                                                marginBottom: '8px !important'
                                                                        }
                                                                }
                                                        }}
                                                >
                                                        <Box sx={styles.labelIcon}>
                                                                <HelpOutlineIcon />
                                                        </Box>
                                                </Tooltip>
                                        </Box>

                                        <Box display={'flex'} alignItems={'flex-start'}>
                                                <TextField
                                                        disabled
                                                        fullWidth
                                                        name="bankPreferences.defaultCheckNumberLength"
                                                        placeholder="0001"
                                                        value={values?.bankPreferences?.defaultCheckNumberLength}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={
                                                                !!errors?.bankPreferences?.defaultCheckNumberLength
                                                        }
                                                        helperText={
                                                                errors?.bankPreferences?.defaultCheckNumberLength
                                                        }
                                                        sx={styles.input}
                                                />

                                                <div className="d-flex align-items-center justify-content-center flex-column">
                                                        <button
                                                                className="bg-transparent border-0 value-cntrl-btn"
                                                                type="button"
                                                                onClick={(e) => {
                                                                        e.preventDefault()
                                                                        setFieldValue(
                                                                                'bankPreferences.defaultCheckNumberLength',
                                                                                `${
                                                                                        +values.bankPreferences.defaultCheckNumberLength +
                                                                                        1
                                                                                }`
                                                                        )
                                                                }}
                                                                disabled={
                                                                        values.defaultCheckNumberLength === 8 ? true : false
                                                                }
                                                        >
                                                                <Icon
                                                                        sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                width: '18px',
                                                                                height: '18px',
                                                                                '& svg': {
                                                                                        width: 'inherit',
                                                                                        height: 'inherit'
                                                                                }
                                                                        }}
                                                                >
                                                                        <ExpandLess />
                                                                </Icon>
                                                        </button>
                                                        <button
                                                                className="bg-transparent border-0 value-cntrl-btn"
                                                                type="button"
                                                                onClick={(e) => {
                                                                        e.preventDefault()
                                                                        setFieldValue(
                                                                                'bankPreferences.defaultCheckNumberLength',
                                                                                `${
                                                                                        +values.bankPreferences.defaultCheckNumberLength -
                                                                                        1
                                                                                }`
                                                                        )
                                                                }}
                                                                disabled={
                                                                        values.defaultCheckNumberLength === 1 ? true : false
                                                                }
                                                        >
                                                                <Icon
                                                                        sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                height: '18px',
                                                                                width: '18px',
                                                                                '& svg': {
                                                                                        width: 'inherit',
                                                                                        height: 'inherit'
                                                                                }
                                                                        }}
                                                                >
                                                                        <ExpandMore />
                                                                </Icon>
                                                        </button>
                                                </div>
                                        </Box>
                                </Box>
                                <Box sx={styles.inputGroup}>
                                        {values.bankPreferences.checkNoGeneration === 'auto' && (
                                                <>
                                                        <Typography sx={styles.inputLabel}>
                                                                Default check start number
                                                        </Typography>
                                                        <TextField
                                                                fullWidth
                                                                name="bankPreferences.defaultCheckStartNumber"
                                                                placeholder="1000"
                                                                value={values?.bankPreferences?.defaultCheckStartNumber}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                helperText={
                                                                        errors?.bankPreferences?.defaultCheckStartNumber
                                                                }
                                                                sx={styles.input}
                                                                error={
                                                                        !!errors?.bankPreferences?.defaultCheckStartNumber
                                                                }
                                                        />
                                                </>
                                        )}
                                </Box>
                        </Box>
                        {false && (
                                <Typography
                                        color="error"
                                        sx={{ ...styles.errorText, marginTop: '-10px' }}
                                >
                                        This check number is already used. Try 1002 instead.
                                </Typography>
                        )}

                        <Box sx={styles.signatureContainer}>
                                <Box sx={styles.signatureLabelContainer}>
                                        <Box>
                                                <Typography sx={styles.signatureLabel}>
                                                        Your Signature
                                                </Typography>
                                                <Typography color="text.secondary">
                                                        Enable signature for every check, If Uploaded
                                                </Typography>
                                        </Box>
                                        <Switch
                                                checked={values.bankPreferences.signatureEnabled}
                                                onChange={(e) => {
                                                        setFieldValue(
                                                                'bankPreferences.signatureEnabled',
                                                                e.target.checked
                                                        )
                                                        if (!e.target.checked) {
                                                                setFieldValue('signature', null)
                                                        }
                                                }}
                                                sx={styles.switch}
                                        />
                                </Box>

                                {values.bankPreferences.signatureEnabled && (
                                        <>
                                                <SignaturePad
                                                        defaultValue={signature}
                                                        value={values.bankPreferences.signatureUrl}
                                                        onChange={(signatureData) => {
                                                                setFieldValue(
                                                                        'bankPreferences.signatureUrl',
                                                                        signatureData
                                                                )
                                                        }}
                                                />
                                                {touched.signature && errors.signature && (
                                                        <Typography color="error" sx={styles.errorText}>
                                                                {errors.signature}
                                                        </Typography>
                                                )}
                                        </>
                                )}
                        </Box>
                </Box>
        )
}

export const AddNewModalUSA = ({
        formRef,
        onSubmit,
        bankData,
        setShouldDisable,
        apiErrors
}) => {
        const { data } = useUserInfo()
        const signature = data?.signatureUrl

        const initialValues = getInitialValues(bankData, signature)

        const handleSubmit = async (values, { setSubmitting }) => {
                try {
                        values.accountName = values.accountNickName
                        values.bankPreferences.useDefaultSignature =
                                values.bankPreferences.signatureUrl === signature

                        onSubmit(values)
                } catch (error) {
                        console.error('Error submitting form:', error)
                } finally {
                        setSubmitting(false)
                }
        }

        return (
                <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        innerRef={formRef}
                >
                        {({
                                values,
                                errors,
                                touched,
                                handleChange,
                                handleBlur,
                                setFieldValue
                        }) => {
                                if (!!Object.keys(errors).length) {
                                        setShouldDisable(true)
                                } else setShouldDisable(false)


                                return (
                                        <Form>
                                                <BankAutoFillContext>
                                                <FormContent
                                                        values={values}
                                                        errors={errors}
                                                        touched={touched}
                                                        handleChange={handleChange}
                                                        handleBlur={handleBlur}
                                                        setFieldValue={setFieldValue}
                                                        apiErrors={apiErrors}
                                                        signature={signature}
                                                />
                                                </BankAutoFillContext>
                                        </Form>
                                )
                        }}
                </Formik>
        )
}



const validationSchema = Yup.object().shape({
        bankRoutingNumber: Yup.string()
                .matches(/^\d{9}$/, 'Routing number must be exactly 9 digits')
                .required('Routing number cannot be empty.'),
        confirmRoutingNumber: Yup.string()
                .oneOf(
                        [Yup.ref('bankRoutingNumber'), null],
                        'Routing Number and Confirm Routing Number do not match.'
                )
                .required('Confirm routing number cannot be empty.'),
        accountNumber: Yup.string()
                .matches(/^\d{4,17}$/, 'Account number must be between 4 and 17 digits')
                .required('Account number cannot be empty.'),
        confirmAccountNumber: Yup.string()
                .oneOf(
                        [Yup.ref('accountNumber'), null],
                        'Account Number and Confirm Account Number do not match.'
                )
                .required('Confirm account number cannot be empty.'),
        accountType: Yup.string().required('Please select an account type.'),
        bankName: Yup.string().required('Bank name cannot be empty.'),
        accountNickName: Yup.string().required(
                'Name cannot be empty or contain special characters.'
        ),

        bankPreferences: Yup.object().shape({
                checkNoGeneration: Yup.string().oneOf(['manual', 'auto']).required(),
                defaultCheckNumberLength: Yup.number()
                        .positive()
                        .integer()
                        .min(1, 'Must be great or euqal to 1')
                        .max(20)
                        .when('checkNoGeneration', {
                                is: 'manual',
                                then: (schema) =>
                                        schema.required(
                                                'Default Check Number Length is required for automatic check generation'
                                        )
                        }),
                defaultCheckStartNumber: Yup.string().when('checkNoGeneration', {
                        is: 'auto',
                        then: (schema) =>
                                schema
                                        .required(
                                                'Default Check Start Number is required for automatic check generation'
                                        )
                                        .matches(
                                                /^[0-9]+$/,
                                                'Default Check Start Number must contain only digits'
                                        )
                }),
                lastUsedCheckNumber: Yup.string().matches(
                        /^[0-9]*$/,
                        'Last Used Check Number must contain only digits'
                ),
                signatureUrl: Yup.string(),
                signatureEnabled: Yup.boolean().required()
        })
})
