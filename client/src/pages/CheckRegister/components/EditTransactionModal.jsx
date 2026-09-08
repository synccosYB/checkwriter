import { useState, useRef, useEffect } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import {
	Box,
	Typography,
	TextField,
	Autocomplete,
	InputAdornment,
	Button,
	MenuItem,
	CircularProgress
} from '@mui/material'
import { CustomDialog } from '../../../components/dialog/CustomDialog'
import { Add } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

import useBanks from '../../../API/banks/useBanks'
import usePayees from '../../../API/payees/usePayees'
import useUpdateTransaction from '../../../API/transactions/useUpdateTransaction'
import { useUploadAttachments } from '../../../API/attachments/useUploadAttachments'
import { EntityType } from '../../../types/attachment.types'
import { addCustomOption } from '../../MyChecks/utils/helpers'
import FileUpload from '../../MyChecks/components/FileUpload'
import { queryClient } from '../../..'
import { styles } from '../styles'
import { CustomButton } from '../../../components/buttons/CustomButton'
import FormModalMUI from '../../../components/shared/Modals/FormModalMUI'
import AddPayee from '../../../components/views/forms/AddPayee'
import { useGetAttachments } from '../../../API/attachments/useGetAttachments'

const CATEGORIES = [
	'Deposit',
	'Groceries',
	'Mortgage',
	'Other',
	'Cash',
	'Credit Card'
]
const STATUS_OPTIONS = ['pending', 'cleared', 'open']

const validationSchema = Yup.object({
	bankId: Yup.string().required('Bank is required'),
	amount: Yup.number()
		.typeError('Enter a valid amount')
		.notOneOf([0], 'Amount cannot be zero')
		.required('Amount is required'),
	issueDate: Yup.string().required('Issue date is required'),
	status: Yup.string().oneOf(STATUS_OPTIONS),
	category: Yup.string().nullable(),
	description: Yup.string().max(500, 'Max 500 characters')
})

export default function EditTransactionModal({
	open,
	onClose,
	transaction,
	attachments = [],
	handleAttachmentSave
}) {
	const formRef = useRef(null)
	const { data: banksData } = useBanks()
	const { data: payeesData } = usePayees({ status: 'active' })
	const { mutate: updateTransaction } = useUpdateTransaction()
	const { mutateAsync: uploadAttachmentAsync } = useUploadAttachments()
	const [loading, setLoading] = useState(false)

	const banks = banksData?.data || []
	const payees = payeesData?.data || []

	const [isAddPayeeModalOpen, setAddPayeeModalOpen] = useState(false)

	const { data: attachmentsData, refetch: refetchAttachments } =
		useGetAttachments({
			entityId: transaction._id,
			entityType: EntityType.TRANSACTION
		})

	const [showWarning, setWarning] = useState(false)

	// Create initial values from transaction data
	const initialValues = transaction
		? {
				payeeId: transaction?.payee?._id || '',
				bankId: transaction?.bank?._id || '',
				amount: transaction.amount || '',
				issueDate: transaction.issueDate
					? dayjs(transaction.issueDate).format('MM/DD/YYYY')
					: dayjs().format('MM/DD/YYYY'),
				category: transaction.category || '',
				status: transaction.status || 'pending',
				description: transaction.description || '',
				attachments: attachments
		  }
		: {
				payeeId: '',
				bankId: '',
				amount: '',
				issueDate: dayjs().format('MM/DD/YYYY'),
				category: '',
				status: 'pending',
				description: '',
				attachments: []
		  }

	useEffect(() => {
		if (attachmentsData?.attachments && formRef.current) {
			formRef.current.setFieldValue('attachments', attachmentsData.attachments)
		}
	}, [attachmentsData])

	const handleSubmit = (values, { setSubmitting }) => {
		const body = {
			bankId: values.bankId,
			amount: values.amount,
			issueDate: values.issueDate,
			description: values.description || '',
			category: values.category || '',
			status: values.status || 'pending',
			payeeId: values.payeeId || ''
		}

		updateTransaction(
			{ transactionId: transaction._id, body },
			{
				onSuccess: async (res) => {
					setSubmitting(false)
					onClose()
				},
				onError: () => setSubmitting(false)
			}
		)
	}

	const handleSaveAttachments = async (
		filesToUpload,
		filesToDelete,
		filesToUpdate
	) => {
		await handleAttachmentSave(filesToUpload, filesToDelete, filesToUpdate)
		refetchAttachments()
	}

	const closeAddPayee = (newPayee) => {
		if (newPayee && newPayee?.data) {
			formRef.current.setFieldValue('payeeId', newPayee?.data._id)
		}
		setAddPayeeModalOpen(false)
	}

	if (!transaction) {
		return null
	}

	return (
		<CustomDialog
			open={open}
			onClose={onClose}
			title="Edit Transaction"
			sx={styles.addTransactionModal.dialog}
			content={
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={handleSubmit}
					innerRef={formRef}
					enableReinitialize
				>
					{({
						values,
						errors,
						touched,
						setFieldValue,
						handleChange,
						handleSubmit
					}) => (
						<>
							<Box sx={styles.addTransactionModal.container}>
								<Typography sx={styles.addTransactionModal.description}>
									Make any necessary updates below and click "Save" to apply
									changes.
								</Typography>

								{/* Contact */}
								<Box>
									<Typography sx={styles.addTransactionModal.label}>
										Contact
									</Typography>
									<Autocomplete
										fullWidth
										options={addCustomOption(payees, 'Add New Contact', true)}
										getOptionLabel={(option) => option?.name || ''}
										value={payees.find((p) => p._id === values.payeeId) || null}
										isOptionEqualToValue={(option, value) => {
											if (!value) return false
											return option._id === value._id
										}}
										onChange={(_, newValue) => {
											if (newValue && newValue._id === 'custom_add') {
												setAddPayeeModalOpen(true)
											} else {
												setFieldValue('payeeId', newValue?._id || '')
											}
										}}
										renderInput={(params) => (
											<TextField
												{...params}
												placeholder="Select Contact"
												sx={styles.addTransactionModal.autoField}
											/>
										)}
										renderOption={(props, option) => (
											<li {...props}>
												{option.isCustom ? (
													<Box
														sx={styles.addTransactionModal.autocompleteOption}
													>
														<Add sx={styles.addTransactionModal.addIcon} />
														<Typography>{option.name}</Typography>
													</Box>
												) : (
													option.name
												)}
											</li>
										)}
									/>
								</Box>

								{/* Row: Bank + Amount */}
								<Box sx={styles.addTransactionModal.gridRow}>
									<Box>
										<Typography sx={styles.addTransactionModal.label}>
											Select a Bank Account*
										</Typography>
										<Autocomplete
											fullWidth
											options={addCustomOption(banks, 'Add Bank Account')}
											getOptionLabel={(option) => option?.bankName || ''}
											value={banks.find((b) => b._id === values.bankId) || null}
											isOptionEqualToValue={(option, value) => {
												if (!value) return false
												return option._id === value._id
											}}
											onChange={(_, newValue) => {
												if (newValue && newValue._id === 'custom_add') {
													// TODO: open add bank modal
												} else {
													setFieldValue('bankId', newValue?._id || '')
												}
											}}
											renderInput={(params) => (
												<TextField
													{...params}
													placeholder="Select a Bank Account"
													sx={styles.addTransactionModal.autoField}
													error={touched.bankId && Boolean(errors.bankId)}
													helperText={touched.bankId && errors.bankId}
												/>
											)}
											renderOption={(props, option) => (
												<li {...props}>
													{option.isCustom ? (
														<Box
															sx={styles.addTransactionModal.autocompleteOption}
														>
															<Add sx={styles.addTransactionModal.addIcon} />
															<Typography>{option.bankName}</Typography>
														</Box>
													) : (
														option.bankName
													)}
												</li>
											)}
										/>
									</Box>
									<Box>
										<Typography sx={styles.addTransactionModal.label}>
											Amount*
										</Typography>
										<TextField
											fullWidth
											name="amount"
											type="number"
											value={values.amount}
											onChange={(e) => {
												const v = e.target.value
												if (v === '' || v !== '0') setFieldValue('amount', v)
											}}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">$</InputAdornment>
												),
												inputMode: 'decimal',
												pattern: '[0-9]*\\.?[0-9]*'
											}}
											placeholder="$0"
											sx={styles.addTransactionModal.textField}
											error={touched.amount && Boolean(errors.amount)}
											helperText={touched.amount && errors.amount}
										/>
									</Box>
								</Box>

								{/* Row: Issue Date + Category */}
								<Box sx={styles.addTransactionModal.gridRow}>
									<Box>
										<Typography sx={styles.addTransactionModal.label}>
											Issue Date*
										</Typography>
										<LocalizationProvider dateAdapter={AdapterDayjs}>
											<DatePicker
												value={
													values.issueDate ? dayjs(values.issueDate) : null
												}
												onChange={(newValue) => {
													const formatted = newValue
														? newValue.format('MM/DD/YYYY')
														: ''
													setFieldValue('issueDate', formatted)
												}}
												slotProps={{
													textField: {
														fullWidth: true,
														sx: styles.addTransactionModal.textField,
														error:
															touched.issueDate && Boolean(errors.issueDate),
														helperText: touched.issueDate && errors.issueDate
													}
												}}
											/>
										</LocalizationProvider>
									</Box>
									<Box>
										<Typography sx={styles.addTransactionModal.label}>
											Category
										</Typography>
										<Autocomplete
											fullWidth
											options={['', ...CATEGORIES]}
											value={values.category || ''}
											isOptionEqualToValue={(option, value) => option === value}
											onChange={(_, v) => setFieldValue('category', v || '')}
											renderInput={(params) => (
												<TextField
													{...params}
													placeholder="Category"
													sx={styles.addTransactionModal.autoField}
												/>
											)}
										/>
									</Box>
								</Box>

								{/* Row: Status + Description */}
								<Box sx={styles.addTransactionModal.gridRow}>
									<Box>
										<Typography sx={styles.addTransactionModal.label}>
											Status
										</Typography>
										<TextField
											select
											fullWidth
											name="status"
											value={values.status}
											onChange={handleChange}
											sx={styles.addTransactionModal.autoField}
										>
											{STATUS_OPTIONS.map((s) => (
												<MenuItem key={s} value={s} className="text-capitalize">
													{s === 'open' ? 'Pending' : s}
												</MenuItem>
											))}
										</TextField>
									</Box>
									<Box>
										<Typography sx={styles.addTransactionModal.label}>
											Description
										</Typography>
										<TextField
											fullWidth
											name="description"
											value={values.description}
											onChange={handleChange}
											placeholder="Description"
											sx={styles.addTransactionModal.autoField}
										/>
									</Box>
								</Box>

								{/* New Attachments */}
								<Box sx={{ mt: '16px' }}>
									{/* <Typography sx={styles.addTransactionModal.label}>
									Add New Attachments
								</Typography> */}
									<FileUpload
										attachments={values.attachments}
										handleDropFile={(file) => handleSaveAttachments(file)}
										handleSaveFile={handleSaveAttachments}
									/>
								</Box>
							</Box>
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
						</>
					)}
				</Formik>
			}
			actions={
				<Box sx={styles.actionsContainer}>
					<Button onClick={onClose} variant="outlined" sx={styles.cancelButton}>
						Cancel
					</Button>

					<CustomButton
						variant="outlined"
						color="primary"
						onClick={() => formRef.current?.handleSubmit?.()}
						endIcon={loading && <CircularProgress size={14} />}
					>
						Save Changes
					</CustomButton>
				</Box>
			}
		/>
	)
}
