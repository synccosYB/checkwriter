import * as React from 'react'
import { Field } from 'formik'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import ListItemText from '@mui/material/ListItemText'
import Select from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox'

const MultipleSelectCheckmarks = ({
	children,
	selected,
	title,
	handleChange,
	isAddBtn,
	name
}) => {
	// const handleChange = (event) => {
	// 	const { value } = event.target
	// 	form.setFieldValue(field.name, value)
	// }

	return (
		<div className="formField">
			<Field name={name}>
				{({ field, form }) => {
					const { value } = field

					return (
						<FormControl sx={{ width: '100%', height: '100%' }}>
							<InputLabel
								id="multiple-checkbox-label"
								sx={{
									'&.MuiInputLabel-root': {
										color: '#969696',
										fontSize: '15px',
										fontWeight: '500',
										transform: 'translate(14px, 13px) scale(1)',

										'&.MuiFormLabel-filled': {
											transform: 'translate(14px, -9px) scale(0.75)'
										},

										'&.Mui-focused': {
											transform: 'translate(14px, -9px) scale(0.75)',
											color: '#1e3a5f'
										},
										'& fieldset': {
											borderRadius: '50px'
										}
									}
								}}
							>
								{title}
							</InputLabel>
							<Select
								labelId="multiple-checkbox-label"
								id="id-multiple-checkbox"
								multiple
								value={value}
								name={name}
								onChange={(event) => {
									let temp = [...event.target.value]

									//temp.push(event.target.value)
									form.setFieldValue(field.name, temp)
								}}
								input={<OutlinedInput label="Tag" />}
								renderValue={(value) => {
									let temp = []

									value.map((id) => {
										children.map((option) => {
											if (option.props.id === id) {
												option.props.sx.border = '1px solid #EEEEEE'
												option.props.sx.borderRadius = '6px'
												option.props.sx.fontWeight = '500'
												option.props.sx.fontSize = '12px'
												option.props.sx.color = '#757575'
												temp.push(option)
											}
										})
									})

									if (temp.length > 2) {
										let extra = temp.length - 2
										extra = extra.toString()
										temp = temp.slice(0, 2)
										temp.push(' + ' + extra)
									}

									return temp
								}}
								sx={{
									borderRadius: isAddBtn ? '4px 0 0 4px' : '4px',
									'&:hover fieldset.MuiOutlinedInput-notchedOutline': {
										borderColor: 'green'
									},
									'& .MuiSelect-select': {
										'& .MuiFormControlLabel-root': {
											marginLeft: '0'
										},

										padding:
											selected && selected.length !== 0
												? '12px 15px'
												: '12.5px 15px'
									},
									'&.Mui-focused fieldset.MuiOutlinedInput-notchedOutline': {
										borderColor: 'green'
									},
									position: 'relative'
								}}
							>
								{children.map((option) => (
									<MenuItem
										key={option.props.label}
										value={option.props.id}
										sx={{
											width: '100%',
											height: '100%',
											'&.Mui-selected': {
												backgroundColor: '#00800014'
											}
										}}
									>
										<Checkbox
											checked={value?.indexOf(option.props.id) > -1}
											sx={{
												color: 'transparent',
												'&.Mui-checked': {
													color: '#1e3a5f'
												},
												'&:hover': {
													color: 'rgba(0,0,0,0.3)'
												}
											}}
										/>
										<ListItemText primary={option} />
									</MenuItem>
								))}
							</Select>
						</FormControl>
					)
				}}
			</Field>
		</div>
	)
}

export default MultipleSelectCheckmarks
