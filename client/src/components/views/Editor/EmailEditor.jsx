import { Editor } from '@tinymce/tinymce-react'
import React from 'react'

import './EmailEditor.css'
import { CircularProgress } from '@mui/material'

const EmailEditor = ({ content, setContent }) => {
	const [isLoading, setIsLoading] = React.useState(true)

	return (
		<div
			className="mail-editor position-relative"
			style={{ width: 'inherit', height: '45vh' }}
		>
			{isLoading ? (
				<div
					className="d-flex position-absolute loader-container"
					style={{
						height: '45h'
					}}
				>
					<div
						className="d-flex align-items-center justify-content-center w-100"
						style={{
							height: 'inherit'
						}}
					>
						<CircularProgress color="success" />
					</div>
				</div>
			) : null}
			<Editor
				apiKey={`${process.env?.REACT_APP_TINY_MCE_API_KEY}`}
				onInit={(evt, editor) => {
					setContent(editor.getContent())
				}}
				initialValue="This is you initial content"
				scriptLoading={{ delay: 1000 }}
				className="our-editor"
				onEditorChange={(evt, editor) => {
					setContent(editor.getContent())
				}}
				style={isLoading ? { display: 'none' } : { display: 'block' }}
				onLoadContent={() => {
					setIsLoading(false)
				}}
				init={{
					height: '45vh',
					menubar: false,
					plugins: [
						'advlist',
						'autolink',
						'lists',
						'link',
						'image',
						'charmap',
						'preview',
						'anchor',
						'searchreplace',
						'visualblocks',
						'code',
						'fullscreen',
						'insertdatetime',
						'media',
						'table',
						'code',
						'help',
						'wordcount',
						'emoticons'
					],
					toolbar:
						'bold italic underline strikethrough forecolor backcolor emoticons ltr rtl | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
						'insertfile image media template link | undo redo',
					content_style:
						'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
				}}
			/>
		</div>
	)
}

export default EmailEditor
