import { useRef, useState } from 'react'
import { CustomDialog } from '../../../../../components/dialog/CustomDialog'
import {
        Box,
        Typography,
        Button,
        TextField,
        Radio,
        Accordion,
        AccordionSummary,
        AccordionDetails,
        InputAdornment,
        IconButton,
        Autocomplete,
        CircularProgress,
        Tooltip,
        Switch,
        FormControlLabel,
        Select,
        MenuItem
} from '@mui/material'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { Formik } from 'formik'

import { styles } from '../../../styles'
import { styles as createCheckStyles } from '../styles'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import CloseIcon from '@mui/icons-material/Close'
import {
        formatAmountAsCurrency,
        numberToCurrencyWords
} from '../../../../../utils/helpers/formatCurrency'
import useBanks from '../../../../../API/banks/useBanks'
import usePayees from '../../../../../API/payees/usePayees'
import useAddresses from '../../../../../API/addresses/useAddresses'
import useAddCheck from '../../../../../API/checks/useAddCheck'
import useUserInfo from '../../../../../API/users/useUserInfo'
import {
        getNextCheckNumber,
        validateManualCheckNumber
} from '../../../../../API/banks/useNextCheckNumber'
import { transformChecks } from '../../../utils/formatData'
import { useSelector } from 'react-redux'
import { checkCreateValidationSchema } from '../../../utils/validationSchema'
import useOrganizations from '../../../../../API/users/organizations/useOrganizations'
import TagsSelector from '../../TagsSelector'
import { Add } from '@mui/icons-material'
import { AddNewModal } from '../../../../Bank/components/modals'
import FormModalMUI from '../../../../../components/shared/Modals/FormModalMUI'
import AddPayee from '../../../../../components/views/forms/AddPayee'
import { addCustomOption, generateRecurringChecks, computeRecurringDate } from '../../../utils/helpers'
import FileUpload from '../../FileUpload'
import { useUploadAttachments } from '../../../../../API/attachments/useUploadAttachments'
import { useValidateCheckNumbers } from '../../../../../API/checks/useValidateCheckNumbers'
import { EntityType } from '../../../../../types/attachment.types'
import { queryClient } from '../../../../..'
import {
        EXCEED_TRIAL_LIMIT_WARNING,
        RECURRING_FREQUENCIES,
        RECURRING_MIN_OCCURRENCES,
        RECURRING_MAX_OCCURRENCES,
        RECURRING_DEFAULT_OCCURRENCES,
        RECURRING_DEFAULT_FREQUENCY
} from '../../../utils/constant'
import { updateSnackbar } from '../../../../../redux/snackbarState'
import { useDispatch } from 'react-redux'

const initialValues = {
        bankId: '',
        payeeId: '',
        checkNumber: '',
        issuedDate: new Date().toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
        }),
        amount: '',
        memo: '',
        dollarAmount: '',
        signature: true,
        tags: [],
        invoiceId: '',
        attachments: [],
}

export const AddModal = ({
        open,
        onClose,
        handleOpenUnsavedAlert,
        handleSaveandPrint,
        totalCount,
        userMaxCheckLimit
}) => {
        const formRef = useRef(null)
        const [isPrinting, setIsPrinting] = useState(false)
        const [isAddCheck, setIsAddCheck] = useState(false)
        const [newChecks, setNewChecks] = useState([])
        const [expandedAccordion, setExpandedAccordion] = useState(null)
        const [checkErrors, setCheckErrors] = useState({})
        const [isFormTouched, setIsFormTouched] = useState(false)
        const selectedOrganization = useSelector(
                (state) => state.appData.selectedOrganization
        )
        const [addNewBankModal, setAddNewBankModal] = useState(false)
        const [isAddPayeeModalOpen, setAddPayeeModalOpen] = useState(false)
        const { mutateAsync: uploadAttachmentAsync } = useUploadAttachments()

        const [showWarning, setWarning] = useState(false)

        const [isRecurring, setIsRecurring] = useState(false)
        const [recurringFrequency, setRecurringFrequency] = useState(
                RECURRING_DEFAULT_FREQUENCY
        )
        const [recurringCount, setRecurringCount] = useState(
                RECURRING_DEFAULT_OCCURRENCES
        )
        const [recurringError, setRecurringError] = useState('')

        const dispatch = useDispatch()
        const { mutateAsync: validateCheckNumbersAsync } = useValidateCheckNumbers()

        const recurringOccurrences = isRecurring
                ? Math.max(1, Math.floor(Number(recurringCount) || 0))
                : 1

        const exceedTrialLimit =
                userMaxCheckLimit !== 0
                        ? totalCount + recurringOccurrences + newChecks.length >=
                          userMaxCheckLimit
                        : false
        const [isAutoMaticCheckGeneration, setIsAutoMaticCheckGeneration] =
                useState(false)

        const resetRecurringState = () => {
                setIsRecurring(false)
                setRecurringFrequency(RECURRING_DEFAULT_FREQUENCY)
                setRecurringCount(RECURRING_DEFAULT_OCCURRENCES)
                setRecurringError('')
        }

        const handleRecurringToggle = (checked) => {
                setIsRecurring(checked)
                setRecurringError('')
                if (!checked) {
                        setRecurringFrequency(RECURRING_DEFAULT_FREQUENCY)
                        setRecurringCount(RECURRING_DEFAULT_OCCURRENCES)
                }
        }

        const ownerType = selectedOrganization ? 'organization' : 'user'
        const { data: userData } = useUserInfo()
        const { data: banksData } = useBanks()
        const { data: payeesData } = usePayees({ status: 'active' })
        const { data: addresses } = useAddresses()
        const { data: organizationData } = useOrganizations()
        const { mutate: addCheck } = useAddCheck()
        const userAddress = addresses ? addresses[0] : null
        const [loading, setLoading] = useState(false)

        const wantSignature = selectedOrganization ?  organizationData?.find(x => x._id === selectedOrganization)?.preferences.wantSignature : userData?.preferences?.wantSignature

        const handleSaveAndPrint = () => {
                setIsPrinting(true)
                if (formRef.current) {
                        formRef.current.handleSubmit()
                }
        }
        const handleSaveCheck = () => {
                if (formRef.current) {
                        formRef.current.handleSubmit()
                }
        }

        const handleAddCheck = () => {
                setIsAddCheck(true)
                if (formRef.current) {
                        formRef.current.handleSubmit()
                }
        }

        const returnSelectedUserName = () => {
                if (selectedOrganization && organizationData) {
                        const organization = organizationData?.find(
                                (x) => x._id === selectedOrganization
                        )
                        return organization?.organizationName
                } else {
                        return `${userData?.firstName} ${userData?.lastName}`
                }
        }

        // Function to update a specific check in the newChecks array
        const updateCheck = async (index, field, value) => {
                const updatedChecks = [...newChecks]
                updatedChecks[index] = {
                        ...updatedChecks[index],
                        [field]: value
                }

                // If amount is updated, also update dollarAmount
                if (field === 'amount') {
                        updatedChecks[index].dollarAmount = numberToCurrencyWords(Number(value))
                }

                if (field === 'tags') {
                        updatedChecks[index].tags = [...value]
                }

                if (field === 'attachmentsSingleFile') {
                        updateCheck[index].attachments.push(value)
                }
                if (field === 'attachmentsMultipleFiles') {
                        updateCheck[index].attachments = [...value]
                }

                if (field === 'bankId') {
                        const occurred = {}
                        if (updateCheck[index]) updateCheck[index].checkNumber = ''
                        for (let i = 0; i < updatedChecks.length; i++) {
                                const tmpBankId = updatedChecks[i].bankId
                                if (!tmpBankId) continue

                                const selectedBank = banksData?.data?.find(
                                        (bank) => bank._id === tmpBankId
                                )
                                if (selectedBank?.bankPreferences?.checkNoGeneration === 'auto') {
                                        if (occurred[tmpBankId] !== undefined) {
                                                updatedChecks[i].checkNumber = occurred[tmpBankId]
                                                occurred[tmpBankId] += 1
                                        } else {
                                                const { nextAvailableCheckNumber } = await getNextCheckNumber(
                                                        ownerType,
                                                        tmpBankId
                                                )
                                                updatedChecks[i].checkNumber = nextAvailableCheckNumber
                                                occurred[tmpBankId] = nextAvailableCheckNumber + 1
                                        }
                                }

                                updateCheck[index].signature =
                                        selectedBank?.bankPreferences?.signatureEnabled || false
                        }
                        const currentBankId = formRef.current.values.bankId
                        if (currentBankId) {
                                const selectedBank = banksData?.data?.find(
                                        (bank) => bank._id === currentBankId
                                )
                                if (selectedBank?.bankPreferences?.checkNoGeneration === 'auto') {
                                        const finalCheckNumber = occurred[currentBankId]
                                                ? occurred[currentBankId]
                                                : (await getNextCheckNumber(ownerType, currentBankId))
                                                                .nextAvailableCheckNumber

                                        formRef.current.setFieldValue('checkNumber', finalCheckNumber)
                                }
                        }
                }

                setNewChecks(updatedChecks)

                // Validate the updated check
                validateCheck(index, updatedChecks[index])
        }

        const updateCheckAttachments = (index, attachments, singleFileUpload) => {
                const updatedChecks = [...newChecks]
                if (singleFileUpload) {
                        updatedChecks[index].attachments.push(attachments[0])
                } else {
                        updatedChecks[index].attachments = [...attachments]
                }
                setNewChecks(updatedChecks)
        }

        // Function to validate a check
        const validateCheck = async (index, check) => {
                try {
                        await checkCreateValidationSchema.validate(check, { abortEarly: false })
                        // If validation passes, remove any errors for this check
                        setCheckErrors((prev) => {
                                const newErrors = { ...prev }
                                delete newErrors[index]
                                return newErrors
                        })
                } catch (err) {
                        // If validation fails, store the errors
                        if (err.inner) {
                                const fieldErrors = {}
                                err.inner.forEach((error) => {
                                        fieldErrors[error.path] = error.message
                                })
                                setCheckErrors((prev) => ({
                                        ...prev,
                                        [index]: fieldErrors
                                }))
                        }
                }
        }

        // Function to handle accordion change
        const handleAccordionChange = async (index) => {
                // If trying to expand a different accordion while one is already expanded
                if (expandedAccordion !== null && expandedAccordion !== index) {
                        // Check if the currently expanded accordion has errors
                        if (checkErrors[expandedAccordion]) {
                                // Don't allow changing if there are errors
                                return
                        }
                }

                // If trying to collapse the currently expanded accordion and it has errors
                if (expandedAccordion === index && checkErrors[index]) {
                        // Don't allow collapsing if there are errors
                        return
                }

                if (formRef.current) {
                        await formRef.current.setTouched(
                                {
                                        bankId: true,
                                        payeeId: true,
                                        amount: true,
                                        issuedDate: true,
                                        memo: true,
                                        signature: true
                                },
                                true
                        )
                        const errors = await formRef.current.validateForm()
                        if (Object.keys(errors).length > 0) {
                                // prevent accordion switch if errors exist
                                return
                        }
                }

                // Toggle the accordion
                setExpandedAccordion(expandedAccordion === index ? null : index)
        }

        // Function to remove a check
        const handleRemoveCheck = (index) => {
                const updatedChecks = [...newChecks]
                updatedChecks.splice(index, 1)
                setNewChecks(updatedChecks)

                // If the removed check was expanded, reset the expanded state
                if (expandedAccordion === index) {
                        setExpandedAccordion(null)
                } else if (expandedAccordion > index) {
                        // Adjust the expanded index if the removed check was before the expanded one
                        setExpandedAccordion(expandedAccordion - 1)
                }
        }

        const handleSubmit = async (values, { setSubmitting, resetForm }) => {
                try {
                        if (isAddCheck) {
                                setNewChecks([
                                        ...newChecks,
                                        { ...values, amount: Number(values.amount).toFixed(2) }
                                ])
                                setIsAddCheck(false)
                                resetForm({ values: { ...initialValues , signature: wantSignature} })
                        } else {
                                for (let i = 0; i < newChecks.length; i++) {
                                        await validateCheck(i, newChecks[i])
                                        if (checkErrors[i]) {
                                                return
                                        }
                                }

                                let recurringChecks = null
                                if (isRecurring) {
                                        const count = Math.floor(Number(recurringCount) || 0)
                                        if (!recurringFrequency) {
                                                setRecurringError('Frequency is required')
                                                return
                                        }
                                        if (
                                                count < RECURRING_MIN_OCCURRENCES ||
                                                count > RECURRING_MAX_OCCURRENCES
                                        ) {
                                                setRecurringError(
                                                        `Number of occurrences must be between ${RECURRING_MIN_OCCURRENCES} and ${RECURRING_MAX_OCCURRENCES}`
                                                )
                                                return
                                        }

                                        recurringChecks = generateRecurringChecks(
                                                values,
                                                recurringFrequency,
                                                count
                                        )

                                        // Validate generated check numbers for collisions (manual banks only;
                                        // auto-numbered banks always produce fresh sequential numbers).
                                        const selectedBank = banksData?.data?.find(
                                                (bank) => bank._id === values.bankId
                                        )
                                        const isManualBank =
                                                selectedBank?.bankPreferences?.checkNoGeneration === 'manual'
                                        const startNumber = parseInt(values.checkNumber, 10)
                                        if (isManualBank && !Number.isNaN(startNumber)) {
                                                try {
                                                        const result = await validateCheckNumbersAsync({
                                                                bankAccountId: values.bankId,
                                                                startingCheckNumber: startNumber,
                                                                count
                                                        })
                                                        if (result && result.available === false) {
                                                                const conflicts = (result.conflicts || []).join(', ')
                                                                setRecurringError(
                                                                        `These check numbers already exist: ${conflicts}. Please choose a different starting check number.`
                                                                )
                                                                return
                                                        }
                                                } catch (err) {
                                                        console.error(
                                                                'Error validating recurring check numbers:',
                                                                err
                                                        )
                                                        setRecurringError(
                                                                'Unable to validate check numbers. Please try again.'
                                                        )
                                                        return
                                                }
                                        }

                                        setRecurringError('')
                                }

                                setLoading(true)
                                const checksToAdd = recurringChecks
                                        ? [...newChecks, ...recurringChecks]
                                        : [...newChecks, values]
                                const req = transformChecks(
                                        checksToAdd,
                                        userAddress ? userAddress._id : ''
                                )
                                addCheck(req, {
                                        onSuccess: async (res) => {
                                                for (let i = 0; i < res.data.length; i++) {
                                                        const check = res.data[i]
                                                        if (checksToAdd[i]?.attachments?.length > 0) {
                                                                const formData = new FormData()
                                                                formData.append('entityType', EntityType.CHECK)
                                                                formData.append('entityId', check._id)

                                                                checksToAdd[i].attachments.forEach((file) => {
                                                                        formData.append('files', file.file)
                                                                        formData.append('descriptions', file.description || '')
                                                                })
                                                                await uploadAttachmentAsync(formData)
                                                        }
                                                }
                                                if (recurringChecks) {
                                                        dispatch(
                                                                updateSnackbar({
                                                                        open: true,
                                                                        message: `${recurringChecks.length} recurring checks created.`,
                                                                        severity: 'success'
                                                                })
                                                        )
                                                }
                                                if (isPrinting) {
                                                        handleSaveandPrint(res.data)
                                                }
                                                queryClient.invalidateQueries({ queryKey: ['checks'] })
                                                resetRecurringState()
                                                setLoading(false)
                                                onClose()
                                        }
                                })
                        }
                } catch (error) {
                        console.error('Error submitting check:', error)
                } finally {
                        setSubmitting(false)
                }
        }

        const handleBankChange = async (bank) => {
                const bankId = bank?._id
                if (!bankId) return
                if (bankId === 'custom_add') {
                        setAddNewBankModal(true)
                        return
                }
                if (bank?.bankPreferences?.checkNoGeneration === 'auto') {
                        setIsAutoMaticCheckGeneration(true)
                        const tmpChecks = [...newChecks]
                        const occurred = {}

                        formRef.current.setFieldValue('bankId', bankId)

                        // Assign check numbers to existing checks for this bank
                        for (let i = 0; i < tmpChecks.length; i++) {
                                let tmpBankId = tmpChecks[i].bankId
                                const selectedBank = banksData?.data?.find(
                                        (bank) => bank._id === tmpBankId
                                )
                                if (selectedBank?.bankPreferences?.checkNoGeneration === 'auto') {
                                        if (occurred[tmpBankId] !== undefined) {
                                                tmpChecks[i].checkNumber = occurred[tmpBankId]
                                                occurred[tmpBankId] += 1
                                        } else {
                                                const { nextAvailableCheckNumber } = await getNextCheckNumber(
                                                        ownerType,
                                                        tmpBankId
                                                )
                                                tmpChecks[i].checkNumber = nextAvailableCheckNumber
                                                occurred[tmpBankId] = nextAvailableCheckNumber + 1
                                        }
                                }
                        }

                        setNewChecks(tmpChecks)
                        // Set the form field for checkNumber for the new check being added
                        const finalCheckNumber = occurred[bankId]
                                ? occurred[bankId]
                                : (await getNextCheckNumber(ownerType, bankId)).nextAvailableCheckNumber

                        formRef.current.setFieldValue('checkNumber', finalCheckNumber)
                } else {
                        // implement the manual logic here
                        setIsAutoMaticCheckGeneration(false)
                        formRef.current.setFieldValue('bankId', bankId)
                        formRef.current.setFieldValue('checkNumber', '')
                }

                formRef.current.setFieldValue(
                        'signature',
                        bank?.bankPreferences?.signatureEnabled || false
                )
        }

        const getMICR = (bankId, checkNumber) => {
                if (!banksData) return ''
                const selectedBank = banksData?.data?.find((bank) => bank._id === bankId)

                if (selectedBank) {
                        const initialNumber = selectedBank?.bankRoutingNumber
                                ? selectedBank?.bankRoutingNumber
                                : selectedBank?.bankTransitNumber

                        return (
                                <Box sx={{ fontFamily: 'MICR !important', fontSize: '28px' }}>
                                        {'C' +
                                                initialNumber +
                                                'C' +
                                                ' A' +
                                                selectedBank.accountNumber +
                                                'A' +
                                                ' C' +
                                                checkNumber +
                                                'C'}
                                </Box>
                        )
                } else return null
        }

        const handleFormikSwitchOnClose = () => {
                const tmpChecks = [...newChecks]

                if (tmpChecks.length > 0) {
                        const lastItem = tmpChecks.pop()
                        formRef.current.resetForm({ values: lastItem })
                        setNewChecks(tmpChecks)
                }
        }

        const handleNewBank = (newBank) => {
                if (newBank?.data) {
                        if (expandedAccordion || expandedAccordion === 0) {
                                updateCheck(
                                        expandedAccordion,
                                        'bankId',
                                        newBank?.data ? newBank?.data._id : ''
                                )
                        } else {
                                handleBankChange(newBank.data)
                        }
                }
                setAddNewBankModal(false)
        }
        const closeAddPayee = (newPayee) => {
                if (newPayee && newPayee?.data) {
                        if (expandedAccordion || expandedAccordion === 0) {
                                updateCheck(
                                        expandedAccordion,
                                        'payeeId',
                                        newPayee?.data ? newPayee?.data._id : ''
                                )
                        } else {
                                formRef.current.setFieldValue('payeeId', newPayee?.data._id)
                        }
                }
                setAddPayeeModalOpen(false)
        }

        const getUserAddress = () => {
                return (
                        <Typography sx={styles.checkSubTitle}>
                                {userAddress?.addressLine1}
                                {userAddress?.addressLine2 && `, ${userAddress.addressLine2}`}
                                <br />
                                {userAddress?.city}
                                {userAddress?.state && `, ${userAddress.state}`}
                                {userAddress?.zip && `, ${userAddress.zip}`}
                        </Typography>
                )
        }

        const handleFileUpdate = (files) => {
                if (formRef.current) {
                        formRef.current.setFieldValue('attachments', files)
                }
        }
        return (
                <CustomDialog
                        open={open}
                        onClose={
                                isFormTouched || formRef.current?.dirty
                                        ? handleOpenUnsavedAlert
                                        : onClose
                        }
                        width={{
                                xs: '95%',
                                sm: '95%',
                                md: '95%',
                                lg: '944px',
                                xl: '1142px'
                        }}
                        title="Create New Check"
                        content={
                                <>
                                        <Box>
                                                <Typography
                                                        color="#00000099"
                                                        sx={createCheckStyles.createCheckSubTitle}
                                                >
                                                        Start a new check to manage your payments.
                                                </Typography>

                                                {newChecks.map((check, index) => (
                                                        <Box
                                                                key={index}
                                                                sx={{
                                                                        ...styles.accordionContainer,
                                                                        mb: expandedAccordion === index ? '24px' : '0px'
                                                                }}
                                                        >
                                                                <IconButton
                                                                        sx={styles.closeIconButton}
                                                                        onClick={(e) => {
                                                                                e.stopPropagation() // Prevent accordion from toggling
                                                                                handleRemoveCheck(index)
                                                                        }}
                                                                >
                                                                        <CloseIcon sx={{ fontSize: '20px' }} />
                                                                </IconButton>
                                                                <Accordion
                                                                        sx={{
                                                                                ...styles.accordion,
                                                                                bgcolor: expandedAccordion === index ? '#F4F5F7' : '#fff'
                                                                        }}
                                                                        expanded={expandedAccordion === index}
                                                                        onChange={() => handleAccordionChange(index)}
                                                                >
                                                                        <AccordionSummary>
                                                                                <Box sx={{ width: '100%' }}>
                                                                                        <Box sx={styles.accordionEditHeader}>
                                                                                                <Box sx={styles.accordionTitleContainer}>
                                                                                                        <Box>
                                                                                                                <Typography sx={styles.checkTitle}>
                                                                                                                        {returnSelectedUserName()}
                                                                                                                </Typography>
                                                                                                                {getUserAddress()}
                                                                                                        </Box>
                                                                                                        <Box sx={styles.itemContainer}>
                                                                                                                <Typography sx={styles.itemLabel}>
                                                                                                                        Bank <br /> Account *
                                                                                                                </Typography>
                                                                                                                <Box>
                                                                                                                        <Autocomplete
                                                                                                                                fullWidth
                                                                                                                                options={addCustomOption(
                                                                                                                                        banksData?.data || [],
                                                                                                                                        'Add New Bank'
                                                                                                                                )}
                                                                                                                                getOptionLabel={(option) =>
                                                                                                                                        option.bankName || ''
                                                                                                                                }
                                                                                                                                getOptionKey={(option) => option._id}
                                                                                                                                value={
                                                                                                                                        banksData?.data?.find(
                                                                                                                                                (bank) => bank._id === check.bankId
                                                                                                                                        ) || null
                                                                                                                                }
                                                                                                                                onChange={(event, newValue) => {
                                                                                                                                        event?.stopPropagation()
                                                                                                                                        if (
                                                                                                                                                newValue &&
                                                                                                                                                newValue._id === 'custom_add'
                                                                                                                                        ) {
                                                                                                                                                setAddNewBankModal(true)
                                                                                                                                        } else {
                                                                                                                                                updateCheck(
                                                                                                                                                        index,
                                                                                                                                                        'bankId',
                                                                                                                                                        newValue ? newValue._id : ''
                                                                                                                                                )
                                                                                                                                        }
                                                                                                                                }}
                                                                                                                                onOpen={(e) => {
                                                                                                                                        e.stopPropagation()
                                                                                                                                        setExpandedAccordion(index)
                                                                                                                                }}
                                                                                                                                onClose={(e) => e.stopPropagation()}
                                                                                                                                renderInput={(params) => (
                                                                                                                                        <Box onClick={(e) => e.stopPropagation()}>
                                                                                                                                                <TextField
                                                                                                                                                        {...params}
                                                                                                                                                        placeholder="Select Bank Account"
                                                                                                                                                        error={
                                                                                                                                                                checkErrors[index]?.bankId
                                                                                                                                                                        ? true
                                                                                                                                                                        : false
                                                                                                                                                        }
                                                                                                                                                        sx={{
                                                                                                                                                                ...styles.select,
                                                                                                                                                                '& .MuiInputBase-root': {
                                                                                                                                                                        height: '40px'
                                                                                                                                                                }
                                                                                                                                                        }}
                                                                                                                                                />
                                                                                                                                        </Box>
                                                                                                                                )}
                                                                                                                                renderOption={(props, option) => {
                                                                                                                                        return (
                                                                                                                                                <Box
                                                                                                                                                        component="li"
                                                                                                                                                        {...props}
                                                                                                                                                        style={
                                                                                                                                                                option.isCustom
                                                                                                                                                                        ? styles.autoCompleteOptionsAddNew
                                                                                                                                                                        : styles.autoCompleteOptions
                                                                                                                                                        }
                                                                                                                                                >
                                                                                                                                                        {option.isCustom ? (
                                                                                                                                                                <>
                                                                                                                                                                        <Add
                                                                                                                                                                                sx={{ mr: 1, color: '#1e3a5f' }}
                                                                                                                                                                        />
                                                                                                                                                                        <Typography>
                                                                                                                                                                                {option.bankName}
                                                                                                                                                                        </Typography>
                                                                                                                                                                </>
                                                                                                                                                        ) : (
                                                                                                                                                                option.bankName
                                                                                                                                                        )}
                                                                                                                                                </Box>
                                                                                                                                        )
                                                                                                                                }}
                                                                                                                        />
                                                                                                                        {checkErrors[index]?.bankId && (
                                                                                                                                <Typography color="error" sx={styles.errorText}>
                                                                                                                                        {checkErrors[index].bankId}
                                                                                                                                </Typography>
                                                                                                                        )}
                                                                                                                </Box>
                                                                                                        </Box>
                                                                                                </Box>
                                                                                                <Box sx={styles.addEditHeaderRight}>
                                                                                                        <Box sx={styles.itemContainer}>
                                                                                                                <Typography sx={styles.itemLabel}>
                                                                                                                        Check <br /> Number
                                                                                                                </Typography>
                                                                                                                <TextField
                                                                                                                        fullWidth
                                                                                                                        name="checkNumber"
                                                                                                                        placeholder="Check Number"
                                                                                                                        value={check.checkNumber}
                                                                                                                        onChange={(e) => {
                                                                                                                                e.stopPropagation()
                                                                                                                                setExpandedAccordion(index)
                                                                                                                                updateCheck(
                                                                                                                                        index,
                                                                                                                                        'checkNumber',
                                                                                                                                        e.target.value
                                                                                                                                )
                                                                                                                        }}
                                                                                                                        disabled={
                                                                                                                                check?.bankId &&
                                                                                                                                banksData?.data?.find(
                                                                                                                                        (bank) => bank._id === check.bankId
                                                                                                                                ).bankPreferences.checkNoGeneration === 'auto'
                                                                                                                        }
                                                                                                                        sx={{
                                                                                                                                ...styles.input,
                                                                                                                                '& .MuiInputBase-input': {
                                                                                                                                        color: '#e2e8f0'
                                                                                                                                },
                                                                                                                                '& .MuiInputLabel-root': {
                                                                                                                                        color: '#e2e8f0'
                                                                                                                                }
                                                                                                                        }}
                                                                                                                        InputProps={{
                                                                                                                                endAdornment: check?.bankId &&
                                                                                                                                        banksData?.data?.find(
                                                                                                                                                (bank) => bank._id === check.bankId
                                                                                                                                        ).bankPreferences.checkNoGeneration ===
                                                                                                                                                'auto' && (
                                                                                                                                                <Typography
                                                                                                                                                        sx={styles.checkNumberAutomatic}
                                                                                                                                                >
                                                                                                                                                        (Automatic)
                                                                                                                                                </Typography>
                                                                                                                                        )
                                                                                                                        }}
                                                                                                                />
                                                                                                        </Box>
                                                                                                </Box>
                                                                                        </Box>
                                                                                </Box>
                                                                        </AccordionSummary>
                                                                        <AccordionDetails>
                                                                                <Box
                                                                                        sx={{
                                                                                                ...styles.accordionEditHeader,
                                                                                                mt: '-24px',
                                                                                                mb: '24px'
                                                                                        }}
                                                                                >
                                                                                        <Box sx={styles.payeeNameContainer}>
                                                                                                <Typography sx={styles.payeeNameLabel}>
                                                                                                        Payee Name
                                                                                                </Typography>

                                                                                                <Autocomplete
                                                                                                        fullWidth
                                                                                                        options={addCustomOption(
                                                                                                                payeesData?.data || [],
                                                                                                                'Add New Payee'
                                                                                                        )}
                                                                                                        getOptionLabel={(option) => option.name || ''}
                                                                                                        getOptionKey={(option) => option._id}
                                                                                                        value={
                                                                                                                payeesData?.data?.find(
                                                                                                                        (payee) => payee._id === check.payeeId
                                                                                                                ) || null
                                                                                                        }
                                                                                                        onChange={(event, newValue) => {
                                                                                                                updateCheck(
                                                                                                                        index,
                                                                                                                        'payeeId',
                                                                                                                        newValue ? newValue._id : ''
                                                                                                                )
                                                                                                        }}
                                                                                                        renderInput={(params) => (
                                                                                                                <TextField
                                                                                                                        {...params}
                                                                                                                        placeholder="Select Payee Name"
                                                                                                                        error={!!checkErrors[index]?.payeeId}
                                                                                                                        helperText={checkErrors[index]?.payeeId}
                                                                                                                        sx={styles.payeeSelect}
                                                                                                                />
                                                                                                        )}
                                                                                                        renderOption={(props, option) => {
                                                                                                                return (
                                                                                                                        <Box
                                                                                                                                component="li"
                                                                                                                                {...props}
                                                                                                                                style={
                                                                                                                                        option.isCustom
                                                                                                                                                ? styles.autoCompleteOptionsAddNew
                                                                                                                                                : styles.autoCompleteOptions
                                                                                                                                }
                                                                                                                        >
                                                                                                                                {option.isCustom ? (
                                                                                                                                        <>
                                                                                                                                                <Add sx={{ mr: 1, color: '#1e3a5f' }} />
                                                                                                                                                <Typography>{option.name}</Typography>
                                                                                                                                        </>
                                                                                                                                ) : (
                                                                                                                                        option.name
                                                                                                                                )}
                                                                                                                        </Box>
                                                                                                                )
                                                                                                        }}
                                                                                                />
                                                                                                {checkErrors[index]?.payeeId && (
                                                                                                        <Typography color="error" sx={styles.errorText}>
                                                                                                                {checkErrors[index].payeeId}
                                                                                                        </Typography>
                                                                                                )}
                                                                                        </Box>
                                                                                        <Box sx={styles.accordionEditHeaderRight}>
                                                                                                <Box sx={styles.itemContainer}>
                                                                                                        <Typography sx={styles.itemLabel}>
                                                                                                                Issued <br /> Date
                                                                                                        </Typography>
                                                                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                                                <DatePicker
                                                                                                                        value={
                                                                                                                                check.issuedDate
                                                                                                                                        ? dayjs(check.issuedDate)
                                                                                                                                        : null
                                                                                                                        }
                                                                                                                        onChange={(newValue) => {
                                                                                                                                const formattedDate = newValue
                                                                                                                                        ? newValue.format('MM/DD/YYYY')
                                                                                                                                        : ''
                                                                                                                                updateCheck(index, 'issuedDate', formattedDate)
                                                                                                                        }}
                                                                                                                        slotProps={{
                                                                                                                                textField: {
                                                                                                                                        fullWidth: true,
                                                                                                                                        placeholder: 'Issued Date',
                                                                                                                                        error: checkErrors[index]?.issuedDate
                                                                                                                                                ? true
                                                                                                                                                : false,
                                                                                                                                        helperText:
                                                                                                                                                checkErrors[index]?.issuedDate || '',
                                                                                                                                        sx: styles.input
                                                                                                                                }
                                                                                                                        }}
                                                                                                                />
                                                                                                        </LocalizationProvider>
                                                                                                </Box>

                                                                                                <Box
                                                                                                        sx={{ ...styles.itemContainer, alignItems: 'center' }}
                                                                                                >
                                                                                                        <Typography sx={styles.itemLabel}>Amount</Typography>
                                                                                                        <TextField
                                                                                                                fullWidth
                                                                                                                name="amount"
                                                                                                                placeholder="Amount"
                                                                                                                value={check.amount}
                                                                                                                onChange={(e) => {
                                                                                                                        const value = e.target.value.replace(
                                                                                                                                /[^0-9.]/g,
                                                                                                                                ''
                                                                                                                        )
                                                                                                                        if (/^\d*\.?\d*$/.test(value)) {
                                                                                                                                updateCheck(index, 'amount', value)
                                                                                                                        }
                                                                                                                }}
                                                                                                                onBlur={(e) => {
                                                                                                                        const formattedValue = formatAmountAsCurrency(
                                                                                                                                e.target.value
                                                                                                                        )
                                                                                                                        updateCheck(index, 'amount', formattedValue)
                                                                                                                }}
                                                                                                                sx={styles.input}
                                                                                                                error={checkErrors[index]?.amount ? true : false}
                                                                                                                helperText={checkErrors[index]?.amount || ''}
                                                                                                                InputProps={{
                                                                                                                        startAdornment: (
                                                                                                                                <InputAdornment position="start">
                                                                                                                                        $
                                                                                                                                </InputAdornment>
                                                                                                                        ),
                                                                                                                        inputMode: 'decimal',
                                                                                                                        pattern: '[0-9]*\\.?[0-9]*'
                                                                                                                }}
                                                                                                        />
                                                                                                </Box>
                                                                                        </Box>
                                                                                </Box>
                                                                                <Box sx={styles.createDollarsContainer}>
                                                                                        <TextField
                                                                                                fullWidth
                                                                                                name="dollarAmount"
                                                                                                disabled={true}
                                                                                                placeholder=""
                                                                                                value={check.dollarAmount}
                                                                                                sx={styles.dollarInput}
                                                                                                error={checkErrors[index]?.dollarAmount ? true : false}
                                                                                                helperText={checkErrors[index]?.dollarAmount || ''}
                                                                                        />
                                                                                        <Typography sx={styles.dollarText}>Dollars</Typography>
                                                                                </Box>

                                                                                <Box sx={styles.createMemoContainer}>
                                                                                        <Box>
                                                                                                <Typography sx={styles.memoLabel}>Memo</Typography>
                                                                                                <TextField
                                                                                                        fullWidth
                                                                                                        name="memo"
                                                                                                        placeholder=""
                                                                                                        value={check.memo}
                                                                                                        onChange={(e) =>
                                                                                                                updateCheck(index, 'memo', e.target.value)
                                                                                                        }
                                                                                                        sx={styles.memoInput}
                                                                                                        error={checkErrors[index]?.memo ? true : false}
                                                                                                        helperText={checkErrors[index]?.memo || ''}
                                                                                                />
                                                                                        </Box>
                                                                                        <Box>
                                                                                                <Typography sx={styles.checkTitle}>
                                                                                                        Your Signature
                                                                                                </Typography>
                                                                                                <Typography sx={styles.checkSubTitle}>
                                                                                                        Want to sign with signature
                                                                                                </Typography>

                                                                                                <Box sx={styles.radioGroup}>
                                                                                                        <Box sx={styles.radioItem}>
                                                                                                                <Radio
                                                                                                                        name="signature"
                                                                                                                        value={true}
                                                                                                                        checked={check.signature === true}
                                                                                                                        onChange={() =>
                                                                                                                                updateCheck(index, 'signature', true)
                                                                                                                        }
                                                                                                                        sx={styles.radio}
                                                                                                                />
                                                                                                                <Typography sx={styles.radioLabel}>Yes</Typography>
                                                                                                        </Box>
                                                                                                        <Box sx={styles.radioItem}>
                                                                                                                <Radio
                                                                                                                        name="signature"
                                                                                                                        value={false}
                                                                                                                        checked={check.signature === false}
                                                                                                                        onChange={() =>
                                                                                                                                updateCheck(index, 'signature', false)
                                                                                                                        }
                                                                                                                        sx={styles.radio}
                                                                                                                />
                                                                                                                <Typography sx={styles.radioLabel}>No</Typography>
                                                                                                        </Box>
                                                                                                </Box>
                                                                                                {checkErrors[index]?.signature && (
                                                                                                        <Typography color="error" sx={styles.errorText}>
                                                                                                                {checkErrors[index].signature}
                                                                                                        </Typography>
                                                                                                )}
                                                                                        </Box>
                                                                                </Box>

                                                                                <Typography sx={styles.footerNumber}>
                                                                                        {getMICR(check.bankId, check.checkNumber)}
                                                                                </Typography>

                                                                                <Box sx={styles.checkBottomContainer}>
                                                                                        <TagsSelector
                                                                                                values={check.tags}
                                                                                                onChange={(e, val) => {
                                                                                                        const newTag = e.target.value
                                                                                                        updateCheck(index, 'tags', newTag)
                                                                                                }}
                                                                                        />

                                                                                        <Box sx={styles.checkBottomItemContainer}>
                                                                                                <Typography sx={styles.checkBottomItemlabel}>
                                                                                                        Invoice ID
                                                                                                </Typography>
                                                                                                <TextField
                                                                                                        fullWidth
                                                                                                        value={check.invoiceId || ''}
                                                                                                        name="invoiceId"
                                                                                                        placeholder="Invoice Id"
                                                                                                        onChange={(e) =>
                                                                                                                updateCheck(index, 'invoiceId', e.target.value)
                                                                                                        }
                                                                                                        sx={{
                                                                                                                ...styles.input,
                                                                                                                width: '100% !important'
                                                                                                        }}
                                                                                                />
                                                                                        </Box>
                                                                                        <FileUpload
                                                                                                attachments={check.attachments}
                                                                                                handleDropFile={(file) =>
                                                                                                        updateCheckAttachments(index, file, true)
                                                                                                }
                                                                                                handleSaveFile={(files) =>
                                                                                                        updateCheckAttachments(index, files, false)
                                                                                                }
                                                                                        />
                                                                                </Box>
                                                                        </AccordionDetails>
                                                                </Accordion>
                                                        </Box>
                                                ))}
                                                <Formik
                                                        initialValues={{
                                                                ...initialValues,
                                                                signature: wantSignature || false
                                                        }}
                                                        validationSchema={checkCreateValidationSchema}
                                                        onSubmit={handleSubmit}
                                                        innerRef={formRef}
                                                >
                                                        {({
                                                                values,
                                                                errors,
                                                                touched,
                                                                handleChange,
                                                                handleBlur,
                                                                setFieldValue,
                                                                setFieldError,
                                                                setErrors,
                                                                setFieldTouched
                                                        }) => (
                                                                <Box sx={styles.formContainer}>
                                                                        <Accordion sx={styles.addAccordionContainer}>
                                                                                <Box sx={styles.createFormContainer}>
                                                                                        {newChecks.length > 0 && (
                                                                                                <IconButton
                                                                                                        sx={styles.closeIconButton}
                                                                                                        onClick={(e) => {
                                                                                                                handleFormikSwitchOnClose()
                                                                                                        }}
                                                                                                >
                                                                                                        <CloseIcon sx={{ fontSize: '20px' }} />
                                                                                                </IconButton>
                                                                                        )}
                                                                                        <Box sx={styles.createFormHeader}>
                                                                                                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                                                                                                        <Typography sx={styles.checkTitle}>
                                                                                                                {returnSelectedUserName()}
                                                                                                        </Typography>
                                                                                                        {getUserAddress()}
                                                                                                </Box>
                                                                                                <Box sx={styles.addFormHeaderLeft}>
                                                                                                        <Box sx={styles.createTitleContainer}>
                                                                                                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                                                                                                        <Typography sx={styles.checkTitle}>
                                                                                                                                {returnSelectedUserName()}
                                                                                                                        </Typography>
                                                                                                                        {getUserAddress()}
                                                                                                                </Box>
                                                                                                                <Box sx={styles.itemContainer}>
                                                                                                                        <Typography sx={styles.itemLabel}>
                                                                                                                                Bank <br /> Account *
                                                                                                                        </Typography>
                                                                                                                        <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
                                                                                                                                <Autocomplete
                                                                                                                                        fullWidth
                                                                                                                                        options={addCustomOption(
                                                                                                                                                banksData?.data || [],
                                                                                                                                                'Add new Bank'
                                                                                                                                        )}
                                                                                                                                        getOptionLabel={(option) =>
                                                                                                                                                option.bankName || ''
                                                                                                                                        }
                                                                                                                                        value={
                                                                                                                                                banksData?.data?.find(
                                                                                                                                                        (bank) => bank._id === values.bankId
                                                                                                                                                ) || null
                                                                                                                                        }
                                                                                                                                        onOpen={() => {
                                                                                                                                                setExpandedAccordion(null)
                                                                                                                                        }}
                                                                                                                                        onChange={(event, newValue) => {
                                                                                                                                                if (newValue) {
                                                                                                                                                        handleBankChange(newValue)
                                                                                                                                                        setIsFormTouched(true)
                                                                                                                                                } else {
                                                                                                                                                        setFieldValue('bankId', '')
                                                                                                                                                        setFieldValue('checkNumber', '')
                                                                                                                                                        setIsAutoMaticCheckGeneration(false)
                                                                                                                                                }
                                                                                                                                        }}
                                                                                                                                        renderInput={(params) => (
                                                                                                                                                <TextField
                                                                                                                                                        {...params}
                                                                                                                                                        placeholder="Select Bank Account"
                                                                                                                                                        error={
                                                                                                                                                                touched.bankId && Boolean(errors.bankId)
                                                                                                                                                        }
                                                                                                                                                        helperText={
                                                                                                                                                                touched.bankId && errors.bankId
                                                                                                                                                        }
                                                                                                                                                        sx={{
                                                                                                                                                                ...styles.select,
                                                                                                                                                                '& .MuiInputBase-root': {
                                                                                                                                                                        height: '40px',
                                                                                                                                                                        width: { xs: '100%', md: '300px' }
                                                                                                                                                                }
                                                                                                                                                        }}
                                                                                                                                                />
                                                                                                                                        )}
                                                                                                                                        renderOption={(props, option) => {
                                                                                                                                                return (
                                                                                                                                                        <Box
                                                                                                                                                                component="li"
                                                                                                                                                                {...props}
                                                                                                                                                                style={
                                                                                                                                                                        option.isCustom
                                                                                                                                                                                ? styles.autoCompleteOptionsAddNew
                                                                                                                                                                                : styles.autoCompleteOptions
                                                                                                                                                                }
                                                                                                                                                        >
                                                                                                                                                                {option.isCustom ? (
                                                                                                                                                                        <>
                                                                                                                                                                                <Add
                                                                                                                                                                                        sx={{ mr: 1, color: '#1e3a5f' }}
                                                                                                                                                                                />
                                                                                                                                                                                <Typography>
                                                                                                                                                                                        {option.bankName}
                                                                                                                                                                                </Typography>
                                                                                                                                                                        </>
                                                                                                                                                                ) : (
                                                                                                                                                                        option.bankName
                                                                                                                                                                )}
                                                                                                                                                        </Box>
                                                                                                                                                )
                                                                                                                                        }}
                                                                                                                                />
                                                                                                                                {touched.bankAccount && errors.bankAccount && (
                                                                                                                                        <Typography
                                                                                                                                                color="error"
                                                                                                                                                sx={styles.errorText}
                                                                                                                                        >
                                                                                                                                                {errors.bankAccount}
                                                                                                                                        </Typography>
                                                                                                                                )}
                                                                                                                        </Box>
                                                                                                                </Box>
                                                                                                        </Box>

                                                                                                        <Box sx={styles.payeeNameContainer}>
                                                                                                                <Typography sx={styles.payeeNameLabel}>
                                                                                                                        Payee Name
                                                                                                                </Typography>

                                                                                                                <Autocomplete
                                                                                                                        fullWidth
                                                                                                                        options={addCustomOption(
                                                                                                                                payeesData?.data || [],
                                                                                                                                'Add New Payee'
                                                                                                                        )}
                                                                                                                        getOptionLabel={(option) => option.name || ''}
                                                                                                                        value={
                                                                                                                                payeesData?.data?.find(
                                                                                                                                        (payee) => payee._id === values.payeeId
                                                                                                                                ) || null
                                                                                                                        }
                                                                                                                        onChange={(event, newValue) => {
                                                                                                                                if (newValue && newValue._id === 'custom_add') {
                                                                                                                                        setAddPayeeModalOpen(true)
                                                                                                                                } else {
                                                                                                                                        handleChange({
                                                                                                                                                target: {
                                                                                                                                                        name: 'payeeId',
                                                                                                                                                        value: newValue?._id || ''
                                                                                                                                                }
                                                                                                                                        })
                                                                                                                                        setIsFormTouched(true)
                                                                                                                                }
                                                                                                                        }}
                                                                                                                        onBlur={(event) => {
                                                                                                                                handleBlur({ target: { name: 'payeeId' } })
                                                                                                                        }}
                                                                                                                        onOpen={() => {
                                                                                                                                setExpandedAccordion(null)
                                                                                                                        }}
                                                                                                                        renderInput={(params) => (
                                                                                                                                <TextField
                                                                                                                                        {...params}
                                                                                                                                        placeholder="Select Payee Name"
                                                                                                                                        error={
                                                                                                                                                touched.payeeId && Boolean(errors.payeeId)
                                                                                                                                        }
                                                                                                                                        helperText={touched.payeeId && errors.payeeId}
                                                                                                                                        sx={{
                                                                                                                                                ...styles.payeeSelect,
                                                                                                                                                '& .MuiInputBase-root': {
                                                                                                                                                        height: '40px'
                                                                                                                                                }
                                                                                                                                        }}
                                                                                                                                />
                                                                                                                        )}
                                                                                                                        renderOption={(props, option) => {
                                                                                                                                return (
                                                                                                                                        <Box
                                                                                                                                                component="li"
                                                                                                                                                {...props}
                                                                                                                                                style={
                                                                                                                                                        option.isCustom
                                                                                                                                                                ? styles.autoCompleteOptionsAddNew
                                                                                                                                                                : styles.autoCompleteOptions
                                                                                                                                                }
                                                                                                                                        >
                                                                                                                                                {option.isCustom ? (
                                                                                                                                                        <>
                                                                                                                                                                <Add sx={{ mr: 1, color: '#1e3a5f' }} />
                                                                                                                                                                <Typography>{option.name}</Typography>
                                                                                                                                                        </>
                                                                                                                                                ) : (
                                                                                                                                                        option.name
                                                                                                                                                )}
                                                                                                                                        </Box>
                                                                                                                                )
                                                                                                                        }}
                                                                                                                />
                                                                                                        </Box>

                                                                                                        {touched.payeeName && errors.payeeName && (
                                                                                                                <Typography color="error" sx={styles.errorText}>
                                                                                                                        {errors.payeeName}
                                                                                                                </Typography>
                                                                                                        )}
                                                                                                </Box>
                                                                                                <Box sx={styles.addEditHeaderRight}>
                                                                                                        <Box sx={styles.itemContainer}>
                                                                                                                <Typography sx={styles.itemLabel}>
                                                                                                                        Check <br /> Number
                                                                                                                </Typography>
                                                                                                                <TextField
                                                                                                                        fullWidth
                                                                                                                        name="checkNumber"
                                                                                                                        placeholder="Check Number"
                                                                                                                        value={values.checkNumber}
                                                                                                                        onChange={handleChange}
                                                                                                                        onBlur={async () => {
                                                                                                                                setFieldTouched('checkNumber', true)
                                                                                                                                if (values.checkNumber) {
                                                                                                                                        try {
                                                                                                                                                if (values?.bankId) {
                                                                                                                                                        const response =
                                                                                                                                                                await validateManualCheckNumber(
                                                                                                                                                                        ownerType,
                                                                                                                                                                        values.bankId,
                                                                                                                                                                        values.checkNumber
                                                                                                                                                                )
                                                                                                                                                        if (response?.isDuplicate) {
                                                                                                                                                                setFieldError(
                                                                                                                                                                        'checkNumber',
                                                                                                                                                                        'Check number already exists'
                                                                                                                                                                )
                                                                                                                                                                setErrors({
                                                                                                                                                                        ...errors,
                                                                                                                                                                        checkNumber:
                                                                                                                                                                                'Check number already exists'
                                                                                                                                                                })
                                                                                                                                                        } else {
                                                                                                                                                                setFieldValue(
                                                                                                                                                                        'checkNumber',
                                                                                                                                                                        values.checkNumber
                                                                                                                                                                )
                                                                                                                                                        }
                                                                                                                                                }
                                                                                                                                        } catch (err) {
                                                                                                                                                console.error(
                                                                                                                                                        'Error validating check number:',
                                                                                                                                                        err
                                                                                                                                                )
                                                                                                                                        }
                                                                                                                                }
                                                                                                                        }}
                                                                                                                        error={
                                                                                                                                touched.checkNumber && !!errors.checkNumber
                                                                                                                        }
                                                                                                                        helperText={
                                                                                                                                touched.checkNumber && errors.checkNumber
                                                                                                                        }
                                                                                                                        disabled={isAutoMaticCheckGeneration}
                                                                                                                        sx={{
                                                                                                                                ...styles.input,
                                                                                                                                '& .MuiInputBase-input': {
                                                                                                                                        color: isAutoMaticCheckGeneration
                                                                                                                                                ? '#e2e8f0'
                                                                                                                                                : 'black'
                                                                                                                                },
                                                                                                                                '& .MuiInputLabel-root': {
                                                                                                                                        color: '#e2e8f0'
                                                                                                                                }
                                                                                                                        }}
                                                                                                                        InputProps={{
                                                                                                                                endAdornment: isAutoMaticCheckGeneration && (
                                                                                                                                        <Typography sx={styles.checkNumberAutomatic}>
                                                                                                                                                (Automatic)
                                                                                                                                        </Typography>
                                                                                                                                )
                                                                                                                        }}
                                                                                                                />
                                                                                                        </Box>

                                                                                                        <Box sx={styles.itemContainer}>
                                                                                                                <Typography sx={styles.itemLabel}>
                                                                                                                        Issued <br /> Date
                                                                                                                </Typography>
                                                                                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                                                        <DatePicker
                                                                                                                                value={
                                                                                                                                        values.issuedDate
                                                                                                                                                ? dayjs(values.issuedDate)
                                                                                                                                                : null
                                                                                                                                }
                                                                                                                                onChange={(newValue) => {
                                                                                                                                        const formattedDate = newValue
                                                                                                                                                ? newValue.format('MM/DD/YYYY')
                                                                                                                                                : ''
                                                                                                                                        setFieldValue('issuedDate', formattedDate)
                                                                                                                                        setIsFormTouched(true)
                                                                                                                                }}
                                                                                                                                slotProps={{
                                                                                                                                        textField: {
                                                                                                                                                fullWidth: true,
                                                                                                                                                placeholder: 'Issued Date',
                                                                                                                                                error:
                                                                                                                                                        touched.issuedDate && !!errors.issuedDate,
                                                                                                                                                helperText:
                                                                                                                                                        touched.issuedDate && errors.issuedDate,
                                                                                                                                                sx: styles.input
                                                                                                                                        }
                                                                                                                                }}
                                                                                                                        />
                                                                                                                </LocalizationProvider>
                                                                                                        </Box>

                                                                                                        <Box
                                                                                                                sx={{
                                                                                                                        ...styles.itemContainer,
                                                                                                                        alignItems: 'center'
                                                                                                                }}
                                                                                                        >
                                                                                                                <Typography sx={styles.itemLabel}>
                                                                                                                        Amount
                                                                                                                </Typography>
                                                                                                                <TextField
                                                                                                                        fullWidth
                                                                                                                        name="amount"
                                                                                                                        placeholder="Amount"
                                                                                                                        value={values.amount}
                                                                                                                        onChange={(e) => {
                                                                                                                                // Only allow numbers and one decimal point
                                                                                                                                const value = e.target.value
                                                                                                                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                                                                                        handleChange(e)
                                                                                                                                        setFieldValue(
                                                                                                                                                'dollarAmount',
                                                                                                                                                numberToCurrencyWords(Number(value))
                                                                                                                                        )
                                                                                                                                }
                                                                                                                                setIsFormTouched(true)
                                                                                                                        }}
                                                                                                                        onBlur={(e) => {
                                                                                                                                const formattedValue = formatAmountAsCurrency(
                                                                                                                                        e.target.value
                                                                                                                                )
                                                                                                                                setFieldValue('amount', formattedValue)
                                                                                                                                setFieldValue(
                                                                                                                                        'dollarAmount',
                                                                                                                                        numberToCurrencyWords(Number(formattedValue))
                                                                                                                                )
                                                                                                                        }}
                                                                                                                        error={touched.amount && !!errors.amount}
                                                                                                                        helperText={touched.amount && errors.amount}
                                                                                                                        sx={styles.input}
                                                                                                                        InputProps={{
                                                                                                                                startAdornment: (
                                                                                                                                        <InputAdornment position="start">
                                                                                                                                                $
                                                                                                                                        </InputAdornment>
                                                                                                                                ),
                                                                                                                                inputMode: 'decimal',
                                                                                                                                pattern: '[0-9]*\\.?[0-9]*'
                                                                                                                        }}
                                                                                                                />
                                                                                                        </Box>
                                                                                                </Box>
                                                                                        </Box>

                                                                                        <Box sx={styles.createDollarsContainer}>
                                                                                                <TextField
                                                                                                        fullWidth
                                                                                                        multiline
                                                                                                        name="dollarAmount"
                                                                                                        placeholder=""
                                                                                                        disabled={true}
                                                                                                        value={values.dollarAmount}
                                                                                                        error={touched.dollarAmount && !!errors.dollarAmount}
                                                                                                        helperText={
                                                                                                                touched.dollarAmount && errors.dollarAmount
                                                                                                        }
                                                                                                        sx={styles.dollarInput}
                                                                                                />
                                                                                                <Typography sx={styles.dollarText}>Dollars</Typography>
                                                                                        </Box>

                                                                                        <Box sx={styles.createMemoContainer}>
                                                                                                <Box>
                                                                                                        <Typography sx={styles.memoLabel}>Memo</Typography>
                                                                                                        <TextField
                                                                                                                fullWidth
                                                                                                                name="memo"
                                                                                                                placeholder=""
                                                                                                                value={values.memo}
                                                                                                                onChange={handleChange}
                                                                                                                onBlur={handleBlur}
                                                                                                                error={touched.memo && !!errors.memo}
                                                                                                                helperText={touched.memo && errors.memo}
                                                                                                                sx={styles.memoInput}
                                                                                                        />
                                                                                                </Box>
                                                                                                <Box sx={styles.signatureContainer}>
                                                                                                        <Box>
                                                                                                                <Typography sx={styles.checkTitle}>
                                                                                                                        Your Signature
                                                                                                                </Typography>
                                                                                                                <Typography sx={styles.checkSubTitle}>
                                                                                                                        Want to sign with signature
                                                                                                                </Typography>
                                                                                                        </Box>
                                                                                                        <Box sx={styles.radioGroup}>
                                                                                                                <Box sx={styles.radioItem}>
                                                                                                                        <Radio
                                                                                                                                name="signature"
                                                                                                                                value={true}
                                                                                                                                disabled={
                                                                                                                                        !(
                                                                                                                                                banksData?.data?.find(
                                                                                                                                                        (x) => x._id === values.bankId
                                                                                                                                                )?.bankPreferences?.signatureEnabled ||
                                                                                                                                                wantSignature
                                                                                                                                        )
                                                                                                                                }
                                                                                                                                checked={values.signature === true}
                                                                                                                                onChange={(e) => {
                                                                                                                                        setFieldValue('signature', true)
                                                                                                                                        setIsFormTouched(true)
                                                                                                                                }}
                                                                                                                                sx={styles.radio}
                                                                                                                        />
                                                                                                                        <Typography sx={styles.radioLabel}>
                                                                                                                                Yes
                                                                                                                        </Typography>
                                                                                                                </Box>
                                                                                                                <Box sx={styles.radioItem}>
                                                                                                                        <Radio
                                                                                                                                name="signature"
                                                                                                                                value={false}
                                                                                                                                disabled={
                                                                                                                                        !(
                                                                                                                                                banksData?.data?.find(
                                                                                                                                                        (x) => x._id === values.bankId
                                                                                                                                                )?.bankPreferences?.signatureEnabled ||
                                                                                                                                                wantSignature
                                                                                                                                        )
                                                                                                                                }
                                                                                                                                checked={values.signature === false}
                                                                                                                                onChange={(e) => {
                                                                                                                                        setFieldValue('signature', false)
                                                                                                                                        setIsFormTouched(true)
                                                                                                                                }}
                                                                                                                                sx={styles.radio}
                                                                                                                        />
                                                                                                                        <Typography sx={styles.radioLabel}>No</Typography>
                                                                                                                </Box>
                                                                                                        </Box>
                                                                                                </Box>
                                                                                        </Box>

                                                                                        <Typography sx={styles.footerNumber}>
                                                                                                {getMICR(values.bankId, values.checkNumber)}
                                                                                        </Typography>
                                                                                </Box>
                                                                        </Accordion>
                                                                        <Box sx={styles.checkBottomContainer}>
                                                                                <TagsSelector
                                                                                        values={values.tags}
                                                                                        onChange={(e, val) => {
                                                                                                const newTag = e.target.value
                                                                                                setFieldValue('tags', [...newTag])
                                                                                        }}
                                                                                        errors={errors}
                                                                                        touched={touched}
                                                                                />
                                                                                <Box sx={styles.checkBottomItemContainer}>
                                                                                        <Typography sx={styles.checkBottomItemlabel}>
                                                                                                Invoice ID
                                                                                        </Typography>
                                                                                        <TextField
                                                                                                fullWidth
                                                                                                name="invoiceId"
                                                                                                placeholder="Invoice Id"
                                                                                                value={values.invoiceId}
                                                                                                onChange={handleChange}
                                                                                                sx={{
                                                                                                        ...styles.input,
                                                                                                        width: '100% !important'
                                                                                                }}
                                                                                        />
                                                                                </Box>

                                                                                <FileUpload
                                                                                        fileCategory="pdf"
                                                                                        handleFileUpdate={handleFileUpdate}
                                                                                        attachments={values.attachments}
                                                                                        handleDropFile={(file) =>
                                                                                                setFieldValue(
                                                                                                        'attachments',
                                                                                                        values.attachments.length === 0
                                                                                                                ? file
                                                                                                                : [...values.attachments, ...file]
                                                                                                )
                                                                                        }
                                                                                        handleSaveFile={(files) =>
                                                                                                setFieldValue('attachments', files)
                                                                                        }
                                                                                />
                                                                        </Box>

                                                                        <Box sx={styles.recurringContainer}>
                                                                                <Box sx={styles.recurringHeader}>
                                                                                        <Box>
                                                                                                <Typography sx={styles.checkBottomItemlabel}>
                                                                                                        Recurring Check
                                                                                                </Typography>
                                                                                                <Typography sx={styles.recurringSubtitle}>
                                                                                                        Generate this check on a repeating schedule as
                                                                                                        future-dated drafts.
                                                                                                </Typography>
                                                                                        </Box>
                                                                                        <FormControlLabel
                                                                                                control={
                                                                                                        <Switch
                                                                                                                checked={isRecurring}
                                                                                                                onChange={(e) =>
                                                                                                                        handleRecurringToggle(e.target.checked)
                                                                                                                }
                                                                                                        />
                                                                                                }
                                                                                                label={isRecurring ? 'On' : 'Off'}
                                                                                                sx={{ mr: 0 }}
                                                                                        />
                                                                                </Box>

                                                                                {isRecurring && (
                                                                                        <>
                                                                                                <Box sx={styles.recurringFields}>
                                                                                                        <Box sx={styles.recurringField}>
                                                                                                                <Typography sx={styles.itemLabel}>
                                                                                                                        Frequency *
                                                                                                                </Typography>
                                                                                                                <Select
                                                                                                                        value={recurringFrequency}
                                                                                                                        onChange={(e) => {
                                                                                                                                setRecurringFrequency(e.target.value)
                                                                                                                                setRecurringError('')
                                                                                                                        }}
                                                                                                                        sx={{
                                                                                                                                ...styles.select,
                                                                                                                                width: { xs: '100%', sm: '220px' }
                                                                                                                        }}
                                                                                                                >
                                                                                                                        {RECURRING_FREQUENCIES.map((option) => (
                                                                                                                                <MenuItem
                                                                                                                                        key={option.value}
                                                                                                                                        value={option.value}
                                                                                                                                >
                                                                                                                                        {option.label}
                                                                                                                                </MenuItem>
                                                                                                                        ))}
                                                                                                                </Select>
                                                                                                        </Box>
                                                                                                        <Box sx={styles.recurringField}>
                                                                                                                <Typography sx={styles.itemLabel}>
                                                                                                                        Number of Occurrences *
                                                                                                                </Typography>
                                                                                                                <TextField
                                                                                                                        type="number"
                                                                                                                        value={recurringCount}
                                                                                                                        onChange={(e) => {
                                                                                                                                setRecurringCount(e.target.value)
                                                                                                                                setRecurringError('')
                                                                                                                        }}
                                                                                                                        inputProps={{
                                                                                                                                min: RECURRING_MIN_OCCURRENCES,
                                                                                                                                max: RECURRING_MAX_OCCURRENCES,
                                                                                                                                step: 1
                                                                                                                        }}
                                                                                                                        sx={{
                                                                                                                                ...styles.input,
                                                                                                                                width: { xs: '100%', sm: '220px' }
                                                                                                                        }}
                                                                                                                />
                                                                                                        </Box>
                                                                                                </Box>

                                                                                                {values.issuedDate &&
                                                                                                        recurringOccurrences >=
                                                                                                                RECURRING_MIN_OCCURRENCES && (
                                                                                                                <Typography sx={styles.recurringPreview}>
                                                                                                                        {recurringOccurrences} checks will be created
                                                                                                                        from{' '}
                                                                                                                        {computeRecurringDate(
                                                                                                                                values.issuedDate,
                                                                                                                                recurringFrequency,
                                                                                                                                0
                                                                                                                        )}{' '}
                                                                                                                        to{' '}
                                                                                                                        {computeRecurringDate(
                                                                                                                                values.issuedDate,
                                                                                                                                recurringFrequency,
                                                                                                                                recurringOccurrences - 1
                                                                                                                        )}
                                                                                                                        .
                                                                                                                </Typography>
                                                                                                        )}

                                                                                                {recurringError && (
                                                                                                        <Typography
                                                                                                                color="error"
                                                                                                                sx={styles.errorText}
                                                                                                        >
                                                                                                                {recurringError}
                                                                                                        </Typography>
                                                                                                )}
                                                                                        </>
                                                                                )}
                                                                        </Box>
                                                                </Box>
                                                        )}
                                                </Formik>
                                                <Tooltip title={exceedTrialLimit ? EXCEED_TRIAL_LIMIT_WARNING : ''}>
                                                        <span>
                                                                <Button
                                                                        sx={styles.addCheckButton}
                                                                        onClick={handleAddCheck}
                                                                        disabled={exceedTrialLimit}
                                                                >
                                                                        Add Check
                                                                </Button>
                                                        </span>
                                                </Tooltip>
                                        </Box>
                                        {addNewBankModal && (
                                                <AddNewModal open={addNewBankModal} onClose={handleNewBank} />
                                        )}
                                        {isAddPayeeModalOpen && (
                                                <FormModalMUI
                                                        title="Add new payee"
                                                        open={isAddPayeeModalOpen}
                                                        maxWidth="sm"
                                                        onClose={() => closeAddPayee(false)}
                                                        hideDividers={true}
                                                        styles={{
                                                                title: {
                                                                        fontSize: '24px',
                                                                        fontWeight: 600,
                                                                        color: '#111827',
                                                                        mb: 1,
                                                                        lineHeight: 1.2
                                                                }
                                                        }}
                                                >
                                                        <AddPayee
                                                                onClose={closeAddPayee}
                                                                warning={showWarning}
                                                                setWarning={setWarning}
                                                        />
                                                </FormModalMUI>
                                        )}
                                </>
                        }
                        actions={
                                <Box sx={styles.actionsContainer}>
                                        <Button
                                                onClick={handleSaveAndPrint}
                                                variant="outlined"
                                                sx={styles.cancelButton}
                                                disabled={loading}
                                                endIcon={loading && <CircularProgress size={14} />}
                                        >
                                                Save & Print
                                        </Button>

                                        <CustomButton
                                                variant="outlined"
                                                color="primary"
                                                onClick={handleSaveCheck}
                                                disabled={loading}
                                                endIcon={loading && <CircularProgress size={14} />}
                                        >
                                                Save Check
                                        </CustomButton>
                                </Box>
                        }
                />
        )
}
