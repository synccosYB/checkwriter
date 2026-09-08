import React from 'react'
import { Field, ErrorMessage } from 'formik'
import PhoneInput from 'react-phone-input-2'

import TextError from '../../../hoc/TextError'

const PhoneNumberInput = (props) => {
	const { name, label, ...rest } = props

	return (
		<div className="formField">
			<Field
				id={name}
				name={name}
				render={({ field }) => {
					return (
						<PhoneInput
							{...rest}
							country="us"
							label={label}
							className="phone-input"
							value={field.value}
						/>
					)
				}}
				label={label}
			/>
			<ErrorMessage name={name} component={TextError} />
		</div>
	)
}

export default PhoneNumberInput
