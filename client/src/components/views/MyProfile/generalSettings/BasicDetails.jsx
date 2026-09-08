import { ErrorOutlineOutlined, ModeEditOutlined } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'
import FormModalMUI from '../../../shared/Modals/FormModalMUI'
import { Form, Formik } from 'formik'
import FormComponents from '../../../shared/forms'
import ButtonComponent from '../../../shared/ButtonComponent'

const BasicDetails = ({ initialValues, validationSchema, onSubmit }) => {
	const [isDisabled, setIsDisabled] = useState(true)

	const [isModalOpen, setModalOpen] = useState(false)
	const [isDirty, setIsDirty] = useState(false)
	const [showWarning, setWarning] = useState(false)

	const setDirty = (dirty) => {
		setIsDirty(dirty)
	}

	const openModal = () => {
		setModalOpen(true)
	}

	const closeModal = (forced) => {
		if (isDirty && !forced) {
			setWarning(true)
		} else {
			setModalOpen(false)
			setWarning(false)
		}
	}

	return (
		<>
			<div className="container-fluid p-0">
				<div className="d-flex align-items-center justify-content-between mb-2 pb-2">
					<div>
						<h4 className="fs-6 fw-semibold text-black mt-4 mb-2">
							Basic Details
						</h4>
						{/* <p className="small-txt-head mb-4">Below are your basic details.</p> */}
					</div>
					<IconButton type="button" onClick={openModal}>
						<ModeEditOutlined />
					</IconButton>
				</div>
			</div>

			<div className="container-fluid mb-4">
				<div className="row justify-content-start pb-4">
					<div className="col-4 ps-0">
						<div className="row text-secondary">
							<small>
								<b>Name</b>
							</small>
						</div>
						<p className="fs-14 mb-0">
							{initialValues.firstName +
								' ' +
								initialValues.middleName +
								' ' +
								initialValues.lastName}
						</p>
					</div>
					<div className="col-4">
						<div className="row text-secondary">
							<small>
								<b>Email Id</b>
							</small>
						</div>
						<p className="fs-14 mb-0">{initialValues.email}</p>
					</div>
				</div>
				<div className="row justify-content-start pb-4">
					<div className="col-4 ps-0">
						<div className="row text-secondary">
							<small>
								<b>Phone Number</b>
							</small>
						</div>
						<p className="fs-14 mb-0">
							{initialValues?.phone ? '+' + initialValues?.phone : ''}
						</p>
					</div>
					<div className="col-4">
						<div className="row text-secondary">
							<small>
								<b>Date of Birth</b>
							</small>
						</div>
						<p className="fs-14 mb-0">
							{dayjs(initialValues.dateOfBirth).format('MM-DD-YYYY')}
						</p>
					</div>
				</div>
			</div>

			{isModalOpen && (
				<FormModalMUI
					onClose={() => closeModal(false)}
					open={isModalOpen}
					title="Edit Basic Info"
					maxWidth="md"
					onSave={onSubmit}
				>
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={onSubmit}
					>
						{({ handleSubmit, setFieldValue, dirty }) => {
							return (
								<Form>
									{setDirty(dirty)}
									{showWarning && (
										<div class="alert alert-danger" role="alert">
											<div className="row row justify-content-between">
												<div className="col-auto p-2">
													<ErrorOutlineOutlined className="me-2" />
													Are you sure you want to close the modal? Your details
													wont be saved.
												</div>
												<div className="col-auto">
													<div className="row justify-content-end">
														<div className="col-auto">
															<button
																type="button"
																class="btn btn-light"
																onClick={() => setWarning(false)}
															>
																No
															</button>
														</div>
														<div className="col-auto">
															<button
																type="button"
																class="btn btn-danger"
																onClick={() => closeModal(true)}
															>
																Yes
															</button>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
									<div className="row">
										<div className="col-12 col-md-4">
											<FormComponents
												name="firstName"
												type="text"
												label="First Name"
												control="input"
												// disabled={isDisabled}
											/>
										</div>
										<div className="col-12 col-md-4">
											<FormComponents
												name="middleName"
												type="text"
												label="Middle Name"
												control="input"
												// disabled={isDisabled}
											/>
										</div>
										<div className="col-12 col-md-4">
											<FormComponents
												name="lastName"
												type="text"
												label="Last Name"
												control="input"
												// disabled={isDisabled}
											/>
										</div>
									</div>
									<div className="row">
										<div className="col-12 col-md-4">
											<FormComponents
												name="email"
												type="email"
												label="Email"
												control="input"
												disabled={isDisabled}
											/>
										</div>
										<div className="col-12 col-md-4">
											<FormComponents
												name="phone"
												label="Phone Number"
												control="phone-input"
												type="text"
												country="us"
												onChange={(phoneNumber) =>
													setFieldValue('phone', phoneNumber)
												}
												// disabled={isDisabled}
											/>
										</div>
										<div className="col-12 col-md-4">
											<FormComponents
												name="dateOfBirth"
												label="Date of Birth"
												control="date"
												// disabled={isDisabled}
											/>
										</div>
									</div>
									<div className="d-flex align-items-center justify-content-center mt-3 mb-5">
										<ButtonComponent
											text="Cancel"
											variant="light"
											extraClass="me-3"
											click={() => closeModal(false)}
										/>
										<ButtonComponent
											text="Save Changes"
											type="submit"
											variant="dark"
											click={() => {
												handleSubmit()
												closeModal(true)
											}}
											// disabled={dirty ? false : true}
										/>
									</div>
								</Form>
							)
						}}
					</Formik>
				</FormModalMUI>
			)}
		</>
	)
}

export default BasicDetails
