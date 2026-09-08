import React, { useState, useEffect } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import FormComponents from '../../shared/forms'
import ButtonComponent from '../../shared/ButtonComponent'
import { updateSnackbar } from '../../../redux/snackbarState'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { getQuickBookAccount } from '../../../API/IntegrationsAPI'
import useAddBank from '../../../API/banks/useAddBank'
import { Box, FormControlLabel, FormGroup, Switch } from '@mui/material'
import useUpdateBank from '../../../API/banks/useUpdateBank'
import useUserInfo from '../../../API/users/useUserInfo'

const CanadaBank = ({ bankData = {}, isEdit = false, onClose, setDirty }) => {
	const dispatch = useDispatch()
	const { data: userData } = useUserInfo
	const { mutate: addBankAccount } = useAddBank()
	const { mutate: updateBankAccount } = useUpdateBank()
	const [quickAccount, setQuickAccount] = useState(false)
	const selectedOrganization = useSelector(
		(state) => state.appData.selectedOrganization
	)

	const validationCanadaSchema = Yup.object({
		bankName: Yup.string().required('Required !'),
		accountName: Yup.string().required('Required !'),
		accountNumber: Yup.string().required('Required !'),
		confirmAccountNumber: Yup.string().required('Required !'),
		accountType: Yup.string().required('Required !'),
		bankTransitNumber: Yup.number().required('Required !'),
		financialInstituteNumber: Yup.number().required('Required !'),
		quickAccount1: Yup.string().when('quickAccount', {
			is: true,
			then: Yup.string().required('Required !')
		}),
		status: Yup.string()
	})

	const initialCanadaValues = {
		bankTransitNumber: bankData?.bankTransitNumber || '',
		financialInstituteNumber: bankData?.financialInstituteNumber || '',
		bankName: bankData?.bankName || '',
		accountName: bankData?.accountName || '',
		accountNumber: bankData?.accountNumber || '',
		confirmAccountNumber: bankData?.accountNumber || '',
		accountNickName: bankData?.accountNickName || '',
		accountType: bankData?.accountType?.toLowerCase() || '',
		country: 'CANADA',
		status: bankData?.status || 'active'
	}


	const onSubmit = async (values, { resetForm }) => {
		if (values.accountNumber !== values.confirmAccountNumber) {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: 'Account numebr mismatch.'
				})
			)
			return false
		}

		const body = { ...values }
		delete body.confirmAccountNumber

		try {
			isEdit
				? updateBankAccount({ body, id: bankData?._id })
				: addBankAccount(body)

			resetForm()
			setDirty(false)
			close(true)
		} catch (err) {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: `${
						isEdit ? 'Unable to update bank.' : 'Unable to add bank.'
					}`
				})
			)
		}
	}

	const accountTypes = [
		{
			key: 'Checking account',
			value: 'checking'
		},
		{
			key: 'Savings account',
			value: 'savings'
		},
		{
			key: 'Money market account',
			value: 'moneyMarket'
		},
		{
			key: 'Certificate of deposit (CD)',
			value: 'certificateOfDeposit'
		},
		{
			key: 'Business account',
			value: 'Business'
		},
		{
			key: 'Joint account',
			value: 'joint'
		},
		{
			key: 'Trust account',
			value: 'trust'
		}
	]

	const close = (forced) => {
		onClose(forced)
	}

	return (
		<Box>
			<Formik
				initialValues={initialCanadaValues}
				validationSchema={validationCanadaSchema}
				onSubmit={onSubmit}
				id="canada-form"
			>
				{({ handleSubmit, setFieldValue, dirty, isValid, values }) => {
					return (
						<Form onSubmit={handleSubmit} id="canada-form" autoComplete="off">
							{typeof setDirty === 'function' && setDirty(dirty)}
							<div className="row">
								<div className="col-12">
									<FormComponents
										name="bankName"
										label="Bank Name"
										control="input"
										type="text"
										required
										autoComplete="off"
									/>
								</div>
							</div>
							<div className="row">
								<div className="col-12 col-md-6">
									<FormComponents
										name="bankTransitNumber"
										label="Transit Number"
										control="input"
										type="number"
										required
										autoComplete="off"
									/>
								</div>
								<div className="col-12 col-md-6">
									<FormComponents
										name="financialInstituteNumber"
										label="Financial Institue Number"
										control="input"
										type="number"
										autoComplete="off"
									/>
								</div>
							</div>
							<div className="row">
								<div className="col-12 col-md-6">
									<FormComponents
										name="accountNumber"
										label="Account Number"
										control="input"
										autoComplete="off"
									/>
								</div>
								<div className="col-12 col-md-6">
									<FormComponents
										name="confirmAccountNumber"
										label="Confirm Account Number"
										control="input"
										type="text"
										autoComplete="off"
									/>
								</div>
							</div>
							<div className="row">
								<div className="col-12">
									<FormComponents
										name="accountType"
										label="Select Account type"
										control="select"
										options={accountTypes}
									/>
								</div>
							</div>
							<div className="row">
								<div className="col-12 col-md-6">
									<FormComponents
										name="accountName"
										label="Account Name"
										control="input"
										type="text"
									/>
								</div>
								<div className="col-12 col-md-6">
									<FormComponents
										name="accountNickName"
										label="Account Nick Number"
										control="input"
										type="text"
									/>
								</div>
								{quickAccount && (
									<div className="col-12">
										<FormComponents
											name="quickAccount"
											label="Select Account type"
											control="select"
											disabled={true}
											options={accountTypes}
										/>
									</div>
								)}
							</div>
							<div className="row">
								<div className="">
									<FormGroup>
										<FormControlLabel
											label="Active"
											labelPlacement="start"
											control={
												<Switch
													name="status"
													checked={values.status === 'active'}
													onChange={(e) => {
														const checked = e.target.checked
														setFieldValue(
															'status',
															checked ? 'active' : 'inactive'
														)
													}}
												/>
											}
										/>
									</FormGroup>
								</div>
							</div>
							<div className="d-flex flex-row align-items-center justify-content-evenly mt-4">
								<button
									type="button"
									className="common-btn bg-white light"
									onClick={() => close(false)}
								>
									Cancel
								</button>
								<ButtonComponent
									text={isEdit ? 'Update Account' : 'Add Account'}
									type="submit"
									variant="dark"
									onClick={handleSubmit}
									disabled={!isValid || !dirty}
								/>
							</div>
						</Form>
					)
				}}
			</Formik>
		</Box>
	)
}

export default CanadaBank
