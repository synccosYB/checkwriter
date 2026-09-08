import React, { useState } from 'react'
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min'
import useUserInfo from '../../../../API/users/useUserInfo'
import appLogoDark from '../../../../assets/images/app-logo-dark.png'
import { welcomeSvg } from '../../../../assets/svg'
import { Box, Modal } from '@mui/material'
import ButtonComponent from '../../../shared/ButtonComponent'
import useUpdateUser from '../../../../API/users/useUpdateUser'

const modalStyle = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	bgcolor: 'background.paper',
	borderRadius: '8px',
	width: '65vw'
}

function WelcomeModal() {
	const location = useLocation()
	const { data: userData } = useUserInfo()
	const { mutate: updateUser } = useUpdateUser()
	const [showWelcomeModal, setShowWelcomeModal] = useState(
		location?.state?.showModal || false
	)

	const handleSubmit = async () => {
		try {
			updateUser({ welcomeSeen: true })
			setShowWelcomeModal(false)
		} catch (err) {
			console.error(err)
		}
	}

	return (
		<div>
			{userData && userData?.welcomeSeen === false ? (
				<Modal
					open={showWelcomeModal}
					onClose={() => {
						setShowWelcomeModal(false)
					}}
				>
					<Box
						sx={{
							...modalStyle,
							'&:focus-visible': {
								outline: 'none'
							}
						}}
					>
						<div className="welcome-modal-container position-relative">
							<div className="logo position-absolute">
								<img src={appLogoDark} alt="app-logo" />
							</div>
							<div className="row m-0 p-0">
								<div
									className="col-12 col-md-6 col-lg-5 text-center"
									style={{
										borderRight: '1px solid #e3e5e8',
										padding: '5rem 0'
									}}
								>
									{welcomeSvg}
								</div>

								<div
									className="col-12 col-md-6 col-lg-7 d-flex align-items-start justify-content-center flex-column"
									style={{
										padding: '0 5rem'
									}}
								>
									<h3 className="fs-3 fw-bold">Welcome to Synccos</h3>
									<p
										className="fs-14"
										style={{
											color: '#757575'
										}}
									>
										Thank you for being a part of our amazing new venture. We
										apologize for any performance issues as we build and cater
										to our early adopters' needs. Your feedback is crucial as we
										shape the future. Please sign in or sign up to join the
										discussion on how we can best suit your needs. Let's create
										something extraordinary together! <b>#ItsYourSynccos</b>
									</p>

									<ButtonComponent
										click={() => {
											handleSubmit()
										}}
										text="Continue"
										extraClass="mt-5"
										variant="dark"
									/>
								</div>
							</div>
						</div>
					</Box>
				</Modal>
			) : null}
		</div>
	)
}

export default WelcomeModal
