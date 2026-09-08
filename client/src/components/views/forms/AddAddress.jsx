import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormComponents from '../../shared/forms'
import ButtonComponent from '../../shared/ButtonComponent'
import { useDispatch } from 'react-redux'
import { updateSnackbar } from '../../../redux/snackbarState'
import countryData from '../../../utils/countryStateCity.json'
import FormModalMUI from '../../shared/Modals/FormModalMUI'

import useAddAddress from '../../../API/addresses/useAddAddress'
import useAddresses from '../../../API/addresses/useAddresses'
import useUpdateAddress from '../../../API/addresses/useUpdateAddress'
import AddressAutocomplete from '../../addressAutocomplete'

const validationSchema = Yup.object({
	zip: Yup.number().required('Required !'),
	country: Yup.string().required('Required !'),
	state: Yup.string().required('Required !'),
	addressLine1: Yup.string().required('Required !'),
	city: Yup.string().required('Required !'),
	name: Yup.string().required('Required !')
})

const AddAddress = ({ isModalOpen, closeModal, type }) => {
	const dispatch = useDispatch()

	const { data: addresses, isLoading } = useAddresses(type)
	const { mutate: addAddress } = useAddAddress(type)
	const { mutate: updateAddress } = useUpdateAddress(type)

	const isUpdate = !!addresses?.length

	const btnTitle = isUpdate ? 'Update Address' : 'Add Address'

	const onSubmit = (values) => {
		try {
			const id = addresses[0]?._id

			if (isUpdate) {
				updateAddress(
					{ body: values, id },
					{
						onSuccess: () => {
							closeModal()
						}
					}
				)
			} else {
				addAddress(values, {
					onSuccess: () => {
						closeModal()
					}
				})
			}
		} catch (err) {
			dispatch(
				updateSnackbar({
					open: true,
					message: 'Unable to Update.',
					severity: 'error'
				})
			)
		}
	}

	return (
		<>
			{isModalOpen && !isLoading ? (
				<Formik
					initialValues={{ ...addresses[0] }}
					validationSchema={validationSchema}
					onSubmit={onSubmit}
					enableReinitialize
				>
					{({ handleSubmit, setFieldValue, dirty, values }) => {
						return (
							<FormModalMUI
								onClose={() => closeModal(false)}
								open={isModalOpen}
								title={btnTitle}
								maxWidth="md"
								onSave={onSubmit}
							>
								<Form>
									<div className="row">
										<div className="col-12 col-md-4">
											<FormComponents
												name="name"
												type="text"
												label="Save As (eg. Home)"
												control="input"

												// disabled={values.addressLine1 !== ''}
											/>
										</div>
									</div>
									<div className="row">
										<AddressAutocomplete
											onChange={(address) => {
												const fields = [
													'addressLine1',
													'addressLine2',
													'city',
													'country',
													'zip',
													'state'
												]

												fields.forEach((item) => {
													if (address[item]) setFieldValue(item, address[item])
												})
											}}
										/>
									</div>
									<div className="row">
										<div className="col-12 col-md-4">
											<FormComponents
												name="addressLine1"
												type="text"
												label="Address Line 1"
												control="input"
												// disabled={isDisabled}
											/>
										</div>
										<div className="col-12 col-md-4">
											<FormComponents
												name="addressLine2"
												type="text"
												label="Address Line 2"
												control="input"
												// disabled={isDisabled}
											/>
										</div>
										<div className="col-12 col-md-4">
											<FormComponents
												name="country"
												label="Country"
												control="input"
												options={[
													...new Set(
														countryData?.flatMap((obj) => {
															return {
																key: obj?.name,
																value: obj?.name
															}
														})
													)
												]}
												required
											/>
										</div>
									</div>
									<div className="row">
										<div className="col-12 col-md-4">
											<FormComponents
												name="state"
												label="State"
												control="input"
												options={
													values?.country !== ''
														? [
																...new Set(
																	countryData
																		?.filter(
																			(country) =>
																				country?.name === values?.country
																		)[0]
																		?.states?.flatMap((obj) => {
																			return {
																				key: obj?.name,
																				value: obj?.name
																			}
																		})
																)
														  ]
														: []
												}
												// disabled={!values?.country}
												required
											/>
										</div>
										<div className="col-12 col-md-4">
											<FormComponents
												name="city"
												label="City"
												control="input"
												options={
													values?.country !== '' && values?.state !== ''
														? [
																...new Set(
																	countryData
																		?.filter(
																			(country) =>
																				country?.name === values?.country
																		)[0]
																		?.states?.filter(
																			(state) => state?.name === values?.state
																		)[0]
																		?.cities?.flatMap((obj) => {
																			return {
																				key: obj,
																				value: obj
																			}
																		})
																)
														  ]
														: []
												}
												required
											/>
										</div>
										<div className="col-12 col-md-4">
											<FormComponents
												name="zip"
												type="text"
												label="ZIP"
												control="input"
												// disabled={isDisabled}
											/>
										</div>
									</div>
									<div className="d-flex align-items-center justify-content-center mt-3 mb-5">
										<ButtonComponent
											text="Cancel"
											type="button"
											variant="light"
											click={() => closeModal(false)}
											extraClass="me-3"
										/>
										<ButtonComponent
											text="Save Changes"
											type="submit"
											variant="dark"
											disabled={dirty ? false : true}
										/>
									</div>
								</Form>
							</FormModalMUI>
						)
					}}
				</Formik>
			) : null}
		</>
	)
}

export default AddAddress
