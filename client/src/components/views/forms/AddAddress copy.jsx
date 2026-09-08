import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import FormComponents from '../../shared/forms'
import FormModal from '../../shared/Modals/FormModal'
import ButtonComponent from '../../shared/ButtonComponent'

import useAddAddress from '../../../API/addresses/useAddAddress'

const AddAddressCopy = () => {
	const { mutate: addAddress } = useAddAddress()

	const validationSchema = Yup.object({
		zipCode: Yup.number().required('Required !'),
		country: Yup.string().required('Required !'),
		state: Yup.string().required('Required !'),
		addressLine1: Yup.string().required('Required !'),
		addressLine2: Yup.string().required('Required !'),
		city: Yup.string().required('Required !'),
		name: Yup.string().required('Required !')
	})

	const initialValues = {
		addressLine1: '',
		addressLine2: '',
		city: '',
		country: '',
		state: '',
		zipCode: '',
		name: ''
	}

	const onSubmit = async (values) => {
		addAddress(values)
	}

	return (
		<FormModal header="Add new address" modalName="address-form">
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={onSubmit}
			>
				{({ handleSubmit }) => {
					return (
						<Form onSubmit={onSubmit}>
							<div className="row">
								<div className="col-12 col-md-12">
									<FormComponents
										name="name"
										label="Save As (eg. Home)"
										control="input"
										type="text"
									/>
								</div>
								<div className="col-12 col-md-6">
									<FormComponents
										name="addressLine1"
										label="Address Line 1"
										control="input"
										type="text"
									/>
								</div>
								<div className="col-12 col-md-6">
									<FormComponents
										name="addressLine2"
										label="Address Line 2"
										control="input"
										type="text"
									/>
								</div>
							</div>
							<div className="row">
								<div className="col-12 col-md-6">
									<FormComponents
										name="country"
										label="Country"
										control="input"
										type="text"
									/>
								</div>
								<div className="col-12 col-md-6">
									<FormComponents
										name="state"
										label="State"
										control="input"
										type="text"
									/>
								</div>
							</div>
							<div className="row">
								<div className="col-12 col-md-6">
									<FormComponents
										name="city"
										label="City"
										control="input"
										type="text"
									/>
								</div>
								<div className="col-12 col-md-6">
									<FormComponents
										name="zipCode"
										label="Zip code"
										control="input"
										type="text"
									/>
								</div>
							</div>
							<div className="d-flex flex-row align-items-center justify-content-evenly mt-4">
								<button type="button" className="common-btn bg-white light">
									Cancel
								</button>
								<ButtonComponent
									text="Add Address"
									type="submit"
									variant="dark"
									data-bs-dismiss="modal"
									click={handleSubmit}
								/>
							</div>
						</Form>
					)
				}}
			</Formik>
		</FormModal>
	)
}

export default AddAddressCopy
