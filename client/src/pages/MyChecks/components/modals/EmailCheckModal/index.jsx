import React, { useRef, useState } from 'react'
import {
	Box,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	TextField,
	Pagination,
	PaginationItem,
	CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CustomTabs from '../../../../../components/tabs'
import { styles } from '../../../styles'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { CustomTable } from '../../../../../components/table/CustomTable'
import { useDispatch } from 'react-redux'
import { setShowToast } from '../../../../../redux/toastSlice'
import ReactQuill from 'react-quill'
import 'quill-emoji'
import 'react-quill/dist/quill.snow.css'
import 'quill-emoji/dist/quill-emoji.css'
import { Formik } from 'formik'
import * as Yup from 'yup'
import useEmailChecks from '../../../../../API/checks/useEmailChecks'

const modules = {
	toolbar: [
		[{ header: [1, 2, 3, 4, 5, 6, false] }],
		['bold', 'italic', 'underline', 'strike', 'blockquote'],
		[{ align: ['right', 'center', 'justify'] }],
		[{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
		// ["link", "image", "video"],
		[{ color: [] }],
		[{ background: [] }],
		['emoji'],
		['code-block']
	],
	'emoji-toolbar': true,
	// "emoji-textarea": true,
	'emoji-shortname': true
}

const formats = [
	'header',
	'bold',
	'italic',
	'underline',
	'strike',
	'blockquote',
	'list',
	'bullet',
	'link',
	'color',
	'image',
	'background',
	'align',
	'emoji',
	'code-block'
]

const ITEMS_PER_PAGE = 5

export const EmailCheckModal = ({
	open,
	onClose,
	onConfirm,
	selectedChecks = []
}) => {
	const [activeTab, setActiveTab] = React.useState(0)
	const formRef = useRef(null)
	const [page, setPage] = useState(1)
	const dispatch = useDispatch()
	const { mutate: emailChecks, isPending } = useEmailChecks()
	const initialValues = {
		email: selectedChecks[0] ? selectedChecks[0].payee.email : '',
		subject: 'You just got paid!',
		body: ''
	}

	const validationSchema = Yup.object().shape({
		email: Yup.string().email('Invalid email').required('Email is required'),
		subject: Yup.string().required('Subject is required')
	})

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue)
	}

	const handleSaveAndSend = () => {
		if (formRef.current) {
			formRef.current.handleSubmit()
		}
	}

	const handleSubmit = async (values, { setSubmitting, resetForm }) => {
		try {
			const payload = {
				checkIds: selectedChecks?.map((item) => item?._id),
				content: values.body,
				subject: values.subject,
				emails: [...new Set(values.email.split(',').map((i) => i.trim()))]
			}

			emailChecks(payload, {
				onSuccess: () => {
					onClose()
					resetForm()
				}
			})
		} catch (error) {
			dispatch(
				setShowToast({
					message: 'Error Sending Check Email',
					type: 'error'
				})
			)
		} finally {
			dispatch(
				setShowToast({
					message: 'Check Email Sent Successfully',
					type: 'success'
				})
			)
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
			}) => (
				<Dialog
					open={open}
					onClose={onClose}
					PaperProps={{
						sx: { ...styles.dialog, minWidth: { xs: '90%', md: '760px' } }
					}}
				>
					<Box sx={styles.dialogHeader}>
						<DialogTitle sx={styles.dialogTitle}>
							Send Check via Email
						</DialogTitle>
						<IconButton onClick={onClose} sx={styles.dialogCloseButton}>
							<CloseIcon />
						</IconButton>
					</Box>
					<DialogContent sx={{ p: 0 }}>
						<Box sx={styles.dialogContent}>
							<Typography color="#00000099" sx={{ mb: '24px' }}>
								Share payment details securely with the recipient via email.
							</Typography>

							<CustomTabs
								activeTab={activeTab}
								handleTabChange={handleTabChange}
								styles={styles.dialogTabs}
								tabs={[{ label: 'TEMPLATE' }, { label: 'CHECKS' }]}
							/>

							{activeTab === 0 && (
								<Box>
									<Box sx={styles.checkEmailInputContainer}>
										<Typography sx={styles.itemLabel}>Email*</Typography>
										<TextField
											fullWidth
											name="email"
											placeholder="To recipient"
											value={values.email}
											onChange={handleChange}
											onBlur={handleBlur}
											error={touched.email && !!errors.email}
											helperText={touched.email && errors.email}
											sx={styles.checkEmailInput}
										/>
									</Box>

									<Box sx={styles.checkEmailInputContainer}>
										<Typography sx={styles.itemLabel}>Subject*</Typography>
										<TextField
											fullWidth
											name="subject"
											placeholder="add subject"
											value={values.subject}
											onChange={handleChange}
											onBlur={handleBlur}
											error={touched.subject && !!errors.subject}
											helperText={touched.subject && errors.subject}
											sx={styles.checkEmailInput}
										/>
									</Box>
									<Box sx={styles.checkEmailInputContainer}>
										<Typography sx={styles.itemLabel}>Body Content</Typography>

										<ReactQuill
											value={values.body}
											onChange={(content) => setFieldValue('body', content)}
											style={{
												display: 'flex',
												flexDirection: 'column',
												// flexDirection: "column-reverse",
												// borderTop: "1px solid #cccccc",
												// gap: "12px",
												height: '275px'
											}}
											theme="snow"
											modules={modules}
											formats={formats}
											placeholder={'This is your initial content'}
										/>
										{touched.body && errors.body && (
											<Typography
												color="error"
												variant="caption"
												sx={{ mt: 1 }}
											>
												{errors.body}
											</Typography>
										)}
									</Box>
								</Box>
							)}

							{activeTab === 1 && (
								<Box>
									<Box sx={styles.selectedChecksContainer}>
										<Typography sx={styles.selectedChecksTitle}>
											Selected Checks
										</Typography>
										<Typography sx={styles.totalCost}>
											Total Amount:{' '}
											<b>
												{selectedChecks.reduce(
													(total, { amount }) => total + amount,
													0
												)}
											</b>
										</Typography>
									</Box>

									<CustomTable
										columns={[
											{ id: '#', label: '#', width: '40px' },
											{ id: 'no', label: 'Check No.', width: '70px' },
											{ id: 'amount', label: 'Amount', width: '70px' },
											{
												id: 'issuedDate',
												label: 'Issued Date',
												width: '140px'
											},
											{
												id: 'accountNickname',
												label: 'Account Nickname',
												width: '140px'
											}
										]}
										data={selectedChecks
											?.slice(
												(page - 1) * ITEMS_PER_PAGE,
												page * ITEMS_PER_PAGE
											)
											.map((check, index) => ({
												'#': (page - 1) * ITEMS_PER_PAGE + index + 1,
												no: check.checkNumber,
												amount: check.amount,
												issuedDate: check.issuedDate,
												accountNickname: check.bank?.accountNickName
											}))}
										isCenteredCells={true}
									/>
									{selectedChecks?.length > ITEMS_PER_PAGE && (
										<Box sx={styles.paginationContainer}>
											<Pagination
												count={Math.ceil(
													(selectedChecks?.length || 0) / ITEMS_PER_PAGE
												)}
												page={page}
												onChange={(event, value) => setPage(value)}
												renderItem={(item) => (
													<PaginationItem
														slots={{
															previous: () => 'Previous',
															next: () => 'Next'
														}}
														{...item}
														sx={styles.paginationItem}
													/>
												)}
												sx={styles.pagination}
											/>
										</Box>
									)}
								</Box>
							)}
						</Box>
					</DialogContent>
					<DialogActions sx={styles.dialogActions}>
						{/* <Button onClick={onClose} variant="outlined" sx={styles.cancelButton}>
          Cancel
        </Button> */}
						<CustomButton
							onClick={handleSaveAndSend}
							variant="contained"
							sx={styles.confirmButton}
							color="primary"
							disabled={isPending}
							endIcon={isPending ? <CircularProgress size={14} /> : null}
						>
							Send
						</CustomButton>
					</DialogActions>
				</Dialog>
			)}
		</Formik>
	)
}
