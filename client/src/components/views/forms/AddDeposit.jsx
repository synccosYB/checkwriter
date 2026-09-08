import React from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import {
	Box,
	TextField,
	Typography,
	Autocomplete,
	InputAdornment,
	MenuItem
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

import FormComponents from '../../shared/forms'

import ButtonComponent from '../../shared/ButtonComponent'
import { AddOutlined } from '@mui/icons-material'
import useBanks from '../../../API/banks/useBanks'
import useAddDeposit from '../../../API/transactions/useAddDeposit'

const AddDeposit = ({ onClose, isEdit }) => {
	const { mutate: addDeposit } = useAddDeposit()
	const { data } = useBanks()

	const banks = data?.data || []

	const validationSchema = Yup.object({
		bankId: Yup.string().required('Required!'),
		amount: Yup.string().required('Required!'),
		date: Yup.string().required('Required!')
	})

	const onSubmit = async (values) => {
		let body = {}

		body.bankId = values.bankId
		body.amount = values.amount
		body.issueDate = values.date

		addDeposit(
			{ body },
			{
				onSuccess: async (res) => {
					const created = res?.data || res // support either shape
					const createdId = created?._id || created?.data?._id
					if (createdId && values.attachments?.length > 0) {
						const formData = new FormData()
						formData.append('entityType', EntityType.TRANSACTION)
						formData.append('entityId', createdId)
						values.attachments.forEach((file) => {
							formData.append('files', file.file)
							formData.append('descriptions', file.description || '')
						})
						try {
							await uploadAttachmentAsync(formData)
						} catch (e) {
							// swallow for now; snackbar handled globally
						}
					}
					// Force refresh the transactions table
					queryClient.invalidateQueries({
						queryKey: ['transactions'],
						exact: false
					})
					setSubmitting(false)
					onClose()
				},
				onError: () => {
					setSubmitting(false)
				}
			}
		)
	}

	// Add Bank modal handling
	const [isAddBankModalOpen, setIsAddBankModalOpen] = React.useState(false)
	const [isDirty, setIsDirty] = React.useState(false)
	const [warning, setWarning] = React.useState(false)

	const openAddBank = () => setIsAddBankModalOpen(true)
	const closeAddBank = async (forced) => {
		if (isDirty && !forced) {
			setWarning(true)
			return
		}
		setIsAddBankModalOpen(false)
		setWarning(false)
		setIsDirty(false)
		await refetchBanks()
	}

	// Add Payee modal handling
	const [isAddPayeeModalOpen, setAddPayeeModalOpen] = React.useState(false)
	const [showWarning, setWarningPayee] = React.useState(false)
	const formikHelpersRef = React.useRef(null)

	const closeAddPayee = (newPayee) => {
		if (newPayee && newPayee?.data) {
			formikHelpersRef.current?.setFieldValue?.('payeeId', newPayee.data._id)
		}
		setAddPayeeModalOpen(false)
	}

	return (
		<>
			<Formik
				initialValues={{
					payeeId: '',
					bankId: '',
					amount: '',
					issueDate: dayjs().format('MM/DD/YYYY'),
					category: '',
					status: 'pending',
					description: '',
					attachments: []
				}}
				validationSchema={validationSchema}
				onSubmit={onSubmit}
			>
				{({
					values,
					errors,
					touched,
					setFieldValue,
					handleChange,
					handleSubmit
				}) => (
					<Box
						component="form"
						onSubmit={handleSubmit}
						className="px-3 pt-3 pb-3"
					>
						{(() => {
							formikHelpersRef.current = { setFieldValue }
						})()}
						<div className="row g-3">
							<div className="col-12">
								<Typography className="mb-1">Contact</Typography>
								<Autocomplete
									fullWidth
									options={addCustomOption(payees, 'Add New Payee', true)}
									getOptionLabel={(option) => option.name || ''}
									value={payees.find((p) => p._id === values.payeeId) || null}
									onChange={(event, newValue) => {
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
											error={touched.payeeId && Boolean(errors.payeeId)}
											helperText={touched.payeeId && errors.payeeId}
										/>
									)}
									renderOption={(props, option) => (
										<li {...props}>
											{option.isCustom ? (
												<Box sx={{ display: 'flex', alignItems: 'center' }}>
													<Add sx={{ mr: 1, color: '#1e3a5f' }} />
													<Typography>{option.name}</Typography>
												</Box>
											) : (
												option.name
											)}
										</li>
									)}
								/>
							</div>

							<div className="col-12">
								<Typography className="mb-1">
									Select a Bank Account Number*
								</Typography>
								<Box className="d-flex align-items-start justify-content-center w-100">
									<Autocomplete
										fullWidth
										options={addCustomOption(banks, 'Add Bank Account')}
										getOptionLabel={(option) => option.bankName || ''}
										value={banks.find((b) => b._id === values.bankId) || null}
										onChange={(event, newValue) => {
											if (newValue && newValue._id === 'custom_add') {
												openAddBank()
											} else {
												setFieldValue('bankId', newValue?._id || '')
											}
										}}
										renderInput={(params) => (
											<TextField
												{...params}
												placeholder="Select Bank Account"
												error={touched.bankId && Boolean(errors.bankId)}
												helperText={touched.bankId && errors.bankId}
											/>
										)}
										renderOption={(props, option) => (
											<li {...props}>
												{option.isCustom ? (
													<Box sx={{ display: 'flex', alignItems: 'center' }}>
														<Add sx={{ mr: 1, color: '#1e3a5f' }} />
														<Typography>{option.bankName}</Typography>
													</Box>
												) : (
													option.bankName
												)}
											</li>
										)}
									/>
								</Box>
							</div>

							<div className="col-12 col-md-6">
								<Typography className="mb-1">Amount (USD)</Typography>
								<TextField
									fullWidth
									name="amount"
									value={values.amount}
									onChange={(e) => {
										const value = e.target.value
										if (value === '' || /^\d*\.?\d*$/.test(value)) {
											setFieldValue('amount', value)
										}
									}}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">$</InputAdornment>
										),
										inputMode: 'decimal',
										pattern: '[0-9]*\\.?[0-9]*'
									}}
									error={touched.amount && Boolean(errors.amount)}
									helperText={touched.amount && errors.amount}
								/>
							</div>

							<div className="col-12 col-md-6">
								<Typography className="mb-1">Issue Date</Typography>
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<DatePicker
										value={values.issueDate ? dayjs(values.issueDate) : null}
										onChange={(newValue) => {
											const formatted = newValue
												? newValue.format('MM/DD/YYYY')
												: ''
											setFieldValue('issueDate', formatted)
										}}
										slotProps={{
											textField: {
												fullWidth: true,
												error: touched.issueDate && Boolean(errors.issueDate),
												helperText: touched.issueDate && errors.issueDate
											}
										}}
									/>
								</LocalizationProvider>
							</div>

							<div className="col-12 col-md-6">
								<Typography className="mb-1">Category</Typography>
								<Autocomplete
									fullWidth
									options={CATEGORIES}
									value={values.category || ''}
									onChange={(_, newValue) =>
										setFieldValue('category', newValue || '')
									}
									renderInput={(params) => (
										<TextField {...params} placeholder="Choose a category" />
									)}
								/>
							</div>

							<div className="col-12 col-md-6">
								<Typography className="mb-1">Status</Typography>
								<TextField
									select
									fullWidth
									name="status"
									value={values.status}
									onChange={handleChange}
								>
									{STATUS_OPTIONS.map((s) => (
										<MenuItem key={s} value={s} className="text-capitalize">
											{s}
										</MenuItem>
									))}
								</TextField>
							</div>

							<div className="col-12">
								<Typography className="mb-1">Description</Typography>
								<TextField
									fullWidth
									name="description"
									value={values.description}
									onChange={handleChange}
									multiline
									rows={3}
									placeholder="Add a short note"
									error={touched.description && Boolean(errors.description)}
									helperText={touched.description && errors.description}
								/>
							</div>

							<div className="col-12">
								<FileUpload
									attachments={values.attachments}
									handleDropFile={(files) =>
										setFieldValue(
											'attachments',
											values.attachments.length === 0
												? files
												: [...values.attachments, ...files]
										)
									}
									handleSaveFile={(files) =>
										setFieldValue('attachments', files)
									}
								/>
							</div>
						</div>

						<div className="d-flex flex-row align-items-center justify-content-evenly mt-3">
							<button
								type="button"
								className="common-btn bg-white light"
								onClick={() => onClose(false)}
							>
								Cancel
							</button>
							<ButtonComponent
								text={isEdit ? 'Save' : 'Add Deposit'}
								type="submit"
								variant="dark"
							/>
						</div>
					</Box>
				)}
			</Formik>

			{/* Add Bank Modal */}
			<FormModalMUI
				title="Add Bank"
				open={isAddBankModalOpen}
				maxWidth="sm"
				onClose={closeAddBank}
			>
				<AddBank
					onClose={closeAddBank}
					setDirty={setIsDirty}
					warning={warning}
					setWarning={setWarning}
				/>
			</FormModalMUI>

			{/* Add Payee Modal */}
			<FormModalMUI
				title="Add new payee"
				open={isAddPayeeModalOpen}
				maxWidth="md"
				onClose={() => setAddPayeeModalOpen(false)}
			>
				<AddPayee
					onClose={closeAddPayee}
					warning={showWarning}
					setWarning={setWarningPayee}
				/>
			</FormModalMUI>
		</>
	)
}

export default AddDeposit
