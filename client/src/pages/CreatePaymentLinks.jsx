///Packages components
import React, { useState } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'

///Custom components used
import FormComponents from '../components/shared/forms'
import PageHeader from '../components/shared/PageHeader'
import ButtonComponent from '../components/shared/ButtonComponent'
import { useHistory } from 'react-router-dom'
////Redux functions used
import { updateSnackbar } from '../redux/snackbarState'

import FormModalMUI from '../components/shared/Modals/FormModalMUI'
import { ContentCopyOutlined } from '@mui/icons-material'
import { Alert, CircularProgress } from '@mui/material'

import useStripeAccount from '../API/integrations/useStripeAccount'
import useGeneratePaymentLink from '../API/integrations/useGeneratePaymentLink'
import { CustomButton } from '../components/shared/buttons/CustomButton'

const validationSchema = Yup.object().shape({
	recipientEmail: Yup.string().email('Incorrect Email').required('Required'),
	recipientName: Yup.string().required('Required!'),
	amount: Yup.number().required('Required!'),
	purpose: Yup.string().required('Required!')
})

const initialValues = {
	recipientEmail: '',
	recipientName: '',
	invoiceNumber: '',
	amount: '',
	currency: 'USD',
	purpose: '',
	dueDate: new Date()
}

const CreatePaymentLinks = () => {
	const { data } = useStripeAccount()

	const stripeAccount = !!data?.userAccount

	const { mutate: generatePaymentLink, isPending: isGeneratingPaymentLink } =
		useGeneratePaymentLink()

	const history = useHistory()

	const [isLinkModalOpen, setLinkModalOpen] = useState(false)
	const [paymentLink, setPaymentLink] = useState('')

	const dispatch = useDispatch()

	const openLinkModal = () => {
		setLinkModalOpen(true)
	}

	const closeLinkModal = async () => {
		setLinkModalOpen(false)
		setPaymentLink('')
		history.push('/dashboard/payment-links')
	}

	const copyLink = () => {
		// Get the text field
		let text = document.getElementById('payment-link')
		const range = document.createRange()
		range.selectNode(text)
		const selection = window.getSelection()
		selection.removeAllRanges()
		selection.addRange(range)

		// Execute the copy command
		document.execCommand('copy')

		// Clean up the selection
		selection.removeAllRanges()

		// Alert the copied text
		dispatch(
			updateSnackbar({
				open: true,
				severity: 'info',
				message: 'Payment link copied'
			})
		)
	}

	const onSubmit = (values) => {
		generatePaymentLink(
			{
				...values,
				stripeUserId: data?.userAccount._id
			},
			{
				onSuccess: (data) => {
					setPaymentLink(data?.payment_link)
					openLinkModal()
				}
			}
		)
	}

	return (
		<>
			<div className="container">
				<PageHeader
					text={'Create Payment Link'}
					info="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
				/>
				{!stripeAccount && (
					<Alert
						severity="info"
						className="mb-4 d-flex align-items-center w-100"
						sx={{
							'.MuiAlert-message': {
								width: '100%'
							}
						}}
					>
						<div className="d-flex align-items-center justify-content-between">
							<p className="m-0 fs-6" style={{ color: '#161617;' }}>
								You need to integrate a stripe account to create a payment link.
							</p>
							<button
								className="fw-semibold m-0 fs-6 border-0 bg-transparent p-0"
								onClick={() => history.push('/dashboard/integrations/payments')}
								style={{
									color: '#0439EA'
								}}
							>
								Add Stripe Account
							</button>
						</div>
					</Alert>
				)}

				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={onSubmit}
					enableReinitialize={true}
				>
					{({ handleSubmit }) => {
						return (
							<>
								<Form onSubmit={handleSubmit}>
									<div className="row p-0 mx-0 my-2">
										<div className="col-12 col-md-4 px-3">
											<div className="d-flex align-items-start justify-content-center w-100">
												<FormComponents
													name="recipientName"
													type="text"
													label="Recipient Name"
													control="input"
													required
												/>
											</div>
										</div>
										<div className="col-12 col-md-4 px-3">
											<FormComponents
												name="recipientEmail"
												type="email"
												label="Recipient Email"
												control="input"
												required
											/>
										</div>
										<div className="col-12 col-md-4 px-3">
											<div className="d-flex align-items-start">
												<div className="field-prefix">$</div>
												<FormComponents
													name="amount"
													type="number"
													label="Amount"
													control="input"
													prefix={true}
													required
												/>
											</div>
										</div>
									</div>
									<div className="row p-0 mx-0 my-2">
										<div className="col-12 col-md-4 px-3">
											<FormComponents
												name="invoiceNumber"
												type="number"
												label="Invoice Number"
												control="input"
											/>
										</div>
										<div className="col-12 col-md-4 px-3">
											<FormComponents
												name="dueDate"
												label="Due Date"
												control="date"
												required
											/>
										</div>
										<div className="col-12 col-md-4 px-3">
											<FormComponents
												name="purpose"
												type="text"
												label="Purpose"
												control="input"
												required
											/>
										</div>
									</div>
									<div className="row p-0 mx-0 my-0">
										<div className="col-12">
											<div className="d-flex justify-content-between">
												<div>
													<CustomButton
														disabled={!stripeAccount || isGeneratingPaymentLink}
														variant="light"
														type="submit"
														endIcon={
															isGeneratingPaymentLink && (
																<CircularProgress size={'14px'} />
															)
														}
													>
														Create Link
													</CustomButton>
												</div>
											</div>
										</div>
									</div>
								</Form>
							</>
						)
					}}
				</Formik>
			</div>

			<FormModalMUI
				title={'Payment Link Generated'}
				onClose={closeLinkModal}
				open={isLinkModalOpen}
				maxWidth="sm"
			>
				<div>
					<p className="fs-6 fw-semibold text-secondary text-center mb-2">
						Link sent to recipient Email Successfully!!
					</p>
					<p
						className="text-center text-primary mb-4 mt-0 fs-14"
						id="payment-link"
						style={{
							wordWrap: 'break-word'
						}}
					>
						{paymentLink}
					</p>
				</div>

				<div className="d-flex align-items-center justify-content-around mb-4">
					<ButtonComponent
						text="Copy Link"
						icon={<ContentCopyOutlined />}
						variant="light"
						onClick={copyLink}
					/>
					<ButtonComponent
						text="Close"
						variant="dark"
						onClick={closeLinkModal}
					/>
				</div>
			</FormModalMUI>
		</>
	)
}

export default CreatePaymentLinks
