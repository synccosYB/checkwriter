import React, { useState } from 'react'

import ButtonComponent from '../../../shared/ButtonComponent'
import AddAddress from '../../forms/AddAddress'
import useAddresses from '../../../../API/addresses/useAddresses'

const Address = ({ type }) => {
	const [isModalOpen, setModalOpen] = useState(false)

	const openModal = () => {
		setModalOpen(true)
	}

	const { data: addresses, isLoading } = useAddresses(type)

	const [showWarning, setWarning] = useState(false)

	const closeModal = () => {
		setModalOpen(false)
	}

	const btnTitle = !addresses?.length ? 'Add Address' : 'Update Address'

	return (
		<>
			<div className="container-fluid p-0">
				<div className="row justify-content-between">
					<div className="col-9">
						<h4 className="fs-6 fw-semibold text-black mt-4 mb-2">Addresses</h4>
					</div>
					<div className="col-3 mt-4">
						<ButtonComponent
							text={btnTitle}
							variant="dark"
							onClick={openModal}
							extraClass="me-0 ms-auto"
						/>
					</div>
				</div>
			</div>
			{isLoading ? null : (
				<AddAddress
					type={type}
					isModalOpen={isModalOpen}
					setWarning={setWarning}
					closeModal={closeModal}
					showWarning={showWarning}
				/>
			)}
			{!addresses?.length ? (
				<div>
					<p>No address data available with us.</p>
				</div>
			) : (
				<div className="container-fluid">
					{addresses?.map((key) => (
						<div className="row">
							<div className="col-4 ps-0">
								<small className="text-secondary">
									<b>Nickname</b>
								</small>

								<p className="mb-0 fs-14">{key.name}</p>
							</div>
							<div className="col-auto">
								<small className="ps-0 text-secondary">
									<b>Address</b>
								</small>

								<p className="mb-0 fs-14">
									{key.addressLine1 + ', ' + key.addressLine2}
								</p>

								<p className="mb-0 fs-14">{key.city + ', ' + key.state}</p>

								<p className="mb-0 fs-14">{key.country + ', ' + key.zip}</p>
							</div>
						</div>
					))}
				</div>
			)}
		</>
	)
}

export default Address
