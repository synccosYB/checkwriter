/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import { CustomDialog } from '../../../../../components/dialog/CustomDialog'
import {
	Box,
	Typography,
	Button,
	TextField,
	Radio,
	InputAdornment,
	Autocomplete,
	CircularProgress
} from '@mui/material'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { Formik } from 'formik'

import { styles } from '../../../styles'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import useBanks from '../../../../../API/banks/useBanks'
import usePayees from '../../../../../API/payees/usePayees'
import useAddresses from '../../../../../API/addresses/useAddresses'
import useUserInfo from '../../../../../API/users/useUserInfo'
import dayjs from 'dayjs'
import useUpdateCheck from '../../../../../API/checks/useUpdateCheck'
import {
	getNextCheckNumber,
	validateManualCheckNumber
} from '../../../../../API/banks/useNextCheckNumber'
import { useSelector } from 'react-redux'
import { numberToCurrencyWords } from '../../../../../utils/helpers/formatCurrency'
import {
	blankCheckValidationSchema,
	checkCreateValidationSchema
} from '../../../utils/validationSchema'
import useOrganizations from '../../../../../API/users/organizations/useOrganizations'
import { CHECK_STATUS } from '../../../../../types/check.types'
import TagsSelector from '../../TagsSelector'
import { AddNewModal } from '../../../../Bank/components/modals'
import FormModalMUI from '../../../../../components/shared/Modals/FormModalMUI'
import AddPayee from '../../../../../components/views/forms/AddPayee'
import { Add } from '@mui/icons-material'
import { addCustomOption } from '../../../utils/helpers'
import { EntityType } from '../../../../../types/attachment.types'
import { useGetAttachments } from '../../../../../API/attachments/useGetAttachments'
import FileUpload from '../../FileUpload'

export const EditModal = ({
	open,
	onClose,
	handleOpenUnsavedAlert,
	checkData,
	handleSaveandPrint,
	handleAttachmentSave
}) => {
	const [isAutoMaticCheckGeneration, setIsAutoMaticCheckGeneration] =
		useState(false)
	const { data: userData } = useUserInfo()
	const { data: banksData } = useBanks({includeBankId: checkData?.bank?._id || ''})
	const { data: payeesData } = usePayees({includePayeeId: checkData?.payee?._id || '', status:'active'})
	const { data: addresses } = useAddresses()
	const { mutateAsync: updateCheck, isSuccess,  } = useUpdateCheck()
	const [isFormTouched, setIsFormTouched] = useState(false)
	const selectedOrganization = useSelector(
		(state) => state.appData.selectedOrganization
	)
	const { data: organizationData } = useOrganizations()
	const ownerType = selectedOrganization ? 'organization' : 'user'
	const [loading, setLoading] = useState(false)

	const [addNewBankModal, setAddNewBankModal] = useState(false)
	const [isAddPayeeModalOpen, setAddPayeeModalOpen] = useState(false)

	const [isDirty, setIsDirty] = useState(false)
	const [showWarning, setWarning] = useState(false)

	const { data: attachmentsData, refetch: refetchAttachments } =
		useGetAttachments({ entityId: checkData._id, entityType: EntityType.CHECK })

	const setDirty = (dirty) => {
		setIsDirty(dirty)
	}

	const wantSignature = selectedOrganization
			? organizationData?.find((x) => x._id === selectedOrganization)
					?.preferences.wantSignature
			: userData?.preferences?.wantSignature


	const isQbCheck = !!checkData.qbCheckId


	const userAddress = addresses ? addresses[0] : null
	const formRef = useRef(null)
	const isblank = checkData?.isBlankCheck
	const initialValues = {
		bankId: checkData?.bank?._id || '',
		payeeId: checkData?.payee?._id || '',
		checkNumber: checkData?.checkNumber || '',
		issuedDate:
			checkData?.issuedDate ||
			new Date().toLocaleDateString('en-US', {
				month: '2-digit',
				day: '2-digit',
				year: 'numeric'
			}),
		amount: checkData?.amount || '',
		memo: checkData?.memo || '',
		dollarAmount: checkData?.amount
			? numberToCurrencyWords(Number(checkData?.amount))
			: '',
		signature: checkData?.isSignatureSelected || false,
		tags: checkData?.tags || [],
		invoiceId: checkData?.invoiceId || '',
		attachments: checkData?.attachments || []
	}
	const [isPrinting, setIsPrinting] = useState(false)

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

	const handleSubmit = async (values, { setSubmitting, resetForm }) => {
		try {
			setLoading(true)
			const req = {
				checkNumber: values.checkNumber,
				amount: values.amount,
				issuedDate: values.issuedDate,
				memo: values.memo,
				invoiceId: values.invoiceId,
				tags: values.tags,
				isSignatureSelected: values.signature,
				status: isblank ? CHECK_STATUS.PRINTED : checkData?.status,
				bankId: values.bankId,
				payeeId: values.payeeId
			}
			if (!req.payeeId) delete req.payeeId
			await updateCheck({ body: req, id: checkData._id })
		} catch (error) {
			console.error('Error submitting check:', error)
		} finally {
			setSubmitting(false)
		}
	}

	useEffect(() => {
		if (attachmentsData?.attachments && formRef.current) {
			formRef.current.setFieldValue('attachments', attachmentsData.attachments)
		}
	}, [attachmentsData])

	const handleClose = () => {
		if (isFormTouched) {
			handleOpenUnsavedAlert()
		} else {
			onClose()
		}
	}

	const handleBankChange = async (bank) => {
		const bankId = bank?._id
		if (!bankId) return
		if (bankId === 'custom_add') {
			setAddNewBankModal(true)
			return
		}
		formRef.current.setFieldValue('bankId', bankId)
		if (bank?.bankPreferences?.checkNoGeneration === 'auto') {
			setIsAutoMaticCheckGeneration(true)
			const { nextAvailableCheckNumber } = await getNextCheckNumber(
				ownerType,
				bankId
			)
			formRef.current.setFieldValue('checkNumber', nextAvailableCheckNumber)
		} else {
			setIsAutoMaticCheckGeneration(false)
			formRef.current.setFieldValue('bankId', bankId)
			formRef.current.setFieldValue('checkNumber', '')
		}

		formRef.current.setFieldValue(
			'signature',
			bank?.bankPreferences?.signatureEnabled
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

	useEffect(() => {
		if (isSuccess) {
			if (isPrinting) {
				handleSaveandPrint([checkData])
				onClose()
				setLoading(false)
			} else {
				onClose()
				setLoading(false)
			}
		}
	}, [isSuccess])

	const handleNewBank = (newBank) => {
		if (newBank?.data) {
			handleBankChange(newBank.data)
		}
		setAddNewBankModal(false)
	}
	const closeAddPayee = (newPayee) => {
		if (newPayee && newPayee?.data) {
			formRef.current.setFieldValue('payeeId', newPayee?.data._id)
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

	const handleSaveAttachments = async (
		filesToUpload,
		filesToDelete,
		filesToUpdate
	) => {
		await handleAttachmentSave(filesToUpload, filesToDelete, filesToUpdate)
		refetchAttachments()
	}
	return (
		<CustomDialog
			open={open}
			onClose={handleClose}
			width={{
				xs: '95%',
				sm: '95%',
				md: '95%',
				lg: '944px',
				xl: '1142px'
			}}
			title="Edit Check"
			content={
				<>
					<Formik
						initialValues={initialValues}
						validationSchema={
							checkData.isBlankCheck
								? blankCheckValidationSchema
								: checkCreateValidationSchema
						}
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
							setFieldTouched,
							setFieldError,
							setErrors
						}) => (
							<Box>
								<Typography color="#00000099" sx={{ mb: '24px' }}>
									Edit your check information for accurate printing and
									transactions.
								</Typography>
								<Box sx={styles.formContainer}>
									<Box sx={styles.addFormContainer}>
										<Box sx={styles.addFormHeader}>
											<Box sx={{ width: '100%' }}>
												<Box sx={styles.titleContainer}>
													<Box sx={{ display: { xs: 'block', md: 'none' } }}>
														<Typography sx={styles.checkTitle}>
															{returnSelectedUserName()}
														</Typography>
														{getUserAddress()}
													</Box>
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
																getOptionKey={(option) => option._id || ''}
																value={
																	banksData?.data?.find(
																		(bank) => bank._id === values.bankId
																	) || null
																}
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
																disabled={isblank || isQbCheck}
																renderInput={(params) => (
																	<TextField
																		{...params}
																		placeholder="Select Bank Account"
																		error={
																			touched.bankId && Boolean(errors.bankId)
																		}
																		helperText={touched.bankId && errors.bankId}
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
																<Typography color="error" sx={styles.errorText}>
																	{errors.bankAccount}
																</Typography>
															)}
														</Box>
													</Box>
												</Box>
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
														}
														setIsFormTouched(true)
													}}
													onBlur={(event) => {
														handleBlur({ target: { name: 'payeeId' } })
													}}
													disabled={isQbCheck}
													renderInput={(params) => (
														<TextField
															{...params}
															placeholder="Select Payee Name"
															error={touched.payeeId && Boolean(errors.payeeId)}
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
																			// setFieldError(
																			// 	'checkNumber',
																			// 	'Check number already exists'
																			// )
																			// setErrors({
																			// 	...errors,
																			// 	checkNumber:
																			// 		'Check number already exists'
																			// })
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
														error={touched.checkNumber && !!errors.checkNumber}
														helperText={
															touched.checkNumber && errors.checkNumber
														}
														disabled={
															isAutoMaticCheckGeneration || isblank || isQbCheck
														}
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
															disabled={isQbCheck}
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
														onBlur={handleBlur}
														error={touched.amount && !!errors.amount}
														helperText={touched.amount && errors.amount}
														sx={styles.input}
														disabled={isQbCheck}
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

										<Box sx={styles.dollarsContainer}>
											<TextField
												fullWidth
												multiline
												name="dollarAmount"
												disabled={true}
												placeholder=""
												value={values.dollarAmount}
												error={touched.dollarAmount && !!errors.dollarAmount}
												helperText={touched.dollarAmount && errors.dollarAmount}
												sx={styles.dollarInput}
											/>
											<Typography sx={styles.dollarText}>Dollars</Typography>
										</Box>

										<Box sx={styles.memoContainer}>
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
													disabled={isQbCheck}
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
															checked={values.signature === true}
															onChange={(e) => {
																setFieldValue('signature', true)
																setIsFormTouched(true)
															}}
															disabled={
																isblank ||
																!(
																	banksData?.data?.find(
																		(x) => x._id === values.bankId
																	)?.bankPreferences?.signatureEnabled ||
																	wantSignature
																)
															}
															sx={styles.radio}
														/>
														<Typography sx={styles.radioLabel}>Yes</Typography>
													</Box>
													<Box sx={styles.radioItem}>
														<Radio
															name="signature"
															value={false}
															checked={values.signature === false}
															onChange={(e) => {
																setFieldValue('signature', false)
																setIsFormTouched(true)
															}}
															disabled={
																isblank ||
																!(
																	banksData?.data?.find(
																		(x) => x._id === values.bankId
																	)?.bankPreferences?.signatureEnabled ||
																	wantSignature
																)
															}
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
											attachments={values.attachments}
											handleDropFile={(file) => handleSaveAttachments(file)}
											handleSaveFile={handleSaveAttachments}
										/>
									</Box>
								</Box>
							</Box>
						)}
					</Formik>
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
								setDirty={setDirty}
								warning={showWarning}
								setWarning={setWarning}
							/>
						</FormModalMUI>
					)}
				</>
			}
			actions={
				<Box sx={styles.actionsContainer}>
					{!isblank && (
						<Button
							onClick={handleSaveAndPrint}
							variant="outlined"
							sx={{
								...styles.cancelButton,
								minWidth: { xs: '80px', sm: '100px' },
								fontSize: { xs: '12px', sm: '14px' }
							}}
							disabled={loading}
							endIcon={loading && <CircularProgress size={14} />}
						>
							Save & Print
						</Button>
					)}

					<CustomButton
						variant="outlined"
						color="primary"
						onClick={handleSaveCheck}
						disabled={loading}
						endIcon={loading && <CircularProgress size={14} />}
						sx={{
							minWidth: { xs: '80px', sm: '100px' },
							fontSize: { xs: '12px', sm: '14px' }
						}}
					>
						Save Check
					</CustomButton>
				</Box>
			}
		/>
	)
}
