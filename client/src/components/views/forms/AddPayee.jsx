import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FormComponents from '../../shared/forms'
import ButtonComponent from '../../shared/ButtonComponent'
import countryData from '../../../utils/countryStateCity.json'
import { Search as SearchIcon } from '@mui/icons-material'
import useAddPayee from '../../../API/payees/useAddPayee'
import useUpdatePayee from '../../../API/payees/useUpdatePayee'
import {
	FormControlLabel,
	FormGroup,
	Switch,
	Box,
	Typography,
	Grid
} from '@mui/material'
import AddressAutocomplete from '../../addressAutocomplete'
import { AlertModal } from '../../../pages/MyChecks/components/modals'
import { UnsavedIcon } from '../../Icons'
import { useState } from 'react'
import {
	getPhoneInputValue,
	normalizePhoneNumberForApi
} from '../../../utils/helpers/formatPhoneNumber'

const validationSchema = Yup.object({
	name: Yup.string().required('Required!')
})

function AddPayee({
	onClose,
	isEdit,
	payeeData,
	setWarning,
	setDirty,
	warning,
	onError
}) {
	const { mutate: addPayee } = useAddPayee()
	const { mutate: updatePayee } = useUpdatePayee()
	const [errorModal, setErrorModal] = useState({
		open: false,
		message: ''
	})

	const onSubmit = async (values, { resetForm }) => {
		let body = {}

		body.name = values.name
		body.address = {
			name: values.name,
			addressLine1: values.addressLine1,
			addressLine2: values.addressLine2,
			country: values.country,
			city: values.city,
			zipCode: values.zipCode,
			state: values.state
		}
		body.phone = normalizePhoneNumberForApi(values.phone)
		body.email = values.email
		body.companyName = values.companyName
		body.status = values.status

		if (isEdit)
			updatePayee(
				{ body, id: payeeData._id },
				{
					onSuccess: () => {
						resetForm()
						onClose(true)
					},
					onError: (error) => {
						const errorMessage =
							error?.response?.data?.message ||
							'Unable to update payee. Please try again.'
						setErrorModal({
							open: true,
							message: errorMessage
						})
						if (onError) {
							onError(error)
						}
					}
				}
			)
		else
			addPayee(
				{ body },
				{
					onSuccess: (res) => {
						resetForm()
						onClose(res)
					},
					onError: (error) => {
						const errorMessage =
							error?.response?.data?.message ||
							'Unable to add payee. Please try again.'
						setErrorModal({
							open: true,
							message: errorMessage
						})
						if (onError) {
							onError(error)
						}
					}
				}
			)
	}

	const handleDiscardConfirm = () => {
		setWarning(false)
		onClose(true)
	}

	return (
		<Formik
			enableReinitialize={true}
			initialValues={{
				name: isEdit && payeeData ? payeeData.name : '',
				email: isEdit && payeeData ? payeeData.email : '',
				phone:
					isEdit && payeeData
						? getPhoneInputValue(
								payeeData?._originalPhone
									? payeeData._originalPhone
									: payeeData?.phone
						  )
						: '',
				companyName: isEdit && payeeData ? payeeData.companyName : '',
				addressLine1:
					isEdit && payeeData ? payeeData.address?.addressLine1 : '',
				addressLine2:
					isEdit && payeeData ? payeeData.address?.addressLine2 : '',
				city: isEdit && payeeData ? payeeData.address?.city : '',
				country: isEdit && payeeData ? payeeData.address?.country : '',
				zipCode: isEdit && payeeData ? payeeData.address?.zipCode : '',
				state: isEdit && payeeData ? payeeData.address?.state : '',
				status: isEdit && payeeData ? payeeData?.status : 'active'
			}}
			validationSchema={validationSchema}
			onSubmit={onSubmit}
		>
			{({ handleSubmit, setFieldValue, values, dirty, isValid }) => (
				<Box
					sx={{
						padding: '0 3px 3px 3px',
						backgroundColor: 'white',
						width: '100%'
					}}
				>
					<Form onSubmit={handleSubmit}>
						{setDirty && setDirty(dirty)}

						<Box
							sx={{
								display: 'flex',
								flexDirection: { xs: 'column', md: 'row' },
								justifyContent: { xs: 'flex-start', md: 'space-between' },
								alignItems: { xs: 'flex-start', md: 'center' },
								gap: 2,
								mb: 2
							}}
						>
							<Typography
								variant="body2"
								sx={{
									fontSize: '14px',
									color: '#6B7280',
									lineHeight: 1.5,
									flex: { xs: 'none', md: 1 },
									width: { xs: '100%', md: 'auto' }
								}}
							>
								{isEdit
									? 'Update payee details and keep your records accurate.'
									: 'Add new payee details to keep your records accurate.'}
							</Typography>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 1,
									width: { xs: '100%', md: 'auto' },
									justifyContent: { xs: 'flex-end', md: 'flex-end' },
									flexShrink: 0
								}}
							>
								<Typography
									variant="body2"
									component="span"
									sx={{
										fontSize: '14px',
										color: '#6B7280',
										fontWeight: 500,
										whiteSpace: 'nowrap'
									}}
								>
									Status
								</Typography>
								<FormGroup>
									<FormControlLabel
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
												size="small"
												sx={{
													'& .MuiSwitch-switchBase.Mui-checked': {
														color: '#5EA479'
													},
													'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
														{
															backgroundColor: '#5EA479'
														}
												}}
											/>
										}
										label=""
										labelPlacement="end"
										sx={{ margin: 0 }}
									/>
								</FormGroup>
							</Box>
						</Box>

						{warning && (
							<AlertModal
								onClose={() => setWarning(false)}
								open={warning}
								title="Discard Changes"
								cancelLabel="No"
								confirmLabel="Yes"
								icon={<UnsavedIcon color="white" />}
								onConfirm={handleDiscardConfirm}
								description="Are you sure you want to close the modal? Your details won't be saved."
								type="discard_changes"
							/>
						)}

						<AlertModal
							onClose={() => setErrorModal({ open: false, message: '' })}
							open={errorModal.open}
							title="Error"
							confirmLabel="OK"
							hideCancel={true}
							onConfirm={() => setErrorModal({ open: false, message: '' })}
							description={errorModal.message}
						/>

						<Grid container spacing={1.5} sx={{ mb: 0.5 }}>
							<Grid item xs={12} md={6}>
								<Box>
									<Typography
										sx={{
											fontSize: '14px',
											fontWeight: 600,
											color: '#111827',
											mb: 0.5
										}}
									>
										Payee Full Name*
									</Typography>
									<Box
										sx={{
											'& .MuiInputLabel-root': {
												display: 'none'
											}
										}}
									>
										<FormComponents
											name="name"
											label=""
											control="input"
											type="text"
											required
											InputLabelProps={{ shrink: false }}
										/>
									</Box>
								</Box>
							</Grid>
							<Grid item xs={12} md={6}>
								<Box>
									<Typography
										sx={{
											fontSize: '14px',
											fontWeight: 600,
											color: '#111827',
											mb: 0.5
										}}
									>
										Email Address
									</Typography>
									<Box
										sx={{
											'& .MuiInputLabel-root': {
												display: 'none'
											}
										}}
									>
										<FormComponents
											name="email"
											label=""
											control="input"
											type="email"
											InputLabelProps={{ shrink: false }}
										/>
									</Box>
								</Box>
							</Grid>
						</Grid>

						<Grid container spacing={1.5} sx={{ mb: 0.5 }}>
							<Grid item xs={12} md={6}>
								<Box>
									<Typography
										sx={{
											fontSize: '14px',
											fontWeight: 600,
											color: '#111827',
											mb: 0.5
										}}
									>
										Phone Number
									</Typography>
									<Box
										sx={{
											'& .MuiInputLabel-root': {
												display: 'none'
											}
										}}
									>
										<FormComponents
											name="phone"
											specialLabel=""
											label=""
											control="phone-input"
											type="text"
											country="us"
											onChange={(phoneNumber) =>
												setFieldValue('phone', phoneNumber)
											}
										/>
									</Box>
								</Box>
							</Grid>
							<Grid item xs={12} md={6}>
								<Box>
									<Typography
										sx={{
											fontSize: '14px',
											fontWeight: 600,
											color: '#111827',
											mb: 0.5
										}}
									>
										Company Name
									</Typography>
									<Box
										sx={{
											'& .MuiInputLabel-root': {
												display: 'none'
											}
										}}
									>
										<FormComponents
											name="companyName"
											label=""
											control="input"
											type="text"
											InputLabelProps={{ shrink: false }}
										/>
									</Box>
								</Box>
							</Grid>
						</Grid>

						<Box
							sx={{
								mb: 0.5,
								width: '100%',
								position: 'relative',
								'& .address-autocomplete-container': {
									margin: 0,
									width: '100%'
								},
								'& .autocomplete-input': {
									width: '100%',
									height: '40px',
									padding: '10px 40px 10px 14px',
									border: '1px solid #E5E7EB',
									borderRadius: '4px',
									backgroundColor: '#F9FAFB',
									fontSize: '14px',
									'&:focus': {
										outline: 'none',
										borderColor: '#5EA479'
									},
									'&:hover': {
										borderColor: '#D1D5DB'
									}
								}
							}}
						>
							<AddressAutocomplete
								onChange={(address) => {
									const fields = [
										'addressLine1',
										'addressLine2',
										'city',
										'country',
										'zipCode',
										'state',
										'name'
									]

									fields.forEach((item) => {
										if (item === 'name' && !values.companyName && address[item])
											setFieldValue('companyName', address[item])
										else if (address[item]) setFieldValue(item, address[item])
									})
								}}
							/>
							<Box
								sx={{
									position: 'absolute',
									right: '14px',
									top: '50%',
									transform: 'translateY(-50%)',
									pointerEvents: 'none'
								}}
							>
								<SearchIcon sx={{ color: '#9CA3AF', fontSize: '20px' }} />
							</Box>
						</Box>

						<Grid container spacing={1.5} sx={{ mb: 0.5 }}>
							<Grid item xs={12} md={6}>
								<Box>
									<Typography
										sx={{
											fontSize: '14px',
											fontWeight: 600,
											color: '#111827',
											mb: 0.5
										}}
									>
										Address Line 1
									</Typography>
									<Box
										sx={{
											'& .MuiInputLabel-root': {
												display: 'none'
											}
										}}
									>
										<FormComponents
											name="addressLine1"
											label=""
											control="input"
											type="text"
											InputLabelProps={{ shrink: false }}
										/>
									</Box>
								</Box>
							</Grid>
							<Grid item xs={12} md={6}>
								<Box>
									<Typography
										sx={{
											fontSize: '14px',
											fontWeight: 600,
											color: '#111827',
											mb: 0.5
										}}
									>
										Address Line 2
									</Typography>
									<Box
										sx={{
											'& .MuiInputLabel-root': {
												display: 'none'
											}
										}}
									>
										<FormComponents
											name="addressLine2"
											label=""
											control="input"
											InputLabelProps={{ shrink: false }}
										/>
									</Box>
								</Box>
							</Grid>
						</Grid>

						<Grid container spacing={1.5} sx={{ mb: 0.5 }}>
							<Grid item xs={12} md={6}>
								<Box>
									<Typography
										sx={{
											fontSize: '14px',
											fontWeight: 600,
											color: '#111827',
											mb: 0.5
										}}
									>
										Country
									</Typography>
									<Box
										sx={{
											'& .MuiInputLabel-root': {
												display: 'none'
											}
										}}
									>
										<FormComponents
											name="country"
											label=""
											control="input"
											options={countryData?.map((country) => ({
												key: country.name,
												value: country.name
											}))}
											freeSolo={false}
											filterSelectedOptions
											InputLabelProps={{ shrink: false }}
										/>
									</Box>
								</Box>
							</Grid>
							<Grid item xs={12} md={6}>
								<Box>
									<Typography
										sx={{
											fontSize: '14px',
											fontWeight: 600,
											color: '#111827',
											mb: 0.5
										}}
									>
										State
									</Typography>
									<Box
										sx={{
											'& .MuiInputLabel-root': {
												display: 'none'
											}
										}}
									>
										<FormComponents
											name="state"
											label=""
											control="input"
											options={
												values?.country
													? countryData
															?.find(
																(country) => country.name === values.country
															)
															?.states?.map((state) => ({
																key: state.name,
																value: state.name
															})) || []
													: []
											}
											freeSolo={false}
											filterSelectedOptions
											InputLabelProps={{ shrink: false }}
										/>
									</Box>
								</Box>
							</Grid>
						</Grid>

						<Grid container spacing={1.5} sx={{ mb: 0.5 }}>
							<Grid item xs={12} md={6}>
								<Box>
									<Typography
										sx={{
											fontSize: '14px',
											fontWeight: 600,
											color: '#111827',
											mb: 0.5
										}}
									>
										City
									</Typography>
									<Box
										sx={{
											'& .MuiInputLabel-root': {
												display: 'none'
											}
										}}
									>
										<FormComponents
											name="city"
											label=""
											control="input"
											options={
												values?.country && values?.state
													? countryData
															?.find(
																(country) => country.name === values.country
															)
															?.states?.find(
																(state) => state.name === values.state
															)
															?.cities?.map((city) => ({
																key: city,
																value: city
															})) || []
													: []
											}
											freeSolo={false}
											filterSelectedOptions
											InputLabelProps={{ shrink: false }}
										/>
									</Box>
								</Box>
							</Grid>
							<Grid item xs={12} md={6}>
								<Box>
									<Typography
										sx={{
											fontSize: '14px',
											fontWeight: 600,
											color: '#111827',
											mb: 0.5
										}}
									>
										Zip Code
									</Typography>
									<Box
										sx={{
											'& .MuiInputLabel-root': {
												display: 'none'
											}
										}}
									>
										<FormComponents
											name="zipCode"
											label=""
											control="input"
											type="text"
											InputLabelProps={{ shrink: false }}
										/>
									</Box>
								</Box>
							</Grid>
						</Grid>

						<Box
							sx={{
								display: 'flex',
								justifyContent: 'flex-end'
							}}
						>
							<ButtonComponent
								text="Save Changes"
								type="submit"
								disabled={!isValid}
								variant="dark"
								click={handleSubmit}
							/>
						</Box>
					</Form>
				</Box>
			)}
		</Formik>
	)
}

export default AddPayee
