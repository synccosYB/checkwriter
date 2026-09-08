import { Button } from '@mui/material'
import React from 'react'

const FormButton = (props) => {
	const { text, click, ...rest } = props

	return (
		<Button
			className="form-btn border-0 fs-6 fw-semibold text-capitalize"
			onClick={click}
			{...rest}
			sx={{
				'& .Mui-disabled': {
					color: 'red'
				}
			}}
		>
			{text}
		</Button>
	)
}

export default FormButton
