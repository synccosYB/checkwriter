import React from 'react'

const FormHeader = (props) => {
	const { text, head } = props
	return (
		<div className="form-head mb-5">
			<h2 className="fw-semibold fs-2 mb-2 text-start form-header">{head}</h2>
			<p className="form-headline fs-6">{text}</p>
		</div>
	)
}

export default FormHeader
