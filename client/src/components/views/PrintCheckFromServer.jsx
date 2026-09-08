import React from 'react'

function PrintCheckFromServer({ printContent, printRef, showPreview }) {
	return (
		<div style={showPreview ? { display: 'block' } : { display: 'none' }}>
			<div
				ref={printRef}
				className="my-div"
				dangerouslySetInnerHTML={{ __html: printContent }}
			/>
		</div>
	)
}

export default PrintCheckFromServer
