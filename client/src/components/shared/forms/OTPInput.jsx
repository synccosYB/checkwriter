import React from 'react'

const OTPInput = (props) => {
	const { inputCount, state, change, focus } = props

	return (
		<div className="otp-container d-flex flex-row align-items-center justify-content-between mb-5">
			{Array.from(Array(6).keys()).map((index) => {
				return (
					<input
						name={`otp${index + 1}`}
						type="number"
						autoComplete="off"
						className="otpInput fs-3 text-black"
						value={state[index] ?? ''}
						onChange={(e) => change(e, index)}
						tabIndex={index + 1}
						max={1}
						min={1}
						onKeyUp={(e) => focus(e)}
					/>
				)
			})}
		</div>
	)
}

export default OTPInput
