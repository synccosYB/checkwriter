import React from 'react'

const FormModal = (props) => {
	const { modalName } = props
	return (
		<div className={`modal app-modal form-modal ${modalName}`} tabIndex="-1">
			<div className="modal-dialog">
				<div className="modal-content">
					<div className="modal-header d-flex flex-row justify-content-end align-items-center">
						<h3 className="moda-head">{props.header}</h3>
						<button
							type="button"
							className="btn-close"
							data-bs-dismiss="modal"
							aria-label="Close"
						></button>
					</div>
					<div className="modal-body">{props.children}</div>
				</div>
			</div>
		</div>
	)
}

export default FormModal
