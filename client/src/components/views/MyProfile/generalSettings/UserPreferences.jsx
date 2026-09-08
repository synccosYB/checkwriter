import React, { useState } from 'react'
import * as Yup from 'yup'
import { Formik, Form, Field } from 'formik'
import FormComponents from '../../../shared/forms'
import { Switch } from '@mui/material'
import ButtonComponent from '../../../shared/ButtonComponent'
import FormModalMUI from '../../../shared/Modals/FormModalMUI'
import AddSignature from '../../forms/AddSignature'
import useUserInfo from '../../../../API/users/useUserInfo'
import useUpdatePreferences from '../../../../API/users/useUpdatePreferences'
import { MyCookies } from '../../../../utils/cookies/Cookies'

const initialValues = {
	wantSignature: false
}

const validationSchema = Yup.object({
	wantSignature: Yup.boolean().optional()
})

const UserPreferences = () => {
	const { data: userData } = useUserInfo()
	const { mutate: updatepreferences } = useUpdatePreferences()
	const [isSignatureModalOpen, setSignatureModalOpen] = useState(false)
	const formValues = { ...initialValues, ...userData?.preferences }

	const onSubmit = async (values) => {
		const organization = MyCookies.get(MyCookies.KEYS.ORGANIZATION)

		if (organization) {
			MyCookies.remove(MyCookies.KEYS.ORGANIZATION)
		}

		updatepreferences(
			{ body: values, type: 'user' },
			{
				onSuccess: () => {
					if (organization) {
						MyCookies.set(MyCookies.KEYS.ORGANIZATION, organization)
					}
				}
			}
		)
	}

	return (
		<>
			<div className="container-fluid p-0 mt-5">
				<h4 className="fs-6 fw-semibold text-black mt-4 mb-2">Preferences</h4>
				<p className="fs-14 mb-4">Change your checkwriting preferences here</p>
			</div>

			<Formik
				initialValues={formValues}
				validationSchema={validationSchema}
				onSubmit={onSubmit}
				enableReinitialize={true}
			>
				{({ dirty, setFieldValue, values, handleSubmit }) => {
					return (
						<Form onSubmit={handleSubmit}>
							<div className="d-flex align-items-center justify-content-between">
								<h6 className="preference-head mb-2">Your signature</h6>
								<ButtonComponent
									text={
										userData?.signatureUrl ? 'Update Signature' : 'Upload'
									}
									type="button"
									variant="dark"
									click={() => setSignatureModalOpen(!isSignatureModalOpen)}
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
										disabled={!userData?.signatureUrl}
									/>
								)}
							</Field>

							<div className="userSignature mt-3" style={{ width: '10rem', height: 'auto' }}>
								{!userData?.signatureUrl ? (
									<p className="fs-14 fw-semibold mb-0 text-secondary">
										No Signature Found. Please create one.
									</p>
								) : (
									<img
										src={userData?.signatureUrl}
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
					)
				}}
			</Formik>

			<FormModalMUI
				title={
					userData?.preferences?.wantSignature
						? 'New Signature'
						: 'Create Signature'
				}
				open={isSignatureModalOpen}
				onClose={() => setSignatureModalOpen(!isSignatureModalOpen)}
				maxWidth="sm"
			>
				<AddSignature
					type="user"
					onClose={() => setSignatureModalOpen(!isSignatureModalOpen)}
				/>
			</FormModalMUI>
		</>
	)
}

export default UserPreferences
