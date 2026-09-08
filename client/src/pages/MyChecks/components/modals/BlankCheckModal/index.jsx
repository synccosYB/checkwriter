import { useEffect, useRef, useState } from 'react'
import { CustomDialog } from '../../../../../components/dialog/CustomDialog'
import {
	Box,
	Typography,
	Button,
	TextField,
	Radio,
	Autocomplete,
	CircularProgress,
	Tooltip
} from '@mui/material'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { styles } from '../styles'
import useBanks from '../../../../../API/banks/useBanks'
import { getNextCheckNumber } from '../../../../../API/banks/useNextCheckNumber'
import { useDispatch, useSelector } from 'react-redux'
import { useValidateCheckNumbers } from '../../../../../API/checks/useValidateCheckNumbers'
import { useDebouncedCallback } from '../../../../../utils/hooks/useDebouncedCallback'
import { useCreateBlankChecks } from '../../../../../API/checks/useCreateBlankChecks'
import { EXCEED_TRIAL_LIMIT_WARNING } from '../../../utils/constant'

export const BlankCheckModal = ({
	open,
	onClose,
	handleOpenUnsavedAlert,
	checkData,
	handleOpenDownloadCheckAlert,
	setAlertDialogValue,
	totalCount,
	userMaxCheckLimit
}) => {
	const [isFormTouched, setIsFormTouched] = useState(false)
	const dispatch = useDispatch()
	const { data: banksData } = useBanks({ status: 'active' })
	const formRef = useRef(null)
	const initialValues = {
		bankAccountId: '',
		startingCheckNumber: '',
		signed: true,
		count: 1
	}
	const [checkLimit, setCheckLimit] = useState(false)
	const validationSchema = Yup.object().shape({
		bankAccountId: Yup.string().required('Bank Account is required'),
		startingCheckNumber: Yup.number()
			.integer()
			.min(1)
			.required('Check Number is required'),
		count: Yup.number()
			.integer()
			.min(1)
			.required('Number of Checks is required'),
		signed: Yup.boolean().required('signed is required')
	})

	const {
		mutate: validateCheckNumbers,
		data: validateResult,

		reset: resetValidation
	} = useValidateCheckNumbers()

	const { mutate: addBlankChecks, isPending: addBlankChecksLoading } =
		useCreateBlankChecks()
	const [conflicts, setConflicts] = useState('')
	useEffect(() => {
		if (
			validateResult &&
			!validateResult.available &&
			validateResult.conflicts
		) {
			setConflicts(
				`Ensure The check starting number aren't duplicated.`
			)
		} else {
			setConflicts('')
		}
	}, [validateResult, dispatch])

	const selectedOrganization = useSelector(
		(state) => state.appData.selectedOrganization
	)
	const ownerType = selectedOrganization ? 'organization' : 'user'

	const handleSaveAndPrint = () => {
		if (formRef.current) {
			formRef.current.handleSubmit()
		}
	}

	const handleSubmit = async (values) => {
		try {
			addBlankChecks(values, {
				onSuccess: async (data) => {
					setAlertDialogValue(data.url)
					handleOpenDownloadCheckAlert()
				},
				onSettled: async () => {
					onClose()
				}
			})
		} catch (error) {
			console.error(error)
		}
	}
	const handleBankChange = async (e) => {
		const bankId = e.target.value
		if (bankId) {
			formRef.current.setFieldValue('bankAccountId', bankId)
			const selectedBank = banksData?.data?.find((bank) => bank._id === bankId)
			if (
				selectedBank &&
				selectedBank.bankPreferences?.checkNoGeneration !== 'manual'
			) {
				const { nextAvailableCheckNumber } = await getNextCheckNumber(
					ownerType,
					selectedBank._id
				)
				formRef.current.setFieldValue(
					'startingCheckNumber',
					nextAvailableCheckNumber
				)
				setConflicts('')
				resetValidation()
			} else {
				formRef.current.setFieldValue('startingCheckNumber', '')
			}
		}
	}

	const handleValidateCheckNumbers = useDebouncedCallback(
		(bankAccountId, startingCheckNumber, count) => {
			if (bankAccountId && startingCheckNumber && count) {
				const selectedBank = banksData?.data?.find((bank) => bank._id === bankAccountId)
				if(selectedBank.bankPreferences?.checkNoGeneration === 'manual'){
					validateCheckNumbers({
					bankAccountId,
					startingCheckNumber: Number(startingCheckNumber),
					count: Number(count)
				})
				}
			}
		},
		500
	)

	
	return (
		<CustomDialog
			open={open}
			onClose={() => {
				isFormTouched || formRef.current?.dirty
					? handleOpenUnsavedAlert()
					: onClose()
			}}
			width="760px"
			title={'Create Blank Check'}
			content={
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
						setFieldValue
					}) => {
						const isManualBankAccount =
							banksData?.data?.find((bank) => bank._id === values.bankAccountId)
								?.bankPreferences?.checkNoGeneration === 'manual'
						return (
							<Box>
								<Typography color="#00000099" sx={styles.subTitle}>
									Following Fields are required to create a blank check.
								</Typography>

								<Box sx={styles.addEditBlankContainer}>
									<Box sx={{ mb: '24px' }}>
										<Typography sx={styles.checkTitle}>
											Your Signature
										</Typography>
										<Typography sx={styles.checkSubTitle}>
											Want to sign with signature
										</Typography>

										<Box sx={styles.radioGroup}>
											<Box sx={styles.radioItem}>
												<Radio
													name="signed"
													value={true}
													checked={values.signed === true}
													onChange={(e) => {
														setFieldValue('signed', true)
														setIsFormTouched(true)
													}}
													sx={styles.radio}
												/>
												<Typography sx={styles.radioLabel}>Yes</Typography>
											</Box>
											<Box sx={styles.radioItem}>
												<Radio
													name="signed"
													value={false}
													checked={values.signed === false}
													onChange={(e) => {
														setFieldValue('signed', false)
														setIsFormTouched(true)
													}}
													sx={styles.radio}
												/>
												<Typography sx={styles.radioLabel}>No</Typography>
											</Box>
										</Box>
									</Box>
									<Box sx={styles.bankCheckNumberFieldContainer}>
										<Box sx={{ width: { md: '50%' } }}>
											<Typography sx={styles.balankItemLabel}>
												Bank Account *
											</Typography>
											<Box>
												<Autocomplete
													fullWidth
													options={banksData?.data || []}
													disableClearable
													getOptionLabel={(option) => option.bankName || ''}
													value={
														banksData?.data?.find(
															(bank) => bank._id === values.bankAccountId
														) || null
													}
													onChange={(event, newValue) => {
														handleBankChange({
															target: { value: newValue?._id || '' }
														})
														setIsFormTouched(true)
													}}
													renderInput={(params) => (
														<TextField
															{...params}
															placeholder="Select Bank Account"
															error={touched.bankId && Boolean(errors.bankId)}
															helperText={touched.bankId && errors.bankId}
															sx={{
																...styles.select,
																width: {
																	xs: '100% !important',
																	sm: '220px !important',
																	md: '250px !important'
																},
																'& .MuiInputBase-root': {
																	height: '40px'
																}
															}}
														/>
													)}
													error={
														touched.bankAccountId && !!errors.bankAccountId
													}
													sx={{ ...styles.select, width: '100%' }}
												/>

												{touched.bankAccountId && errors.bankAccountId && (
													<Typography color="error" sx={styles.errorText}>
														{errors.bankAccountId}
													</Typography>
												)}
											</Box>
										</Box>
										<Box sx={styles.checkNumberFieldContainer}>
											<Typography sx={styles.balankItemLabel}>
												Number of checks
											</Typography>
											<TextField
												fullWidth
												name="count"
												placeholder="Number of checks"
												value={values.count}
												onChange={(e) => {
													setFieldValue('count', e.target.value)
													setIsFormTouched(true)
													if(userMaxCheckLimit !== 0){
														setCheckLimit((Number(totalCount) + Number(e.target.value)) > userMaxCheckLimit)
													}
													handleValidateCheckNumbers(
														values.bankAccountId,
														values.startingCheckNumber,
														e.target.value
													)
												}}
												error={touched.count && !!errors.count}
												helperText={touched.count && errors.count}
												sx={{ ...styles.input, width: '100%' }}
											/>
										</Box>
									</Box>
									<Box>
										<Typography sx={styles.balankItemLabel}>
											Check Number
										</Typography>
										<TextField
											name="startingCheckNumber"
											// placeholder="Check Number"
											value={values.startingCheckNumber}
											onChange={(e) => {
												setFieldValue('startingCheckNumber', e.target.value)
												setIsFormTouched(true)
												handleValidateCheckNumbers(
													values.bankAccountId,
													e.target.value,
													values.count
												)
											}}
											disabled={!values.bankAccountId || !isManualBankAccount}
											error={
												(touched.startingCheckNumber &&
													!!errors.startingCheckNumber) ||
												conflicts
											}
											helperText={
												(touched.startingCheckNumber &&
													errors.startingCheckNumber) ||
												conflicts
											}
											sx={{
												...styles.input,
												width: { xs: '100%' },
												'& .MuiInputBase-input': {
													color: isManualBankAccount ? '#000' : '#e2e8f0'
												},
												'& .MuiInputLabel-root': {
													color: isManualBankAccount ? '#000' : '#e2e8f0'
												}
											}}
											InputProps={{
												endAdornment: values.bankAccountId &&
													!isManualBankAccount && (
														<Typography sx={styles.checkNumberAutomatic}>
															(Automatic)
														</Typography>
													)
											}}
										/>
									</Box>
								</Box>
							</Box>
						)
					}}
				</Formik>
			}
			actions={
				<>
					<Box sx={styles.actionsContainer}>
						<Button
							onClick={() => {
								handleOpenUnsavedAlert()
							}}
							variant="outlined"
							sx={styles.cancelButton}
						>
							Cancel
						</Button>

						<Tooltip title={checkLimit ? EXCEED_TRIAL_LIMIT_WARNING : ''}>
							<span>
								<CustomButton
									variant="outlined"
									color="primary"
									onClick={handleSaveAndPrint}
									disabled={
										conflicts ||
										(formRef.current && !formRef.current.isValid) ||
										addBlankChecksLoading || checkLimit
									}
									endIcon={
										addBlankChecksLoading ? (
											<CircularProgress size={20} />
										) : null
									}
								>
									Save & Print
								</CustomButton>
							</span>
						</Tooltip>
					</Box>
				</>
			}
		/>
	)
}
