import * as React from 'react'
import {
	DialogActions,
	Button,
	TextField,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Stack
} from '@mui/material'
import { Formik, Form, Field, type FormikProps } from 'formik'
import * as Yup from 'yup'
import { useCreateAdminUser } from '../../../../../API/admin/useCreateAdminUser'
import { CustomDialog } from '../../../../../components/dialog/CustomDialog'
import { CustomButton } from '../../../../../components/buttons/CustomButton'
import FormComponents from '../../../../../components/shared/forms'

type FormVals = {
	firstName: string
	lastName: string
	email: string
	sendPasswordSetupEmail: '' | 'yes' | 'no'
}

const AddUserSchema = Yup.object({
	firstName: Yup.string().trim().required('First name is required'),
	lastName: Yup.string().trim().required('Last name is required'),
	email: Yup.string()
		.trim()
		.email('Invalid email')
		.required('Email is required'),
	sendPasswordSetupEmail: Yup.mixed<'yes' | 'no'>()
		.oneOf(['yes', 'no'], 'Please choose Yes or No')
		.required('Please choose Yes or No')
})

export function AddUserModal({
	open,
	onClose
}: {
	open: boolean
	onClose: () => void
}) {
	const createUser = useCreateAdminUser()
	const [emailChecking] = React.useState(false)
	const formRef = React.useRef<FormikProps<FormVals>>(null)

	const FORM_ID = 'add-user-form'

	return (
		<CustomDialog
			open={open}
			onClose={onClose}
			title="Add User"
			content={
				<Formik<FormVals>
					initialValues={{
						firstName: '',
						lastName: '',
						email: '',
						sendPasswordSetupEmail: ''
					}}
					innerRef={formRef}
					validationSchema={AddUserSchema}
					validateOnMount
					onSubmit={async (values, { setSubmitting }) => {
						try {
							await createUser.mutateAsync({
								firstName: values.firstName.trim(),
								lastName: values.lastName.trim(),
								email: values.email.trim().toLowerCase(),
								sendPasswordSetupEmail: values.sendPasswordSetupEmail === 'yes'
							})
							onClose()
						} finally {
							setSubmitting(false)
						}
					}}
				>
					{({
						errors,
						touched,
						isSubmitting,
						isValid,
						setFieldValue,
						handleBlur,
						values,
						dirty
					}) => (
						<Form id={FORM_ID}>
							<Stack spacing={3} mt={1} padding={0}>
								<FormComponents
									type="text"
									control="input"
									label="First Name"
									name="firstName"
									onBlur={handleBlur}
								/>

								<FormComponents
									name="lastName"
									type="text"
									control="input"
									label="Last Name"
									onBlur={handleBlur}
								/>

								<FormComponents
									name="email"
									type="text"
									control="input"
									label="Email"
									onBlur={handleBlur}
									inputProps={{ autoComplete: 'off' }}
								/>

								<FormControl
									component={Stack}
									error={
										touched.sendPasswordSetupEmail &&
										Boolean(errors.sendPasswordSetupEmail)
									}
								>
									<FormLabel sx={{fontSize:'14px'}}>Send Password Setup Email?</FormLabel>
									<RadioGroup
										row
										name="sendPasswordSetupEmail"
										value={values.sendPasswordSetupEmail}
										onChange={(e) =>
											setFieldValue('sendPasswordSetupEmail', e.target.value)
										}
									>
										<FormControlLabel
											value="yes"
											control={<Radio />}
											label="Yes"
										/>
										<FormControlLabel
											value="no"
											control={<Radio />}
											label="No"
										/>
									</RadioGroup>
									{touched.sendPasswordSetupEmail &&
										errors.sendPasswordSetupEmail && (
											<span style={{ color: '#d32f2f', fontSize: 12 }}>
												{errors.sendPasswordSetupEmail as string}
											</span>
										)}
								</FormControl>
							</Stack>
							<DialogActions>
								<Button onClick={onClose} variant="text">
									Cancel
								</Button>
								<CustomButton
									variant="outlined"
									color="primary"
									type="submit"
									disabled={
										!isValid ||
										!dirty ||
										isSubmitting ||
										createUser.isPending ||
										emailChecking
									}
								>
									{createUser.isPending || isSubmitting
										? 'Creating…'
										: 'Create User'}
								</CustomButton>
							</DialogActions>
						</Form>
					)}
				</Formik>
			}
		/>
	)
}
