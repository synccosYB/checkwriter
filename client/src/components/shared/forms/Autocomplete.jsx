import React from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { ErrorMessage, Field } from 'formik'
import TextError from '../../../hoc/TextError'

const AutocompleteComponent = ({
	name,
	label,
	options = [],
	isAddBtn,
	disabled,
	onChange,
	...rest
}) => {
	return (
		<div className="formField">
			<Field name={name}>
				{({ form, field }) => {
					const handleChange = (event, value) => {
						form.setFieldValue(field.name, value ? value.value : '')
						if (onChange) {
							onChange(value)
						}
					}
					return (
						<Autocomplete
							disabled={disabled}
							name={name}
							value={
								options && options.length > 0
									? options.find((option) => option.value === field.value) || ''
									: ''
							}
							options={options}
							getOptionLabel={(option) => {
								return (
									options.find((opt) => opt.value === option.value)?.key || ''
								)
							}}
							onChange={handleChange}
							sx={{
								'&:hover fieldset.MuiOutlinedInput-notchedOutline': {
									borderColor: 'green'
								},

								'&.Mui-focused fieldset.MuiOutlinedInput-notchedOutline': {
									borderColor: 'green'
								},
								position: 'relative'
							}}
							renderInput={(params) => {
								return (
									<TextField
										{...params}
										label={label}
										sx={{
											'& .MuiOutlinedInput-root': {
												'.MuiAutocomplete-input': {
													padding: '3px 15px',
													fontSize: '12px'
												},

												'& fieldset': {
													borderColor: '#C8CBCB',
													borderRadius: isAddBtn ? '4px 0 0 4px' : '4px',
													'& legend': {
														fontSize: '0.52em'
													}
												},
												'&:hover fieldset': {
													borderColor: '#C8CBCB'
												},
												'&.Mui-focused fieldset': {
													borderColor: 'green'
												},
												'&.Mui-focused': {}
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
									/>
								)
							}}
							{...rest}
						/>
					)
				}}
			</Field>
			<ErrorMessage name={name} component={TextError} />
		</div>
	)
}

export default AutocompleteComponent
