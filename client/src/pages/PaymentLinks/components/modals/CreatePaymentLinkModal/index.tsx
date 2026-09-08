import React, { useRef, useState } from 'react'
import { CustomDialog } from '../../../../../components/dialog/CustomDialog'
import {
	Box,
	Typography,
	TextField,
	Autocomplete,
	Paper,
	Checkbox
} from '@mui/material'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { styles } from '../../../styles'
import { DocumentIcon } from '../../../../../components/Icons'
import { GeneratePaymentLinkAlert } from '../GeneratePaymentLinkAlert'
import { AttachmentsModal } from '../AttachmentsModal'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import { useAddPaymentLink } from '../../../../../API/payment/useAddPaymentLink'
import useStripeAccount from '../../../../../API/integrations/useStripeAccount'
import usePayees from '../../../../../API/payees/usePayees'
import { EntityType } from '../../../../../types/attachment.types'
import { useUploadAttachments } from '../../../../../API/attachments/useUploadAttachments'
import { queryClient } from '../../../../..'

interface EmailOption {
	id: string
	name: string
	email: string
}

interface FormValues {
	recipientEmail: string
	recipientName: string
	payeeId: string
	amount: string
	note: string
	purpose: string
	attachments: any[]
	sendEmail: boolean
}

interface CreatePaymentLinkModalProps {
	open: boolean
	onClose: () => void
}

export const CreatePaymentLinkModal: React.FC<CreatePaymentLinkModalProps> = ({
	open,
	onClose
}) => {
	const formRef = useRef<FormikProps<FormValues>>(null)
	const [openAttachmentsModal, setOpenAttachmentsModal] =
		useState<boolean>(false)
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [openPaymentLink, setOpenPaymentLink] = useState<boolean>(false)
	const [paymentLink, setPaymentLink] = useState<string>(
		'https://pay.example.com/payment/8f3d9a...'
	)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [inputValue, setInputValue] = useState<string>('')
	const { data: payeesData } = usePayees()
	const { mutate } = useAddPaymentLink()

	const { mutateAsync: uploadAttachmentAsync } = useUploadAttachments()

	const { data: stripeAccount } = useStripeAccount()

	const emailOptions =
		payeesData?.data?.map((payee) => ({
			id: payee._id,
			name: payee.name,
			email: payee.email
		})) || []

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)

		const droppedFiles = Array.from(e.dataTransfer.files)
		if (droppedFiles.length > 0) {
			processFiles(droppedFiles)
		}
	}

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
		if (e.target.files && e.target.files.length > 0) {
			const selectedFiles = Array.from(e.target.files)
			processFiles(selectedFiles)
			// Reset the file input value so the same file can be selected again
			e.target.value = ''
		}
	}

	const processFiles = (newFiles: File[]): void => {
		const processedFiles = newFiles.map((file) => {
			// Create URL for preview
			const url = URL.createObjectURL(file)
			return {
				name: file.name,
				size: file.size,
				type: file.type,
				url,
				file,
				id: Date.now() + Math.random().toString(36).substr(2, 9) // Add unique ID
			}
		})

		if (formRef.current) {
			const currentAttachments = formRef.current.values.attachments || []
			formRef.current.setFieldValue('attachments', [
				...currentAttachments,
				...processedFiles
			])
		}
	}

	const handleEmailChange = (event: any, value: any) => {
		if (formRef.current) {
			formRef.current.setFieldValue('recipientEmail', value)

			// If we selected an email from the list, also set the recipient name
			const selectedOption = emailOptions.find(
				(option) => option.email === value
			)
			if (selectedOption && !formRef.current.values.recipientName) {
				formRef.current.setFieldValue('recipientName', selectedOption.name)
			}
			if (selectedOption && !formRef.current.values.payeeId){
				formRef.current.setFieldValue('payeeId', selectedOption.id)
			}
		}
	}

	const handleInputChange = (event: React.SyntheticEvent, value: string) => {
		setInputValue(value)
	}

	const initialValues: FormValues = {
		recipientEmail: '',
		recipientName: '',
		payeeId: '',
		amount: '',
		note: '',
		purpose: '',
		attachments: [],
		sendEmail: true
	}

	const validationSchema = Yup.object().shape({
		recipientEmail: Yup.string()
			.email('Invalid email address')
			.required('Recipient Email is required'),
		recipientName: Yup.string().required('Recipient Name is required'),
		amount: Yup.string().required('Amount is required'),
		purpose: Yup.string().required('Purpose is required')
	})

	const handleCreateLink = (): void => {
		if (formRef.current) {
			formRef.current.handleSubmit()
		}
	}

	const handleSubmit = async (
		values: FormValues,
		{
			setSubmitting,
			resetForm
		}: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
	): Promise<void> => {

		const selectedPayee = emailOptions.find(
				(option) => option.email === values.recipientEmail
			)
		
		const req = {
			recipientEmail: values.recipientEmail,
			recipientName: values.recipientName,
			invoiceNumber: '',
			amount: values.amount,
			currency: 'USD',
			purpose: values.purpose,
			dueDate: '',
			stripeUserId: stripeAccount?.userAccount?._id,
			sendEmail: values.sendEmail,
			payeeId: selectedPayee?.id || ''
		}

		mutate(req, {
			onSuccess: async (res) => {
				if (res.result) {
					if (values.attachments.length > 0) {
						const formData = new FormData()
						formData.append('entityType', EntityType.PAYMENT_LINK)
						formData.append('entityId', res.result._id)

						values.attachments.forEach((file) => {
							formData.append('files', file.file)
							formData.append('descriptions', file.description || '')
						})
						await uploadAttachmentAsync(formData)
            queryClient.invalidateQueries({ queryKey: ['payment-link'] })
					}
				}
				setOpenPaymentLink(true)
				setPaymentLink(res.payment_link)
			},
			onSettled: () => {
				setSubmitting(false)
				resetForm()
				onClose()
			}
		})
	}

	const handleSaveAttachments = (attachments: any[]): void => {
		if (formRef.current) {
			formRef.current.setFieldValue('attachments', attachments)
		}
	}

	return (
		<>
			<CustomDialog
				open={open}
				onClose={onClose}
				width="760px"
				title="Create Payment Link"
				content={
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
						}) => (
							<Box>
								<Typography color="#00000099" sx={{ mb: '24px' }}>
									Easily generate a secure payment request and share it with
									your customer via email.
								</Typography>
								<Box sx={styles.formContainer}>
									<Box sx={styles.formItemContainer}>
										<Typography sx={styles.formItemLabel}>
											Recipient Email*
										</Typography>

										<Autocomplete
											freeSolo
											options={emailOptions.map((option) => option.email)}
											value={values.recipientEmail}
											onChange={handleEmailChange}
											inputValue={inputValue}
											onInputChange={handleInputChange}
											renderInput={(params) => (
												<TextField
													{...params}
													name="recipientEmail"
													placeholder="Enter recipient email"
													value={values.recipientEmail}
													onChange={handleChange}
													error={
														touched.recipientEmail && !!errors.recipientEmail
													}
													helperText={
														touched.recipientEmail && errors.recipientEmail
													}
													onBlur={handleBlur}
													sx={{
														...styles.input,
														width: '100% !important'
													}}
													fullWidth
												/>
											)}
											renderOption={(props, option) => {
												const matchingOption = emailOptions.find(
													(item) => item.email === option
												)
												return (
													<li {...props}>
														<Box
															sx={{ display: 'flex', flexDirection: 'column' }}
														>
															<Typography>
																{matchingOption?.name || option}
															</Typography>
															<Typography
																sx={{ color: '#00000099', fontSize: '12px' }}
															>
																{option}
															</Typography>
														</Box>
													</li>
												)
											}}
											PaperComponent={(props) => (
												<Paper
													elevation={3}
													{...props}
													sx={{
														mt: 1,
														borderRadius: '8px',
														'& .MuiAutocomplete-option': {
															padding: '10px 16px'
														}
													}}
												/>
											)}
										/>
									</Box>

									<Box sx={styles.formItemContainer}>
										<Typography sx={styles.formItemLabel}>
											Recipient Name*
										</Typography>
										<TextField
											fullWidth
											name="recipientName"
											placeholder="Recipient Name"
											value={values.recipientName}
											onChange={handleChange}
											onBlur={handleBlur}
											error={touched.recipientName && !!errors.recipientName}
											helperText={touched.recipientName && errors.recipientName}
											sx={{
												...styles.input,
												width: '100% !important'
											}}
										/>
									</Box>
								</Box>

								<Box sx={styles.formContainer}>
									<Box sx={styles.formItemContainer}>
										<Typography sx={styles.formItemLabel}>Amount*</Typography>
										<TextField
											fullWidth
											name="amount"
											placeholder="Enter amount"
											value={values.amount}
											onChange={handleChange}
											onBlur={handleBlur}
											error={touched.amount && !!errors.amount}
											helperText={touched.amount && errors.amount}
											sx={{
												...styles.input,
												width: '100% !important'
											}}
										/>
									</Box>
									<Box sx={styles.formItemContainer}>
										<Typography sx={styles.formItemLabel}>Note</Typography>
										<TextField
											fullWidth
											name="note"
											placeholder="Enter Note"
											value={values.note}
											onChange={handleChange}
											onBlur={handleBlur}
											error={touched.note && !!errors.note}
											helperText={touched.note && errors.note}
											sx={{
												...styles.input,
												width: '100% !important'
											}}
										/>
									</Box>
								</Box>

								<Box sx={styles.formContainer}>
									<Box sx={styles.formItemContainer}>
										<Typography sx={styles.formItemLabel}>Purpose</Typography>
										<TextField
											fullWidth
											name="purpose"
											placeholder="Purpose"
											value={values.purpose}
											onChange={handleChange}
											onBlur={handleBlur}
											error={touched.purpose && !!errors.purpose}
											helperText={touched.purpose && errors.purpose}
											sx={{
												...styles.input,
												width: '100% !important'
											}}
										/>
									</Box>
								</Box>

								<Box sx={{ display: 'flex', mb: '20px' }}>
									<Box
										sx={{
											...styles.addAttachmentButton,
											borderColor:
												values.attachments.length > 0 ? '#1e3a5f' : '#00000099',
											borderStyle: isDragging ? 'dashed' : 'dashed',
											borderWidth: isDragging ? '2px' : '1px',
											backgroundColor: isDragging ? '#F0F9FF' : 'transparent'
										}}
										onDragEnter={handleDragEnter}
										onDragLeave={handleDragLeave}
										onDragOver={handleDragOver}
										onDrop={handleDrop}
										onClick={() => setOpenAttachmentsModal(true)}
									>
										<input
											type="file"
											ref={fileInputRef}
											onChange={handleFileInput}
											style={{ display: 'none' }}
											multiple
										/>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												width: '100%'
											}}
										>
											<Box
												sx={{
													display: 'flex',
													alignItems: 'center',
													gap: '4px'
												}}
											>
												<DocumentIcon
													color={
														values.attachments.length > 0
															? '#1e3a5f'
															: '#00000099'
													}
												/>
												<Typography
													sx={{
														fontSize: '18px',
														color:
															values.attachments.length > 0
																? '#1e3a5f'
																: '#00000099',
														lineHeight: 'normal'
													}}
												>
													{values.attachments && values.attachments.length > 0
														? `${values.attachments.length} ${
																values.attachments.length === 1
																	? 'file'
																	: 'files'
														  } attached`
														: 'Add Attachments'}
												</Typography>
											</Box>

											<AttachFileOutlinedIcon
												sx={{
													fontSize: '20px',
													color:
														values.attachments.length > 0
															? '#1e3a5f'
															: '#00000099',
													rotate: '45deg'
												}}
											/>
										</Box>
									</Box>
								</Box>

								<Box sx={{ display: 'flex', alignItems: 'center' }}>
									<Checkbox
										checked={values.sendEmail}
										onChange={(e) => {
											setFieldValue('sendEmail', !values.sendEmail)
										}}
									/>
									<Typography
										sx={{
											fontSize: '14px',
											color: '#000000DE',
											lineHeight: 'normal'
										}}
									>
										Automatically email the payment link to the recipient
									</Typography>
								</Box>
							</Box>
						)}
					</Formik>
				}
				actions={
					<>
						<CustomButton
							variant="contained"
							color="primary"
							onClick={handleCreateLink}
							sx={{ minWidth: '100px' }}
						>
							Create Link
						</CustomButton>
					</>
				}
			/>

			{openAttachmentsModal && (
				<AttachmentsModal
					open={openAttachmentsModal}
					onClose={() => setOpenAttachmentsModal(false)}
					attachments={formRef.current?.values.attachments || []}
					handleSave={handleSaveAttachments}
				/>
			)}

			<GeneratePaymentLinkAlert
				open={openPaymentLink}
				onClose={() => setOpenPaymentLink(false)}
				onConfirm={() => setOpenPaymentLink(false)}
				link={paymentLink}
			/>
		</>
	)
}

export default CreatePaymentLinkModal
