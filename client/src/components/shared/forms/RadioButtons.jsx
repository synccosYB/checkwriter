/* eslint-disable no-param-reassign */
import React from 'react'
import { Field, ErrorMessage } from 'formik'
import {
	FormControlLabel,
	FormControl,
	FormLabel,
	RadioGroup,
	Radio
} from '@mui/material'
import TextError from '../../../hoc/TextError'
import useUserInfo from '../../../API/users/useUserInfo'

const RadioButtons = (props) => {
	const { name, label, options, ...rest } = props

	const { data: userData } = useUserInfo()

	return (
		<div className="formField">
			<FormControl>
				<FormLabel
					id="demo-radio-buttons-group-label"
					sx={{
						fontSize: '14px',
						color: '#000',
						'&.Mui-focused': {
							color: '#000'
						}
					}}
				>
					{label}
				</FormLabel>
				<RadioGroup
					row
					aria-labelledby="demo-row-radio-buttons-group-label"
					name="row-radio-buttons-group"
				>
					<Field name={name} {...rest}>
						{({ field, form }) =>
							options.map((option, index) => {
								return (
									<div className="radioDiv" key={index}>
										<FormControlLabel
											value={option?.value}
											control={
												<Radio
													checked={option?.value === field?.value}
													onChange={(e) => {
														form.setFieldValue(name, option?.value)
													}}
													color="success"
													disabled={
														name === 'isSignatureSelected' &&
														userData?.signatureUrl === '' &&
														option?.key === 'Yes'
															? true
															: false
													}
												/>
											}
											label={option?.key}
											{...rest}
										/>
									</div>
								)
							})
						}
					</Field>
				</RadioGroup>
			</FormControl>

			<ErrorMessage name={name} component={TextError} />
		</div>
	)
}

export default RadioButtons
