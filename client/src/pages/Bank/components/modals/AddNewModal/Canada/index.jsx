import React from 'react'
import {
	Box,
	Typography,
	TextField,
	Select,
	MenuItem,
	Radio,
	Switch,
	Tooltip,
	Icon
} from '@mui/material'
import { SignaturePad } from '../../../../../../components/signaturePad/index'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import { ExpandLess, ExpandMore } from '@mui/icons-material'

import { styles } from '../../styles'
import { accountTypes } from '../USA'
import useUserInfo from '../../../../../../API/users/useUserInfo'

const getInitialValues = (bankData, defaultSignature) => {
	return {
		bankTransitNumber: bankData?.bankTransitNumber || '',
		confirmTransitNumber: bankData?.bankTransitNumber || '',
		financialInstituteNumber: bankData?.financialInstituteNumber || '',
		confirmFinancialInstitutionNumber: bankData?.financialInstituteNumber || '',
		bankName: bankData?.bankName || '',
		accountName: bankData?.accountNickName || '',
		accountNumber: bankData?.accountNumber || '',
		confirmAccountNumber: bankData?.accountNumber || '',
		accountNickName: bankData?.accountNickName || '',
		accountType: bankData?.accountType || '',
		country: 'CANADA',
		status: bankData?.status || 'active',
		bankPreferences: {
			checkNoGeneration:
				bankData?.bankPreferences?.checkNoGeneration || 'manual',
			defaultCheckNumberLength:
				bankData?.bankPreferences?.defaultCheckNumberLength || 6,
			defaultCheckStartNumber:
				bankData?.bankPreferences?.defaultCheckStartNumber || '',
			lastUsedCheckNumber: bankData?.bankPreferences?.lastUsedCheckNumber || '',
			signatureUrl:
				bankData?.bankPreferences?.signatureUrl || defaultSignature || '',
			signatureEnabled: bankData?.bankPreferences?.signatureEnabled || false
		}
	}
}

export const AddNewModalCanada = ({
	formRef,
	onSubmit,
	bankData,
	setShouldDisable,
	apiErrors
}) => {
	const { data } = useUserInfo()

	const signature = data?.signatureUrl
	const initialValues = getInitialValues(bankData, signature)

	const handleSubmit = async (values, { setSubmitting }) => {
		try {
			values.bankPreferences.useDefaultSignature =
				values.bankPreferences.signatureUrl === signature
			onSubmit(values)
		} catch (error) {
			console.error('Error submitting form:', error)
		} finally {
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
				setFieldValue,
				setErrors
			}) => {
				if (!!Object.keys(errors).length) {
					setShouldDisable(true)
				} else setShouldDisable(false)
				return (
					<Form>
						<Box sx={styles.formContainer}>
							<Box sx={styles.inputGroup}>
								<Box sx={styles.labelContainer}>
									<Typography sx={styles.inputLabel}>Bank Name*</Typography>
									<Tooltip
										title="Enter the official name of the bank as it should appear on printed checks."
										placement="top-end"
										arrow
										componentsProps={{
											tooltip: {
												sx: {
													marginRight: '-15px',
													bgcolor: '#181D27',
													fontSize: '12px',
													lineHeight: '16px',
													padding: '12px 8px',
													borderRadius: '8px',
													'& .MuiTooltip-arrow': {
														color: '#181D27',
														left: '-10px !important'
													}
												}
											},
											popper: {
												sx: {
													marginBottom: '8px !important'
												}
											}
										}}
									>
										<Box sx={styles.labelIcon}>
											<HelpOutlineIcon />
										</Box>
									</Tooltip>
								</Box>
								<TextField
									fullWidth
									name="bankName"
									placeholder="JP Morgan Chase"
									value={values.bankName}
									onChange={handleChange}
									onBlur={handleBlur}
									error={touched.bankName && !!errors.bankName}
									helperText={touched.bankName && errors.bankName}
									sx={styles.input}
								/>
							</Box>
							<Box sx={styles.groupContainer}>
								<Box sx={styles.inputGroup}>
									<Typography sx={styles.inputLabel}>
										Transit Number*
									</Typography>
									<TextField
										fullWidth
										name="bankTransitNumber"
										placeholder="Transit Number"
										value={values.bankTransitNumber}
										onChange={handleChange}
										onBlur={handleBlur}
										error={
											touched.bankTransitNumber && !!errors.bankTransitNumber
										}
										helperText={
											touched.bankTransitNumber && errors.bankTransitNumber
										}
										sx={styles.input}
									/>
								</Box>
								<Box sx={styles.inputGroup}>
									<Typography sx={styles.inputLabel}>
										Confirm Transit Number*
									</Typography>
									<TextField
										fullWidth
										name="confirmTransitNumber"
										placeholder="ConfirmRouting Number"
										value={values.confirmTransitNumber}
										onChange={handleChange}
										onBlur={handleBlur}
										error={
											touched.confirmTransitNumber &&
											!!errors.confirmTransitNumber
										}
										helperText={
											touched.confirmTransitNumber &&
											errors.confirmTransitNumber
										}
										sx={styles.input}
									/>
								</Box>
							</Box>

							<Box sx={styles.groupContainer}>
								<Box sx={styles.inputGroup}>
									<Typography sx={styles.inputLabel}>
										Financial Institution Number*
									</Typography>
									<TextField
										fullWidth
										name="financialInstituteNumber"
										placeholder="Financial Institution Number"
										value={values.financialInstituteNumber}
										onChange={handleChange}
										onBlur={handleBlur}
										error={
											touched.financialInstituteNumber &&
											!!errors.financialInstituteNumber
										}
										helperText={
											touched.financialInstituteNumber &&
											errors.financialInstituteNumber
										}
										sx={styles.input}
									/>
								</Box>
								<Box sx={styles.inputGroup}>
									<Typography sx={styles.inputLabel}>
										Confirm Financial Institution Number*
									</Typography>
									<TextField
										fullWidth
										name="confirmFinancialInstitutionNumber"
										placeholder="Confirm Financial Institution Number"
										value={values.confirmFinancialInstitutionNumber}
										onChange={handleChange}
										onBlur={handleBlur}
										error={
											touched.confirmFinancialInstitutionNumber &&
											!!errors.confirmFinancialInstitutionNumber
										}
										helperText={
											touched.confirmTransitNumber &&
											errors.confirmTransitNumber
										}
										sx={styles.input}
									/>
								</Box>
							</Box>

							<Box sx={styles.groupContainer}>
								<Box sx={styles.inputGroup}>
									<Typography sx={styles.inputLabel}>
										Account Number*
									</Typography>
									<TextField
										fullWidth
										name="accountNumber"
										placeholder="Account Number"
										value={values.accountNumber}
										onChange={handleChange}
										onBlur={handleBlur}
										error={touched.accountNumber && !!errors.accountNumber}
										helperText={touched.accountNumber && errors.accountNumber}
										sx={styles.input}
									/>
								</Box>
								<Box sx={styles.inputGroup}>
									<Typography sx={styles.inputLabel}>
										Confirm Account Number*
									</Typography>
									<TextField
										fullWidth
										name="confirmAccountNumber"
										placeholder="Confirm Account Number"
										value={values.confirmAccountNumber}
										onChange={handleChange}
										onBlur={handleBlur}
										error={
											touched.confirmAccountNumber &&
											!!errors.confirmAccountNumber
										}
										helperText={
											touched.confirmAccountNumber &&
											errors.confirmAccountNumber
										}
										sx={styles.input}
									/>
								</Box>
							</Box>

							<Box sx={styles.groupContainer}>
								<Box sx={styles.inputGroup}>
									<Typography sx={styles.inputLabel}>
										Select Account Type*
									</Typography>

									<Select
										fullWidth
										name="accountType"
										value={values.accountType}
										onChange={handleChange}
										onBlur={handleBlur}
										error={touched.accountType && !!errors.accountType}
										sx={styles.select}
									>
										{accountTypes.map((item) => (
											<MenuItem key={item.value} value={item.value}>
												{item.key}
											</MenuItem>
										))}
									</Select>
									{touched.accountType && errors.accountType && (
										<Typography color="error" sx={styles.errorText}>
											{errors.accountType}
										</Typography>
									)}
								</Box>
								<Box sx={styles.inputGroup}>
									<Box sx={styles.labelContainer}>
										<Typography sx={styles.inputLabel}>
											Account Nickname*
										</Typography>
										<Tooltip
											title="Enter a custom name for this bank account. This accountNickName is for your reference only and will not appear on printed checks."
											placement="top-end"
											arrow
											componentsProps={{
												tooltip: {
													sx: {
														marginRight: '-15px',
														bgcolor: '#181D27',
														fontSize: '12px',
														lineHeight: '16px',
														padding: '12px 8px',
														borderRadius: '8px',
														'& .MuiTooltip-arrow': {
															color: '#181D27',
															left: '-10px !important'
														}
													}
												},
												popper: {
													sx: {
														marginBottom: '8px !important'
													}
												}
											}}
										>
											<Box sx={styles.labelIcon}>
												<HelpOutlineIcon />
											</Box>
										</Tooltip>
									</Box>
									<TextField
										fullWidth
										name="accountNickName"
										placeholder="My Chase Account"
										value={values.accountNickName}
										onChange={handleChange}
										onBlur={handleBlur}
										error={touched.accountNickName && !!errors.accountNickName}
										helperText={
											touched.accountNickName && errors.accountNickName
										}
										sx={styles.input}
									/>
								</Box>
							</Box>
							{
								apiErrors?.reason && <Box my={3}>
								<Typography color={'red'} textAlign={'center'}>
										{}
									</Typography>
							</Box>
							}
							

							<Typography sx={styles.inputLabel}>Preferences</Typography>
							<Typography color="text.secondary">
								Change Your Checkwriting Preferences here.
							</Typography>

							<Box sx={styles.inputGroup}>
								<Typography sx={styles.inputLabel}>
									Check No. generation
								</Typography>
								<Box sx={styles.radioGroup}>
									<Box sx={styles.radioItem}>
										<Radio
											name="bankPreferences.checkNoGeneration"
											value="manual"
											checked={
												values.bankPreferences.checkNoGeneration === 'manual'
											}
											onChange={handleChange}
											sx={styles.radio}
										/>
										<Typography sx={styles.radioLabel}>Manual</Typography>
									</Box>
									<Box sx={styles.radioItem}>
										<Radio
											name="bankPreferences.checkNoGeneration"
											value="auto"
											checked={
												values.bankPreferences.checkNoGeneration === 'auto'
											}
											onChange={handleChange}
											sx={styles.radio}
										/>
										<Typography sx={styles.radioLabel}>Auto</Typography>
									</Box>
								</Box>
							</Box>

							<Box sx={styles.groupContainer}>
								<Box sx={styles.inputGroup}>
									<Box sx={styles.labelContainer}>
										<Typography sx={styles.inputLabel}>
											Length of check number
										</Typography>
										<Tooltip
											title="Choose the number of digits for check numbers. Shorter numbers will be padded with zeros."
											placement="top-end"
											arrow
											componentsProps={{
												tooltip: {
													sx: {
														marginRight: '-15px',
														bgcolor: '#181D27',
														fontSize: '12px',
														lineHeight: '16px',
														padding: '12px 8px',
														borderRadius: '8px',
														'& .MuiTooltip-arrow': {
															color: '#181D27',
															left: '-10px !important'
														}
													}
												},
												popper: {
													sx: {
														marginBottom: '8px !important'
													}
												}
											}}
										>
											<Box sx={styles.labelIcon}>
												<HelpOutlineIcon />
											</Box>
										</Tooltip>
									</Box>

									<Box
										display={'flex'}
										alignItems={'flex-start'}
									>
										<TextField
											disabled
											fullWidth
											name="bankPreferences.defaultCheckNumberLength"
											placeholder="0001"
											value={values?.bankPreferences?.defaultCheckNumberLength}
											onChange={handleChange}
											onBlur={handleBlur}
											error={
												!!errors?.bankPreferences?.defaultCheckNumberLength
											}
											helperText={
												errors?.bankPreferences?.defaultCheckNumberLength
											}
											sx={styles.input}
										/>

										<div className="d-flex align-items-center justify-content-center flex-column">
											<button
												className="bg-transparent border-0 value-cntrl-btn"
												type="button"
												onClick={(e) => {
													e.preventDefault()
													setFieldValue(
														'bankPreferences.defaultCheckNumberLength',
														`${
															+values.bankPreferences.defaultCheckNumberLength +
															1
														}`
													)
												}}
												disabled={
													values.defaultCheckNumberLength === 8 ? true : false
												}
											>
												<Icon
													sx={{
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														width: '18px',
														height: '18px',
														'& svg': {
															width: 'inherit',
															height: 'inherit'
														}
													}}
												>
													<ExpandLess />
												</Icon>
											</button>
											<button
												className="bg-transparent border-0 value-cntrl-btn"
												type="button"
												onClick={(e) => {
													e.preventDefault()
													setFieldValue(
														'bankPreferences.defaultCheckNumberLength',
														`${
															+values.bankPreferences.defaultCheckNumberLength -
															1
														}`
													)
												}}
												disabled={
													values.defaultCheckNumberLength === 1 ? true : false
												}
											>
												<Icon
													sx={{
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														height: '18px',
														width: '18px',
														'& svg': {
															width: 'inherit',
															height: 'inherit'
														}
													}}
												>
													<ExpandMore />
												</Icon>
											</button>
										</div>
									</Box>
								</Box>
								<Box sx={styles.inputGroup}>
									{values.bankPreferences.checkNoGeneration === 'auto' && (
										<>
											<Typography sx={styles.inputLabel}>
												Default check start number
											</Typography>
											<TextField
												fullWidth
												name="bankPreferences.defaultCheckStartNumber"
												placeholder="1000"
												value={values?.bankPreferences?.defaultCheckStartNumber}
												onChange={handleChange}
												onBlur={handleBlur}
												helperText={
													errors?.bankPreferences?.defaultCheckStartNumber
												}
												sx={styles.input}
												error={
													!!errors?.bankPreferences?.defaultCheckStartNumber
												}
											/>
										</>
									)}
								</Box>
							</Box>
							{false && (
								<Typography
									color="error"
									sx={{ ...styles.errorText, marginTop: '-10px' }}
								>
									This check number is already used. Try 1002 instead.
								</Typography>
							)}

							<Box sx={styles.signatureContainer}>
								<Box sx={styles.signatureLabelContainer}>
									<Box>
										<Typography sx={styles.signatureLabel}>
											Your Signature
										</Typography>
										<Typography color="text.secondary">
											Enable signature for every check, If Uploaded
										</Typography>
									</Box>
									<Switch
										checked={values.bankPreferences.signatureEnabled}
										onChange={(e) => {
											setFieldValue(
												'bankPreferences.signatureEnabled',
												e.target.checked
											)
											if (!e.target.checked) {
												setFieldValue('signature', null)
											}
										}}
										sx={styles.switch}
									/>
								</Box>

								{values.bankPreferences.signatureEnabled && (
									<>
										<SignaturePad
											defaultValue={signature}
											value={values.bankPreferences.signatureUrl}
											onChange={(signatureData) => {
												setFieldValue(
													'bankPreferences.signatureUrl',
													signatureData
												)
											}}
										/>
										{touched.signature && errors.signature && (
											<Typography color="error" sx={styles.errorText}>
												{errors.signature}
											</Typography>
										)}
									</>
								)}
							</Box>
						</Box>
					</Form>
				)
			}}
		</Formik>
	)
}

const validationSchema = Yup.object().shape({
	bankTransitNumber: Yup.string()
		.matches(/^\d{9}$/, 'Transit number must be exactly 9 digits')
		.required('Transit number cannot be empty.'),
	confirmTransitNumber: Yup.string()
		.oneOf(
			[Yup.ref('bankTransitNumber'), null],
			'Transit Number and Confirm Transit Number do not match.'
		)
		.required('Confirm Transit number cannot be empty.'),
	financialInstituteNumber: Yup.string()
		.matches(/^\d{9}$/, 'Financial Institution Number must be exactly 9 digits')
		.required('Financial Institution Number cannot be empty.'),
	confirmFinancialInstitutionNumber: Yup.string()
		.oneOf(
			[Yup.ref('financialInstituteNumber'), null],
			'Financial Institution Number and Confirm Financial Institution Number do not match.'
		)
		.required('Confirm Financial Institution Number number cannot be empty.'),
	accountNumber: Yup.string()
		.matches(/^\d{4,17}$/, 'Account number must be between 4 and 17 digits')
		.required('Account number cannot be empty.'),
	confirmAccountNumber: Yup.string()
		.oneOf(
			[Yup.ref('accountNumber'), null],
			'Account Number and Confirm Account Number do not match.'
		)
		.required('Confirm account number cannot be empty.'),
	accountType: Yup.string().required('Please select an account type.'),
	bankName: Yup.string().required('Bank name cannot be empty.'),
	accountNickName: Yup.string().required(
		'Name cannot be empty or contain special characters.'
	),

	signatureEnabled: Yup.boolean(),
	bankPreferences: Yup.object().shape({
		checkNoGeneration: Yup.string().oneOf(['manual', 'auto']).required(),
		defaultCheckNumberLength: Yup.number()
			.positive()
			.integer()
			.min(1, 'Must be great or euqal to 1')
			.max(20)
			.when('checkNoGeneration', {
				is: 'manual',
				then: (schema) =>
					schema.required(
						'Default Check Number Length is required for automatic check generation'
					)
			}),
		defaultCheckStartNumber: Yup.string().when('checkNoGeneration', {
			is: 'auto',
			then: (schema) =>
				schema
					.required(
						'Default Check Start Number is required for automatic check generation'
					)
					.matches(
						/^[0-9]+$/,
						'Default Check Start Number must contain only digits'
					)
		}),
		lastUsedCheckNumber: Yup.string().matches(
			/^[0-9]*$/,
			'Last Used Check Number must contain only digits'
		),
		signatureUrl: Yup.string(),
		signatureEnabled: Yup.boolean().required()
	})
})
