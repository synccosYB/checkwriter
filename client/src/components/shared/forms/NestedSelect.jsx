import React from 'react'
import { ErrorMessage, Field } from 'formik'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled } from '@mui/material/styles'

import TextError from '../../../hoc/TextError'
import {
	Checkbox,
	Chip,
	FormControl,
	FormControlLabel,
	InputLabel,
	ListSubheader,
	MenuItem,
	Select
} from '@mui/material'
import { AddOutlined, GridViewOutlined } from '@mui/icons-material'
import { set } from 'date-fns'

const MyOutlinedInput = styled(OutlinedInput)(({ isAddBtn }) => ({
	'&:hover': {
		borderColor: 'green'
	},
	'& .MuiSelect-outlined': {
		padding: '9.2px 15px'
	},

	fieldset: {
		borderColor: '#C8CBCB',
		borderRadius: isAddBtn ? '4px 0 0 4px' : '4px'
	},

	'&.Mui-focused fieldset': {
		borderColor: 'green',
		'&..MuiOutlinedInput-notchedOutline': {
			borderColor: 'green'
		}
	},
	'&.Mui-focused': {
		//color: 'green' // set your custom color here
	}
}))

const CustomMultiSelect = ({
	field,
	options,
	label,
	multiple,
	isAddBtn = false,
	btnText,
	modalClass,
	selected,
	handleChange,
	color,
	form
}) => {
	const { setFieldValue } = form

	const selectProps = {
		input: <MyOutlinedInput label={label} shrink="true" isAddBtn={isAddBtn} />,
		value: selected
		//onChange: handleChange
	}

	if (multiple) {
		selectProps.multiple = true
	}

	const tagSelect = (e, id) => {
		let temp = [...selected]
		if (temp.includes(id)) {
			const index = temp.indexOf(id)
			if (index > -1) {
				// only splice array when item is found
				temp.splice(index, 1) // 2nd parameter means remove one item only
			}
		} else {
			temp.push(id)
		}

		setFieldValue('tags', temp)

		handleChange(id)
		e.stopPropagation()
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
							marginLeft: '0'
						}
					},
					'&.Mui-focused fieldset.MuiOutlinedInput-notchedOutline': {
						borderColor: 'green'
					},
					'& fieldset': {
						'& legend': {
							fontSize: '0.52em'
						}
					},
					position: 'relative'
				}}
				renderValue={(selected) => {
					let temp = []

					options?.forEach((option) => {
						option?.categoryList?.forEach((item) => {
							if (selected.includes(item.value)) {
								temp.push(
									<>
										<Chip
											key={item.value}
											avatar={
												<span
													className="dot"
													style={{
														backgroundColor: `${item.color}`,
														width: '8px',
														height: '8px'
													}}
												/>
											}
											label={`${item.key}`}
											variant="outlined"
											size="small"
											id={`${item.key}`}
											sx={{
												padding: '6px 8px',
												border: '1px solid #EEEEEE',
												borderRadius: '6px',
												fontWeight: '500',
												fontSize: '11px',
												color: '#757575',
												marginRight: '5px',
												height: '20px'
											}}
										/>
									</>
								)
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
				name={field.name}
				MenuProps={{
					sx: {
						height: 350
					}
				}}
			>
				{options?.length === 0 ? (
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
					options?.map((option) => {
						return (
							<div>
								{color ? (
									<ListSubheader
										sx={{
											zIndex: '111',
											background: '#fff',
											fontWeight: '600',
											padding: '0 15px',
											fontSize: '12px',
											lineHeight: '2.5rem'
										}}
									>
										<div className=" d-flex align-items-center">
											<div>
												<div className="grid-view-icon me-3">
													<div
														className="dot"
														style={{
															backgroundColor:
																option?.categoryHeadColor || 'transparent'
														}}
													></div>
													<div
														className="dot"
														style={{
															backgroundColor:
																option?.categoryHeadColor || 'transparent'
														}}
													></div>
													<div
														className="dot"
														style={{
															backgroundColor:
																option?.categoryHeadColor || 'transparent'
														}}
													></div>
													<div
														className="dot"
														style={{
															backgroundColor:
																option?.categoryHeadColor || 'transparent'
														}}
													></div>
												</div>
											</div>
											<div>{option?.categoryHead || ''}</div>
										</div>
									</ListSubheader>
								) : (
									<ListSubheader>{option?.categoryHead || ''}</ListSubheader>
								)}

								{option &&
									option?.categoryList?.map((item, index) => {
										return (
											<>
												<MenuItem
													key={index}
													value={item?.value}
													sx={{
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'start',
														padding: '2px 20px',
														fontSize: '12px',
														':hover': {
															backgroundColor: 'rgba(0,128,0, 0.1)'
														},
														'&.Mui-selected': {
															backgroundColor: 'rgba(0,128,0, 0.1)'
														}
													}}
													onClick={(e) => tagSelect(e, item?.value)}
												>
													{multiple && (
														<Checkbox
															value={item?.value}
															checked={selected?.includes(item?.value)}
															onClick={(e) => tagSelect(e, item?.value)}
															sx={{
																svg: {
																	width: '1rem',
																	height: '1rem'
																}
															}}
														/>
													)}
													{color ? (
														<div className="row d-flex align-items-center justify-content-start">
															<div className="col-auto">
																<div className="d-flex align-items-center">
																	<div
																		className="dot_bigger"
																		style={{ backgroundColor: item?.color }}
																	/>
																</div>
															</div>
															<div className="col-auto ps-0">{item?.key}</div>
														</div>
													) : (
														<p>{item.key}</p>
													)}
												</MenuItem>
											</>
										)
									})}
							</div>
						)
					})
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

const NestedSelect = ({ name, multiple = false, options, label, ...rest }) => {
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

export default NestedSelect
