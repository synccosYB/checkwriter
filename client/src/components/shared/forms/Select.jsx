import React, { useEffect } from 'react'
import { Field, ErrorMessage } from 'formik'
import {
	InputLabel,
	FormControl,
	MenuItem,
	Checkbox,
	FormControlLabel,
	OutlinedInput,
	Select
} from '@mui/material'
import styled from '@emotion/styled'

import TextError from '../../../hoc/TextError'
import { AddOutlined } from '@mui/icons-material'

const MyOutlinedInput = styled(OutlinedInput)(() => ({
	'&:hover': {
		borderColor: 'green'
	},
	'& .MuiSelect-outlined': {
		padding: '9px 15px'
	},

	'& .MuiFormControlLabel-root': {},

	fieldset: {
		borderColor: '#C8CBCB',
		borderRadius: '4px',
		'& legend': {
			fontSize: '0.5em'
		}
	},

	'&.Mui-focused fieldset': {
		borderColor: 'green',
		'&..MuiOutlinedInput-notchedOutline': {
			borderColor: 'green'
		}
	},
	'&.Mui-focused': {
		//color: '#1e3a5f' // set your custom color here
	}
}))

const CustomMultiSelect = ({
	field,
	form,
	options,
	label,
	multiple,
	isAddBtn = false,
	btnText,
	modalClass
}) => {
	const handleChange = (event) => {
		const { value } = event.target
		form.setFieldValue(field.name, value)
	}

	const selectProps = {
		value: field?.value,
		input: <MyOutlinedInput label={label} shrink="true" />,
		onChange: handleChange
	}

	if (multiple) {
		selectProps.multiple = true
		selectProps.checkbox = <Checkbox color="primary" />
	}

	return (
		<FormControl fullWidth>
			<InputLabel
				id="multiple-checkbox-label"
				sx={{
					'&.MuiInputLabel-root': {
						color: '#969696',
						fontSize: '12px',
						fontWeight: '500',
						transform: 'translate(14px, 13px) scale(1)',

						'&.MuiFormLabel-filled': {
							transform: 'translate(14px, -7px) scale(0.75)'
						},

						'&.Mui-focused': {
							transform: 'translate(14px, -7px) scale(0.75)'
						}
					}
				}}
			>
				{label}
			</InputLabel>
			<Select
				labelId="multiple-checkbox-label"
				className="app-select"
				{...selectProps}
				sx={{
					'&:hover fieldset.MuiOutlinedInput-notchedOutline': {
						borderColor: 'green'
					},
					'& .MuiSelect-select': {
						'& .MuiFormControlLabel-root': {
							marginLeft: '0',
							'& span.MuiFormControlLabel-label': {
								fontSize: '12px'
							}
						}
					},
					'&.Mui-focused fieldset.MuiOutlinedInput-notchedOutline': {
						borderColor: 'green',
						padding: '14px 10px'
					},
					position: 'relative'
				}}
				MenuProps={{
					sx: {
						height: 250
					}
				}}
			>
				{options.length === 0 ? (
					<MenuItem
						disabled
						value=""
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							':hover': {
								backgroundColor: 'rgba(0,128,0, 0.1)'
							},
							'&.Mui-selected': {
								backgroundColor: 'rgba(0,128,0, 0.1)'
							}
						}}
					>
						-
					</MenuItem>
				) : (
					options?.map((option, index) => (
						<MenuItem
							key={index}
							value={option.value}
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								fontSize: '12px',
								':hover': {
									backgroundColor: 'rgba(0,128,0, 0.1)'
								},
								'&.Mui-selected': {
									backgroundColor: 'rgba(0,128,0, 0.1)'
								},
								'& .MuiFormControlLabel-root': {
									marginLeft: '0px',
									'& .MuiFormControlLabel-label': {
										fontSize: '12px'
									}
								}
							}}
						>
							<FormControlLabel control={<div />} label={option.key} />
							{multiple && (
								<Checkbox
									checked={field?.value?.includes(option.value) || false}
									sx={{
										color: 'transparent',
										'&.Mui-checked': {
											color: '#1e3a5f'
										}
									}}
								/>
							)}
						</MenuItem>
					))
				)}
				{isAddBtn ? (
					<MenuItem
						value=""
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							':hover': {
								backgroundColor: 'transparent'
							},
							'&.Mui-selected': {
								backgroundColor: 'transparent'
							},
							padding: 0
						}}
					>
						<button
							className="w-100 border-0 py-2 mt-2 px-2 bg-transparent d-flex flex-row align-items-center justify-content-center"
							data-bs-target={`.${modalClass}`}
							data-bs-toggle="modal"
						>
							<AddOutlined className="me-4" />
							{btnText}
						</button>
					</MenuItem>
				) : null}
			</Select>
		</FormControl>
	)
}

const SelectComponent = ({ name, label, options, multiple, ...rest }) => {
	return (
		<div className="formField">
			<Field
				component={CustomMultiSelect}
				id={name}
				name={name}
				{...rest}
				multiple={multiple}
				options={options}
				label={label}
			/>
			<ErrorMessage name={name} component={TextError} />
		</div>
	)
}

export default SelectComponent
