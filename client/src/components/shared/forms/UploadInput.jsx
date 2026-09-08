import React, { useState } from 'react'
import { FieldArray, ErrorMessage, Field } from 'formik'
import TextError from '../../../hoc/TextError'
import { trashFolderPurple, attachIcon } from '../../utils/svg/index'

const UploadInput = (props) => {
	const [change, setChange] = useState(true)
	const { label, name, limit, size, ...rest } = props

	const handleFileChange = (e, values) => {
		if (values.attachments.length < limit) {
			for (let i = 0; i < e.target.files.length; i += 1) {
				if (e.target.files[i].size <= size) {
					values.attachments.push(e.target.files[i])
				} else {
					//toast.error(`File size exeeds: ${e.target.files[i].name}`)
				}
			}
		} else {
			//toast.error('Max 5 files allowed')
		}
	}

	return (
		<div className="formField">
			<label htmlFor={name}>{label}</label>
			<FieldArray name={name}>
				{(fieldArrayProps) => {
					const { form, remove } = fieldArrayProps
					const { values } = form

					return (
						<div className="uploadDiv">
							<Field
								id={name}
								name={name}
								type="file"
								value=""
								{...rest}
								onChange={(e) => {
									handleFileChange(e, values)
									setChange(!change)
								}}
							/>
							<div aria-hidden className="browseFile">
								<div>{attachIcon}</div>
								<p>Browse Files</p>
							</div>
							<div className="attachedFiles">
								{values.attachments.map((file, index) => (
									<div key={index} className="files">
										<div aria-hidden onClick={() => remove(index)}>
											{trashFolderPurple}
										</div>
										<p>{file.name}</p>
									</div>
								))}
							</div>
						</div>
					)
				}}
			</FieldArray>
			<ErrorMessage name={name} component={TextError} />
		</div>
	)
}

export default UploadInput
