import React from 'react'
import { Field, ErrorMessage } from 'formik'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import enUS from 'date-fns/locale/en-US'

import TextError from '../../../hoc/TextError'

const DatePickerInput = (props) => {
	const { name, label, ...rest } = props

	return (
		<div className="formField">
			<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={enUS}>
				<Field name={name}>
					{({ form, field }) => {
						const { setFieldValue } = form
						const { value } = field
						const dateValue = dayjs(value)

						return (
							<DatePicker
								{...rest}
								sx={{
									width: '100%',
									'& .MuiOutlinedInput-root': {
										'.MuiInputBase-input': {
											padding: '12px 15px',
											fontSize: '12px'
										},

										'& .MuiIconButton-root': {
											svg: {
												width: '18px',
												height: '18px'
											}
										},

										'& fieldset': {
											borderColor: '#C8CBCB',
											borderRadius: '4px',
											'& legend': {
												fontSize: '0.6em',
												'& span': {
													paddingRight: '1px',
													paddingLeft: '1px',
													width: 'fit-content'
												}
											}
										},
										'&:hover fieldset': {
											borderColor: '#C8CBCB'
										},
										'&.Mui-focused fieldset': {
											borderColor: 'green'
										},
										'&.Mui-focused': {
											//color: '#1e3a5f' // set your custom color here
										}
									},
									'& .MuiInputLabel-root': {
										color: '#969696',
										fontSize: '12px',
										fontWeight: '500',
										transform: 'translate(14px, 13px) scale(1)',

										'&.MuiFormLabel-filled': {
											transform: 'translate(14px, -7px) scale(0.75)'
										},

										'&.Mui-focused': {
											color: '#1e3a5f',
											transform: 'translate(14px, -7px) scale(0.75)'
										}
									}
								}}
								id={name}
								value={dateValue}
								onChange={(val) => {
									setFieldValue(name, dayjs(val).toDate())
								}}
								format="MM/DD/YYYY"
								label={label}
							/>
						)
					}}
				</Field>
			</LocalizationProvider>

			<ErrorMessage name={name} component={TextError} />
		</div>
	)
}

export default DatePickerInput
