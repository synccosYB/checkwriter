import React, { useState } from 'react'
import * as Yup from 'yup'
import { Formik, Form, Field } from 'formik'
import { Switch } from '@mui/material'
import FormComponents from '../../shared/forms'
import ButtonComponent from '../../shared/ButtonComponent'
import FormModalMUI from '../../shared/Modals/FormModalMUI'
import AddSignature from '../forms/AddSignature'
import useUpdatePreferences from '../../../API/users/useUpdatePreferences'
import { MyCookies } from '../../../utils/cookies/Cookies'

const initialValues = {
	wantSignature: false
}

const validationSchema = Yup.object({
	wantSignature: Yup.boolean().optional()
})

function CompanyPrefrences({ orgData }) {
	const [isSignatureModalOpen, setSignatureModalOpen] = useState(false)
	const { mutate: updatepreferences } = useUpdatePreferences()

	const { _id, ...orgPreferences } = orgData?.preferences
	const formValues = { ...initialValues, ...orgPreferences }

	const onSubmit = (values) => {
		const shouldSetCookies = !MyCookies.get(MyCookies.KEYS.ORGANIZATION)
		if (shouldSetCookies) {
			MyCookies.set(MyCookies.KEYS.ORGANIZATION, orgData?._id)
		}

		updatepreferences(
			{ body: values, type: 'organization' },
			{
				onSuccess: () => {
					if (shouldSetCookies) MyCookies.remove(MyCookies.KEYS.ORGANIZATION)
				}
			}
		)
	}

	return (
		<div>
			<div key={JSON.stringify(orgData.signatureUrl)}>
				<div className="container-fluid p-0 mt-5">
					<h4 className="fs-6 fw-semibold text-black mt-4 mb-2">Preferences</h4>
					<p className="fs-14 mb-4">
						Change your checkwriting preferences for organization here
					</p>
				</div>

				<Formik
					initialValues={formValues}
					validationSchema={validationSchema}
					onSubmit={onSubmit}
					enableReinitialize={true}
				>
					{({ dirty, setFieldValue, values, handleSubmit }) => (
						<Form onSubmit={handleSubmit}>
							<div className="d-flex align-items-center justify-content-between">
								<h6 className="preference-head mb-2">Your signature</h6>
								<ButtonComponent
									text={
										orgData?.signatureUrl ? 'Update Signature' : 'Upload'
									}
									type="button"
									variant="dark"
									click={() => {
										setSignatureModalOpen(!isSignatureModalOpen)
									}}
								/>
							</div>

							<h6 className="preference-head mb-2">
								Enable signature for every check, if Uploaded
							</h6>

							<Field>
								{() => (
									<Switch
										key={JSON.stringify(values?.wantSignature)}
										defaultChecked={values?.wantSignature}
										onChange={(e) => {
											setFieldValue('wantSignature', e.target.checked)
										}}
										color="success"
										value={values?.wantSignature}
										inputProps={{ 'aria-label': 'controlled' }}
										disabled={
											orgData?.signatureUrl === null ||
											orgData?.signatureUrl === ''
										}
									/>
								)}
							</Field>

							<div
								className="userSignature mt-3"
								style={{ width: '10rem', height: 'auto' }}
							>
								{!orgData?.signatureUrl ? (
									<p className="fs-14 fw-semibold mb-0 text-secondary">
										No Signature Found. Please create one.
									</p>
								) : (
									<img
										key={orgData?.signatureUrl}
										src={orgData?.signatureUrl}
										alt="user-signature"
										style={{ width: 'inherit', height: 'inherit' }}
									/>
								)}
							</div>

							<div className="d-flex align-items-center justify-content-end mt-3 mb-5">
								<ButtonComponent
									text="Update Preferences"
									type="submit"
									variant="dark"
									disabled={!dirty}
								/>
							</div>
						</Form>
					)}
				</Formik>

				<FormModalMUI
					title={
						orgData?.preferences?.wantSignature
							? 'New Signature'
							: 'Create Signature'
					}
					open={isSignatureModalOpen}
					onClose={() => {
						setSignatureModalOpen(!isSignatureModalOpen)
					}}
					maxWidth="sm"
				>
					<AddSignature
						type="organization"
						organizationId={orgData?._id}
						onClose={() => {
							setSignatureModalOpen(!isSignatureModalOpen)
						}}
					/>
				</FormModalMUI>
			</div>
		</div>
	)
}

export default CompanyPrefrences
