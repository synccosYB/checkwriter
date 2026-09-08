import React from 'react'
import { Modal, Box } from '@mui/material'
import ButtonComponent from '../ButtonComponent'

const AlertModal = ({ open, type, head, message, setOpen, severity }) => {
	///modal types - success, edit, delete

	return (
		<Modal
			open={open}
			onClose={setOpen(!open)}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
			className="bg-white"
		>
			<Box>
				<h3 className="text-black text-center fs-3">{head}</h3>
				<p className="">{message}</p>
				<div className="d-flex align-items-center justify-content-center">
					<button
						type="button"
						className="common-btn bg-white light"
						data-bs-dismiss="modal"
					>
						Cancel
					</button>
					<ButtonComponent
						text="Add Address"
						type="submit"
						variant="dark"
						data-bs-dismiss="modal"
						//click={handleSubmit}
					/>
				</div>
			</Box>
		</Modal>
	)
}

export default AlertModal
