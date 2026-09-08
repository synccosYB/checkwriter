import React, { useEffect, useState } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormComponents from '../../shared/forms'
import ButtonComponent from '../../shared/ButtonComponent'
import { updateSnackbar } from '../../../redux/snackbarState'
import { useDispatch, useSelector } from 'react-redux'

import { addQuickBook } from '../../../API/IntegrationsAPI'
import { v4 as uuidv4 } from 'uuid'
import useUserInfo from '../../../API/users/useUserInfo'
const AddQuickBook = ({ onClose, isEdit }) => {
	const dispatch = useDispatch()

	const selectedOrganization = useSelector(
		(state) => state.appData.selectedOrganization
	)

	const { data: userData } = useUserInfo()
	const [webhookUrl, setWebhookUrl] = useState('')

	const validationSchema = Yup.object({
		clientId: Yup.string().required('Required!'),
		clientsecret: Yup.string().required('Required!'),
		webhooktoken: Yup.string().required('Required!')
	})

	const onSubmit = async (values, { resetForm }) => {
		let body = {}

		body.clientId = values.clientId
		body.clientSecret = values.clientsecret
		body.webhooktoken = values.webhooktoken
		body.uuid = webhookUrl
		if (selectedOrganization && selectedOrganization !== null) {
			body.organizationId = selectedOrganization
		} else {
			body.userId = userData?._id // Assuming userId is available in the scope
		}

		try {
			const res = await addQuickBook(body)
			const { data } = res
			const url = data
			if (url) {
				window.open(url, '_blank')
				// window.location.href = url;
			}
			close()
		} catch (err) {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Unknown Error.',
					severity: 'error'
				})
			)
		}
	}

	const close = (forced) => {
		onClose(forced)
	}

	useEffect(() => {
		const newUuid = uuidv4() // Generate a new UUID
		setWebhookUrl(newUuid) // Set the webhook URL as a string
	}, [])

	return (
		<Formik
			initialValues={{
				clientId: '',
				clientsecret: '',
				webhooktoken: '',
				uuid: webhookUrl
			}}
			validationSchema={validationSchema}
			onSubmit={onSubmit}
		>
			{({ handleSubmit, setFieldValue, values, dirty }) => (
				<Form onSubmit={handleSubmit} className="px-3 pt-3 pb-3">
					<div className="row">
						{/* <h1>Connect QuickBooks with CheckWriter - Steps to follow</h1> */}
						<p>
							<b>Step 1: </b> Open{' '}
							<a
								href="https://developer.intuit.com/app/developer/homepage"
								target="_blank"
								rel="noopener noreferrer"
							>
								{' '}
								Intuit Developer
							</a>{' '}
							and login using the same account as your QuickBooks Account.
						</p>
						<p>
							<b>Step 2: </b> Go to My Hub --> App Dashboard
						</p>
						<p>
							<b>Step 3: </b> Click "+" sign to add new app --> Get Started
						</p>
						<p>
							<b>Step 4: </b> Enter App Name - CW Platform (you can add any name
							to identify this app) --> Click Next
						</p>
						<p>
							<b>Step 5: </b> Select Accounting --> Click Next --> Confirm
						</p>
						<p>
							<b>Step 6: </b> It should generate the credentails, click
							"Credentials" and copy the Client ID and Client secret and Paste
							in below form, then click Done
						</p>
						<div className="col-12 col-md-12">
							<div className="d-flex align-items-start justify-content-center w-100">
								<FormComponents
									name="clientId"
									type="text"
									label="Client Id"
									control="input"
									required
									autoComplete="off"
								/>
							</div>
						</div>
						<div className="col-12 col-md-12">
							<div className="d-flex align-items-start">
								<FormComponents
									name="clientsecret"
									label="Client Secret"
									control="input"
									type="password"
									required
									autoComplete="off"
								/>
							</div>
						</div>
						<p>
							<b>Next Step: </b> It will open the App Overview of the App you
							have created, click on Settings --> Redirect URIs --> Add URI -->
							Copy this URL and Paste into it -<br />{' '}
							<b>https://api.synccoschecking.com/quickbooks/callback</b> -->
							Click Save{' '}
							<button
								onClick={() => {
									navigator.clipboard.writeText(
										`https://api.synccoschecking.com/quickbooks/callback`
									)
									dispatch(
										updateSnackbar({
											open: true,
											message: 'Copied to clipboard!',
											severity: 'success'
										})
									)
								}}
								className="common-btn important-border-radius"
								type="button"
								style={{ marginLeft: '10px' }}
							>
								Copy URL
							</button>
						</p>

						<p>
							<b>Next Step: </b> Click "Webhooks" from left navigation --> Copy
							below URL and Paste it into Endpoint URL field and click Save
						</p>

						<p>
							Please add the following webhook URL to your QuickBooks Webhooks
							configuration: <br />
							<b>
								https://api.synccoschecking.com/quickbooks/webhooks/{webhookUrl}
							</b>
							<button
								onClick={() => {
									navigator.clipboard.writeText(
										`https://api.synccoschecking.com/quickbooks/webhooks/${webhookUrl}`
									)
									dispatch(
										updateSnackbar({
											open: true,
											message: 'Copied to clipboard!',
											severity: 'success'
										})
									)
								}}
								className="common-btn important-border-radius"
								type="button"
								style={{ marginLeft: '10px' }}
							>
								Copy URL
							</button>
						</p>

						{/* <p>It will generate Verifier Token after save, copy that token and paste it into the box below</p>					 */}
						<p>
							It will generate Verifier Token after save, copy that token and
							paste it into the box below and click on "Add" button below,
							clicking on add button will open new screen on your browser, click
							"Connect" and it will successfully redirect back to your CW
							account
						</p>

						<div className="col-12 col-md-12 mt-3">
							<div className="d-flex align-items-start justify-content-center w-100">
								<FormComponents
									name="webhooktoken"
									type="text"
									label="Webhook Verifier Token"
									control="input"
									required
									autoComplete="off"
								/>
							</div>
						</div>
					</div>
					<div className="d-flex flex-row align-items-center justify-content-end">
						<button
							type="button"
							className="common-btn bg-white light"
							style={{ marginRight: '25px' }}
							onClick={() => {
								close(false)
							}}
						>
							Cancel
						</button>
						<ButtonComponent
							text={isEdit ? 'Save' : 'Add'}
							type="submit"
							variant="dark"
							click={handleSubmit}
						/>
					</div>
				</Form>
			)}
		</Formik>
	)
}

export default AddQuickBook
