import React, { useEffect, useState } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import FormComponents from '../../shared/forms'
import ButtonComponent from '../../shared/ButtonComponent'
import { updateSnackbar } from '../../../redux/snackbarState'
import { useDispatch } from 'react-redux'
import { bankNames } from '../../../utils/constants'
import { bankAccountType } from '../../../utils/helper'
import { useSelector } from 'react-redux'
import useUpdateBank from '../../../API/banks/useUpdateBank'
import useUserInfo from '../../../API/users/useUserInfo'
import useAddBank from '../../../API/banks/useAddBank'
import { FormControlLabel, FormGroup, Switch } from '@mui/material'
import { BankAutoFillContext } from '../../../pages/Bank/components/context/BankAutoFillContext'

const USABank = ({
	bankData = {},
	isUpdate = false,
	onClose,
	isEdit,
	setDirty
}) => {
	const dispatch = useDispatch()
	const [isDisabled, setIsDisabled] = React.useState(false)
	const { data: userData } = useUserInfo()
	const { mutate: addBankAccount } = useAddBank()
	const { mutate: updateBankAccount } = useUpdateBank()

	const selectedOrganization = useSelector(
		(state) => state.appData.selectedOrganization
	)

	const [quickAccount, setQuickAccount] = useState(false)

	const initialValues = {
		bankName: bankData?.bankName || '',
		accountName: bankData?.accountName || '',
		accountNumber: bankData?.accountNumber || '',
		bankRoutingNumber: bankData?.bankRoutingNumber || '',
		confirmAccountNumber: '',
		accountNickName: bankData?.accountNickName || '',
		accountType: bankData?.accountType
			? bankAccountType(bankData?.accountType)
			: '',
		country: 'USA'
	}


	const validationUSASchema = Yup.object({
		bankName: Yup.string().required('Required !'),
		accountName: Yup.string().required('Required !'),
		accountNumber: Yup.string().required('Required !'),
		confirmAccountNumber: Yup.string().required('Required !'),
		accountType: Yup.string().required('Required !'),
		bankRoutingNumber: Yup.string()
			.required('Required !')
			.min(9, 'Must be exactly 9 digits')
			.max(9, 'Must be exactly 9 digits'),
		accountNickName: Yup.string().required('Required !'),
		status: Yup.string()
	})

	const initialUSAValues = {
		bankName: bankData?.bankName || '',
		accountName: bankData?.accountName || '',
		accountNumber: bankData?.accountNumber || '',
		bankRoutingNumber: bankData?.bankRoutingNumber || '',
		confirmAccountNumber: bankData?.accountNumber || '',
		accountNickName: bankData?.accountNickName || '',
		accountType: bankData?.accountType
			? bankAccountType(bankData?.accountType)
			: '',
		country: 'USA',
		status: bankData?.status || 'active'
	}

	const onSubmit = async (values, { resetForm }) => {
		if (values.accountNumber !== values.confirmAccountNumber) {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: 'Account number mismatch'
				})
			)
			return false
		}

		if (quickAccount && values.quickAccount1 === '') {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: 'QuickBook account need to select'
				})
			)
			return false
		}

		if (!isEdit) {
		}

		const body = { ...values }
		delete body.confirmAccountNumber

		try {
			isEdit
				? updateBankAccount({ body, id: bankData?._id })
				: addBankAccount(body)

			resetForm()
			close(true)
		} catch (err) {
			dispatch(
				updateSnackbar({
					open: true,
					severity: 'error',
					message: 'Unable to add bank.'
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

	const bankOptions = bankNames.map((bank, index) => {
		return { key: bank, value: bank }
	})
	bankOptions.sort((a, b) => a.key.localeCompare(b.key))

	const close = (forced) => {
		onClose(forced)
	}

	if (initialValues) {
		return (
			<Formik
				initialValues={initialUSAValues}
				validationSchema={validationUSASchema}
				onSubmit={onSubmit}
				id="usa-form"
				enableReinitialize={true}
			>
				{({ handleSubmit, isValid, dirty, setFieldValue, values }) => {
					return (
						<Form onSubmit={handleSubmit} id="usa-form" autoComplete="off">
							{typeof setDirty === 'function' && setDirty(dirty)}
							<BankAutoFillContext/>
							<div className="row">
								<div className="col-12 col-md-6 position-relative">
									<FormComponents
										name="bankRoutingNumber"
										label="Routing Number"
										control="input"
										type="text"
										required
										// disabled={isDisabled}
										onChange={(e) => {
											setFieldValue('bankRoutingNumber', e.target.value)
										}}
									/>
								</div>
								<div className="col-12 col-md-6">
									{
										isDisabled ? (
											<FormComponents
												control="input"
												name="bankName"
												autoComplete="off"
												label="Select a bank*"
												disabled={isDisabled}
												required
											/>
										) : (
											<FormComponents
												name="bankName"
												label="Select a bank*"
												control="autocomplete"
												options={bankOptions}
												multiple={false}
												required
											/>
										)
									}
								</div>
							</div>

							<div className="row">
								<div className="col-12">
									<FormComponents
										name="accountType"
										label="Select Account type"
										control="select"
										disabled={true}
										options={accountTypes}
									/>
								</div>
							</div>
							<div className="row">
								<div className="col-12 col-md-6">
									<FormComponents
										name="accountNumber"
										label="Account Number"
										control="input"
										required
										autoComplete="off"
									/>
								</div>
								<div className="col-12 col-md-6">
									<FormComponents
										autoComplete="off"
										name="confirmAccountNumber"
										label="Confirm Account Number"
										control="input"
										type="text"
										required
									/>
								</div>
							</div>
							<div className="row">
								<div className="col-12 col-md-6">
									<FormComponents
										autoComplete="off"
										name="accountName"
										label="Account Name"
										control="input"
										type="text"
										required
									/>
								</div>
								<div className="col-12 col-md-6">
									<FormComponents
										autoComplete="off"
										name="accountNickName"
										label="Account Nick Name*"
										control="input"
										type="text"
										required
									/>
								</div>
								<div className="row">
									{quickAccount && (
										<div className="col-12">
											<FormComponents
												name="quickAccount1"
												label="Select Account type"
												control="select"
												disabled={true}
												options={accountTypes}
												required
											/>
										</div>
									)}
								</div>
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
							<div className="d-flex flex-row align-items-center justify-content-evenly mt-1">
								<button
									type="button"
									className="common-btn bg-white light"
									onClick={() => close(false)}
								>
									Cancel
								</button>
								<ButtonComponent
									text={isEdit ? 'Save Changes' : 'Add Account'}
									type="submit"
									variant="dark"
									click={handleSubmit}
									disabled={!isValid || !dirty}
								/>
							</div>
						</Form>
					)
				}}
			</Formik>
		)
	}
}

export default USABank
