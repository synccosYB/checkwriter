import React, { useRef, useState } from 'react'
import SignaturePad from 'react-signature-canvas'
import ButtonComponent from '../../shared/ButtonComponent'
import { dataUriToImg } from '../../../utils/helper'
import useUploadSignature from '../../../API/users/useUploadSignature'
import { MyCookies } from '../../../utils/cookies/Cookies'

const AddSignature = ({ onClose, type, organizationId }) => {
	const signRef = useRef(null)
	const { mutate: uploadSignature } = useUploadSignature()

	const [submitted, setSubmitted] = useState(false)

	const shouldSetCookies =
		type !== 'user' && !MyCookies.get(MyCookies.KEYS.ORGANIZATION)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setSubmitted(true)

		let file = dataUriToImg(
			signRef.current.getTrimmedCanvas().toDataURL('image/png')
		)

		let body = new FormData()
		body.append('signature', file)

		if (shouldSetCookies) {
			MyCookies.set(MyCookies.KEYS.ORGANIZATION, organizationId)
		}

		try {
			uploadSignature(
				{ body, type },
				{
					onSuccess: () => {
						setSubmitted(false)
						onClose()
						if (shouldSetCookies) MyCookies.remove(MyCookies.KEYS.ORGANIZATION)
					}
				}
			)
		} catch (err) {
			setSubmitted(false)
		}
	}

	return (
		<div className="signature-canvas-container">
			<div className="d-flex align-items-center justify-content-between mb-3">
				<p className="fs-14 m-0">Create your signature to sign checks.</p>
				<ButtonComponent
					text="Clear Signature"
					type="button"
					variant="light"
					extraClass="me-3"
					onClick={() => {
						signRef?.current?.clear()
					}}
				/>
			</div>
			<div
				className="signature-canvas border-1"
				style={{
					border: '1px solid rgba(0,0,0,13%)',
					borderRadius: '6px',
					padding: '1rem',
					marginBottom: '2rem'
				}}
			>
				<SignaturePad
					ref={signRef}
					canvasProps={{
						style: { width: '100%', height: '270px' }
					}}
				/>
			</div>
			<div className="d-flex align-items-center justify-content-center pb-2">
				<ButtonComponent
					text="Cancel"
					type="button"
					variant="light"
					extraClass="me-3"
					onClick={onClose}
				/>
				<ButtonComponent
					text={submitted ? 'Saving...' : 'Save'}
					//disabled={signRef?.current === null ? true : false}
					type="submit"
					variant="dark"
					onClick={handleSubmit}
				/>
			</div>
		</div>
	)
}

export default AddSignature
