import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TimePicker from '@mui/lab/TimePicker'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import { TextField } from '@material-ui/core'
import TextError from '../../../hoc/TextError'

const TimePickerInput = (props) => {
	const { name, label, ...rest } = props
	return (
		<div className="formField">
			<label htmlFor={name}>{label}</label>
			<Field name={name}>
				{({ form, field }) => {
					const { setFieldValue } = form
					const { value } = field
					return (
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<TimePicker
								id={name}
								{...field}
								{...rest}
								label={label}
								value={value}
								onChange={(val) => setFieldValue(name, val)}
								className="time-picker"
								renderInput={(params) => (
									<TextField {...params} className="time-picker-field" />
								)}
							/>
						</LocalizationProvider>
					)
				}}
			</Field>
			<ErrorMessage name={name} component={TextError} />
		</div>
	)
}

export default TimePickerInput
